import StatusBadge from "./StatusBadge";
import { METRICS } from "../config";

function formatTime(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleTimeString(); } catch { return ""; }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-3 h-3" aria-hidden="true">
      <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Severity bar color per alert level.
const SEVERITY = {
  NOMINAL: "#10B981",
  ELEVATED: "#FACC15",
  ANOMALY: "#FB923C",
  EMERGENCY: "#FC3D21"
};

export default function AlertPanel({ alerts, responderLabel, onAck }) {
  const open = alerts.filter((a) => a.state !== "ACK");
  const acknowledged = alerts.filter((a) => a.state === "ACK").slice(0, 4);
  const visible = open.slice(0, 6);
  const hidden = open.length - visible.length;

  return (
    <div className="rounded-2xl bg-orbiter shadow-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm tracking-wide text-ink">Active Alerts</h2>
        <span className="text-[10px] font-mono text-ink-muted tabular">{open.length} OPEN</span>
      </div>

      {open.length === 0 ? (
        /* Designed empty state: quiet, with a checkmark. */
        <div className="py-6 flex flex-col items-center gap-2 text-center">
          <span className="w-8 h-8 rounded-full border border-ok/30 text-ok/70 flex items-center justify-center">
            <CheckIcon />
          </span>
          <p className="text-xs text-ink-dim">All crew within expected ranges.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((a) => {
            const metric = METRICS[a.triggered_by];
            return (
              <li
                key={a.id}
                className="anim-slide-in relative overflow-hidden rounded-lg bg-panel p-3 pl-4"
              >
                {/* Severity stripe */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ backgroundColor: SEVERITY[a.level] || SEVERITY.ELEVATED }}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <StatusBadge status={a.level} size="sm" />
                  <span className="text-[10px] font-mono text-ink-muted">{formatTime(a.created_ts)}</span>
                </div>
                <div className="text-sm text-ink font-medium truncate">{a.crew_name || a.crew_id}</div>
                <div className="text-xs text-ink-dim mt-0.5">
                  {metric ? `${metric.label} deviation` : "Vital sign deviation"}
                  <span className="mx-1.5 text-edge">|</span>
                  <span className="font-mono text-ink-muted">{a.triggered_by || "unknown trigger"}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <span className="text-[10px] text-ink-muted truncate max-w-[180px]">
                    {responderLabel}: {a.responder}
                  </span>
                  <button
                    onClick={() => onAck(a.id, "Flight Surgeon")}
                    className="px-3 py-1.5 text-[11px] font-mono tracking-wider rounded-lg bg-telemetry/15 text-telemetry border border-telemetry/30 hover:bg-telemetry/25 active:scale-[0.97] transition"
                  >
                    ACKNOWLEDGE
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hidden > 0 && (
        <p className="mt-2 text-[10px] font-mono text-ink-muted text-center">
          + {hidden} OLDER UNACKNOWLEDGED
        </p>
      )}

      {acknowledged.length > 0 && (
        <div className="mt-4 pt-3 border-t border-edge/60">
          <div className="text-[10px] font-mono tracking-[0.18em] text-ink-muted mb-2">ACKNOWLEDGED</div>
          <ul className="space-y-1.5">
            {acknowledged.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="truncate text-ink-dim">
                  {a.crew_name || a.crew_id}
                  <span className="mx-1.5 text-edge">|</span>
                  <span className="font-mono">{a.level}</span>
                </span>
                <span className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] text-ok">
                  <CheckIcon />
                  {formatTime(a.acknowledged_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
