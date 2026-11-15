import { useNavigate } from "react-router-dom";
import { useTelemetry } from "../state/TelemetryContext";
import { LABELS, IMAGES, STATUS_ORDER, STATUS_STYLE } from "../config";
import Skeleton from "../components/Skeleton";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// NASA meatball-style roundel: brand moment, used sparingly.
function Roundel() {
  return (
    <span className="w-8 h-8 rounded-full bg-nasa-blue border border-edge flex items-center justify-center shrink-0 shadow-panel">
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#FC3D21" strokeWidth="1.4" />
        <path d="M5 15.5C8 13 16 13 19 15.5" stroke="#FC3D21" strokeWidth="1.4" fill="none" />
        <path d="M7 10l4 3-4 3z" fill="#FC3D21" />
      </svg>
    </span>
  );
}

export default function RoleSelect() {
  const navigate = useNavigate();
  const { earthMode, apod, crew, backendKind } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;
  const firstCrewId = crew[0] ? crew[0].crew_id : "first";
  const loading = crew.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

      {/* Hero: arrive, do not flash */}
      <div className="anim-fade-up">
        <div className="flex items-center gap-3 mb-5">
          <span className="h-[2px] w-10 bg-nasa-blue" aria-hidden="true" />
          <span className="text-[10px] font-mono tracking-[0.24em] text-ink-muted uppercase">
            NASA Space Apps Challenge 2026
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-semibold text-ink leading-[1.08] max-w-3xl">
          Continuous health watch for crews far from help.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-ink-dim max-w-2xl leading-relaxed">
          Vitals stream in live. Status is classified in plain language. Warnings reach a
          named responder with exact next steps, and every event lands in the mission report.
        </p>
      </div>

      {/* Role selection */}
      <h2 className="anim-fade-up font-display text-lg font-semibold text-ink mt-12 mb-4" style={{ animationDelay: "60ms" }}>
        {labels.homeTitle}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-14">
        <button
          onClick={() => navigate(`/crew/${firstCrewId}`)}
          className="anim-fade-up group text-left rounded-2xl bg-orbiter shadow-panel border border-edge/50 overflow-hidden hover:-translate-y-1 hover:shadow-lift hover:border-telemetry/40 transition-all duration-300"
          style={{ animationDelay: "120ms" }}
        >
          <div className="relative overflow-hidden">
            <img
              src={IMAGES.astronaut}
              alt="NASA astronaut on a spacewalk"
              className="w-full h-44 sm:h-48 object-cover saturate-[0.65] group-hover:saturate-100 group-hover:scale-[1.03] transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-orbiter via-transparent to-transparent" />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-display text-lg font-semibold text-ink group-hover:text-telemetry transition-colors duration-200">
                {labels.crewCard}
              </div>
              <span className="text-ink-muted group-hover:text-telemetry group-hover:translate-x-1 transition-all duration-200">
                <ArrowIcon />
              </span>
            </div>
            <div className="text-xs text-ink-dim mt-1">{labels.crewCardHint}</div>
          </div>
        </button>

        <button
          onClick={() => navigate("/control")}
          className="anim-fade-up group text-left rounded-2xl bg-orbiter shadow-panel border border-edge/50 overflow-hidden hover:-translate-y-1 hover:shadow-lift hover:border-telemetry/40 transition-all duration-300"
          style={{ animationDelay: "180ms" }}
        >
          <div className="relative overflow-hidden">
            <img
              src={IMAGES.missionControl}
              alt="Flight control room at NASA Mission Control Center"
              className="w-full h-44 sm:h-48 object-cover saturate-[0.65] group-hover:saturate-100 group-hover:scale-[1.03] transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-orbiter via-transparent to-transparent" />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-display text-lg font-semibold text-ink group-hover:text-telemetry transition-colors duration-200">
                {labels.controlCard}
              </div>
              <span className="text-ink-muted group-hover:text-telemetry group-hover:translate-x-1 transition-all duration-200">
                <ArrowIcon />
              </span>
            </div>
            <div className="text-xs text-ink-dim mt-1">{labels.controlCardHint}</div>
          </div>
        </button>
      </div>

      {/* Status ladder: one bar, four segments, fills left to right */}
      <h2 className="anim-fade-up font-display text-lg font-semibold text-ink mb-4" style={{ animationDelay: "240ms" }}>
        The four status levels
      </h2>
      <div className="anim-fade-up mb-14" style={{ animationDelay: "300ms" }}>
        <div className="rounded-2xl bg-orbiter shadow-panel overflow-hidden">
          <div className="flex anim-ladder-fill">
            {STATUS_ORDER.map((status) => {
              const style = STATUS_STYLE[status];
              return (
                <div key={status} className="flex-1 relative">
                  <div className="h-[3px]" style={{ backgroundColor: style.bright }} />
                  <div
                    className="px-3 sm:px-4 py-4 sm:py-5 border-r border-edge/40 last:border-r-0"
                    style={{ backgroundColor: style.deep }}
                  >
                    <div className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.14em]" style={{ color: style.bright }}>
                      {style.label}
                    </div>
                    <p className="hidden sm:block text-[11px] text-ink-dim mt-1.5 leading-snug">
                      {status === "NOMINAL" && "All vitals within the safe range."}
                      {status === "ELEVATED" && "One or more vitals trending out of range."}
                      {status === "ANOMALY" && "Significant deviation, action required."}
                      {status === "EMERGENCY" && "Immediate intervention required."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NASA picture of the day: a quiet grace note, served by the backend */}
      <div className="anim-fade-up mb-14" style={{ animationDelay: "360ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <Roundel />
          <span className="text-[10px] font-mono tracking-[0.18em] text-ink-muted uppercase">
            NASA Astronomy Picture of the Day
          </span>
        </div>
        {apod && apod.url ? (
          <div className="rounded-2xl overflow-hidden border border-edge/50 shadow-panel">
            <img
              src={apod.url}
              alt={apod.title || "NASA Astronomy Picture of the Day"}
              className="w-full h-52 sm:h-64 object-cover"
            />
            {apod.title && (
              <div className="px-4 py-3 bg-panel">
                <span className="text-xs text-ink-dim">{apod.title}</span>
              </div>
            )}
          </div>
        ) : (
          <Skeleton className="w-full h-52 sm:h-64" />
        )}
      </div>

      <p className="anim-fade-up text-[11px] text-ink-muted" style={{ animationDelay: "420ms" }}>
        Simulation for the NASA Space Apps Challenge. Not medical advice.
      </p>
    </div>
  );
}
