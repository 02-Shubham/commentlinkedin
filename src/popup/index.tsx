import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Settings, Check } from 'lucide-react';
import { useStore } from '../store';
import '../styles/index.css';

function PopupApp() {
  const { settings, history, hasHydrated } = useStore();

  // Dynamic Google Font Injection
  useEffect(() => {
    if (!document.getElementById('plus-jakarta-sans-font')) {
      const link = document.createElement('link');
      link.id = 'plus-jakarta-sans-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Sync background classes for extension popup
  useEffect(() => {
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#1d2226'; // LinkedIn dark theme canvas
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f4f2ee'; // LinkedIn light theme canvas
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

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div 
      style={{ 
        width: '280px', 
        fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, BlinkMacSystemFont, sans-serif" 
      }}
      className="p-4 flex flex-col gap-4 text-[#191919] dark:text-[#ffffff] antialiased"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#38434f] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className={isDark ? 'text-[#70b5f9]' : 'text-[#0a66c2]'} />
          <span className="font-bold text-sm tracking-wide text-[#0a66c2] dark:text-[#70b5f9]">
            AI Comment Assistant
          </span>
        </div>
        <button 
          onClick={openSettings}
          className={`p-1.5 rounded-md border transition-all ${
            isDark 
              ? 'border-[#38434f] bg-[#1d2226] hover:bg-[#ffffff10] text-[#ffffff99]' 
              : 'border-slate-200 bg-white hover:bg-slate-50 text-[#5e5e5e]'
          }`}
          title="Open Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Connection status card */}
      <div className={`p-3 rounded-md border flex flex-col gap-1.5 ${
        isDark ? 'border-[#38434f] bg-[#121619]/40' : 'border-slate-200 bg-white shadow-sm'
      }`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#ffffffb3]' : 'text-[#5e5e5e]'}`}>Active Provider</span>
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs capitalize">{settings.selectedProvider}</span>
          <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
            <Check size={12} /> Ready
          </div>
        </div>
        <span className="text-[9px] text-slate-400 font-mono mt-0.5">
          Model: {settings.providers[settings.selectedProvider]?.model}
        </span>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-md border flex flex-col gap-1 ${
          isDark ? 'border-[#38434f] bg-[#121619]/40' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <span className={`text-[9px] font-bold uppercase ${isDark ? 'text-[#ffffffb3]' : 'text-[#5e5e5e]'}`}>Generated</span>
          <span className="text-lg font-bold">{history.length}</span>
        </div>
        <div className={`p-3 rounded-md border flex flex-col gap-1 ${
          isDark ? 'border-[#38434f] bg-[#121619]/40' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <span className={`text-[9px] font-bold uppercase ${isDark ? 'text-[#ffffffb3]' : 'text-[#5e5e5e]'}`}>Length</span>
          <span className="text-xs font-semibold capitalize mt-0.5">{settings.defaultLength}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-1 flex flex-col gap-2">
        <button
          onClick={openSettings}
          className={`w-full py-2 rounded-md font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
            isDark 
              ? 'bg-[#70b5f9] text-[#1d2226] hover:bg-[#a0d1ff]' 
              : 'bg-[#0a66c2] text-[#ffffff] hover:bg-[#004182]'
          }`}
        >
          <Settings size={14} /> Open Settings
        </button>
      </div>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<PopupApp />);
}
