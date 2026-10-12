import React, { useState, useRef, useEffect } from 'react';
import { useScan } from '../context/ScanContext';
import {
  Flame,
  Bot,
  User,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileCode,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Terminal,
  Loader2,
  Zap,
  HelpCircle,
  LayoutDashboard,
  Compass,
  Brain
} from 'lucide-react';

export function AssistantView() {
  const {
    activeScan,
    assistantMessages,
    isAssistantThinking,
    sendMessageToAssistant,
    inspectIssue,
    setActiveTab,
    setSelectedIssue,
    copyPrompt,
    runRescan,
    isLoading
  } = useScan();

  const [inputMessage, setInputMessage] = useState('');
  const [expandedEvidenceId, setExpandedEvidenceId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages, isAssistantThinking]);

  if (!activeScan) {
    return (
      <div className="tactical-card rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto my-12">
        <Flame className="w-12 h-12 text-emergency-flame mx-auto mb-4 animate-pulse-subtle" />
        <h3 className="text-lg font-bold text-white mb-2">Fire Drill AI Ready</h3>
        <p className="text-xs text-slate-400">
          Analyze a public GitHub repository above or select a Demo Preset to initiate the conversational reliability assistant.
        </p>
      </div>
    );
  }

  const { repo, healthScore, summary, issues = [] } = activeScan;

  const quickActions = [
    { label: 'What should I fix first?', icon: Flame },
    { label: 'Explain highest-risk issue', icon: ShieldAlert },
    { label: 'Show the evidence', icon: FileCode },
    { label: 'Why is my score low?', icon: HelpCircle },
    { label: 'What features are coming next?', icon: Compass },
    { label: 'What is the future of Fire Drill?', icon: Brain },
    { label: 'Find security problems', icon: Zap },
    { label: 'Find missing tests', icon: CheckCircle2 },
    { label: 'Generate a fix prompt', icon: Sparkles, action: () => setActiveTab('masterprompt') },
    { label: 'Re-scan after fixes', icon: RefreshCw, action: () => runRescan() }
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (inputMessage.trim() && !isAssistantThinking) {
      sendMessageToAssistant(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleQuickActionClick = (actionItem) => {
    if (actionItem.action) {
      actionItem.action();
    } else {
      sendMessageToAssistant(actionItem.label);
    }
  };

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    if (val >= 50) return 'text-emergency-flame border-orange-500/30 bg-orange-500/10';
    return 'text-emergency-red border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[850px] min-h-[600px] tactical-card rounded-2xl overflow-hidden border border-surface-border">
      
      {/* 1. Top Telemetry Header */}
      <div className="px-5 py-3.5 bg-surface/90 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emergency-flame to-emergency-red flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Fire Drill AI Assistant
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emergency-flame/15 text-emergency-flame border border-emergency-flame/30 font-bold uppercase">
                Active Copilot
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Grounded in <strong className="text-slate-200">{repo.owner}/{repo.name}</strong> • {issues.length} verified findings
            </p>
          </div>
        </div>

        {/* Telemetry Pills & Forensic Workspace Switcher */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${getScoreColor(healthScore)}`}>
            {healthScore}/100 HEALTH
          </span>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-surface-card hover:bg-surface-elevated text-slate-300 border border-surface-border transition-all"
            title="Open deep forensic metrics & architecture"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emergency-amber" />
            <span className="hidden sm:inline">Forensic Workspace</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Conversational Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-background/50 selection:bg-emergency-flame/30">
        
        {assistantMessages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isAssistant
                    ? 'bg-emergency-flame/20 border border-emergency-flame/40 text-emergency-flame'
                    : 'bg-surface border border-surface-border text-slate-300'
                }`}
              >
                {isAssistant ? <Flame className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs font-sans leading-relaxed ${
                  isAssistant
                    ? 'bg-surface/80 border border-surface-border text-slate-200'
                    : 'bg-emergency-flame/15 border border-emergency-flame/30 text-white shadow-sm'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] font-mono text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isAssistant ? 'Fire Drill AI' : 'Developer'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content body */}
                <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Grounded Issue Action Cards */}
                {isAssistant && msg.referencedIssueIds && msg.referencedIssueIds.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-surface-border/80 space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                      <FileCode className="w-3 h-3 text-emergency-flame" />
                      Traceable Repository Evidence:
                    </p>

                    <div className="space-y-1.5">
                      {msg.referencedIssueIds.map((issueId) => {
                        const issueObj = issues.find(i => i.id === issueId);
                        if (!issueObj) return null;
                        const isEvidenceExpanded = expandedEvidenceId === issueId;

                        return (
                          <div
                            key={issueId}
                            className="p-2.5 rounded-xl bg-surface-card border border-surface-border/80 space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-200">
                                  {issueObj.id}
                                </span>
                                <span className="font-semibold text-white">
                                  {issueObj.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setExpandedEvidenceId(isEvidenceExpanded ? null : issueId)}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface hover:bg-surface-elevated text-slate-300 border border-surface-border flex items-center gap-1 transition-all"
                                >
                                  {isEvidenceExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  <span>{isEvidenceExpanded ? 'Hide Code' : 'View Evidence'}</span>
                                </button>

                                <button
                                  onClick={() => inspectIssue(issueObj.id)}
                                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emergency-flame/15 hover:bg-emergency-flame text-emergency-flame hover:text-white border border-emergency-flame/30 flex items-center gap-1 transition-all"
                                >
                                  <span>Inspect in Bug Hunt</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="text-[11px] font-mono text-slate-400">
                              Target: <span className="text-emergency-flame">{issueObj.file}</span> ({issueObj.functionOrScope || 'scope'})
                            </div>

                            {/* Inline Code Evidence Expander */}
                            {isEvidenceExpanded && (
                              <div className="mt-2 rounded-lg bg-background p-3 border border-surface-border/80 font-mono text-[11px] text-slate-200">
                                <div className="text-slate-500 mb-1 text-[10px]">
                                  {issueObj.file} • Lines: {issueObj.evidence?.lineNumbers || 'Handler definition'}
                                </div>
                                <pre className="overflow-x-auto text-emerald-300/90 whitespace-pre">
                                  <code>{issueObj.evidence?.snippet}</code>
                                </pre>
                                <p className="mt-2 text-slate-400 text-[10px] leading-relaxed border-t border-surface-border/50 pt-1.5">
                                  <strong>Reasoning:</strong> {issueObj.evidence?.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hero Master Fix Prompt Quick Link Button */}
                {isAssistant && msg.isBriefing && (
                  <div className="mt-3 pt-2.5 border-t border-surface-border/60 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('masterprompt')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-emergency-flame to-emergency-red text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Master Fix Prompt</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('bughunt')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-surface hover:bg-surface-elevated text-slate-300 border border-surface-border transition-all"
                    >
                      <span>Explore Forensic Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isAssistantThinking && (
          <div className="flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-emergency-flame/20 border border-emergency-flame/40 text-emergency-flame">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-surface/80 border border-surface-border rounded-2xl p-3 text-xs font-mono text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-emergency-flame animate-spin" />
              <span>Fire Drill AI is analyzing repository evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Action Chips Bar */}
      <div className="px-4 py-2.5 bg-surface/70 border-t border-surface-border overflow-x-auto shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap mr-1">
          Quick Actions:
        </span>
        {quickActions.map((qa, idx) => {
          const Icon = qa.icon;
          return (
            <button
              key={idx}
              onClick={() => handleQuickActionClick(qa)}
              disabled={isAssistantThinking}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-surface-card hover:bg-surface-elevated text-slate-300 hover:text-white border border-surface-border hover:border-emergency-flame/40 whitespace-nowrap transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-emergency-amber shrink-0" />
              <span>{qa.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Message Input Field */}
      <div className="p-3.5 bg-surface border-t border-surface-border shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Fire Drill AI about issues, blast radius, test cases, or fixes..."
              disabled={isAssistantThinking}
              className="w-full pl-4 pr-10 py-2.5 text-xs bg-background/90 border border-surface-border rounded-xl text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emergency-flame focus:border-emergency-flame transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isAssistantThinking}
            className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-emergency-flame to-emergency-red text-white shadow-md shadow-emergency-flame/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all shrink-0"
          >
            {isAssistantThinking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
