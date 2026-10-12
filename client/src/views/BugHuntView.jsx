import React, { useState } from 'react';
import { useScan } from '../context/ScanContext';
import { EvidenceViewer } from '../components/EvidenceViewer';
import {
  Bug,
  Shield,
  Zap,
  CheckCircle,
  Package,
  Layers,
  Filter,
  Search,
  ShieldAlert,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export function BugHuntView() {
  const { activeScan, selectedIssue, setSelectedIssue } = useScan();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeScan) {
    return (
      <div className="tactical-card rounded-2xl p-12 text-center text-slate-500">
        <Bug className="w-12 h-12 text-emergency-flame mx-auto mb-3 opacity-30" />
        <p className="text-sm">Scan a repository first to begin the Bug Hunt.</p>
      </div>
    );
  }

  const issues = activeScan.issues || [];

  const filteredIssues = issues.filter(issue => {
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (evidenceFilter !== 'all' && issue.evidenceLevel !== evidenceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchFile = issue.file.toLowerCase().includes(q);
      const matchId = issue.id.toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchId) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emergency-red/20 text-emergency-red border border-emergency-red/30 font-bold uppercase">Critical</span>;
      case 'high':
        return <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emergency-flame/20 text-emergency-flame border border-emergency-flame/30 font-bold uppercase">High</span>;
      case 'medium':
        return <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emergency-amber/20 text-emergency-amber border border-emergency-amber/30 font-bold uppercase">Medium</span>;
      default:
        return <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-bold uppercase">Low</span>;
    }
  };

  const getTaxonomyPill = (level) => {
    switch (level) {
      case 'confirmed_evidence':
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 uppercase font-semibold">Confirmed</span>;
      case 'likely_issue':
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase font-semibold">Likely</span>;
      case 'potential_risk':
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-semibold">Potential</span>;
      default:
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase font-semibold">Rec</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="tactical-card rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, or file path..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background/80 border border-surface-border rounded-lg text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emergency-flame"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Evidence Level Filter */}
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="text-xs bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-emergency-flame"
          >
            <option value="all">All Evidence Levels</option>
            <option value="confirmed_evidence">Confirmed by Static Evidence</option>
            <option value="likely_issue">Likely Issue</option>
            <option value="potential_risk">Potential Risk</option>
            <option value="recommendation">Recommendations</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-emergency-flame"
          >
            <option value="all">All Categories</option>
            <option value="bug">Bugs</option>
            <option value="security">Security</option>
            <option value="testing">Testing</option>
            <option value="performance">Performance</option>
            <option value="architecture">Architecture</option>
            <option value="reliability">Reliability</option>
            <option value="dependency">Dependencies</option>
          </select>

        </div>

      </div>

      {/* Main Split-Screen Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Issues List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
            <span>Showing {filteredIssues.length} of {issues.length} Issues</span>
            <span className="text-slate-500">Click to inspect</span>
          </div>

          {filteredIssues.map((issue) => {
            const isSelected = selectedIssue?.id === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emergency-flame/15 border-emergency-flame/50 shadow-md shadow-emergency-flame/10'
                    : 'bg-surface/60 border-surface-border hover:bg-surface-hover/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-200">
                      {issue.id}
                    </span>
                    {getSeverityBadge(issue.severity)}
                  </div>
                  {getTaxonomyPill(issue.evidenceLevel)}
                </div>

                <h4 className="text-xs font-semibold text-white leading-snug">
                  {issue.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                  <span className="truncate max-w-[240px] text-slate-400">
                    {issue.file}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {Math.round((issue.confidence || 0.8) * 100)}% Conf
                  </span>
                </div>
              </div>
            );
          })}

          {filteredIssues.length === 0 && (
            <div className="tactical-card rounded-xl p-8 text-center text-slate-500 text-xs">
              No issues match the selected filters.
            </div>
          )}
        </div>

        {/* Right Column: Deep Forensic Evidence & Actions */}
        <div className="lg:col-span-7 sticky top-20">
          <EvidenceViewer issue={selectedIssue || filteredIssues[0]} />
        </div>

      </div>

    </div>
  );
}
