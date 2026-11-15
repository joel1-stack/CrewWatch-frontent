import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTelemetry } from "./state/TelemetryContext";
import { LABELS } from "./config";
import Header from "./components/Header";
import RoleSelect from "./views/RoleSelect";
import CrewView from "./views/CrewView";
import MissionControlView from "./views/MissionControlView";
import ReportView from "./views/ReportView";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4" aria-hidden="true">
      <path d="M3 11l9-8 9 8M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ControlIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Footer nav: fixed bottom bar on mobile, quiet footer line on desktop.
function NavFooter({ earthMode }) {
  const labels = earthMode ? LABELS.earth : LABELS.space;
  const items = [
    { href: "#/", label: "Home", icon: <HomeIcon /> },
    { href: "#/control", label: labels.missionControl, icon: <ControlIcon /> },
    { href: "#/report", label: "Mission Report", icon: <ReportIcon /> }
  ];
  return (
    <>
      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-void/95 backdrop-blur border-t border-edge/60">
        <div className="grid grid-cols-3">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono tracking-wider text-ink-dim hover:text-telemetry active:text-telemetry transition-colors"
            >
              {item.icon}
              <span className="truncate max-w-[92px] px-1">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Desktop footer */}
      <footer className="hidden md:block border-t border-edge/60 pb-6 pt-4">
        <nav className="max-w-7xl mx-auto px-6 flex gap-6 text-[11px] font-mono tracking-wider text-ink-muted">
          {items.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-telemetry transition-colors">
              {item.label}
            </a>
          ))}
          <span className="ml-auto">Simulation {String.fromCharCode(183)} Not medical advice</span>
        </nav>
      </footer>
    </>
  );
}

export default function App() {
  const { earthMode, setEarthMode, linkState, backendKind } = useTelemetry();
  return (
    <HashRouter>
      <div className={`min-h-screen bg-void text-ink flex flex-col ${earthMode ? "earth-shift" : "space-shift"}`}>
        <Header earthMode={earthMode} setEarthMode={setEarthMode} linkState={linkState} backendKind={backendKind} />
        <main className="flex-1 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<RoleSelect />} />
            <Route path="/crew/:id" element={<CrewView />} />
            <Route path="/control" element={<MissionControlView />} />
            <Route path="/report" element={<ReportView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <NavFooter earthMode={earthMode} />
      </div>
    </HashRouter>
  );
}
