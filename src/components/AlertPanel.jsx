import StatusBadge from "./StatusBadge";

function formatTime(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleTimeString(); } catch { return ""; }
}

export default function AlertPanel({ alerts, responderLabel, onAck }) {
  const open = alerts.filter((a) => a.state !== "ACK");
  const acknowledged = alerts.filter((a) => a.state === "ACK").slice(0, 5);
  const visible = open.slice(0, 6);
  const hidden = open.length - visible.length;

  return (
    <div className="rounded-xl bg-cabin-800 border border-cabin-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-100">Active Alerts</h3>
        <span className="text-xs text-slate-400">{open.length} open</span>
      </div>

      {open.length === 0 && (
        <p className="text-sm text-slate-400 py-4 text-center">
          No active alerts. All crew within expected ranges.
        </p>
      )}

      <ul className="space-y-2">
        {visible.map((a) => (
          <li key={a.id} className="rounded-lg border border-cabin-700 bg-cabin-900 p-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={a.level} size="sm" />
            <div className="flex-1 min-w-[160px]">
              <div className="text-sm text-slate-100 font-medium">{a.crew_name || a.crew_id}</div>
              <div className="text-xs text-slate-400">
                {responderLabel}: <span className="text-slate-200">{a.responder}</span>
                <span className="mx-1 text-slate-600">|</span>
                {formatTime(a.created_ts)}
                <span className="mx-1 text-slate-600">|</span>
                <span className="font-mono text-slate-500">{a.triggered_by || "unknown trigger"}</span>
              </div>
            </div>
            <button
              onClick={() => onAck(a.id, "Flight Surgeon")}
              className="px-3 py-1.5 text-xs rounded-lg bg-warn/20 text-warn font-semibold hover:bg-warn/30 transition"
            >
              Acknowledge
            </button>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <p className="mt-2 text-xs text-slate-500 text-center">
          Plus {hidden} older unacknowledged alert{hidden === 1 ? "" : "s"}.
        </p>
      )}

      {acknowledged.length > 0 && (
        <div className="mt-4 pt-3 border-t border-cabin-700">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Recently acknowledged</div>
          <ul className="space-y-1">
            {acknowledged.map((a) => (
              <li key={a.id} className="text-xs text-slate-400 flex justify-between gap-3">
                <span className="truncate">
                  {a.crew_name || a.crew_id} <span className="text-slate-600">|</span> {a.level}
                </span>
                <span className="text-ok shrink-0">ACKNOWLEDGED</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
