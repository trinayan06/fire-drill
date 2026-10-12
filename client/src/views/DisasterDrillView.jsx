import React, { useState } from 'react';
import { useScan } from '../context/ScanContext';
import {
  Zap,
  Database,
  Server,
  Key,
  TrendingUp,
  PackageX,
  UserX,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Flame
} from 'lucide-react';

export function DisasterDrillView() {
  const { activeScan } = useScan();
  const [selectedScenarioId, setSelectedScenarioId] = useState('db-down');

  const scenarios = [
    {
      id: 'db-down',
      title: 'DATABASE DOWN',
      icon: Database,
      tag: 'Infrastructure Outage',
      subsystems: {
        frontend: { status: 'stable', label: 'Cached Shell Up' },
        api: { status: 'degraded', label: '503 Outage Spikes' },
        database: { status: 'down', label: 'Connection Dropped' },
        jobs: { status: 'down', label: 'Poller Crash Risk' }
      },
      affectedModules: ['src/pages/Checkout.jsx', 'src/api/orders.js', 'src/services/orderPoller.js'],
      evidence: 'src/services/orderPoller.js does not enclose database query polling loops in try/catch or reconnect retry blocks.',
      impact: 'Unhandled promise rejection terminates Node.js process. In-flight order confirmations are lost without an idempotent replay log.',
      preparation: [
        'Implement circuit-breaker pattern (e.g., opossum) on database queries',
        'Add Redis-backed dead-letter queue for pending order writes',
        'Configure database connection pool health checks with exponential backoff'
      ],
      chaosTests: [
        'Simulate 15-second PostgreSQL network blackout and verify poller retries without process exit',
        'Confirm frontend displays polite "Degraded Mode" toast instead of unhandled promise rejection'
      ]
    },
    {
      id: 'api-failure',
      title: 'UPSTREAM API FAILURE',
      icon: Server,
      tag: 'Service Degradation',
      subsystems: {
        frontend: { status: 'degraded', label: 'Hung Request UI' },
        api: { status: 'down', label: 'Gateway Timeout' },
        database: { status: 'stable', label: 'Idle' },
        jobs: { status: 'stable', label: 'Queued' }
      },
      affectedModules: ['src/pages/Checkout.jsx', 'src/components/MenuSearch.jsx'],
      evidence: 'Checkout.jsx lacks timeout abort controllers (AbortSignal.timeout(8000)) on API requests.',
      impact: 'Users encounter infinite spinner on checkout button with no error state or cancellation option.',
      preparation: [
        'Attach 8-second AbortSignal to all Axios/fetch request instances',
        'Add user-facing manual retry and transaction status polling'
      ],
      chaosTests: [
        'Inject 10,000ms latency on /api/orders and assert client triggers fallback timeout after 8,000ms'
      ]
    },
    {
      id: 'auth-failure',
      title: 'AUTHENTICATION OUTAGE',
      icon: Key,
      tag: 'Security & Session Fault',
      subsystems: {
        frontend: { status: 'degraded', label: 'Session Loops' },
        api: { status: 'degraded', label: 'Token Reject' },
        database: { status: 'stable', label: 'Healthy' },
        jobs: { status: 'stable', label: 'Healthy' }
      },
      affectedModules: ['src/context/AuthContext.jsx', 'src/api/orders.js'],
      evidence: 'AuthContext.jsx bundles Supabase administrative service role credentials in client context.',
      impact: 'If auth provider experiences degraded JWT revocation, sessions cannot be gracefully expired or refreshed.',
      preparation: [
        'Transition from client-side role key to backend-authenticated proxy token exchange',
        'Cache short-lived JWT public verification keys locally'
      ],
      chaosTests: [
        'Revoke user token at auth provider and assert client logs out without state loop'
      ]
    },
    {
      id: 'traffic-100x',
      title: '100× TRAFFIC SPIKE',
      icon: TrendingUp,
      tag: 'Capacity Saturation',
      subsystems: {
        frontend: { status: 'stable', label: 'CDN Edge Up' },
        api: { status: 'down', label: 'Thread Starvation' },
        database: { status: 'degraded', label: 'Max Connections' },
        jobs: { status: 'down', label: 'Queue Overflow' }
      },
      affectedModules: ['src/components/MenuSearch.jsx', 'src/pages/Checkout.jsx'],
      evidence: 'MenuSearch.jsx executes unthrottled API requests on every raw keystroke without debouncing.',
      impact: '100x concurrent active users typing simultaneously generates 5,000 req/sec, exhausting database connection pool.',
      preparation: [
        'Apply 300ms debounce on input fields',
        'Enforce Redis sliding-window rate limiting on all API routes'
      ],
      chaosTests: [
        'Run k6 load test simulating 500 concurrent virtual users hitting search endpoint'
      ]
    },
    {
      id: 'maintainer-gone',
      title: 'MAINTAINER DISAPPEARS',
      icon: UserX,
      tag: 'Knowledge & Bus Factor',
      subsystems: {
        frontend: { status: 'stable', label: 'Static' },
        api: { status: 'stable', label: 'Static' },
        database: { status: 'stable', label: 'Static' },
        jobs: { status: 'degraded', label: 'No CI Gates' }
      },
      affectedModules: ['tests/', 'package.json', '.github/workflows/'],
      evidence: 'Repository has zero automated integration tests configured in package.json and no GitHub Actions CI verification.',
      impact: 'Successor engineers or AI coding agents will inadvertently introduce regressions with zero automated guardrails.',
      preparation: [
        'Integrate Vitest / Jest test runner into pre-commit and PR workflows',
        'Document architecture decision records (ADRs) for checkout and payment idempotency'
      ],
      chaosTests: [
        'Assert automated CI pipeline blocks pull requests when unit tests fail'
      ]
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const getSubsystemBadge = (status) => {
    switch (status) {
      case 'down':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold uppercase">🔴 DOWN</span>;
      case 'degraded':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">🟡 DEGRADED</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">🟢 STABLE</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-emergency-flame/10 border border-emergency-flame/30 flex items-start gap-3">
        <Zap className="w-5 h-5 text-emergency-flame shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Disaster Simulation Mode (Static Predictive Modeling)
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Fire Drill <strong className="text-emergency-flame">never takes down real services</strong>.
            All scenarios represent <em className="text-white">predicted blast radii</em> calculated from repository code patterns, error handling coverage, and architectural coupling.
          </p>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emergency-flame/15 border-emergency-flame text-white shadow-lg shadow-emergency-flame/20'
                  : 'bg-surface/60 border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-emergency-flame' : 'text-slate-500'}`} />
              <div className="text-xs font-bold leading-tight">{sc.title}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">{sc.tag}</div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detail Card */}
      <div className="tactical-card rounded-2xl p-6 space-y-6 border border-surface-border">
        
        {/* Scenario Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-400 uppercase">
              Scenario Simulation: {currentScenario.tag}
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {currentScenario.title}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Targeting: {activeScan?.repo?.name || 'Repository'}
          </span>
        </div>

        {/* Subsystem Blast Radius Matrix */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Simulated Subsystem Impact Matrix
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-surface/70 border border-surface-border p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Frontend Layer</span>
              <div className="mt-2 flex items-center justify-between">
                {getSubsystemBadge(currentScenario.subsystems.frontend.status)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                {currentScenario.subsystems.frontend.label}
              </p>
            </div>

            <div className="bg-surface/70 border border-surface-border p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">API Server</span>
              <div className="mt-2 flex items-center justify-between">
                {getSubsystemBadge(currentScenario.subsystems.api.status)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                {currentScenario.subsystems.api.label}
              </p>
            </div>

            <div className="bg-surface/70 border border-surface-border p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Database Layer</span>
              <div className="mt-2 flex items-center justify-between">
                {getSubsystemBadge(currentScenario.subsystems.database.status)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                {currentScenario.subsystems.database.label}
              </p>
            </div>

            <div className="bg-surface/70 border border-surface-border p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Background Jobs</span>
              <div className="mt-2 flex items-center justify-between">
                {getSubsystemBadge(currentScenario.subsystems.jobs.status)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                {currentScenario.subsystems.jobs.label}
              </p>
            </div>

          </div>
        </div>

        {/* Evidence & Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-surface/50 border border-surface-border p-4 rounded-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emergency-flame font-bold mb-1.5 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              Repository Evidence
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentScenario.evidence}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {currentScenario.affectedModules.map((mod, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface/50 border border-surface-border p-4 rounded-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emergency-red font-bold mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Predicted Blast Radius
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentScenario.impact}
            </p>
          </div>

        </div>

        {/* Recommended Preparation & Chaos Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hardening Preparation Playbook
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentScenario.preparation.map((prep, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{prep}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-cyber-cyan/5 border border-cyber-cyan/20 p-4 rounded-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-cyan font-bold mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Recommended Chaos Regression Tests
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentScenario.chaosTests.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan mt-1.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
