import React, { useState } from 'react';
import { useScan } from '../context/ScanContext';
import {
  Sparkles,
  Copy,
  Check,
  Bot,
  ShieldCheck,
  FileCheck2,
  Terminal,
  Download,
  Flame,
  ArrowRight
} from 'lucide-react';

export function MasterPromptView() {
  const { activeScan, copyPrompt, selectedAgent, changeAgent, setActiveTab } = useScan();
  const [copied, setCopied] = useState(false);

  if (!activeScan) {
    return (
      <div className="tactical-card rounded-2xl p-12 text-center text-slate-500">
        <Sparkles className="w-12 h-12 text-emergency-flame mx-auto mb-3 opacity-30" />
        <p className="text-sm">Scan a repository first to synthesize the Master Fix Prompt.</p>
      </div>
    );
  }

  const promptText = activeScan.masterFixPrompt || '// Generating Master Fix Prompt...';
  const issues = activeScan.issues || [];

  const handleCopy = () => {
    copyPrompt();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadPrompt = () => {
    const blob = new Blob([promptText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FIRE_DRILL_FIX_PROMPT_${activeScan.repo?.name || 'REPO'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const agents = [
    { id: 'antigravity', name: 'Google Antigravity', badge: 'Recommended' },
    { id: 'cursor', name: 'Cursor AI (Composer)', badge: 'Supported' },
    { id: 'claude', name: 'Claude Code', badge: 'Supported' },
    { id: 'copilot', name: 'GitHub Copilot', badge: 'Supported' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Header Box */}
      <div className="tactical-card rounded-2xl p-6 border-2 border-emergency-flame/40 bg-gradient-to-br from-surface-card via-surface to-emergency-flame/5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emergency-flame text-white rounded shadow-sm">
                ★ HERO ASSET
              </span>
              <span className="text-xs font-mono text-slate-400">
                Executable Pre-Flight Directive
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              MASTER FIX PROMPT
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Paste this directly into <strong className="text-white">Antigravity, Cursor, Claude Code</strong> or your preferred AI coding assistant.
              It instructs the agent on exact file locations, evidence, root causes, defensive constraints, and mandatory test suites.
            </p>
          </div>

          {/* Massive Action Button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-extrabold text-sm tracking-wide text-white transition-all shadow-xl ${
                copied
                  ? 'bg-emerald-600 shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-gradient-to-r from-emergency-flame to-emergency-red shadow-emergency-flame/30 hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>PROMPT COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY MASTER PROMPT</span>
                </>
              )}
            </button>

            <button
              onClick={downloadPrompt}
              className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-xs font-mono font-semibold bg-surface hover:bg-surface-hover text-slate-300 border border-surface-border transition-all"
              title="Download prompt as markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
          </div>

        </div>

        {/* Agent Switcher Bar */}
        <div className="mt-6 pt-5 border-t border-surface-border/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-semibold flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emergency-amber" /> Format for Agent:
            </span>
            <div className="flex flex-wrap gap-2">
              {agents.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => changeAgent(ag.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono font-semibold transition-all flex items-center gap-1.5 ${
                    selectedAgent === ag.id
                      ? 'bg-emergency-flame text-white shadow-md shadow-emergency-flame/30 ring-1 ring-emergency-flame'
                      : 'bg-surface hover:bg-surface-hover text-slate-300 border border-surface-border'
                  }`}
                >
                  <span>{ag.name}</span>
                  {ag.badge === 'Recommended' && (
                    <span className="text-[9px] uppercase bg-black/30 px-1 py-0.2 rounded text-amber-200">
                      ★
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>{issues.length} Issues Packaged</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Secret Leakage
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Checklist: What This Prompt Solves */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-surface/50 border border-surface-border p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">1. Scope Bounds</span>
          <p className="text-xs text-slate-200 font-semibold mt-1">Strict File Locks</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Prevents AI coding agents from modifying unrelated code.</p>
        </div>

        <div className="bg-surface/50 border border-surface-border p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">2. Root Cause Evidence</span>
          <p className="text-xs text-slate-200 font-semibold mt-1">Line-Level Snippets</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Direct proof of the race condition or missing guard.</p>
        </div>

        <div className="bg-surface/50 border border-surface-border p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">3. Defensive Measures</span>
          <p className="text-xs text-slate-200 font-semibold mt-1">isSubmitting Locks</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mandates idempotency & error state handling.</p>
        </div>

        <div className="bg-surface/50 border border-surface-border p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">4. Automated Tests</span>
          <p className="text-xs text-slate-200 font-semibold mt-1">Edge-Case Coverage</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires test assertions for double-click and network drops.</p>
        </div>

      </div>

      {/* Synthesized Prompt Code Container */}
      <div className="tactical-card rounded-2xl overflow-hidden border border-surface-border">
        
        {/* Container Toolbar */}
        <div className="px-5 py-3 bg-surface/90 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>DIRECTIVE_MANIFEST.md</span>
            <span className="text-slate-500 text-[11px]">({promptText.length} characters)</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-surface-card hover:bg-surface-elevated text-slate-200 border border-surface-border transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emergency-flame" />}
            <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
          </button>
        </div>

        {/* Code Content */}
        <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap bg-background/95 max-h-[600px] overflow-y-auto selection:bg-emergency-flame/30">
          <code>{promptText}</code>
        </pre>

      </div>

      {/* Next Step Callout */}
      <div className="tactical-card rounded-2xl p-5 flex items-center justify-between bg-surface-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">After Your Coding Agent Applies Changes</h4>
            <p className="text-[11px] text-slate-400">Push to GitHub or trigger Re-Scan to verify that the health score leaps and bugs are gone.</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('rescan')}
          className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emergency-flame hover:underline shrink-0"
        >
          <span>Go to Re-Scan & Verify</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
