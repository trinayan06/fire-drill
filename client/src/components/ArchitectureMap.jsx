import React from 'react';
import { useScan } from '../context/ScanContext';
import { Monitor, Server, Database, Key, ArrowRight, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ArchitectureMap() {
  const { activeScan } = useScan();

  if (!activeScan) return null;

  const { architecture } = activeScan;
  const components = architecture?.components || [];
  const connections = architecture?.connections || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emergency-red bg-emergency-red/10 border border-emergency-red/30 px-1.5 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emergency-amber bg-emergency-amber/10 border border-emergency-amber/30 px-1.5 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> HAZARD
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> HARDENED
          </span>
        );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'frontend': return <Monitor className="w-5 h-5 text-cyber-cyan" />;
      case 'api': return <Server className="w-5 h-5 text-emergency-flame" />;
      case 'database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'auth': return <Key className="w-5 h-5 text-amber-400" />;
      default: return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="tactical-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div>
          <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <span>Visual Architecture Topology</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-400 font-normal">
              Derived from Repository Evidence
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time component health status and communication paths mapped from static manifest analysis.
          </p>
        </div>
      </div>

      {/* Component Nodes Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {components.map((comp) => (
          <div
            key={comp.id}
            className={`p-4 rounded-xl bg-surface/70 border transition-all ${
              comp.status === 'critical'
                ? 'border-emergency-red/40 shadow-sm shadow-emergency-red/10'
                : comp.status === 'warning'
                ? 'border-emergency-amber/40 shadow-sm shadow-emergency-amber/10'
                : 'border-surface-border hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
                {getIcon(comp.type)}
              </div>
              {getStatusBadge(comp.status)}
            </div>

            <h4 className="text-xs font-bold text-white mt-1">
              {comp.name}
            </h4>

            <div className="flex flex-wrap gap-1 mt-2">
              {comp.technologies?.map((tech, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-surface-border text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            {comp.files && comp.files.length > 0 && (
              <div className="mt-3 pt-2 border-t border-surface-border/60 text-[10px] font-mono text-slate-400 truncate">
                <span className="text-slate-500">Ref:</span> {comp.files.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connections List */}
      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
        <span className="text-slate-500">Observed Ingress/Egress:</span>
        {connections.map((conn, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface/80 border border-surface-border text-slate-300"
          >
            <span className="font-bold text-slate-100">{conn.from.toUpperCase()}</span>
            <ArrowRight className="w-3 h-3 text-emergency-flame" />
            <span className="font-bold text-slate-100">{conn.to.toUpperCase()}</span>
            <span className="text-[10px] text-slate-500">({conn.label})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
