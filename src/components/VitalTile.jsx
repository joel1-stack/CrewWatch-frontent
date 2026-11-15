import { useRef, useState, useEffect } from "react";
import Sparkline from "./Sparkline";
import { METRICS } from "../config";
import { metricLevel } from "../data/vitals";

export default function VitalTile({ metric, value, history }) {
  const meta = METRICS[metric] || { label: metric, unit: "", color: "#22D3EE", decimals: 1 };
  const series = ((history && history[metric]) || []).slice(-40);
  const level = metricLevel(metric, value);

  // Pop the number once whenever the value changes; numbers count, they
  // do not jump.
  const [pop, setPop] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPop((n) => n + 1);
    }
  }, [value]);

  const trending = level.key === "watch";

  return (
    <div
      className="relative rounded-xl bg-orbiter shadow-panel p-3 flex flex-col gap-1.5 min-w-0"
    >
      {/* 3px per-metric status bar on the left edge */}
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-colors duration-500"
        style={{ backgroundColor: level.color }}
        aria-hidden="true"
      />
      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted pl-2 truncate">
        {meta.label}
      </div>
      <div className="flex items-end justify-between gap-2 pl-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span
            key={pop}
            className={`font-mono font-semibold text-2xl sm:text-[26px] tabular text-ink anim-value-pop`}
          >
            {typeof value === "number" ? value.toFixed(meta.decimals) : "--"}
          </span>
          <span className="text-[10px] text-ink-muted shrink-0">{meta.unit}</span>
        </div>
        <Sparkline data={series} color={meta.color} />
      </div>
      {trending && (
        <div className="text-[9px] font-mono tracking-[0.18em] text-warn pl-2">TRENDING</div>
      )}
    </div>
  );
}
