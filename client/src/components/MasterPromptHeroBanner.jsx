import React from 'react';
import { useScan } from '../context/ScanContext';
import { Sparkles, Copy, Check, ArrowRight, Bot, Cpu } from 'lucide-react';

export function MasterPromptHeroBanner() {
  const { activeScan, copyPrompt, selectedAgent, changeAgent, setActiveTab } = useScan();

  if (!activeScan) return null;

  const agents = [
    { id: 'antigravity', label: 'Antigravity' },
    { id: 'cursor', label: 'Cursor' },
    { id: 'claude', label: 'Claude Code' },
    { id: 'copilot', label: 'Copilot' }
  ];

  const handleCopy = () => {
    copyPrompt();
  };

  return (
    <div className="relative rounded-2xl p-6 overflow-hidden bg-gradient-to-r from-emergency-flame/15 via-surface-card to-cyber-cyan/10 border-2 border-emergency-flame/40 shadow-xl shadow-emergency-flame/10">
      
      {/* Decorative background grid and glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emergency-flame/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Hero Headline & Description */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-mono font-extrabold uppercase tracking-wider bg-emergency-flame text-white rounded-md shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ★ HERO FEATURE
            </span>
            <span className="text-xs font-mono text-slate-400">
              Pre-Flight Remediation Dispatcher
            </span>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            Master Fix Prompt Ready for Your AI Agent
          </h3>

          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            Fire Drill has synthesized forensic evidence, exact file lines, root causes, strict boundaries, and regression test suites. Copy and paste this directly into your coding assistant to execute the repair safely.
          </p>

          {/* Target Coding Agent Switcher */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
              <Bot className="w-3.5 h-3.5 text-emergency-amber" /> Target Agent:
            </span>
            {agents.map((ag) => (
              <button
                key={ag.id}
                onClick={() => changeAgent(ag.id)}
                className={`text-xs px-3 py-1 rounded-lg font-mono font-semibold transition-all ${
                  selectedAgent === ag.id
                    ? 'bg-emergency-flame text-white shadow-md shadow-emergency-flame/30'
                    : 'bg-surface hover:bg-surface-hover text-slate-300 border border-surface-border'
                }`}
              >
                {ag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Copy Prompt Action Area */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-extrabold text-sm tracking-wide bg-gradient-to-r from-emergency-flame to-emergency-red text-white shadow-lg shadow-emergency-flame/30 hover:shadow-emergency-flame/50 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>COPY MASTER FIX PROMPT</span>
          </button>

          <button
            onClick={() => setActiveTab('masterprompt')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold bg-surface hover:bg-surface-hover text-slate-300 border border-surface-border transition-all"
          >
            <span>View Full Prompt ({activeScan.issues?.length || 0} Issues)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
