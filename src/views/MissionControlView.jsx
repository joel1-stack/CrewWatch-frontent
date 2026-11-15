import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTelemetry } from "../state/TelemetryContext";
import { STATUS_STYLE, METRICS, KEY_METRICS, SCENARIOS, LABELS } from "../config";
import StatusBadge from "../components/StatusBadge";
import AlertPanel from "../components/AlertPanel";
import Timeline from "../components/Timeline";

const TREND_COLOR = {
  worsening: "text-danger",
  improving: "text-ok",
  stable: "text-slate-400",
  changing: "text-warn"
};

export default function MissionControlView() {
  const navigate = useNavigate();
  const { crew, alerts, logs, earthMode, ackAlert, injectScenario, backendKind } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;
  const [targetCrew, setTargetCrew] = useState("");

  const target = targetCrew || (crew[0] ? crew[0].crew_id : "");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{labels.missionControl}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {crew.length} crew monitored <span className="text-slate-600">|</span> {alerts.filter(a => a.state !== "ACK").length} open alerts
          </p>
        </div>

        {/* Demo scenario injector, wired to the backend simulator */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={target}
            onChange={(e) => setTargetCrew(e.target.value)}
            className="text-xs rounded-lg bg-cabin-800 border border-cabin-700 text-slate-200 px-2 py-1.5"
            title="Crew member receiving the scenario"
          >
            {crew.map((c) => (
              <option key={c.crew_id} value={c.crew_id}>{c.name || c.crew_id}</option>
            ))}
          </select>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => injectScenario(scenario.id, target)}
              className={`px-2.5 py-1.5 text-[11px] rounded-md border transition font-mono ${
                scenario.id === "full_recovery"
                  ? "bg-cabin-800 border-cabin-700 text-slate-300 hover:border-slate-500"
                  : "bg-cabin-800 border-cabin-700 text-slate-300 hover:border-warn/60 hover:text-warn"
              }`}
              title={`Inject the ${scenario.label.toLowerCase()} scenario for the selected crew member`}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      {backendKind === "mock" && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-danger/15 border border-danger/30 text-danger text-xs font-mono">
          SIMULATED FEED: the backend is unreachable, the built-in simulator is driving the demo.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Crew grid */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3 content-start">
          {crew.map((member) => {
            const style = STATUS_STYLE[member.status] || STATUS_STYLE.NOMINAL;
            return (
              <button
                key={member.crew_id}
                onClick={() => navigate(`/crew/${member.crew_id}`)}
                className="text-left rounded-2xl bg-cabin-800 border p-4 hover:bg-cabin-700 transition"
                style={{ borderColor: `${style.color}44` }}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 truncate">{member.name || member.crew_id}</div>
                    <div className="text-xs text-slate-400 truncate">{member.role || ""}</div>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {KEY_METRICS.map((metric) => {
                    const meta = METRICS[metric];
                    const value = member.vitals ? member.vitals[metric] : undefined;
                    return (
                      <div key={metric} className="rounded-lg bg-cabin-900 py-1.5">
                        <div className="text-[10px] uppercase text-slate-500 truncate">{meta.label}</div>
                        <div className="text-sm font-bold text-slate-200">
                          {typeof value === "number" ? value.toFixed(meta.decimals) : "--"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 text-[11px] flex items-center gap-1.5">
                  <span className={`font-mono ${TREND_COLOR[member.trend] || "text-slate-400"}`}>
                    {member.trend}
                  </span>
                  {member.triggered_by && (
                    <span className="text-slate-500 truncate">
                      watch: {member.triggered_by.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {crew.length === 0 && (
            <div className="rounded-2xl bg-cabin-800 border border-cabin-700 p-6 text-sm text-slate-400">
              Connecting to telemetry...
            </div>
          )}
        </div>

        {/* Alerts and event timeline */}
        <div className="space-y-4">
          <AlertPanel alerts={alerts} responderLabel={labels.responder} onAck={ackAlert} />
          <Timeline logs={logs} />
        </div>
      </div>
    </div>
  );
}
