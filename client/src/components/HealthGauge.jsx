import React from 'react';
import { ShieldAlert, AlertTriangle, Lightbulb, Shield, CheckCircle, FileCode } from 'lucide-react';

export function HealthGauge({ score = 63, summary = {} }) {
  // SVG circular gauge math
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Color calculation based on health score
  const getScoreColor = (val) => {
    if (val >= 85) return { stroke: '#10B981', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (val >= 70) return { stroke: '#F59E0B', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    if (val >= 50) return { stroke: '#FF5722', text: 'text-emergency-flame', badge: 'bg-orange-500/10 text-emergency-flame border-orange-500/30' };
    return { stroke: '#EF4444', text: 'text-emergency-red', badge: 'bg-red-500/10 text-red-400 border-red-500/30' };
  };

  const colorInfo = getScoreColor(clampedScore);

  const getStatusText = (val) => {
    if (val >= 85) return 'STABLE & HARDENED';
    if (val >= 70) return 'ELEVATED RISK';
    if (val >= 50) return 'SIGNIFICANT VULNERABILITIES';
    return 'CRITICAL HAZARDS';
  };

  return (
    <div className="tactical-card rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
      
      {/* Background ambient glow */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: colorInfo.stroke }}
      />

      {/* Radial Gauge HUD */}
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
            {/* Background track */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="#1F293D"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Value stroke */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke={colorInfo.stroke}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center score readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${colorInfo.text}`}>
              {clampedScore}
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-semibold">
              / 100 HEALTH
            </span>
          </div>
        </div>

        {/* Status description */}
        <div>
          <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-md border uppercase ${colorInfo.badge}`}>
            {getStatusText(clampedScore)}
          </span>
          <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">
            Project Reliability Score
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            Composite rating calculated from static evidence, race conditions, test coverage gaps, and architectural failure vectors.
          </p>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
        
        <div className="bg-surface/80 border border-surface-border p-3 rounded-xl min-w-[110px]">
          <div className="flex items-center gap-1.5 text-emergency-red text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {summary.criticalCount ?? 0}
          </p>
        </div>

        <div className="bg-surface/80 border border-surface-border p-3 rounded-xl min-w-[110px]">
          <div className="flex items-center gap-1.5 text-emergency-flame text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Issues</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {summary.highCount ?? 0}
          </p>
        </div>

        <div className="bg-surface/80 border border-surface-border p-3 rounded-xl min-w-[110px]">
          <div className="flex items-center gap-1.5 text-emergency-amber text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medium</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {summary.mediumCount ?? 0}
          </p>
        </div>

        <div className="bg-surface/80 border border-surface-border p-3 rounded-xl min-w-[110px]">
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Security</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {summary.securityCount ?? 0}
          </p>
        </div>

        <div className="bg-surface/80 border border-surface-border p-3 rounded-xl min-w-[110px]">
          <div className="flex items-center gap-1.5 text-cyber-cyan text-xs font-semibold mb-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>Missing Tests</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {summary.missingTestsCount ?? 0}
          </p>
        </div>

        <div className="bg-surface/80 border border-surface-border p-3 rounded-xl min-w-[110px]">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Suggestions</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {summary.suggestionsCount ?? 0}
          </p>
        </div>

      </div>

    </div>
  );
}
