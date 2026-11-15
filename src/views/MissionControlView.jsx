import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTelemetry } from "../state/TelemetryContext";
import { STATUS_STYLE, METRICS, SCENARIOS, LABELS } from "../config";
import StatusBadge from "../components/StatusBadge";
import VitalTile from "../components/VitalTile";
import AlertPanel from "../components/AlertPanel";
import Timeline from "../components/Timeline";
import Skeleton from "../components/Skeleton";
import { guidanceFor, sentenceFor } from "../data/guidance";

const TREND_COLOR = {
  worsening: "text-danger",
  improving: "text-ok",
  stable: "text-ink-muted",
  changing: "text-warn"
};

export default function MissionControlView() {
  const navigate = useNavigate();
  const { crew, alerts, logs, earthMode, ackAlert, injectScenario, backendKind } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;
  const [selected, setSelected] = useState("");
  const [toast, setToast] = useState(null);

  const focus = crew.find((c) => c.crew_id === selected) || crew[0] || null;
  const openCount = alerts.filter((a) => a.state !== "ACK").length;
  const focusAlert = focus
    ? alerts.find((a) => a.crew_id === focus.crew_id && a.state !== "ACK")
    : null;
  const focusGuidance = focusAlert && focusAlert.triggered_by
    ? guidanceFor(focusAlert.triggered_by, focusAlert.level)
    : null;

  function flash(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }

  function runScenario(scenario) {
    if (focus) injectScenario(scenario.id, focus.crew_id);
    flash(scenario.id === "full_recovery" ? "Reset applied." : `Scenario ${scenario.label.toLowerCase()} injected for ${focus ? focus.name : "crew"}.`);
  }

  const nominalCount = crew.filter((c) => c.status === "NOMINAL").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

      {/* Top bar: one glance, whole crew */}
      <div className="anim-fade-up flex items-center gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-semibold text-ink">{labels.missionControl}</h1>
        </div>

        {/* Crew status pill strip: click to focus */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {crew.length === 0 && <Skeleton className="h-7 w-40 rounded-full" />}
          {crew.map((member) => {
            const style = STATUS_STYLE[member.status] || STATUS_STYLE.NOMINAL;
            const active = focus && focus.crew_id === member.crew_id;
            return (
              <button
                key={member.crew_id}
                onClick={() => setSelected(member.crew_id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-wider transition-all duration-200 ${
                  active ? "border-telemetry/60 bg-panel" : "border-edge/60 bg-orbiter hover:border-edge"
                }`}
                title={`${member.name}: ${style.label}`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${member.status !== "NOMINAL" ? "anim-breathe" : ""}`}
                  style={{ backgroundColor: style.bright }}
                />
                <span className="text-ink-dim">{(member.name || member.crew_id).split(" ").slice(-1)[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Demo control, clearly labeled as intentional */}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="hidden md:inline text-[9px] font-mono tracking-[0.2em] text-ink-muted uppercase">
            Demo Control
          </span>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => runScenario(scenario)}
              className={`px-2.5 py-1.5 text-[10px] font-mono tracking-wider rounded-lg border transition-all duration-200 active:scale-[0.97] ${
                scenario.id === "full_recovery"
                  ? "border-edge bg-orbiter text-ink-dim hover:text-ink hover:border-edge"
                  : "border-edge bg-orbiter text-ink-dim hover:text-warn hover:border-warn/50"
              }`}
              title={`Inject the ${scenario.label.toLowerCase()} scenario for the focused crew member`}
            >
              {scenario.id === "full_recovery" ? "RESET" : scenario.label.split(" ")[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Three columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Column A: focused crew detail */}
        <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
          {focus ? (
            <>
              <div
                key={focus.status}
                className="relative rounded-2xl overflow-hidden p-5"
                style={{ backgroundColor: STATUS_STYLE[focus.status].deep }}
              >
                <span
                  className="absolute top-0 inset-x-0 h-[2px]"
                  style={{ backgroundColor: STATUS_STYLE[focus.status].bright }}
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold text-ink truncate">
                      {focus.name || focus.crew_id}
                    </div>
                    <div className="text-[11px] text-ink-dim truncate">{focus.role || ""}</div>
                  </div>
                  <StatusBadge status={focus.status} />
                </div>
                <p className="mt-2.5 text-sm" style={{ color: STATUS_STYLE[focus.status].bright }}>
                  {focus.status === "NOMINAL"
                    ? "All vitals within the safe range."
                    : sentenceFor(focusAlert ? focusAlert.triggered_by : focus.triggered_by)}
                </p>
                <p className="mt-1 text-[11px] text-ink-dim">
                  <span className={`font-mono ${TREND_COLOR[focus.trend] || "text-ink-muted"}`}>
                    {focus.trend.toUpperCase()}
                  </span>
                  {focus.triggered_by && (
                    <span> <span className="text-edge">|</span> watch: {focus.triggered_by.replace(/_/g, " ")}</span>
                  )}
                </p>
                <button
                  onClick={() => navigate(`/crew/${focus.crew_id}`)}
                  className="mt-3 text-[10px] font-mono tracking-[0.18em] text-telemetry hover:text-telemetry-glow transition-colors"
                >
                  OPEN FULL VIEW
                </button>
              </div>

              {/* Next step card for the focused crew */}
              {focusAlert && (
                <div className="anim-slide-in rounded-2xl bg-orbiter shadow-panel p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-display text-sm font-semibold text-ink">
                      {focusGuidance ? focusGuidance.title : "Recommended action"}
                    </h3>
                    <span className="text-[9px] font-mono tracking-widest text-ink-muted">
                      {focusAlert.guidance_id || "PROTOCOL"}
                    </span>
                  </div>
                  <ol className="space-y-2 mb-4">
                    {(focusGuidance ? focusGuidance.steps : ["Follow flight surgeon instructions."]).map((step, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <span className="font-mono text-telemetry text-xs mt-0.5">{i + 1}</span>
                        <span className="text-xs text-ink leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={() => ackAlert(focusAlert.id, "Flight Surgeon")}
                    className="w-full px-4 py-2.5 rounded-xl bg-telemetry text-void font-display font-semibold text-xs hover:brightness-110 active:scale-[0.98] transition"
                  >
                    Acknowledge
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {Object.keys(METRICS).map((metric) => (
                  <VitalTile
                    key={metric}
                    metric={metric}
                    value={focus.vitals ? focus.vitals[metric] : undefined}
                    history={focus.history}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-36 rounded-2xl" />
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            </div>
          )}
        </div>

        {/* Column B: active alerts */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <AlertPanel alerts={alerts} responderLabel={labels.responder} onAck={ackAlert} />
        </div>

        {/* Column C: the audit trail */}
        <div className="lg:col-span-3 order-3">
          <Timeline logs={logs} />
        </div>
      </div>

      {/* Bottom strip: mission health summary, always visible */}
      <div className="anim-fade-up mt-4 rounded-2xl bg-orbiter shadow-panel px-4 py-3 flex items-center justify-between gap-3 overflow-x-auto">
        {[
          { label: "CREW", value: crew.length },
          { label: "NOMINAL", value: nominalCount },
          { label: "ALERTS", value: openCount },
          { label: "EVENTS", value: logs.length }
        ].map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2 shrink-0">
            <span className="text-[10px] font-mono tracking-[0.18em] text-ink-muted">{stat.label}</span>
            <span className="font-mono font-semibold text-sm tabular text-ink">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Toast: quiet confirmation, no blocking dialogs */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl bg-panel border border-telemetry/40 shadow-lift text-xs text-ink anim-fade-up whitespace-nowrap">
          {toast}
        </div>
      )}

      {backendKind === "mock" && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-[11px] font-mono text-center">
          DEMO FEED ACTIVE
        </div>
      )}
    </div>
  );
}
