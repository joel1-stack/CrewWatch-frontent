import { useParams, useNavigate } from "react-router-dom";
import { useTelemetry } from "../state/TelemetryContext";
import { STATUS_STYLE, METRICS, LABELS } from "../config";
import VitalTile from "../components/VitalTile";
import Skeleton from "../components/Skeleton";
import { guidanceFor, sentenceFor } from "../data/guidance";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4 anim-draw-check" aria-hidden="true">
      <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CrewView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { crew, alerts, earthMode, ackAlert } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;

  const me = crew.find((c) => c.crew_id === id) || crew[0];

  if (!me) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const style = STATUS_STYLE[me.status] || STATUS_STYLE.NOMINAL;
  const myAlert = alerts.find((a) => a.crew_id === me.crew_id && a.state !== "ACK");
  const reasonMetric = myAlert ? myAlert.triggered_by : me.triggered_by;
  const guidance = reasonMetric
    ? guidanceFor(reasonMetric, myAlert ? myAlert.level : me.status)
    : null;

  const initials = (me.name || me.crew_id)
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const trendText =
    me.trend === "worsening" ? "Trend is worsening. Act now."
    : me.trend === "improving" ? "Trend is improving. Keep monitoring."
    : "Trend is stable.";

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-ink-dim hover:text-ink transition-colors"
        >
          <BackIcon />
          BACK
        </button>
        <span className="text-[10px] font-mono tracking-[0.18em] text-ink-muted uppercase">
          {initials} {String.fromCharCode(183)} {labels.crew}
        </span>
      </div>

      {/* Status banner: the hero of this screen, calm until it is not */}
      <div
        key={me.status}
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8 mb-4 anim-fade-up"
        style={{ backgroundColor: style.deep }}
      >
        <span className="absolute top-0 inset-x-0 h-[3px]" style={{ backgroundColor: style.bright }} aria-hidden="true" />
        <span
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-16 rounded-full anim-status-pulse"
          style={{ color: style.bright, opacity: 0.25 }}
          aria-hidden="true"
        />
        <div className="text-center">
          <div className="font-display text-4xl sm:text-5xl font-bold tracking-[0.08em]" style={{ color: style.bright }}>
            {style.label}
          </div>
          <p className="mt-3 text-sm sm:text-base text-ink max-w-md mx-auto leading-relaxed">
            {me.status === "NOMINAL"
              ? "All vitals are within the safe range. Keep going."
              : `${sentenceFor(reasonMetric)} Status: ${style.label.toLowerCase()}.`}
          </p>
          <p className="mt-2 text-xs text-ink-dim">{trendText}</p>
        </div>
      </div>

      {/* Next step card: appears only when it matters */}
      {myAlert && (
        <div className="anim-slide-in rounded-2xl bg-orbiter shadow-panel p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-ink">
              {guidance ? guidance.title : "Recommended action"}
            </h2>
            <span className="text-[10px] font-mono tracking-widest text-ink-muted">
              {myAlert.guidance_id || "PROTOCOL"}
            </span>
          </div>

          {myAlert.guidance_text && (
            <p className="text-sm text-ink-dim mb-4 leading-relaxed">{myAlert.guidance_text}</p>
          )}

          <ol className="space-y-2.5 mb-5">
            {(guidance ? guidance.steps : ["Follow flight surgeon instructions."]).map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="font-mono text-telemetry text-sm mt-0.5">{i + 1}</span>
                <span className="text-sm text-ink leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          <div className="text-[11px] text-ink-muted mb-3">
            {labels.responder}: <span className="text-ink-dim font-medium">{myAlert.responder}</span>
            <span className="mx-1.5 text-edge">|</span>
            Alert opened {new Date(myAlert.created_ts).toLocaleTimeString()}
          </div>

          <button
            onClick={() => ackAlert(myAlert.id, me.name || "Crew Member")}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-telemetry text-void font-display font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition"
          >
            <CheckIcon />
            Acknowledge: I am on it
          </button>
        </div>
      )}

      {/* Vitals grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.keys(METRICS).map((metric) => (
          <VitalTile
            key={metric}
            metric={metric}
            value={me.vitals ? me.vitals[metric] : undefined}
            history={me.history}
          />
        ))}
      </div>
    </div>
  );
}
