import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { CONFIG, METRICS } from "../config";
import { LiveApi } from "../api/client";
import { createMockBackend } from "../api/mock";

const TelemetryContext = createContext(null);
export const useTelemetry = () => useContext(TelemetryContext);

const HISTORY_LEN = 90;

// Map one backend alert (HealthEvent response) into the internal alert model.
function mapLiveAlert(event) {
  return {
    id: event.id,
    crew_id: event.crew_member_id,
    crew_name: event.crew_member_name,
    level: event.to_status || "ELEVATED",
    from_status: event.from_status,
    responder: event.responder_name,
    triggered_by: event.triggered_by,
    guidance_text: event.guidance_text,
    state: event.acknowledged ? "ACK" : "OPEN",
    acknowledged_by: event.acknowledged_by,
    acknowledged_at: event.acknowledged_at,
    created_ts: event.created_at
  };
}

// Build the event log timeline from the alert list, newest first.
function deriveLogs(alerts) {
  const logs = [];
  for (const a of alerts) {
    logs.push({
      id: `${a.id}-open`,
      ts: a.created_ts,
      type: "STATUS_ALERT",
      crew: a.crew_name || a.crew_id,
      detail: `status ${a.from_status || "NOMINAL"} to ${a.level}, triggered by ${a.triggered_by || "unknown"}`
    });
    if (a.state === "ACK" && a.acknowledged_at) {
      logs.push({
        id: `${a.id}-ack`,
        ts: a.acknowledged_at,
        type: "ALERT_ACK",
        crew: a.crew_name || a.crew_id,
        detail: `acknowledged by ${a.acknowledged_by}`
      });
    }
  }
  return logs.sort((x, y) => new Date(y.ts) - new Date(x.ts));
}

// Map one live vitals payload entry into the internal crew model.
function mapLiveMember(entry, previous) {
  const vitals = {};
  for (const key of Object.keys(METRICS)) {
    vitals[key] = typeof entry[key] === "number" ? entry[key] : previous?.vitals?.[key] ?? null;
  }
  return {
    crew_id: entry.crew_id,
    name: entry.name,
    role: entry.role,
    status: entry.status || "NOMINAL",
    triggered_by: entry.triggered_by || null,
    responder: entry.responder || null,
    vitals
  };
}

export function TelemetryProvider({ children }) {
  const [backendKind, setBackendKind] = useState("connecting"); // live | mock | connecting
  const [crew, setCrew] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [linkState, setLinkState] = useState("connecting"); // ws | polling | offline
  const [earthMode, setEarthMode] = useState(false);
  const [apod, setApod] = useState(null);

  const backendRef = useRef(null);
  const historyRef = useRef({});   // crew_id -> { metric: [values] }
  const liveRef = useRef({ pollTimer: null, ws: null });
  const lastAlertIdRef = useRef(null);

  // Push the latest vitals into per-crew history buffers for the sparklines.
  const pushHistory = useCallback((member) => {
    const history = historyRef.current[member.crew_id] || (historyRef.current[member.crew_id] = {});
    for (const key of Object.keys(METRICS)) {
      const value = member.vitals[key];
      if (typeof value !== "number") continue;
      (history[key] = history[key] || []).push(value);
      if (history[key].length > HISTORY_LEN) history[key].shift();
    }
  }, []);

  const refresh = useCallback(async () => {
    const backend = backendRef.current;
    if (!backend) return;
    try {
      const list = await backend.crew();
      const alertList = (await backend.alerts()).map(backend.mode === "mock" ? (a) => a : mapLiveAlert);
      setAlerts(alertList);
      setLogs(deriveLogs(alertList));
      setCrew((prev) => {
        return list.map((next) => {
          const mapped = mapLiveMember(next, prev.find((p) => p.crew_id === next.crew_id));
          const old = prev.find((p) => p.crew_id === mapped.crew_id);
          pushHistory(mapped);
          const history = historyRef.current[mapped.crew_id] || {};
          return {
            ...mapped,
            trend:
              old && old.status !== mapped.status
                ? (old.status === "NOMINAL" ? "worsening" : mapped.status === "NOMINAL" ? "improving" : "changing")
                : old?.trend || "stable",
            history
          };
        });
      });
    } catch { /* keep the last known state while the link is lost */ }
  }, [pushHistory]);

  // Boot: try the live backend first, fall back to the built-in simulator.
  useEffect(() => {
    let cancelled = false;

    // Cold starts on serverless hosts can drop the first request. Retry the
    // health check a few times before deciding the backend is unreachable.
    async function waitForHealth() {
      const attempts = 3;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          await LiveApi.health();
          return true;
        } catch (error) {
          if (attempt === attempts) throw error;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
      return false;
    }

    async function boot() {
      if (CONFIG.FORCE_DEMO) throw new Error("demo mode forced");
      await waitForHealth();
      if (cancelled) return;

      backendRef.current = {
        crew: () => LiveApi.crewLive(),
        alerts: () => LiveApi.alerts(),
        ackAlert: (id, by) => LiveApi.ackAlert(id, by),
        injectScenario: (crewId, name) => LiveApi.injectScenario(crewId, name),
        apod: () => LiveApi.apod().catch(() => null)
      };
      setBackendKind("live");

      // WebSocket feed with REST polling as the safety net.
      liveRef.current.ws = LiveApi.connect(
        () => refresh(),
        (state) => setLinkState(state)
      );
      liveRef.current.pollTimer = setInterval(refresh, CONFIG.POLL_INTERVAL_MS);
      await refresh();
    }

    boot().catch(() => {
      if (cancelled) return;
      backendRef.current = createMockBackend(42);
      setBackendKind("mock");
      setLinkState("offline");
      backendRef.current.start(refresh).then(() => refresh());
    });

    return () => {
      cancelled = true;
      if (liveRef.current.pollTimer) clearInterval(liveRef.current.pollTimer);
      if (liveRef.current.ws) liveRef.current.ws.close();
      if (backendRef.current && backendRef.current.stop) backendRef.current.stop();
    };
  }, [refresh]);

  // Fetch the NASA picture of the day once the backend is known.
  useEffect(() => {
    let mounted = true;
    if (backendRef.current && backendRef.current.apod) {
      backendRef.current.apod()
        .then((picture) => { if (mounted && picture) setApod(picture); })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, [backendKind]);

  const ackAlert = useCallback(async (id, by = "CrewWatch Responder") => {
    if (backendRef.current && backendRef.current.ackAlert) {
      try { await backendRef.current.ackAlert(id, by); } catch { /* retry on next poll */ }
    }
    await refresh();
  }, [refresh]);

  const injectScenario = useCallback(async (name, crewId) => {
    if (backendRef.current && backendRef.current.injectScenario) {
      try { await backendRef.current.injectScenario(crewId, name); } catch { /* scenario not supported */ }
    }
    await refresh();
  }, [refresh]);

  const value = {
    crew, alerts, logs, apod,
    backendKind, linkState, earthMode, setEarthMode,
    ackAlert, injectScenario, refresh
  };

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}
