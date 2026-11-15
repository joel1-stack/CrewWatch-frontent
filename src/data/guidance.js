// Guidance library: specific next steps per metric and status level.
// Metric keys mirror the backend triggered_by values (VitalsReading fields).
// The backend guidance_text always takes precedence as the lead sentence.

export const GUIDANCE = {
  spo2: {
    ELEVATED: {
      id: "HYPOX-1",
      title: "Oxygen trending low",
      steps: [
        "Check oxygen supply and cabin pressure readings.",
        "Reduce physical exertion for the next hour.",
        "Re-check SpO2 after 15 minutes."
      ]
    },
    ANOMALY: {
      id: "HYPOX-2",
      title: "Low blood oxygen",
      steps: [
        "Switch to backup oxygen supply immediately.",
        "Check the CO2 scrubber and ventilation flow.",
        "Notify the flight surgeon and rest until SpO2 recovers."
      ]
    },
    EMERGENCY: {
      id: "HYPOX-3",
      title: "Severe hypoxia",
      steps: [
        "Use emergency oxygen mask now.",
        "Alert crew and assign a buddy to monitor you continuously.",
        "Flight surgeon: prepare for emergency procedure."
      ]
    }
  },
  heart_rate: {
    ELEVATED: {
      id: "CARD-1",
      title: "Heart rate elevated",
      steps: ["Pause exertion.", "Hydrate.", "Re-check in 10 minutes."]
    },
    ANOMALY: {
      id: "CARD-2",
      title: "Abnormal heart rate",
      steps: ["Stop all exertion.", "Sit down and slow breathing.", "Flight surgeon review within 15 minutes."]
    },
    EMERGENCY: {
      id: "CARD-3",
      title: "Cardiac emergency signal",
      steps: ["Emergency protocol: crew buddy assigned.", "Flight surgeon: immediate intervention."]
    }
  },
  temperature: {
    ELEVATED: {
      id: "TMP-1",
      title: "Temperature above range",
      steps: ["Check suit and environment temperature settings.", "Hydrate.", "Re-check in 20 minutes."]
    },
    ANOMALY: {
      id: "TMP-2",
      title: "Abnormal temperature",
      steps: ["Check suit cooling settings.", "Hydrate and re-check in 20 minutes."]
    },
    EMERGENCY: {
      id: "TMP-3",
      title: "Critical temperature signal",
      steps: ["Check suit cooling or heating immediately.", "Buddy monitoring until stable."]
    }
  },
  radiation_dose: {
    ELEVATED: {
      id: "RAD-1",
      title: "Radiation dose rising",
      steps: ["Check the space weather forecast for solar activity.", "Minimize time in low-shielded modules."]
    },
    ANOMALY: {
      id: "RAD-2",
      title: "High radiation exposure",
      steps: ["Move to the storm shelter module.", "Log the exposure event in the mission record."]
    },
    EMERGENCY: {
      id: "RAD-3",
      title: "Radiation emergency",
      steps: ["All crew to storm shelter now.", "Flight surgeon: dose assessment required."]
    }
  },
  sleep_hours: {
    ELEVATED: {
      id: "SLP-1",
      title: "Sleep debt building",
      steps: ["Prioritize a full sleep block.", "Reduce non-critical workload today."]
    },
    ANOMALY: {
      id: "SLP-2",
      title: "Severe sleep deprivation",
      steps: ["Mandatory rest block scheduled.", "Flight surgeon informed: performance risk."]
    },
    EMERGENCY: {
      id: "SLP-3",
      title: "Critical fatigue",
      steps: ["Stop all non-essential tasks.", "Rest immediately under buddy supervision."]
    }
  },
  stress_index: {
    ELEVATED: {
      id: "STR-1",
      title: "Stress rising",
      steps: ["Take a scheduled break.", "Use the guided breathing exercise."]
    },
    ANOMALY: {
      id: "STR-2",
      title: "High stress load",
      steps: ["Pause high-cognition tasks.", "Crew check-in with commander.", "Flight surgeon aware."]
    },
    EMERGENCY: {
      id: "STR-3",
      title: "Critical stress load",
      steps: ["Step away from all tasks now.", "Flight surgeon: immediate wellbeing check."]
    }
  }
};

const SENTENCES = {
  spo2: "Your oxygen level is low.",
  heart_rate: "Your heart rate is abnormal.",
  temperature: "Your body temperature is off.",
  radiation_dose: "Your radiation dose is climbing.",
  sleep_hours: "Your sleep debt is critical.",
  stress_index: "Your stress load is high."
};

export function guidanceFor(metric, level) {
  return (GUIDANCE[metric] && GUIDANCE[metric][level]) || null;
}

export function sentenceFor(metric) {
  return SENTENCES[metric] || "A vital sign needs attention.";
}
