// Client-side per-metric health ranges. Used only for the thin status bar
// and the trending hint on vital tiles; the backend remains the source of
// truth for the overall status classification.

export const RANGES = {
  heart_rate:     { min: 60, max: 90 },
  spo2:           { min: 94, max: 100 },
  temperature:    { min: 36.0, max: 37.5 },
  radiation_dose: { min: 0, max: 60 },
  sleep_hours:    { min: 6, max: 9.5 },
  stress_index:   { min: 0, max: 0.35 }
};

const LEVEL_COLOR = { ok: "#10B981", watch: "#FACC15", alert: "#FC3D21" };

// ok: inside the safe range. watch: within 12% of a bound. alert: outside.
export function metricLevel(metric, value) {
  const range = RANGES[metric];
  if (!range || typeof value !== "number") return { key: "ok", color: LEVEL_COLOR.ok };
  const span = range.max - range.min || 1;
  const margin = span * 0.12;
  if (value < range.min || value > range.max) return { key: "alert", color: LEVEL_COLOR.alert };
  if (value < range.min + margin || value > range.max - margin) return { key: "watch", color: LEVEL_COLOR.watch };
  return { key: "ok", color: LEVEL_COLOR.ok };
}
