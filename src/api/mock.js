// Built-in simulated backend (seeded, deterministic).
// Two jobs:
//   1. Demo mode fallback if the live backend is unreachable (banner shown).
//   2. Local development without the backend running.
// Metric and alert shapes mirror the live CrewWatch backend exactly.

import { CREW_IDS, STATUS, STATUS_ORDER } from "../config";
import { guidanceFor } from "../data/guidance";

// Deterministic PRNG so the demo repeats exactly.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Demo thresholds: a mirror of the backend status ladder.
const LADDER = {
  heart_rate:     { ELEVATED: [91, 110], ANOMALY: [111, 130], EMERGENCY: (v) => v > 130 || v < 40 },
  spo2:           { ELEVATED: [92, 94],  ANOMALY: [88, 91],   EMERGENCY: (v) => v < 88 },
  temperature:    { ELEVATED: [37.6, 38.0], ANOMALY: [38.1, 39.0], EMERGENCY: (v) => v > 39.0 || v < 35.0 },
  sleep_hours:    { ELEVATED: [4.5, 5.9], ANOMALY: [3.0, 4.4], EMERGENCY: (v) => v < 3.0 },
  radiation_dose: { ELEVATED: [80, 120], ANOMALY: [121, 200], EMERGENCY: (v) => v > 200 },
  stress_index:   { ELEVATED: [0.40, 0.59], ANOMALY: [0.60, 0.79], EMERGENCY: (v) => v >= 0.80 }
};

function levelFor(metric, value) {
  const ladder = LADDER[metric];
  if (!ladder) return STATUS.NOMINAL;
  if (typeof ladder.EMERGENCY === "function" ? ladder.EMERGENCY(value) : false) return STATUS.EMERGENCY;
  if (value >= ladder.ANOMALY[0] && value <= ladder.ANOMALY[1]) return STATUS.ANOMALY;
  if (value >= ladder.ELEVATED[0] && value <= ladder.ELEVATED[1]) return STATUS.ELEVATED;
  return STATUS.NOMINAL;
}

function classify(vitals) {
  let worst = STATUS.NOMINAL;
  const reasons = [];
  for (const metric of Object.keys(LADDER)) {
    const level = levelFor(metric, vitals[metric]);
    if (STATUS_ORDER.indexOf(level) > STATUS_ORDER.indexOf(worst)) {
      worst = level;
      reasons.unshift({ metric, value: vitals[metric] });
    } else if (level !== STATUS.NOMINAL) {
      reasons.push({ metric, value: vitals[metric] });
    }
  }
  // Compound rule: low SpO2 with fast breathing and a raised heart rate
  // escalates the overall level by one step.
  const compound =
    levelFor("spo2", vitals.spo2) !== STATUS.NOMINAL &&
    levelFor("heart_rate", vitals.heart_rate) !== STATUS.NOMINAL;
  if (compound && worst !== STATUS.EMERGENCY) {
    worst = STATUS_ORDER[STATUS_ORDER.indexOf(worst) + 1];
  }
  return { status: worst, triggered_by: reasons[0] ? reasons[0].metric : null };
}

const NAMES = { C1: "Cmdr. Ray", C2: "Dr. Okafor", C3: "Eng. Silva", C4: "Pilot Chen" };
const ROLES = { C1: "Commander", C2: "Flight Surgeon", C3: "Engineer", C4: "Pilot" };
const RESPONDER = "CMO Amara";

// Scenario names mirror the live backend simulator.
const SCENARIOS = {
  low_oxygen:          { metric: "spo2",           target: 86,   rate: 0.35 },
  cardiac_event:       { metric: "heart_rate",     target: 126,  rate: 1.2 },
  radiation_spike:     { metric: "radiation_dose", target: 240,  rate: 4.5 },
  high_fever:          { metric: "temperature",    target: 39.2, rate: 0.06 },
  fatigue_accumulation: { metric: "sleep_hours",   target: 2.4,  rate: 0.05 }
};

