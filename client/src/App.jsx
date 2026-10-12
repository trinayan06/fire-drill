import React from 'react';
import { useScan } from './context/ScanContext';
import { Navbar } from './components/Navbar';
import { ScanBar } from './components/ScanBar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { BugHuntView } from './views/BugHuntView';
import { MasterPromptView } from './views/MasterPromptView';
import { HistoryRescanView } from './views/HistoryRescanView';
import { DisasterDrillView } from './views/DisasterDrillView';
import { AssistantView } from './views/AssistantView';
import { RoadmapView } from './views/RoadmapView';

export function App() {
  const { activeTab } = useScan();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'assistant':
        return <AssistantView />;
      case 'dashboard':
        return <DashboardView />;
      case 'bughunt':
        return <BugHuntView />;
      case 'masterprompt':
        return <MasterPromptView />;
      case 'rescan':
        return <HistoryRescanView />;
      case 'disaster':
        return <DisasterDrillView />;
      case 'roadmap':
        return <RoadmapView />;
      default:
        return <AssistantView />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-emergency-flame/30">
      
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Repository Scan & URL Bar */}
      <ScanBar />

      {/* 3. Main Operational Layout (Sidebar + Active View) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <Sidebar />

        {/* View Port Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderActiveView()}
        </main>

      </div>

      {/* Global Toast Manager */}
      <Toast />

      {/* Footer */}
      <footer className="w-full border-t border-surface-border py-4 px-6 text-center text-xs font-mono text-slate-500">
        FIRE DRILL &copy; 2026 — AI Code Reliability Simulator. "Scan. Understand. Prompt. Fix. Verify."
      </footer>

    </div>
  );
}

export default App;
