import { useParams, useNavigate } from "react-router-dom";
import { useTelemetry } from "../state/TelemetryContext";
import { STATUS_STYLE, METRICS, LABELS } from "../config";
import StatusBadge from "../components/StatusBadge";
import VitalTile from "../components/VitalTile";
import { guidanceFor, sentenceFor } from "../data/guidance";

export default function CrewView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { crew, alerts, earthMode, ackAlert } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;

  const me = crew.find((c) => c.crew_id === id) || crew[0];
  if (!me) {
    return (
      <div className="p-8 text-slate-400">
        Connecting to telemetry...
      </div>
    );
  }

  const style = STATUS_STYLE[me.status] || STATUS_STYLE.NOMINAL;
  const myAlert = alerts.find((a) => a.crew_id === me.crew_id && a.state !== "ACK");
  const reasonMetric = myAlert ? myAlert.triggered_by : me.triggered_by;
  const guidance = reasonMetric
    ? guidanceFor(reasonMetric, myAlert ? myAlert.level : me.status)
    : null;

  const trendText =
    me.trend === "worsening" ? "Trend is worsening. Act now."
    : me.trend === "improving" ? "Trend is improving. Keep monitoring."
    : "Trend is stable.";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <StatusBadge status={me.status} />
      </div>

      {/* Large, legible status banner */}
      <div
        className="rounded-2xl p-6 mb-4 border"
        style={{ backgroundColor: style.bg, borderColor: `${style.color}66` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-300">
              {labels.crew}: <span className="text-slate-100 font-semibold">{me.name || me.crew_id}</span>
              {me.role ? <span className="text-slate-400"> {String.fromCharCode(183)} {me.role}</span> : null}
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold leading-snug" style={{ color: style.color }}>
              {me.status === "NOMINAL"
                ? "All systems within the expected range. Keep going."
                : `${sentenceFor(reasonMetric)} Status: ${style.label}.`}
            </div>
            <div className="mt-1 text-sm text-slate-300">{trendText}</div>
          </div>
        </div>
      </div>

      {/* Action card: what to do next */}
      {myAlert && (
        <div className="rounded-2xl bg-cabin-800 border border-cabin-700 p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-100">
              {guidance ? guidance.title : "Recommended action"}
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {myAlert.guidance_id || "PROTOCOL"}
            </span>
          </div>

          {myAlert.guidance_text && (
            <p className="text-sm text-slate-300 mb-3">{myAlert.guidance_text}</p>
          )}

          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-300 mb-4">
            {(guidance ? guidance.steps : ["Follow flight surgeon instructions."]).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <div className="text-xs text-slate-400 mb-3">
            {labels.responder}: <span className="text-slate-200 font-medium">{myAlert.responder}</span>
            <span className="mx-1 text-slate-600">|</span>
            Alert opened {new Date(myAlert.created_ts).toLocaleTimeString()}
          </div>

          <button
            onClick={() => ackAlert(myAlert.id, me.name || "Crew Member")}
            className="px-5 py-3 rounded-xl bg-warn text-cabin-900 font-bold text-sm hover:brightness-110 transition"
          >
            Acknowledge: I am on it
          </button>
        </div>
      )}

      {/* Vitals with live sparklines */}
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
