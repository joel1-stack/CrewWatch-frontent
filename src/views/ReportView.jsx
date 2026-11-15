import { useEffect, useState } from "react";
import { useTelemetry } from "../state/TelemetryContext";
import { LiveApi } from "../api/client";
import { CONFIG, STATUS_STYLE } from "../config";
import Skeleton from "../components/Skeleton";

function buildLocalText(crew, alerts, logs) {
  const lines = [];
  lines.push("MISSION HEALTH REPORT, CrewWatch");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  for (const member of crew) {
    const memberAlerts = alerts.filter((a) => a.crew_id === member.crew_id);
    const acked = memberAlerts.filter((a) => a.state === "ACK").length;
    lines.push(`${member.name || member.crew_id}: status ${member.status}, alerts ${memberAlerts.length}, acknowledged ${acked}`);
  }
  lines.push("");
  lines.push(`Events logged: ${logs.length}`);
  return lines.join("\n");
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M12 3v12M6 11l6 6 6-6M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReportView() {
  const { crew, alerts, logs, injectScenario, backendKind } = useTelemetry();
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  function flash(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const generated = await LiveApi.generateReport(1);
      setReport(generated);
      flash("Report generated on the server.");
    } catch {
      setError("The backend could not generate a report right now. The local export still works.");
    } finally {
      setBusy(false);
    }
  }

  function copySummary() {
    const text = buildLocalText(crew, alerts, logs);
    navigator.clipboard.writeText(text)
      .then(() => flash("Summary copied."))
      .catch(() => flash("Copy failed, use Export text instead."));
  }

  function downloadText() {
    const blob = new Blob([buildLocalText(crew, alerts, logs)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "crewwatch-mission-report.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    flash("Text report exported.");
  }

  function downloadPdf() {
    if (report && report.id) {
      window.open(LiveApi.reportDownloadUrl(report.id), "_blank", "noopener");
      flash("PDF opened in a new tab.");
    }
  }

  useEffect(() => {
    if (CONFIG.FORCE_DEMO || backendKind !== "live") return;
    LiveApi.reportList()
      .then((list) => { if (Array.isArray(list) && list.length) setReport(list[0]); })
      .catch(() => {});
  }, [backendKind]);

  const ackedCount = alerts.filter((a) => a.state === "ACK").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

      {/* Document header */}
      <div className="anim-fade-up flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Mission Health Report</h1>
          <p className="mt-1 text-[11px] font-mono text-ink-muted tabular">
            AUTO-BUILT FROM THE APPEND-ONLY EVENT LOG {String.fromCharCode(183)} {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copySummary}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono tracking-wider rounded-lg border border-edge bg-orbiter text-ink-dim hover:text-ink hover:border-telemetry/50 transition"
          >
            <CopyIcon />
            COPY SUMMARY
          </button>
          <button
            onClick={downloadText}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono tracking-wider rounded-lg border border-edge bg-orbiter text-ink-dim hover:text-ink hover:border-telemetry/50 transition"
          >
            <DownloadIcon />
            EXPORT TEXT
          </button>
          <button
            onClick={generate}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono tracking-wider rounded-lg bg-nasa-blue/40 border border-nasa-blue text-telemetry-glow hover:bg-nasa-blue/60 disabled:opacity-50 transition"
          >
            {busy ? "GENERATING" : "GENERATE PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="anim-fade-up mb-4 px-3 py-2 rounded-lg bg-warn/10 border border-warn/30 text-warn text-xs">
          {error}
        </div>
      )}

      {/* Server-generated report block */}
      {backendKind !== "mock" && (
        <div className="anim-fade-up rounded-2xl bg-orbiter shadow-panel p-5 mb-4" style={{ animationDelay: "60ms" }}>
          <div className="text-[10px] font-mono tracking-[0.2em] text-ink-muted uppercase mb-3">
            Server report, mission day 1
          </div>
          {report ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "TOTAL EVENTS", value: report.total_events, color: "#E6EDF7" },
                  { label: "ANOMALIES", value: report.anomaly_count, color: "#FB923C" },
                  { label: "EMERGENCIES", value: report.emergency_count, color: "#FC3D21" },
                  { label: "ACKNOWLEDGED", value: ackedCount, color: "#10B981" }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-panel p-3">
                    <div className="text-[9px] font-mono tracking-[0.16em] text-ink-muted">{stat.label}</div>
                    <div className="font-mono font-semibold text-2xl tabular mt-1" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
              {report.summary_text && (
                <p className="text-sm text-ink-dim leading-relaxed">{report.summary_text}</p>
              )}
              <button
                onClick={downloadPdf}
                className="mt-4 flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono tracking-wider rounded-lg border border-telemetry/40 text-telemetry hover:bg-telemetry/10 transition"
              >
                <DownloadIcon />
                DOWNLOAD PDF
              </button>
            </>
          ) : busy ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <p className="text-xs text-ink-muted py-2">
              Press GENERATE PDF to build the official report from the live event record.
            </p>
          )}
        </div>
      )}

      {/* Per-crew table */}
      <div className="anim-fade-up rounded-2xl bg-orbiter shadow-panel p-5 mb-4" style={{ animationDelay: "120ms" }}>
        <h2 className="font-display text-sm font-semibold text-ink mb-3">Crew status snapshot</h2>
        <div className="divide-y divide-edge/60">
          {crew.map((member) => {
            const style = STATUS_STYLE[member.status] || STATUS_STYLE.NOMINAL;
            const memberAlerts = alerts.filter((a) => a.crew_id === member.crew_id);
            return (
              <div key={member.crew_id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-ink font-medium truncate">{member.name || member.crew_id}</div>
                  <div className="text-[11px] font-mono text-ink-muted tabular">
                    {memberAlerts.length} alert{memberAlerts.length === 1 ? "" : "s"} {String.fromCharCode(183)}{" "}
                    {memberAlerts.filter((a) => a.state === "ACK").length} acknowledged
                  </div>
                </div>
                <span
                  className="text-[10px] font-mono font-semibold tracking-[0.14em] px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: style.bright, backgroundColor: style.deep, border: `1px solid ${style.bright}33` }}
                >
                  {style.label}
                </span>
              </div>
            );
          })}
          {crew.length === 0 && (
            <div className="py-2 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          )}
        </div>
      </div>

      {/* The document body */}
      <pre className="anim-fade-up whitespace-pre-wrap rounded-2xl bg-orbiter shadow-panel p-5 text-[12px] leading-relaxed text-ink-dim font-mono overflow-x-auto" style={{ animationDelay: "180ms" }}>
        {buildLocalText(crew, alerts, logs)}
      </pre>

      <p className="anim-fade-up mt-4 text-[11px] text-ink-muted" style={{ animationDelay: "240ms" }}>
        Simulation for the NASA Space Apps Challenge. Not medical advice.
      </p>

      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl bg-panel border border-telemetry/40 shadow-lift text-xs text-ink anim-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
