import { useNavigate } from "react-router-dom";
import { useTelemetry } from "../state/TelemetryContext";
import { LABELS, IMAGES, STATUS_ORDER, STATUS_STYLE } from "../config";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RoleSelect() {
  const navigate = useNavigate();
  const { earthMode, apod, crew, backendKind } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;
  const firstCrewId = crew[0] ? crew[0].crew_id : "first";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-cabin-700 mb-10">
        <img
          src={IMAGES.earthHorizon}
          alt="Earth observed from the International Space Station"
          className="w-full h-64 sm:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cabin-900 via-cabin-900/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-ok mb-2 font-mono">
            NASA Space Apps Challenge 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 max-w-xl leading-tight">
            Continuous health watch for crews far from help
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
            Vitals stream in live. Status is classified in plain language. Warnings reach a
            named responder with exact next steps, and every event lands in the mission report.
          </p>
        </div>
        {backendKind === "mock" && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-danger/20 border border-danger/40 text-danger text-xs font-mono">
            SIMULATED FEED
          </div>
        )}
      </div>

      {/* Role selection */}
      <h2 className="text-xl font-semibold text-slate-100 mb-4">{labels.homeTitle}</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => navigate(`/crew/${firstCrewId}`)}
          className="group text-left rounded-2xl overflow-hidden bg-cabin-800 border border-cabin-700 hover:border-ok/60 transition"
        >
          <img
            src={IMAGES.astronaut}
            alt="NASA astronaut on a spacewalk"
            className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-300"
          />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-100 group-hover:text-ok transition">
                {labels.crewCard}
              </div>
              <span className="text-slate-500 group-hover:text-ok transition"><ArrowIcon /></span>
            </div>
            <div className="text-sm text-slate-400 mt-1">{labels.crewCardHint}</div>
          </div>
        </button>

        <button
          onClick={() => navigate("/control")}
          className="group text-left rounded-2xl overflow-hidden bg-cabin-800 border border-cabin-700 hover:border-sky-400/60 transition"
        >
          <img
            src={IMAGES.missionControl}
            alt="Flight control room at NASA Mission Control Center"
            className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-300"
          />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-100 group-hover:text-sky-300 transition">
                {labels.controlCard}
              </div>
              <span className="text-slate-500 group-hover:text-sky-300 transition"><ArrowIcon /></span>
            </div>
            <div className="text-sm text-slate-400 mt-1">{labels.controlCardHint}</div>
          </div>
        </button>
      </div>

      {/* Status ladder legend */}
      <h2 className="text-xl font-semibold text-slate-100 mb-3">The four status levels</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {STATUS_ORDER.map((status) => {
          const style = STATUS_STYLE[status];
          return (
            <div
              key={status}
              className="rounded-xl border p-4"
              style={{ backgroundColor: style.bg, borderColor: `${style.color}55` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
                <span className="font-semibold" style={{ color: style.color }}>{style.label}</span>
              </div>
              <p className="text-xs text-slate-400">
                {status === "NOMINAL" && "All vitals within the safe range."}
                {status === "ELEVATED" && "One or more vitals trending out of range."}
                {status === "ANOMALY" && "Significant deviation, action required."}
                {status === "EMERGENCY" && "Immediate intervention required."}
              </p>
            </div>
          );
        })}
      </div>

      {/* NASA picture of the day, served by the backend */}
      {apod && apod.url && (
        <div className="rounded-2xl overflow-hidden border border-cabin-700 relative">
          <img
            src={apod.url}
            alt={apod.title || "NASA Astronomy Picture of the Day"}
            className="w-full max-h-72 object-cover opacity-80"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-cabin-900 to-transparent p-4">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              NASA Astronomy Picture of the Day
            </div>
            <div className="text-sm text-slate-200 font-medium">{apod.title}</div>
          </div>
        </div>
      )}

      <p className="mt-8 text-[11px] text-slate-500">
        Simulation for the NASA Space Apps Challenge. Not medical advice.
      </p>
    </div>
  );
}
