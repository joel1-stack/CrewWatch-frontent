// ============================================================
// CrewWatch: frontend configuration.
// Single source of truth for backend wiring. If a request returns
// 404, adjust the path here and nowhere else.
// ============================================================

const envBase = import.meta.env.VITE_API_BASE_URL || "https://crewwatch-spaceapps.fastapicloud.dev";

export const CONFIG = {
  API_BASE: envBase.replace(/\/$/, ""),
  WS_PATH: "/ws/mission-feed",
  get WS_URL() {
    return this.API_BASE.replace(/^http/, "ws") + this.WS_PATH;
  },

  // Force the built-in simulated feed regardless of backend health.
  FORCE_DEMO: import.meta.env.VITE_DEMO_MODE === "true",

  HEALTH_TIMEOUT_MS: 8000,
  REQUEST_TIMEOUT_MS: 10000,
  POLL_INTERVAL_MS: 3000,
  WS_RECONNECT_MS: 3000,

  ENDPOINTS: {
    health: "/health",
    crewLive: "/api/vitals/live",                 // GET -> {timestamp, crew: [{crew_id, name, role, status, vitals...}]}
    crewList: "/api/crew",                        // GET -> [{id, name, role, responder_name, current_status}]
    crewVitals: (id) => `/api/crew/${id}/vitals`, // GET -> vitals reading history
    alerts: "/api/alerts",                        // GET -> [{id, crew_member_id, to_status, acknowledged, ...}]
    alertAck: (id) => `/api/alerts/${id}/acknowledge`, // POST {acknowledged_by}
    reportGenerate: "/api/reports/generate",      // POST {mission_day} -> report summary
    reportList: "/api/reports",                   // GET -> generated reports
    reportDownload: (id) => `/api/reports/${id}/download`, // GET -> PDF
    scenario: "/api/vitals/simulator/inject",     // POST {crew_member_id, scenario}
    apod: "/api/nasa/apod"                        // GET -> {data: {title, url, explanation}}
  }
};

// Fallback roster ids used by the built-in simulated feed.
export const CREW_IDS = ["C1", "C2", "C3", "C4"];

export const STATUS = {
  NOMINAL: "NOMINAL",
  ELEVATED: "ELEVATED",
  ANOMALY: "ANOMALY",
  EMERGENCY: "EMERGENCY"
};

export const STATUS_ORDER = ["NOMINAL", "ELEVATED", "ANOMALY", "EMERGENCY"];

// Status ladder: deep tone is the panel background, bright tone is the
// label and stripe. The glow appears only on active or fresh alerts.
export const STATUS_STYLE = {
  NOMINAL:   { deep: "#06281F", bright: "#10B981", label: "NOMINAL" },
  ELEVATED:  { deep: "#2A1F02", bright: "#FACC15", label: "ELEVATED" },
  ANOMALY:   { deep: "#2D1100", bright: "#FB923C", label: "ANOMALY" },
  EMERGENCY: { deep: "#2A0406", bright: "#FC3D21", label: "EMERGENCY" }
};

// Metric fields use the backend VitalsReading model names directly.
export const METRICS = {
  heart_rate:     { label: "Heart rate",     unit: "bpm", color: "#f472b6", decimals: 0 },
  spo2:           { label: "Blood oxygen",   unit: "%",   color: "#38bdf8", decimals: 1 },
  temperature:    { label: "Temperature",    unit: "\u00B0C", color: "#fbbf24", decimals: 1 },
  radiation_dose: { label: "Radiation dose", unit: "mGy", color: "#fb923c", decimals: 1 },
  sleep_hours:    { label: "Sleep (24 h)",   unit: "h",   color: "#34d399", decimals: 1 },
  stress_index:   { label: "Stress index",   unit: "idx", color: "#f87171", decimals: 2 }
};

export const KEY_METRICS = ["heart_rate", "spo2", "radiation_dose", "stress_index"];

// Scenario names match the backend simulator (app/core/simulator.py).
export const SCENARIOS = [
  { id: "low_oxygen",          label: "Low oxygen" },
  { id: "cardiac_event",       label: "Cardiac event" },
  { id: "radiation_spike",     label: "Radiation spike" },
  { id: "high_fever",          label: "High fever" },
  { id: "fatigue_accumulation", label: "Fatigue build-up" },
  { id: "full_recovery",       label: "Full reset" }
];

// NASA open imagery, hosted by images-assets.nasa.gov (stable CDN).
export const IMAGES = {
  earthHorizon: "https://images-assets.nasa.gov/image/iss045e013851/iss045e013851~medium.jpg",
  astronaut: "https://images-assets.nasa.gov/image/jsc2024e066574/jsc2024e066574~medium.jpg",
  missionControl: "https://images-assets.nasa.gov/image/41g-90128/41g-90128~medium.jpg"
};

export const LABELS = {
  space: {
    crew: "Crew Member",
    missionControl: "Mission Control",
    responder: "Flight Surgeon",
    homeTitle: "Who is using CrewWatch?",
    crewCard: "I am a crew member",
    crewCardHint: "One glance: my status and my next step.",
    controlCard: "I am monitoring the crew",
    controlCardHint: "Whole crew, alerts and the audit trail."
  },
  earth: {
    crew: "Patient",
    missionControl: "Clinic Monitor",
    responder: "Doctor on Call",
    homeTitle: "Who is using the monitor?",
    crewCard: "I am a patient",
    crewCardHint: "My vitals, in plain language.",
    controlCard: "I am monitoring patients",
    controlCardHint: "Every patient, alerts and history."
  }
};
