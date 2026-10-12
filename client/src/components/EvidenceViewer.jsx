import React from 'react';
import { FileCode, AlertOctagon, HelpCircle, CheckSquare, Sparkles, Copy, ShieldAlert } from 'lucide-react';
import { useScan } from '../context/ScanContext';

export function EvidenceViewer({ issue }) {
  const { copyPrompt } = useScan();

  if (!issue) {
    return (
      <div className="tactical-card rounded-2xl p-8 text-center text-slate-500">
        <FileCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Select an issue from the list to inspect forensic evidence.</p>
      </div>
    );
  }

  // Taxonomy badge configuration
  const taxonomyConfig = {
    confirmed_evidence: {
      label: 'CONFIRMED BY STATIC EVIDENCE',
      className: 'bg-red-500/15 text-red-400 border-red-500/30',
      icon: ShieldAlert,
      desc: 'Direct line-level proof of unsafe logic or missing guard found in repository.'
    },
    likely_issue: {
      label: 'LIKELY ISSUE (HIGH PROBABILITY)',
      className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      icon: AlertOctagon,
      desc: 'Inferred architectural or concurrency defect based on control flow.'
    },
    potential_risk: {
      label: 'POTENTIAL RISK (REQUIRES VERIFICATION)',
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: HelpCircle,
      desc: 'Context-dependent vulnerability that may trigger under specific edge cases.'
    },
    recommendation: {
      label: 'RECOMMENDATION / BEST PRACTICE',
      className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: CheckSquare,
      desc: 'Proactive test coverage or defensive hardening suggestion.'
    }
  };

  const badgeInfo = taxonomyConfig[issue.evidenceLevel] || taxonomyConfig.potential_risk;
  const BadgeIcon = badgeInfo.icon;

  const copySingleIssuePrompt = () => {
    const singlePrompt = `You are a Senior Engineer repairing this confirmed reliability issue:
Issue: ${issue.title} (${issue.id})
Severity: ${issue.severity.toUpperCase()}
Target File: ${issue.file}
Function/Scope: ${issue.functionOrScope || 'Module'}
Evidence:
${issue.evidence?.snippet}
Problem: ${issue.problem}
Prescribed Fix: ${issue.recommendation}
Required Test Cases:
${(issue.testCases || []).map(t => `- ${t}`).join('\n')}
Fix this file specifically. Ensure all test cases pass and verify no regressions.`;
    copyPrompt(singlePrompt);
  };

  return (
    <div className="tactical-card rounded-2xl p-6 space-y-6">
      
      {/* Header & Badges */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300">
              {issue.id}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 uppercase ${badgeInfo.className}`}>
              <BadgeIcon className="w-3 h-3" />
              {badgeInfo.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Confidence: {Math.round((issue.confidence || 0.8) * 100)}%
            </span>
          </div>

          <button
            onClick={copySingleIssuePrompt}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-surface hover:bg-surface-hover text-slate-300 border border-surface-border transition-all"
            title="Copy prompt for only this specific issue"
          >
            <Copy className="w-3.5 h-3.5 text-emergency-flame" />
            <span>Copy Issue Prompt</span>
          </button>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          {issue.title}
        </h3>

        <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-slate-400">
          <span className="text-emergency-flame font-semibold">
            {issue.file}
          </span>
          {issue.functionOrScope && (
            <>
              <span>•</span>
              <span className="text-cyber-cyan">{issue.functionOrScope}</span>
            </>
          )}
          {issue.evidence?.lineNumbers && (
            <>
              <span>•</span>
              <span className="text-slate-500">Lines: {issue.evidence.lineNumbers}</span>
            </>
          )}
        </div>
      </div>

      {/* Forensic Evidence Code Snippet */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-emergency-flame" />
            Code Evidence from Repository
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {badgeInfo.desc}
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-surface-border bg-background/90">
          <div className="px-4 py-2 bg-surface/80 border-b border-surface-border/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{issue.file}</span>
            <span className="text-emergency-amber font-semibold">Defect Signature</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed selection:bg-emergency-flame/30">
            <code>{issue.evidence?.snippet || '// Evidence referenced in source file'}</code>
          </pre>
        </div>

        {issue.evidence?.explanation && (
          <p className="mt-2 text-xs text-slate-300 bg-surface/50 border border-surface-border/60 p-3 rounded-lg leading-relaxed">
            <strong className="text-emergency-flame font-mono text-[11px] mr-1.5">[REASONING]:</strong>
            {issue.evidence.explanation}
          </p>
        )}
      </div>

      {/* Problem & Impact Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface/50 border border-surface-border p-4 rounded-xl">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emergency-red font-bold mb-1.5">
            Root Problem
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {issue.problem}
          </p>
        </div>

        <div className="bg-surface/50 border border-surface-border p-4 rounded-xl">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emergency-amber font-bold mb-1.5">
            Potential Impact / Blast Radius
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {issue.impact}
          </p>
        </div>
      </div>

      {/* Recommended Fix */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
        <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1.5">
          Recommended Engineering Fix
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed">
          {issue.recommendation}
        </p>
      </div>

      {/* Required Test Scenarios */}
      {issue.testCases && issue.testCases.length > 0 && (
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-cyber-cyan" />
            Mandatory Regression Test Scenarios
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {issue.testCases.map((tc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 bg-surface/40 border border-surface-border/60 p-2.5 rounded-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan mt-1.5 shrink-0" />
                <span>{tc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
