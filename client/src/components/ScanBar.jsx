import React, { useState, useEffect } from 'react';
import { useScan } from '../context/ScanContext';
import { Search, Flame, Loader2, GitBranch, AlertCircle, X, ShieldAlert } from 'lucide-react';

export function ScanBar() {
  const { runScan, activeScan, isLoading, scanStage, error, clearError } = useScan();
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (activeScan?.repo?.url) {
      setUrlInput(activeScan.repo.url);
    }
  }, [activeScan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      runScan(urlInput.trim());
    }
  };

  const stageLabels = {
    fetching_tree: '1. Ingesting GitHub Tree & Metadata...',
    redacting_secrets: '2. Scrubbing Secrets, Tokens & PII...',
    analyzing_rules: '3. Executing Static & AI Reliability Rules...',
    synthesizing_prompt: '4. Synthesizing Master Fix Prompt...',
    completed: 'Analysis Complete'
  };

  return (
    <div className="w-full bg-surface/50 border-b border-surface-border py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          
          {/* Input field */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter a public GitHub repository URL..."
              disabled={isLoading}
              className="w-full pl-10 pr-24 py-2.5 bg-background/90 border border-surface-border rounded-xl text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emergency-flame/50 focus:border-emergency-flame transition-all"
            />
            {urlInput && !isLoading && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emergency-flame to-emergency-red text-white shadow-lg shadow-emergency-flame/25 hover:shadow-emergency-flame/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SCANNING...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>ANALYZE REPOSITORY</span>
              </>
            )}
          </button>
        </form>

        {/* Real-time Telemetry Stage Stepper */}
        {isLoading && (
          <div className="mt-3.5 p-3 rounded-lg bg-surface-card border border-surface-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emergency-amber">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{stageLabels[scanStage] || 'Scanning repository pipeline...'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className={scanStage === 'fetching_tree' ? 'text-emergency-flame font-bold' : ''}>Tree</span>
              <span>→</span>
              <span className={scanStage === 'redacting_secrets' ? 'text-emergency-flame font-bold' : ''}>Redact</span>
              <span>→</span>
              <span className={scanStage === 'analyzing_rules' ? 'text-emergency-flame font-bold' : ''}>Rules</span>
              <span>→</span>
              <span className={scanStage === 'synthesizing_prompt' ? 'text-emergency-flame font-bold' : ''}>Master Prompt</span>
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-emergency-red/10 border border-emergency-red/30 flex items-start justify-between gap-3 text-xs text-red-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emergency-red shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">{error}</p>
                <p className="text-[11px] text-red-300/80 mt-0.5">
                  Try one of the pre-configured Demo Presets in the top bar to inspect a live verified simulation.
                </p>
              </div>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
