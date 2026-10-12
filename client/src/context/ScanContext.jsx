import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [activeScan, setActiveScan] = useState(null);
  const [previousScan, setPreviousScan] = useState(null);
  const [rescanDelta, setRescanDelta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanStage, setScanStage] = useState('idle');
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeTab, setActiveTab] = useState('assistant'); // Default to AI Assistant!
  const [selectedAgent, setSelectedAgent] = useState('antigravity');
  const [presets, setPresets] = useState([]);
  const [toast, setToast] = useState(null);

  // Assistant State
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Helper to create the initial conversational AI briefing
  const createBriefingMessage = (scan) => {
    const highestRisk = scan.issues?.find(i => i.severity === 'critical') || 
                        scan.issues?.find(i => i.severity === 'high') || 
                        scan.issues?.[0];

    return {
      id: `msg_briefing_${Date.now()}`,
      role: 'assistant',
      content: `🔥 **Fire Drill complete.**\nI analyzed your repository (**${scan.repo?.name || 'project'}**) and found **${scan.issues?.length || 0} reliability issues**.\nYour reliability score is **${scan.healthScore}/100**.\nThe highest-risk finding is **${highestRisk?.title}** (${highestRisk?.severity?.toUpperCase()}) in \`${highestRisk?.file}\`.`,
      referencedIssueIds: highestRisk ? [highestRisk.id] : [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBriefing: true
    };
  };

  // Fetch presets on load
  useEffect(() => {
    fetch('/api/presets')
      .then(res => res.json())
      .then(data => {
        if (data.presets) {
          setPresets(data.presets);
          loadPresetScan('quickbite-food-app');
        }
      })
      .catch(err => console.warn('Could not load presets:', err));
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.id === Date.now() ? null : prev));
    }, 3500);
  };

  const loadPresetScan = async (presetId) => {
    setIsLoading(true);
    setError(null);
    setRescanDelta(null);
    setScanStage('fetching_tree');
    
    try {
      setTimeout(() => setScanStage('redacting_secrets'), 250);
      setTimeout(() => setScanStage('analyzing_rules'), 500);
      setTimeout(() => setScanStage('synthesizing_prompt'), 750);

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load demo scan');

      setTimeout(() => {
        setActiveScan(data.scan);
        if (data.scan.issues?.length > 0) {
          setSelectedIssue(data.scan.issues[0]);
        }
        // Generate AI Assistant briefing
        setAssistantMessages([createBriefingMessage(data.scan)]);
        setIsLoading(false);
        setScanStage('completed');
      }, 950);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setScanStage('idle');
    }
  };

  const runScan = async (repoUrl) => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRescanDelta(null);
    setScanStage('fetching_tree');

    try {
      const stepInterval = setInterval(() => {
        setScanStage(prev => {
          if (prev === 'fetching_tree') return 'redacting_secrets';
          if (prev === 'redacting_secrets') return 'analyzing_rules';
          if (prev === 'analyzing_rules') return 'synthesizing_prompt';
          return prev;
        });
      }, 700);

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });

      clearInterval(stepInterval);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Scan failed.');
      }

      setActiveScan(data.scan);
      if (data.scan.issues?.length > 0) {
        setSelectedIssue(data.scan.issues[0]);
      }
      // Populate fresh conversational briefing
      setAssistantMessages([createBriefingMessage(data.scan)]);
      setIsLoading(false);
      setScanStage('completed');
      showToast(`Scan complete for ${data.scan.repo.name}`, 'success');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setScanStage('idle');
      showToast(err.message, 'error');
    }
  };

  const runRescan = async () => {
    if (!activeScan) return;

    setIsLoading(true);
    setError(null);
    setScanStage('fetching_tree');

    try {
      const res = await fetch('/api/rescan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousScanId: activeScan.scanId,
          repoUrl: activeScan.repo?.url
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-scan failed.');

      setPreviousScan(data.previousScan);
      setActiveScan(data.currentScan);
      setRescanDelta(data.delta);
      setIsLoading(false);
      setScanStage('completed');
      setActiveTab('rescan');

      // Add verification resolution message to assistant thread
      const rescanNotice = {
        id: `msg_rescan_${Date.now()}`,
        role: 'assistant',
        content: `🔄 **Re-scan verified.**\nHealth score leaped from **${data.delta.previousScore}** → **${data.delta.currentScore}/100** (+${data.delta.scoreDelta} delta).\n**${data.delta.resolvedIssues?.length || 0} issues resolved** after AI agent modifications!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedIssueIds: data.delta.resolvedIssues?.map(i => i.id) || []
      };
      setAssistantMessages(prev => [...prev, rescanNotice]);

      // Trigger celebratory confetti if score improved!
      if (data.delta.scoreDelta > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      showToast(`Re-scan completed! Score improved by +${data.delta.scoreDelta} points!`, 'success');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setScanStage('idle');
      showToast(err.message, 'error');
    }
  };

  // Conversational Assistant Dispatcher
  const sendMessageToAssistant = async (text) => {
    if (!text || !text.trim() || !activeScan) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    setIsAssistantThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: activeScan.scanId,
          message: text.trim(),
          history: assistantMessages.slice(-6),
          scan: activeScan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get assistant response.');

      const assistantMsg = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        referencedIssueIds: data.referencedIssueIds || [],
        aiEnhanced: data.aiEnhanced,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAssistantMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Chat error:', err);
      const fallbackMsg = {
        id: `ast_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Note: Assistant query encountered an issue: ${err.message}. Showing grounded metrics directly from current scan.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAssistantMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  const inspectIssue = (issueId) => {
    if (!activeScan) return;
    const match = activeScan.issues?.find(i => i.id === issueId);
    if (match) {
      setSelectedIssue(match);
      setActiveTab('bughunt');
    }
  };

  const changeAgent = async (agent) => {
    setSelectedAgent(agent);
    if (!activeScan) return;

    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: activeScan.scanId,
          agent
        })
      });
      const data = await res.json();
      if (data.masterPrompt) {
        setActiveScan(prev => ({ ...prev, masterFixPrompt: data.masterPrompt }));
        showToast(`Master Fix Prompt formatted for ${agent.toUpperCase()}`, 'info');
      }
    } catch (err) {
      console.warn('Agent change prompt re-gen error:', err);
    }
  };

  const copyPrompt = (customText) => {
    const textToCopy = customText || activeScan?.masterFixPrompt;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    showToast('Copied Master Fix Prompt to clipboard! Paste directly into your AI coding agent.', 'success');
  };

  return (
    <ScanContext.Provider
      value={{
        activeScan,
        previousScan,
        rescanDelta,
        isLoading,
        scanStage,
        error,
        selectedIssue,
        activeTab,
        selectedAgent,
        presets,
        toast,
        assistantMessages,
        isAssistantThinking,
        runScan,
        runRescan,
        loadPresetScan,
        changeAgent,
        setSelectedIssue,
        setActiveTab,
        copyPrompt,
        showToast,
        sendMessageToAssistant,
        inspectIssue,
        clearError: () => setError(null)
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
