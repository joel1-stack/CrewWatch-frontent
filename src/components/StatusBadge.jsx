import { STATUS_STYLE } from "../config";

export default function StatusBadge({ status, size = "md" }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.NOMINAL;
  const pad = size === "lg" ? "px-4 py-2 text-lg" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${pad}`}
      style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}55` }}
    >
      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}
