import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { AppSettings, HistoryItem, CommentLength, AIProviderName, ProviderConfig } from '../types';

// Custom storage adapter for chrome.storage.local
const chromeStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return localStorage.getItem(name);
    }
    const result = await chrome.storage.local.get(name);
    return result[name] || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      localStorage.setItem(name, value);
      return;
    }
    await chrome.storage.local.set({ [name]: value });
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      localStorage.removeItem(name);
      return;
    }
    await chrome.storage.local.remove(name);
  },
};

interface AppState {
  settings: AppSettings;
  history: HistoryItem[];
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateProviderConfig: (provider: AIProviderName, config: Partial<ProviderConfig>) => void;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  selectedProvider: 'gemini',
  providers: {
    gemini: { apiKey: '', model: 'gemini-1.5-flash' },
    openai: { apiKey: '', model: 'gpt-4o-mini' },
    groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
    openrouter: { apiKey: '', model: 'meta-llama/llama-3-8b-instruct:free' },
  },
  defaultLength: 'medium',
  theme: 'system',
  temperature: 0.7,
  maxTokens: 1000,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },
      history: [],
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
        
      updateProviderConfig: (provider, config) =>
        set((state) => ({
          settings: {
            ...state.settings,
            providers: {
              ...state.settings.providers,
              [provider]: {
                ...state.settings.providers[provider],
                ...config,
              },
            },
          },
        })),
        
      addHistoryItem: (item) =>
        set((state) => {
          const newItem: HistoryItem = {
            ...item,
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            timestamp: Date.now(),
          };
          return {
            history: [newItem, ...state.history].slice(0, 100), // Cap history at 100 entries
          };
        }),
        
      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
        
      clearHistory: () => set({ history: [] }),
      
      resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } }),
    }),
    {
      name: 'linkedin-ai-comment-assistant-storage-v2', // Updated key to force refresh
      storage: createJSONStorage(() => chromeStorageAdapter),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
