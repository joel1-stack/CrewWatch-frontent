import { LABELS } from "../config";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21M12 3c-2.5 2.6-3.8 5.7-3.8 9s1.3 6.4 3.8 9" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M12 2c3.5 2 5 5.5 5 9l-2 2h-6l-2-2c0-3.5 1.5-7 5-9z" />
      <path d="M9 13l-2.5 3.5M15 13l2.5 3.5" />
      <circle cx="12" cy="9" r="1.6" />
    </svg>
  );
}

// The single most important live element breathes; everything else stays quiet.
function LivePill({ state, backendKind }) {
  const live = state === "ws" || state === "polling";
  const degraded = state === "polling";
  const offline = state === "offline";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.14em] ${
        offline
          ? "border-danger/40 text-danger"
          : degraded
            ? "border-warn/40 text-warn"
            : "border-telemetry/40 text-telemetry"
      }`}
      title={offline ? "Backend unreachable, built-in simulated feed active" : "Real-time link to the CrewWatch backend"}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          offline ? "bg-danger" : degraded ? "bg-warn" : "bg-telemetry anim-breathe"
        }`}
      />
      {live ? (degraded ? "DEGRADED" : "LIVE") : "DEMO"}
    </span>
  );
}

export default function Header({ earthMode, setEarthMode, linkState, backendKind }) {
  return (
    <header className="sticky top-0 z-30 bg-void/90 backdrop-blur border-b border-edge/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <a href="#/" className="flex items-center gap-3 group">
          <img src="/favicon.svg" alt="CrewWatch" className="w-6 h-6" />
          <span className="font-mono font-semibold text-sm tracking-[0.22em] text-ink uppercase">
            Crew<span className="text-telemetry">Watch</span>
          </span>
          <span className="hidden lg:block h-3 w-px bg-edge" />
          <span className="hidden lg:block text-[10px] font-mono tracking-[0.18em] text-ink-muted uppercase">
            {earthMode ? LABELS.earth.missionControl : LABELS.space.missionControl}
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LivePill state={linkState} backendKind={backendKind} />
          <button
            onClick={() => setEarthMode(!earthMode)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono tracking-wider rounded-lg border border-edge bg-panel text-ink-dim hover:text-ink hover:border-telemetry/50 transition-colors duration-200"
            title="Toggle between space mission mode and Earth clinic mode"
          >
            {earthMode ? <GlobeIcon /> : <RocketIcon />}
            <span className="hidden sm:inline">{earthMode ? "EARTH" : "SPACE"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
