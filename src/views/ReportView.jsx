import { useEffect, useState } from "react";
import { useTelemetry } from "../state/TelemetryContext";
import { LiveApi } from "../api/client";
import { CONFIG, STATUS_STYLE } from "../config";

function buildLocalText(crew, alerts, logs) {
  const lines = [];
  lines.push("MISSION HEALTH REPORT, CrewWatch");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  for (const member of crew) {
    const memberAlerts = alerts.filter((a) => a.crew_id === member.crew_id);
    lines.push(`${member.name || member.crew_id} (${member.crew_id}): status ${member.status}`);
    if (memberAlerts.length) {
      lines.push(`  Alerts: ${memberAlerts.map((a) => `${a.level} ${a.state}`).join(", ")}`);
    }
    lines.push("");
  }
  lines.push(`Events logged: ${logs.length}`);
  return lines.join("\n");
}

export default function ReportView() {
  const { crew, alerts, logs, injectScenario, backendKind } = useTelemetry();
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const generated = await LiveApi.generateReport(1);
      setReport(generated);
    } catch {
      setError("The backend could not generate a report right now. The local export below still works.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const text = buildLocalText(crew, alerts, logs);
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "crewwatch-mission-report.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function downloadPdf() {
    if (report && report.id) {
      window.open(LiveApi.reportDownloadUrl(report.id), "_blank", "noopener");
    }
  }

  useEffect(() => {
    // Load the most recent generated report if the backend already has one.
    if (CONFIG.FORCE_DEMO || backendKind !== "live") return;
    LiveApi.reportList()
      .then((list) => { if (Array.isArray(list) && list.length) setReport(list[0]); })
      .catch(() => {});
  }, [backendKind]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-100">Mission Health Report</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => injectScenario("full_recovery", crew[0] && crew[0].crew_id)}
            className="px-3 py-1.5 text-xs rounded-lg bg-cabin-800 border border-cabin-700 text-slate-300 hover:bg-cabin-700 transition"
          >
            Reset scenario
          </button>
          <button
            onClick={download}
            className="px-3 py-1.5 text-xs rounded-lg bg-ok/20 text-ok font-semibold hover:bg-ok/30 transition"
          >
            Export text
          </button>
          <button
            onClick={generate}
            disabled={busy}
            className="px-3 py-1.5 text-xs rounded-lg bg-sky-500/20 text-sky-300 font-semibold hover:bg-sky-500/30 disabled:opacity-50 transition"
          >
            {busy ? "Generating..." : "Generate on server"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-warn/10 border border-warn/30 text-warn text-xs">
          {error}
        </div>
      )}

      {report && (
        <div className="rounded-2xl bg-cabin-800 border border-cabin-700 p-5 mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Server report, mission day {report.mission_day}
              </div>
              <div className="text-xs text-slate-400">
                Generated {new Date(report.generated_at).toLocaleString()}
              </div>
            </div>
            <button
              onClick={downloadPdf}
              className="px-3 py-1.5 text-xs rounded-lg bg-cabin-700 text-slate-200 hover:bg-cabin-600 transition"
            >
              Download PDF
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-cabin-900 py-2">
              <div className="text-[11px] uppercase text-slate-500">Total events</div>
              <div className="text-xl font-bold text-slate-100">{report.total_events}</div>
            </div>
            <div className="rounded-lg bg-cabin-900 py-2">
              <div className="text-[11px] uppercase text-slate-500">Anomalies</div>
              <div className="text-xl font-bold text-alert">{report.anomaly_count}</div>
            </div>
            <div className="rounded-lg bg-cabin-900 py-2">
              <div className="text-[11px] uppercase text-slate-500">Emergencies</div>
              <div className="text-xl font-bold text-danger">{report.emergency_count}</div>
            </div>
          </div>
          {report.summary_text && (
            <p className="mt-3 text-sm text-slate-300">{report.summary_text}</p>
          )}
        </div>
      )}

      {/* Crew status snapshot */}
      <div className="rounded-2xl bg-cabin-800 border border-cabin-700 p-5 mb-4">
        <h2 className="font-semibold text-slate-100 mb-3">Crew status snapshot</h2>
        <ul className="divide-y divide-cabin-700">
          {crew.map((member) => {
            const style = STATUS_STYLE[member.status] || STATUS_STYLE.NOMINAL;
            return (
              <li key={member.crew_id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-slate-100 font-medium truncate">
                    {member.name || member.crew_id}
                  </div>
                  <div className="text-xs text-slate-500">{member.role || ""}</div>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: style.color, backgroundColor: style.bg }}
                >
                  {style.label}
                </span>
              </li>
            );
          })}
          {crew.length === 0 && <li className="py-2 text-sm text-slate-400">Loading crew...</li>}
        </ul>
      </div>

      <pre className="whitespace-pre-wrap rounded-2xl bg-cabin-800 border border-cabin-700 p-5 text-sm text-slate-300 font-mono overflow-x-auto">
        {buildLocalText(crew, alerts, logs)}
      </pre>

      <p className="mt-4 text-[11px] text-slate-500">
        Auto-built from the append-only event log. Simulation. Not medical advice.
      </p>
    </div>
  );
}
