// Live backend client: REST + WebSocket, with automatic polling fallback.
// All paths come from CONFIG.ENDPOINTS, the only file to edit if a route changes.

import { CONFIG } from "../config";

async function request(path, { method = "GET", body, timeout = CONFIG.REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(CONFIG.API_BASE + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  } finally {
    clearTimeout(timer);
  }
}

export const LiveApi = {
  async health() {
    return request(CONFIG.ENDPOINTS.health, { timeout: CONFIG.HEALTH_TIMEOUT_MS });
  },

  // Primary telemetry source: latest vitals + status for every crew member.
  async crewLive() {
    const data = await request(CONFIG.ENDPOINTS.crewLive);
    return (data && data.crew) || [];
  },

  async crewList() { return request(CONFIG.ENDPOINTS.crewList); },
  async crewVitals(id) { return request(CONFIG.ENDPOINTS.crewVitals(id)); },

  async alerts(limit = 50) {
    return request(`${CONFIG.ENDPOINTS.alerts}?limit=${limit}`);
  },

  async ackAlert(id, acknowledgedBy) {
    return request(CONFIG.ENDPOINTS.alertAck(id), {
      method: "POST",
      body: { acknowledged_by: acknowledgedBy }
    });
  },

  async generateReport(missionDay = 1) {
    return request(CONFIG.ENDPOINTS.reportGenerate, {
      method: "POST",
      body: { mission_day: missionDay }
    });
  },

  async reportList() { return request(CONFIG.ENDPOINTS.reportList); },

  reportDownloadUrl(id) { return CONFIG.API_BASE + CONFIG.ENDPOINTS.reportDownload(id); },

  async injectScenario(crewId, scenario) {
    return request(CONFIG.ENDPOINTS.scenario, {
      method: "POST",
      body: { crew_member_id: crewId, scenario }
    });
  },

  async apod() {
    const data = await request(CONFIG.ENDPOINTS.apod);
    return data && data.data ? data.data : null;
  },

  // WebSocket feed with auto-reconnect. Calls onMessage(parsed) per frame,
  // onStatus("ws" | "polling") whenever the transport changes.
  connect(onMessage, onStatus) {
    let ws = null;
    let closed = false;
    let retry = null;

    const open = () => {
      if (closed) return;
      try {
        ws = new WebSocket(CONFIG.WS_URL);
      } catch {
        onStatus("polling");
        return;
      }
      ws.onopen = () => onStatus("ws");
      ws.onmessage = (event) => {
        try { onMessage(JSON.parse(event.data)); } catch { /* ignore malformed frame */ }
      };
      ws.onclose = () => {
        onStatus("polling");
        if (!closed) retry = setTimeout(open, CONFIG.WS_RECONNECT_MS);
      };
      ws.onerror = () => { try { ws && ws.close(); } catch { /* already closing */ } };
    };

    open();
    return {
      close() {
        closed = true;
        if (retry) clearTimeout(retry);
        try { ws && ws.close(); } catch { /* already closed */ }
      }
    };
  }
};
