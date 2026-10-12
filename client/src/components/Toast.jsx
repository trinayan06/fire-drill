import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useScan } from '../context/ScanContext';

export function Toast() {
  const { toast } = useScan();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-emergency-red shrink-0" />,
    info: <Info className="w-4 h-4 text-cyber-cyan shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-surface-card/95 text-emerald-200',
    error: 'border-emergency-red/40 bg-surface-card/95 text-red-200',
    info: 'border-cyber-cyan/40 bg-surface-card/95 text-cyan-200'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-mono max-w-md ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <p className="leading-snug">{toast.message}</p>
      </div>
    </div>
  );
}
