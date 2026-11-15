import { LABELS } from "../config";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21M12 3c-2.5 2.6-3.8 5.7-3.8 9s1.3 6.4 3.8 9" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" aria-hidden="true">
      <path d="M12 2c3.5 2 5 5.5 5 9l-2 2h-6l-2-2c0-3.5 1.5-7 5-9z" />
      <path d="M9 13l-2.5 3.5M15 13l2.5 3.5" />
      <circle cx="12" cy="9" r="1.6" />
    </svg>
  );
}

export default function Header({ earthMode, setEarthMode, linkState, backendKind }) {
  const labels = earthMode ? LABELS.earth : LABELS.space;
  const linkText =
    linkState === "ws" ? "LINK LIVE" :
    linkState === "polling" ? "LINK POLLING" :
    backendKind === "mock" ? "SIMULATED FEED" : "LINK OFFLINE";
  const linkColor =
    linkState === "ws" ? "text-ok" :
    linkState === "polling" ? "text-warn" : "text-danger";

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-cabin-900/85 border-b border-cabin-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <a href="#/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="CrewWatch" className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight text-slate-100">
            Crew<span className="text-ok">Watch</span>
          </span>
        </a>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          NASA Space Apps 2026, The Next Frontier
        </span>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <span className={`text-[11px] font-mono ${linkColor}`}>{linkText}</span>
          <button
            onClick={() => setEarthMode(!earthMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-cabin-700 bg-cabin-800 text-slate-200 hover:bg-cabin-700 transition"
            title="Toggle between space mission mode and Earth clinic mode"
          >
            {earthMode ? <GlobeIcon /> : <RocketIcon />}
            {earthMode ? "Earth Mode" : "Space Mode"}
          </button>
          <span className="text-xs text-slate-400 hidden md:inline">{labels.missionControl}</span>
        </div>
      </div>
    </header>
  );
}
