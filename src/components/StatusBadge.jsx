import { STATUS_STYLE } from "../config";

// Instrument-panel status pill: deep tone fill, bright label, breathing dot.
export default function StatusBadge({ status, size = "md" }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.NOMINAL;
  const pad = size === "lg" ? "px-4 py-2 text-base" : size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-mono font-semibold tracking-[0.14em] ${pad}`}
      style={{ color: s.bright, backgroundColor: s.deep, border: `1px solid ${s.bright}33` }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.bright }}
      />
      {s.label}
    </span>
  );
}
