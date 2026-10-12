import React from 'react';
import { useScan } from '../context/ScanContext';
import { Flame, ShieldCheck, Terminal, Sparkles, RefreshCw } from 'lucide-react';

export function Navbar() {
  const { presets, loadPresetScan, activeScan, isLoading } = useScan();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emergency-flame to-emergency-red flex items-center justify-center shadow-lg shadow-emergency-flame/20 ring-1 ring-white/20">
            <Flame className="w-6 h-6 text-white animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FIRE DRILL
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emergency-flame/15 text-emergency-flame border border-emergency-flame/30 rounded-full font-bold">
                Reliability Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Scan. Understand. Prompt. Fix. Verify.
            </p>
          </div>
        </div>

        {/* Center: Quick Presets */}
        <div className="hidden md:flex items-center gap-2 bg-surface/80 p-1.5 rounded-lg border border-surface-border">
          <span className="text-xs text-slate-400 flex items-center gap-1 px-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emergency-amber" /> Presets:
          </span>
          {presets.map((p) => {
            const isSelected = activeScan?.repo?.name === p.name;
            return (
              <button
                key={p.id}
                onClick={() => loadPresetScan(p.id)}
                disabled={isLoading}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emergency-flame/20 text-emergency-flame border border-emergency-flame/40'
                    : 'text-slate-300 hover:bg-surface-hover hover:text-white'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({p.framework.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Security & Operational Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-surface-border text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Redaction Guard</span> Active
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-surface-border text-[11px] font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Agent-Ready</span>
          </div>
        </div>

      </div>
    </header>
  );
}
