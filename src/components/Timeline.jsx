const TYPE_COLOR = {
  STATUS_ALERT: "text-warn",
  ALERT_ACK: "text-ok",
  ALERT_ESCALATED: "text-danger",
  SCENARIO: "text-violet-300",
  SYSTEM: "text-slate-400"
};

export default function Timeline({ logs }) {
  return (
    <div className="rounded-xl bg-cabin-800 border border-cabin-700 p-4 max-h-[420px] overflow-y-auto">
      <h3 className="font-semibold text-slate-100 mb-3">Event Log</h3>
      {logs.length === 0 && <p className="text-sm text-slate-500">Waiting for events.</p>}
      <ul className="space-y-1.5 text-xs font-mono">
        {logs.slice(0, 60).map((log) => (
          <li key={log.id} className="flex gap-3">
            <span className="text-slate-500 shrink-0">
              {new Date(log.ts).toLocaleTimeString()}
            </span>
            <span className={TYPE_COLOR[log.type] || "text-slate-300"}>{log.type}</span>
            <span className="text-slate-300 truncate max-w-[80px]">{log.crew}</span>
            <span className="text-slate-500 truncate">{log.detail || ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