export function createMockBackend(seed = 42) {
  const rand = mulberry32(seed);
  const state = {
    crew: {},
    alerts: [],
    seq: 100,
    scenario: null,
    handlers: null,
    timers: []
  };

  for (const id of CREW_IDS) {
    state.crew[id] = {
      crew_id: id,
      name: NAMES[id],
      role: ROLES[id],
      vitals: {
        heart_rate: 68 + rand() * 10,
        spo2: 96 + rand() * 2,
        temperature: 36.6 + rand() * 0.5,
        sleep_hours: 6.2 + rand() * 1.4,
        radiation_dose: 35 + rand() * 15,
        stress_index: 0.25 + rand() * 0.15
      },
      status: STATUS.NOMINAL,
      trend: "stable",
      triggered_by: null
    };
  }

  function emit() { if (state.handlers) state.handlers(); }

  function tick() {
    const now = new Date().toISOString();
    for (const id of CREW_IDS) {
      const member = state.crew[id];
      const v = member.vitals;
      const noise = (magnitude) => (rand() - 0.5) * magnitude;

      // Baseline wander
      v.heart_rate = Math.max(40, Math.min(150, v.heart_rate + noise(2.5)));
      v.spo2 = Math.max(80, Math.min(100, v.spo2 + noise(0.4)));
      v.temperature = Math.max(35, Math.min(40, v.temperature + noise(0.08)));
      v.stress_index = Math.max(0.05, Math.min(1, v.stress_index + noise(0.03)));
      v.radiation_dose = Math.min(300, v.radiation_dose + 0.05);
      v.sleep_hours = Math.max(0, v.sleep_hours - 0.01);

      // Active scenario drift
      if (state.scenario && state.scenario.crew_id === id) {
        const scenario = SCENARIOS[state.scenario.name];
        if (scenario) {
          const diff = scenario.target - v[scenario.metric];
          v[scenario.metric] += Math.sign(diff) * Math.min(Math.abs(diff), scenario.rate * (0.6 + rand() * 0.8));
        }
      }

      const previous = member.status;
      const { status, triggered_by } = classify(v);
      member.status = status;
      member.triggered_by = triggered_by;
      member.trend =
        STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf(previous) ? "worsening" :
        STATUS_ORDER.indexOf(status) < STATUS_ORDER.indexOf(previous) ? "improving" : "stable";
      member.ts = now;

      if (status !== previous) {
        const above = STATUS_ORDER.indexOf(status) >= STATUS_ORDER.indexOf(STATUS.ANOMALY);
        const already = state.alerts.some((a) => a.crew_id === id && a.state !== "ACK");
        if (status !== STATUS.NOMINAL && above && !already) {
          const reason = triggered_by || "heart_rate";
          const guidance = guidanceFor(reason, status) || guidanceFor("heart_rate", status);
          state.alerts.unshift({
            id: `A${++state.seq}`,
            crew_id: id,
            crew_name: member.name,
            level: status,
            from_status: previous,
            responder: RESPONDER,
            triggered_by: reason,
            guidance_id: guidance ? guidance.id : "GEN-1",
            guidance_text: guidance ? guidance.title : "Follow flight surgeon instructions.",
            state: "OPEN",
            acknowledged: false,
            acknowledged_by: null,
            acknowledged_at: null,
            created_ts: now
          });
        }
      }
    }

    emit();
  }

  return {
    mode: "mock",
    async start(handlers) {
      state.handlers = handlers;
      emit();
      state.timers.push(setInterval(tick, 1000));
      return true;
    },
    stop() { state.timers.forEach(clearInterval); state.timers = []; },
    crew() {
      return CREW_IDS.map((id) => {
        const member = state.crew[id];
        return { ...member, vitals: { ...member.vitals } };
      });
    },
    alerts() { return [...state.alerts]; },
    async ackAlert(id, by) {
      const alert = state.alerts.find((a) => a.id === id);
      if (alert && alert.state !== "ACK") {
        alert.state = "ACK";
        alert.acknowledged = true;
        alert.acknowledged_by = by;
        alert.acknowledged_at = new Date().toISOString();
      }
      emit();
    },
    async injectScenario(name, crewId) {
      if (name === "full_recovery") {
        state.scenario = null;
        for (const id of CREW_IDS) {
          Object.assign(state.crew[id].vitals, {
            heart_rate: 72, spo2: 97, temperature: 36.8,
            sleep_hours: 6.5, radiation_dose: 40, stress_index: 0.25
          });
        }
      } else {
        state.scenario = { name, crew_id: crewId || "C2" };
      }
      emit();
    },
    async apod() { return null; }
  };
}
