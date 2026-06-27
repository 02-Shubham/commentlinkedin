import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Sparkles, Key, Sliders, History, Trash2, CheckCircle, 
  XCircle, Save, Eye, EyeOff, Moon, Sun, Monitor
} from 'lucide-react';
import { useStore } from '../store';
import { PROVIDERS_INFO, testProviderConnection } from '../services/providers';
import { AIProviderName, CommentLength } from '../types';
import '../styles/index.css';

function OptionsApp() {
  const { 
    settings, 
    history, 
    hasHydrated, 
    updateSettings, 
    updateProviderConfig, 
    deleteHistoryItem, 
    clearHistory, 
    resetSettings 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'keys' | 'defaults' | 'history'>('keys');
  const [testingKey, setTestingKey] = useState<AIProviderName | null>(null);
  const [testResult, setTestResult] = useState<Record<AIProviderName, 'success' | 'failed' | null>>({
    gemini: null,
    openai: null,
    groq: null,
    openrouter: null
  });
  const [showKey, setShowKey] = useState<Record<AIProviderName, boolean>>({
    gemini: false,
    openai: false,
    groq: false,
    openrouter: false
  });

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

  // Apply theme classes
  useEffect(() => {
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1d2226'; // LinkedIn dark theme background
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f4f2ee'; // LinkedIn light theme background
    }
  }, [settings.theme, hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading configurations...
      </div>
    );
  }

  const handleApiKeyChange = (provider: AIProviderName, value: string) => {
    updateProviderConfig(provider, { apiKey: value });
    setTestResult(prev => ({ ...prev, [provider]: null }));
  };

  const handleModelChange = (provider: AIProviderName, value: string) => {
    updateProviderConfig(provider, { model: value });
  };

  const testConnection = async (provider: AIProviderName) => {
    const config = settings.providers[provider];
    if (!config || !config.apiKey) return;

    setTestingKey(provider);
    setTestResult(prev => ({ ...prev, [provider]: null }));

    try {
      const success = await testProviderConnection(provider, config.apiKey, config.model);
      setTestResult(prev => ({ ...prev, [provider]: success ? 'success' : 'failed' }));
    } catch {
      setTestResult(prev => ({ ...prev, [provider]: 'failed' }));
    } finally {
      setTestingKey(null);
    }
  };

  const toggleShowKey = (provider: AIProviderName) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div 
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, BlinkMacSystemFont, sans-serif" }}
      className="max-w-4xl mx-auto px-4 py-8 text-[#191919] dark:text-[#ffffff] antialiased"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#0a66c2] text-white shadow-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0a66c2] dark:text-[#70b5f9]">
              LinkedIn AI Comment Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Settings and Configuration Dashboard</p>
          </div>
        </div>
        <button
          onClick={resetSettings}
          className="px-3.5 py-1.5 rounded-md border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-56 shrink-0 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('keys')}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'keys'
                ? 'bg-[#0a66c2] text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#191919] dark:hover:text-[#ffffff]'
            }`}
          >
            <Key size={16} /> API Keys & Providers
          </button>
          <button
            onClick={() => setActiveTab('defaults')}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'defaults'
                ? 'bg-[#0a66c2] text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#191919] dark:hover:text-[#ffffff]'
            }`}
          >
            <Sliders size={16} /> Default Behavior
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'history'
                ? 'bg-[#0a66c2] text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#191919] dark:hover:text-[#ffffff]'
            }`}
          >
            <History size={16} /> Comment History
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white dark:bg-[#1d2226] border border-slate-200 dark:border-[#38434f] rounded-md p-6 shadow-sm min-h-[500px]">
          {activeTab === 'keys' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-bold text-[#191919] dark:text-[#ffffff]">API Key Configuration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your API keys for the services you want to use. Keys are stored locally on your machine.
                </p>
              </div>

              {/* Provider Radio Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Provider</span>
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(PROVIDERS_INFO) as AIProviderName[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateSettings({ selectedProvider: p })}
                      className={`p-3 rounded-md border text-left transition-all ${
                        settings.selectedProvider === p
                          ? 'border-[#0a66c2] bg-[#0a66c2]/5 text-[#0a66c2] dark:text-[#70b5f9] dark:border-[#70b5f9] shadow-sm'
                          : 'border-slate-200 dark:border-[#38434f] bg-slate-50 dark:bg-[#121619] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="block font-bold text-xs capitalize">{p}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {settings.providers[p]?.apiKey ? 'Key set' : 'No key'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-[#38434f] my-2"></div>

              {/* Detailed Config per Provider */}
              <div className="flex flex-col gap-6">
                {(Object.keys(PROVIDERS_INFO) as AIProviderName[]).map((p) => {
                  const info = PROVIDERS_INFO[p];
                  const config = settings.providers[p];
                  const testStatus = testResult[p];

                  return (
                    <div 
                      key={p} 
                      className={`p-4 rounded-md border transition-all ${
                        settings.selectedProvider === p 
                          ? 'border-slate-200 dark:border-[#38434f] bg-slate-50/50 dark:bg-[#121619]/40' 
                          : 'border-transparent opacity-60 hover:opacity-85'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm text-[#191919] dark:text-[#ffffff]">{info.name}</span>
                        <div className="flex gap-2">
                          {/* Model Select */}
                          <select
                            value={config?.model || info.defaultModel}
                            onChange={(e) => handleModelChange(p, e.target.value)}
                            className="bg-white dark:bg-[#121619] border border-slate-200 dark:border-[#38434f] rounded-md px-2.5 py-1 text-xs text-[#191919] dark:text-slate-200 focus:outline-none focus:border-[#0a66c2]"
                          >
                            {info.models.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKey[p] ? 'text' : 'password'}
                            value={config?.apiKey || ''}
                            onChange={(e) => handleApiKeyChange(p, e.target.value)}
                            placeholder={`Enter API Key (${info.placeholderKey})`}
                            className="w-full pl-3 pr-10 py-1.5 rounded-md border border-slate-200 dark:border-[#38434f] bg-white dark:bg-[#121619] text-xs text-[#191919] dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showKey[p] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>

                        <button
                          onClick={() => testConnection(p)}
                          disabled={testingKey === p || !config?.apiKey}
                          className="px-3.5 py-1.5 rounded-md bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          {testingKey === p ? 'Testing...' : 'Test'}
                        </button>
                      </div>

                      {/* Connection Test Results banner */}
                      {testStatus && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          {testStatus === 'success' ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle size={14} /> Connection Successful!
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                              <XCircle size={14} /> Connection failed. Please check your key.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-bold">Default Behavior Settings</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjust default parameters for comment generation. The AI will automatically analyze each post to determine the most context-appropriate tone.
                </p>
              </div>

              {/* Default Length */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Default Comment Length</span>
                <div className="flex bg-slate-100 dark:bg-[#121619] p-0.5 rounded-md border border-slate-200 dark:border-[#38434f]">
                  {(['short', 'medium', 'long'] as CommentLength[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => updateSettings({ defaultLength: l })}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                        settings.defaultLength === l
                          ? 'bg-[#0a66c2] text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Generation Temperature</span>
                  <span className="text-xs font-bold text-[#0a66c2] dark:text-[#70b5f9]">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-[#0a66c2] dark:accent-[#70b5f9]"
                />
                <span className="text-[10px] text-slate-400">
                  Lower value makes responses more deterministic and structured; higher value makes responses more creative.
                </span>
              </div>

              {/* Max Tokens */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Max Tokens</span>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) || 500 })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-[#38434f] bg-white dark:bg-[#121619] text-xs text-[#191919] dark:text-slate-200 focus:outline-none focus:border-[#0a66c2]"
                />
              </div>

              {/* Theme Settings */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">App Theme</span>
                <div className="flex bg-slate-100 dark:bg-[#121619] p-0.5 rounded-md border border-slate-200 dark:border-[#38434f]">
                  {([
                    { name: 'light', icon: <Sun size={14} /> },
                    { name: 'dark', icon: <Moon size={14} /> },
                    { name: 'system', icon: <Monitor size={14} /> }
                  ] as const).map((t) => (
                    <button
                      key={t.name}
                      onClick={() => updateSettings({ theme: t.name })}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize flex items-center justify-center gap-1.5 transition-all ${
                        settings.theme === t.name
                          ? 'bg-[#0a66c2] text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold">Comment Generation History</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage and review comments you've generated. Last 100 comments are saved locally.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1.5 rounded-md border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* History list */}
              {history.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
                  <History size={40} className="stroke-1 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm">No comment history available.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[550px] overflow-y-auto pr-2">
                  {history.map((h) => (
                    <div 
                      key={h.id} 
                      className="p-4 rounded-md border border-slate-200 dark:border-[#38434f] bg-slate-50 dark:bg-[#121619]/40 hover:bg-slate-100 dark:hover:bg-[#121619]/70 transition-all flex flex-col gap-3 relative group"
                    >
                      {/* Delete button */}
                      <button
                        onClick={() => deleteHistoryItem(h.id)}
                        className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Header metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[#0a66c2] dark:text-[#70b5f9] uppercase">{h.provider}</span>
                        <span>•</span>
                        <span className="capitalize">Length: {h.length}</span>
                        <span>•</span>
                        <span>{new Date(h.timestamp).toLocaleString()}</span>
                      </div>

                      {/* Post Content preview */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 border-l-2 border-[#0a66c2]/40 pl-3 py-0.5 line-clamp-2">
                        {h.postAuthor ? <strong className="text-slate-800 dark:text-slate-200 mr-1">{h.postAuthor}:</strong> : ''}
                        "{h.postText}"
                      </div>

                      {/* Generated Comment */}
                      <div className="text-xs bg-white dark:bg-[#121619] p-3 rounded-md border border-slate-200 dark:border-[#38434f] text-[#191919] dark:text-slate-200 leading-relaxed select-all">
                        {h.generatedComment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<OptionsApp />);
}
