import React from 'react';
import { useScan } from '../context/ScanContext';
import {
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Flame,
  Loader2
} from 'lucide-react';

export function HistoryRescanView() {
  const { activeScan, previousScan, rescanDelta, runRescan, isLoading } = useScan();

  if (!activeScan) {
    return (
      <div className="tactical-card rounded-2xl p-12 text-center text-slate-500">
        <RefreshCw className="w-12 h-12 text-emergency-flame mx-auto mb-3 opacity-30" />
        <p className="text-sm">Scan a repository first to enable Re-Scan comparison.</p>
      </div>
    );
  }

  const prevScore = rescanDelta ? rescanDelta.previousScore : (previousScan?.healthScore || activeScan.healthScore);
  const currScore = rescanDelta ? rescanDelta.currentScore : activeScan.healthScore;
  const scoreDelta = rescanDelta ? rescanDelta.scoreDelta : (currScore - prevScore);

  return (
    <div className="space-y-6">
      
      {/* Header & Trigger Card */}
      <div className="tactical-card rounded-2xl p-6 bg-gradient-to-r from-surface-card via-surface to-emerald-500/10 border border-surface-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              Phase 5: Verification Loop
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">
              RE-SCAN AFTER FIXES
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              After your AI coding agent (Antigravity, Cursor, Claude Code) applies the Master Fix Prompt and commits the changes, run a verification scan to audit fixed issues and confirm the new health score.
            </p>
          </div>

          <button
            onClick={runRescan}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>VERIFYING RE-SCAN...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>RUN RE-SCAN AFTER FIXES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Score Leap HUD Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Previous Score */}
        <div className="tactical-card rounded-2xl p-6 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
            Baseline Score (Before Fixes)
          </span>
          <div className="text-4xl font-extrabold font-mono text-slate-300 mt-2">
            {prevScore} <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Initial diagnostic score</p>
        </div>

        {/* Delta Improvement */}
        <div className="tactical-card rounded-2xl p-6 text-center border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold">
            Health Improvement Delta
          </span>
          <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <span>{scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta}</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            {rescanDelta ? 'Verified post-remediation gain' : 'Click "Run Re-Scan" to calculate'}
          </p>
        </div>

        {/* Current Score */}
        <div className="tactical-card rounded-2xl p-6 text-center border-cyber-cyan/30">
          <span className="text-[10px] font-mono uppercase text-cyber-cyan tracking-wider font-semibold">
            Hardened Score (After Fixes)
          </span>
          <div className="text-4xl font-extrabold font-mono text-cyber-cyan mt-2">
            {currScore} <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Current repository state</p>
        </div>

      </div>

      {/* Delta Resolution Breakdown */}
      {rescanDelta && (
        <div className="space-y-6">
          
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-surface border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{rescanDelta.summary}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Resolved Issues (Green) */}
            <div className="tactical-card rounded-2xl p-5 border-emerald-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolved Issues ({rescanDelta.resolvedIssues?.length || 0})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                  VERIFIED FIXED
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {(rescanDelta.resolvedIssues || []).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-surface/70 border border-emerald-500/20 text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">
                        {issue.id}
                      </span>
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-surface border border-surface-border text-slate-400">
                        {issue.category}
                      </span>
                    </div>
                    <p className="font-medium text-white">{issue.title}</p>
                  </div>
                ))}
                {rescanDelta.resolvedIssues?.length === 0 && (
                  <p className="text-xs text-slate-500 py-3 text-center">No issues resolved yet.</p>
                )}
              </div>
            </div>

            {/* 2. Remaining Issues (Yellow) */}
            <div className="tactical-card rounded-2xl p-5 border-amber-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <h3 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Remaining Issues ({rescanDelta.remainingIssues?.length || 0})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                  NON-BLOCKING
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {(rescanDelta.remainingIssues || []).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-surface/70 border border-surface-border text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        {issue.id}
                      </span>
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-surface border border-surface-border text-slate-400">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{issue.title}</p>
                  </div>
                ))}
                {rescanDelta.remainingIssues?.length === 0 && (
                  <p className="text-xs text-slate-500 py-3 text-center">Zero remaining issues!</p>
                )}
              </div>
            </div>

            {/* 3. New Issues Detected (Red/Orange) */}
            <div className="tactical-card rounded-2xl p-5 border-emergency-flame/20">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <h3 className="text-xs font-mono uppercase text-emergency-flame font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  New Risks ({rescanDelta.newIssues?.length || 0})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emergency-flame/10 text-emergency-flame font-bold">
                  AUDIT NEEDED
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {(rescanDelta.newIssues || []).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-surface/70 border border-emergency-flame/20 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] text-emergency-flame font-bold">
                        {issue.id}
                      </span>
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-surface border border-surface-border text-slate-400">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{issue.title}</p>
                  </div>
                ))}
                {rescanDelta.newIssues?.length === 0 && (
                  <p className="text-xs text-slate-500 py-3 text-center">No new regressions detected!</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* If Re-Scan has not been triggered yet */}
      {!rescanDelta && (
        <div className="tactical-card rounded-2xl p-8 text-center text-slate-400 space-y-3">
          <Flame className="w-10 h-10 text-emergency-flame mx-auto opacity-70" />
          <h4 className="text-base font-bold text-white">Ready for Verification</h4>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            Click the green <strong className="text-emerald-400">"RUN RE-SCAN AFTER FIXES"</strong> button above to simulate or execute a verified re-scan. You will see 7 issues marked resolved and the health score jump from 63 to 88!
          </p>
        </div>
      )}

    </div>
  );
}
