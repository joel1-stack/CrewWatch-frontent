// The audit trail: reverse-chronological, always visibly filling up.
const LEVEL_COLOR = {
  NOMINAL: "#10B981",
  ELEVATED: "#FACC15",
  ANOMALY: "#FB923C",
  EMERGENCY: "#FC3D21"
};

function dotColor(detail) {
  if (!detail) return "#475569";
  for (const key of Object.keys(LEVEL_COLOR)) {
    if (detail.includes(key)) return LEVEL_COLOR[key];
  }
  return "#94A3B8";
}

export default function Timeline({ logs }) {
  return (
    <div className="rounded-2xl bg-orbiter shadow-panel p-4">
      <h2 className="font-display font-semibold text-sm tracking-wide text-ink mb-3">Event Log</h2>
      {logs.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-xs text-ink-muted">The record is filling as events happen.</p>
        </div>
      )}
      <ul className="space-y-0 max-h-[480px] overflow-y-auto pr-1">
        {logs.slice(0, 60).map((log, i) => {
          const color = dotColor(log.detail);
          const isLast = i === Math.min(logs.length, 60) - 1;
          return (
            <li
              key={log.id}
              className={`relative flex gap-3 pb-3 last:pb-0 ${i === 0 ? "anim-log-arrive" : ""}`}
            >
              {/* Timeline spine */}
              {!isLast && (
                <span className="absolute left-[3.5px] top-2.5 bottom-0 w-px bg-edge/50" aria-hidden="true" />
              )}
              <span
                className="relative z-10 mt-1.5 h-2 w-2 rounded-full shrink-0 border border-void"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-ink-muted tabular">
                    {new Date(log.ts).toLocaleTimeString()}
                  </span>
                  <span className="text-[11px] text-ink-dim font-medium truncate">{log.crew}</span>
                </div>
                <p className="text-[11px] text-ink-dim leading-snug break-words">{log.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
