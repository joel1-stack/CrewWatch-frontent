import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTelemetry } from "./state/TelemetryContext";
import { LABELS } from "./config";
import Header from "./components/Header";
import RoleSelect from "./views/RoleSelect";
import CrewView from "./views/CrewView";
import MissionControlView from "./views/MissionControlView";
import ReportView from "./views/ReportView";

function NavFooter() {
  const { earthMode } = useTelemetry();
  const labels = earthMode ? LABELS.earth : LABELS.space;
  return (
    <nav className="max-w-6xl mx-auto px-4 py-3 flex gap-4 text-xs text-slate-500">
      <a href="#/" className="hover:text-slate-300">Home</a>
      <a href="#/control" className="hover:text-slate-300">{labels.missionControl}</a>
      <a href="#/report" className="hover:text-slate-300">Mission Report</a>
      <span className="ml-auto">Simulation · Not medical advice</span>
    </nav>
  );
}

export default function App() {
  const { earthMode, setEarthMode, linkState, backendKind } = useTelemetry();
  return (
    <HashRouter>
      <div className="min-h-screen bg-cabin-900 text-slate-200 flex flex-col">
        <Header earthMode={earthMode} setEarthMode={setEarthMode} linkState={linkState} backendKind={backendKind} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<RoleSelect />} />
            <Route path="/crew/:id" element={<CrewView />} />
            <Route path="/control" element={<MissionControlView />} />
            <Route path="/report" element={<ReportView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-cabin-700">
          <NavFooter />
        </footer>
      </div>
    </HashRouter>
  );
}
