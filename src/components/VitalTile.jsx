import Sparkline from "./Sparkline";
import { METRICS } from "../config";

export default function VitalTile({ metric, value, history }) {
  const meta = METRICS[metric] || { label: metric, unit: "", color: "#38bdf8", decimals: 1 };
  const series = ((history && history[metric]) || []).slice(-40);
  return (
    <div className="rounded-xl bg-cabin-800 border border-cabin-700 p-3 flex flex-col gap-1 min-w-[120px]">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{meta.label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <span className="text-2xl font-bold" style={{ color: meta.color }}>
            {typeof value === "number" ? value.toFixed(meta.decimals) : "--"}
          </span>
          <span className="text-xs text-slate-400 ml-1">{meta.unit}</span>
        </div>
        <Sparkline data={series} color={meta.color} />
      </div>
    </div>
  );
}
