import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Settings, History, Check } from 'lucide-react';
import { useStore } from '../store';
import '../styles/index.css';

function PopupApp() {
  const { settings, history, hasHydrated } = useStore();

  useEffect(() => {
    // Setup body classes based on theme settings
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [settings.theme, hasHydrated]);

  const openSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  if (!hasHydrated) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400 text-sm">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 font-sans text-slate-800 dark:text-slate-100 min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-indigo-600 text-white">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-base tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AI Comment Assistant
          </span>
        </div>
        <button 
          onClick={openSettings}
          className="p-1.5 rounded-lg border border-slate-200/10 bg-slate-200/5 hover:bg-indigo-600 hover:text-white transition-all"
          title="Open Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Connection status card */}
      <div className="p-3.5 rounded-xl border border-slate-200/10 bg-slate-200/5 flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Provider</span>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm capitalize">{settings.selectedProvider}</span>
          <div className="flex items-center gap-1 text-[11px] text-green-400 font-medium">
            <Check size={12} /> Ready
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono mt-1">
          Model: {settings.providers[settings.selectedProvider]?.model}
        </span>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-slate-200/10 bg-slate-200/5 flex flex-col gap-1">
          <span className="text-[10px] font-medium text-slate-400 uppercase">Comments Generated</span>
          <span className="text-xl font-bold">{history.length}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200/10 bg-slate-200/5 flex flex-col gap-1">
          <span className="text-[10px] font-medium text-slate-400 uppercase">Default Tone</span>
          <span className="text-sm font-semibold capitalize mt-0.5">{settings.defaultTone}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          onClick={openSettings}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow flex items-center justify-center gap-1.5 transition-all"
        >
          Manage API Keys & Config
        </button>
        <span className="text-[10px] text-center text-slate-400 block mt-2">
          Open a LinkedIn post and click the ✨ icon inside any comment box to write.
        </span>
      </div>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<PopupApp />);
}
