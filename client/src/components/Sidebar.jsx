import React from 'react';
import { useScan } from '../context/ScanContext';
import {
  Bot,
  LayoutDashboard,
  Bug,
  Sparkles,
  RefreshCw,
  Zap,
  Shield,
  Gauge,
  CheckCircle2,
  Package,
  Layers,
  History,
  Compass
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, activeScan, rescanDelta } = useScan();

  const totalIssues = activeScan?.issues?.length || 0;
  const criticalCount = activeScan?.summary?.criticalCount || 0;

  const navItems = [
    {
      id: 'assistant',
      label: 'Fire Drill AI',
      icon: Bot,
      badge: 'AI COPILOT',
      badgeHero: true,
      priority: 'AI'
    },
    {
      id: 'dashboard',
      label: 'Forensic Dashboard',
      icon: LayoutDashboard,
      badge: null,
      priority: 'P0'
    },
    {
      id: 'bughunt',
      label: 'Bug Hunt',
      icon: Bug,
      badge: totalIssues > 0 ? `${totalIssues}` : null,
      badgeAlert: criticalCount > 0,
      priority: 'P0'
    },
    {
      id: 'masterprompt',
      label: 'Master Fix Prompt',
      icon: Sparkles,
      badge: 'HERO',
      badgeHero: true,
      priority: 'P0'
    },
    {
      id: 'rescan',
      label: 'Re-Scan & Delta',
      icon: RefreshCw,
      badge: rescanDelta ? `+${rescanDelta.scoreDelta}` : null,
      badgeSuccess: !!rescanDelta,
      priority: 'P0'
    },
    {
      id: 'disaster',
      label: 'Disaster Drill',
      icon: Zap,
      badge: 'P1',
      priority: 'P1'
    },
    {
      id: 'roadmap',
      label: 'Product Roadmap',
      icon: Compass,
      badge: 'P1 • P2 • P3',
      badgeHero: false,
      priority: 'ROADMAP'
    }
  ];

  const comingSoonItems = [
    { label: 'Security Drill', icon: Shield, status: 'Upcoming' },
    { label: 'Performance Drill', icon: Gauge, status: 'Upcoming' },
    { label: 'Testing Drill', icon: CheckCircle2, status: 'Upcoming' },
    { label: 'Dependency Drill', icon: Package, status: 'Upcoming' }
  ];

  return (
    <aside className="w-64 shrink-0 bg-surface/60 border-r border-surface-border flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-8rem)]">
      
      {/* Primary Navigation */}
      <div>
        <div className="px-3 pb-3 mb-2 border-b border-surface-border/50">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Reliability Dispatcher
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emergency-flame/15 text-white font-semibold border border-emergency-flame/30 shadow-sm shadow-emergency-flame/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-emergency-flame'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      item.badgeHero
                        ? 'bg-gradient-to-r from-emergency-flame to-emergency-amber text-white shadow-xs'
                        : item.badgeAlert
                        ? 'bg-emergency-red/20 text-emergency-red border border-emergency-red/30'
                        : item.badgeSuccess
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-surface-border text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Polished Coming Soon Section */}
        <div className="mt-8 px-3 pb-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Advanced Drill Suites
          </p>
        </div>

        <div className="space-y-1">
          {comingSoonItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab('roadmap')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-surface-hover/50 transition-all text-left"
                title="View in Product Roadmap"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-surface-card rounded text-slate-500 border border-surface-border/40">
                  {item.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-surface-card/60 rounded-xl border border-surface-border/50 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emergency-flame animate-pulse"></span>
          Pre-Flight Active
        </p>
        <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">
          Verify issues and generate prompts before deploying AI fixes.
        </p>
      </div>

    </aside>
  );
}
