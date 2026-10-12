import React from 'react';
import { useScan } from '../context/ScanContext';
import { HealthGauge } from '../components/HealthGauge';
import { MasterPromptHeroBanner } from '../components/MasterPromptHeroBanner';
import { ArchitectureMap } from '../components/ArchitectureMap';
import {
  Bot,
  FolderTree,
  FileCode,
  Layers,
  Code2,
  GitFork,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export function DashboardView() {
  const { activeScan, setActiveTab, setSelectedIssue } = useScan();

  if (!activeScan) {
    return (
      <div className="tactical-card rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto my-12">
        <Flame className="w-12 h-12 text-emergency-flame mx-auto mb-4 animate-pulse-subtle" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Repository Scan</h3>
        <p className="text-xs text-slate-400">
          Enter a public GitHub repository URL above or choose a Demo Preset to start the reliability analysis.
        </p>
      </div>
    );
  }

  const { repo, healthScore, summary, issues = [] } = activeScan;
  const criticalIssues = issues.slice(0, 3);

  const getTaxonomyBadge = (level) => {
    switch (level) {
      case 'confirmed_evidence':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 font-bold uppercase">Confirmed Evidence</span>;
      case 'likely_issue':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 font-bold uppercase">Likely Issue</span>;
      case 'potential_risk':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold uppercase">Potential Risk</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold uppercase">Recommendation</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Project Health Gauge Card */}
      <HealthGauge score={healthScore} summary={summary} />

      {/* 2. Fire Drill AI Conversational Assistant Callout */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emergency-flame/15 via-surface-card to-cyber-cyan/10 border border-emergency-flame/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emergency-flame/20 border border-emergency-flame/40 flex items-center justify-center text-emergency-flame font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Fire Drill AI Conversational Assistant Ready</span>
              <span className="text-[9px] font-mono uppercase bg-emergency-flame text-white px-1.5 py-0.2 rounded font-bold">Interactive</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Ask questions, investigate blast radius, explore forensic code evidence, or prioritize fixes conversationally.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('assistant')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-emergency-flame hover:bg-emergency-flame/90 text-white shadow-sm transition-all shrink-0"
        >
          <span>Chat with Fire Drill AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. HERO: Master Fix Prompt Callout */}
      <MasterPromptHeroBanner />

      {/* 3. Repository Blueprint & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Repo Overview */}
        <div className="tactical-card rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">
                  {repo.owner}/{repo.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-400 uppercase">
                  {repo.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {repo.description}
              </p>
            </div>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-emergency-flame hover:underline"
            >
              GitHub ↗
            </a>
          </div>

          {/* Architecture & Tech Stack Badges */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Detected Stack & Frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              {(repo.stack || [repo.framework]).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-surface border border-surface-border text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-surface/50 border border-surface-border p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <FolderTree className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Folders</span>
              </div>
              <p className="text-base font-bold font-mono text-white">
                {repo.stats?.foldersCount || 0}
              </p>
            </div>

            <div className="bg-surface/50 border border-surface-border p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <FileCode className="w-3.5 h-3.5 text-emergency-amber" />
                <span>Files</span>
              </div>
              <p className="text-base font-bold font-mono text-white">
                {repo.stats?.filesCount || 0}
              </p>
            </div>

            <div className="bg-surface/50 border border-surface-border p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Code2 className="w-3.5 h-3.5 text-emergency-flame" />
                <span>Est. Lines</span>
              </div>
              <p className="text-base font-bold font-mono text-white">
                {(repo.stats?.linesOfCodeEstimate || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-surface/50 border border-surface-border p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dependencies</span>
              </div>
              <p className="text-base font-bold font-mono text-white">
                {repo.stats?.dependenciesCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Loop Guide Card */}
        <div className="tactical-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-emergency-flame font-bold mb-2">
              The Fire Drill Loop
            </h4>
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface border border-surface-border text-center leading-5 font-bold text-slate-400">1</span>
                <span>Analyze GitHub Repository</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface border border-surface-border text-center leading-5 font-bold text-slate-400">2</span>
                <span>Forensic Code Evidence Found</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emergency-flame/20 border border-emergency-flame/40 text-center leading-5 font-bold text-emergency-flame">3</span>
                <span className="text-white font-semibold">Copy Master Fix Prompt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface border border-surface-border text-center leading-5 font-bold text-slate-400">4</span>
                <span>Coding Agent Fixes Project</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-center leading-5 font-bold text-emerald-400">5</span>
                <span>Re-Scan & Verify Delta</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border mt-4">
            <button
              onClick={() => setActiveTab('bughunt')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-mono font-semibold bg-surface hover:bg-surface-hover text-slate-200 border border-surface-border transition-all"
            >
              <span>Explore All Issues ({issues.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Visual Architecture Map */}
      <ArchitectureMap />

      {/* 5. Top Urgent Issues Preview */}
      <div className="tactical-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emergency-red" />
              Highest Priority Findings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by impact and verified static evidence.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('bughunt')}
            className="text-xs font-mono text-emergency-flame hover:underline flex items-center gap-1"
          >
            <span>View Full List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {criticalIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => {
                setSelectedIssue(issue);
                setActiveTab('bughunt');
              }}
              className="p-4 rounded-xl bg-surface/70 border border-surface-border hover:border-emergency-flame/40 cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-slate-300">
                    {issue.id}
                  </span>
                  {getTaxonomyBadge(issue.evidenceLevel)}
                  <span className="text-xs font-mono text-slate-500">
                    {issue.file}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-emergency-flame transition-colors">
                  {issue.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                  {issue.problem}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {Math.round((issue.confidence || 0.8) * 100)}% Confidence
                </span>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-surface text-slate-200 border border-surface-border group-hover:bg-emergency-flame group-hover:text-white transition-all">
                  Inspect Evidence →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
