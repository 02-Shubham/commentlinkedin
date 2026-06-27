import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Copy, Check, RotateCw, FileInput, 
  MessageSquare, Sliders, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { useStore } from '../../store';
import { extractPostData } from '../../utils/extractor';
import { CommentTone, CommentLength, ExtractedPostData } from '../../types';

interface TriggerEventDetail {
  inputElement: HTMLElement;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export default function FloatingPanel() {
  const { settings, addHistoryItem } = useStore();
  
  // UI states
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [activeInput, setActiveInput] = useState<HTMLElement | null>(null);
  
  // Generation parameters
  const [selectedTone, setSelectedTone] = useState<CommentTone>('professional');
  const [selectedLength, setSelectedLength] = useState<CommentLength>('medium');
  const [customInstruction, setCustomInstruction] = useState('');
  
  // Result states
  const [loading, setLoading] = useState(false);
  const [generatedComment, setGeneratedComment] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPostData | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // Sync defaults from store settings once loaded
  useEffect(() => {
    if (settings) {
      setSelectedTone(settings.defaultTone);
      setSelectedLength(settings.defaultLength);
    }
  }, [settings]);

  // Listen for the custom trigger event dispatched by the injected button
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<TriggerEventDetail>;
      const { inputElement, rect } = customEvent.detail;
      
      setActiveInput(inputElement);
      // Place the panel 8px below the editor input box
      setPosition({
        top: rect.top + rect.height + 8,
        left: rect.left,
        width: Math.max(rect.width, 380) // Minimum width of 380px
      });
      setIsOpen(true);
      
      // Reset output states when opening a new input
      setGeneratedComment('');
      setError('');
      setInserted(false);
      setCopied(false);
      
      // Auto-extract post content
      try {
        const postData = extractPostData(inputElement);
        setExtractedData(postData);
      } catch (err) {
        console.error('Failed to extract post content:', err);
      }
    };

    window.addEventListener('linkedin-ai-trigger-panel', handleTrigger);
    return () => {
      window.removeEventListener('linkedin-ai-trigger-panel', handleTrigger);
    };
  }, []);

  // Close panel on clicking outside the panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!isOpen || !panelRef.current) return;
      
      // Check if click was outside the panel AND not on the active input or the trigger button
      const path = e.composedPath();
      if (!path.includes(panelRef.current) && (!activeInput || !path.includes(activeInput))) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, activeInput]);

  // Handle key validation & comment generation
  const handleGenerate = async () => {
    if (!extractedData) {
      setError('Could not extract LinkedIn post data.');
      return;
    }

    const providerConfig = settings.providers[settings.selectedProvider];
    if (!providerConfig || !providerConfig.apiKey) {
      setError(`Please set an API key for ${settings.selectedProvider === 'gemini' ? 'Google Gemini' : settings.selectedProvider.toUpperCase()} in the extension options page.`);
      return;
    }

    setLoading(true);
    setError('');
    setInserted(false);
    setCopied(false);

    try {
      // Proxy call through background service worker to bypass LinkedIn's strict CSP / CORS rules
      const response = await chrome.runtime.sendMessage({
        type: 'generate-comment',
        payload: {
          provider: settings.selectedProvider,
          params: {
            apiKey: providerConfig.apiKey,
            model: providerConfig.model,
            postData: extractedData,
            tone: selectedTone,
            length: selectedLength,
            customInstruction,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens
          }
        }
      });

      if (response && response.success) {
        setGeneratedComment(response.comment);
        // Save to history
        addHistoryItem({
          postAuthor: extractedData.author,
          postText: extractedData.postText,
          generatedComment: response.comment,
          tone: selectedTone,
          length: selectedLength,
          provider: settings.selectedProvider
        });
      } else {
        throw new Error(response?.error || 'Failed to generate comment.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  // Natively insert the comment into LinkedIn's editor
  const handleInsert = () => {
    if (!activeInput || !generatedComment) return;

    try {
      activeInput.focus();
      // Select everything and replace
      document.execCommand('selectAll', false, undefined);
      document.execCommand('delete', false, undefined);
      document.execCommand('insertText', false, generatedComment);
      
      // Dispatch standard input events so React / Quill model notices the text change
      activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      setInserted(true);
      setTimeout(() => setIsOpen(false), 800); // Auto close panel shortly after insert
    } catch (err) {
      console.error('Failed to insert comment:', err);
      setError('Could not automatically insert text. Please copy and paste manually.');
    }
  };

  const handleCopy = async () => {
    if (!generatedComment) return;
    try {
      await navigator.clipboard.writeText(generatedComment);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!isOpen) return null;

  // Determine theme mode classes
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const themeClass = isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-800';

  const tones: { label: string; value: CommentTone }[] = [
    { label: '💼 Professional', value: 'professional' },
    { label: '👋 Friendly', value: 'friendly' },
    { label: '🎯 Straight', value: 'straight' },
    { label: '💻 Technical', value: 'technical' },
    { label: '💡 Thought Leader', value: 'thought-leader' },
    { label: '🤔 Curious', value: 'curious' },
    { label: '❤️ Supportive', value: 'supportive' },
    { label: '🚀 Founder', value: 'founder' },
    { label: '🔍 Recruiter', value: 'recruiter' },
    { label: '🎓 Student', value: 'student' },
    { label: '⚖️ Contrarian', value: 'contrarian' },
    { label: '✨ Inspirational', value: 'inspirational' }
  ];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        maxWidth: '550px',
        pointerEvents: 'auto'
      }}
      className={`rounded-2xl shadow-2xl overflow-hidden font-sans border border-slate-200/20 glass ${themeClass}`}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-indigo-600 text-white">
              <Sparkles size={16} />
            </div>
            <span className="font-semibold text-sm tracking-wide">AI Comment Assistant</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-slate-200/20 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Tone</span>
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedTone(t.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedTone === t.value
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-95'
                    : 'bg-slate-200/10 text-slate-300 border-slate-200/5 hover:bg-slate-200/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacing & Length */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Length</span>
            <div className="flex bg-slate-200/10 p-0.5 rounded-lg border border-slate-200/5">
              {(['short', 'medium', 'long'] as CommentLength[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLength(l)}
                  className={`flex-1 py-1 rounded text-xs font-medium capitalize transition-all ${
                    selectedLength === l
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:bg-slate-200/5'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200/10 bg-slate-200/5 hover:bg-slate-200/10 text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-1"><Sliders size={12} /> Advanced</span>
              {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Advanced Panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden flex flex-col gap-2 text-xs border-t border-b border-slate-200/5 py-2 text-slate-300"
            >
              <div className="flex justify-between">
                <span>Active Provider:</span>
                <span className="font-semibold text-indigo-400 capitalize">{settings.selectedProvider}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="font-mono text-[10px]">{settings.providers[settings.selectedProvider]?.model}</span>
              </div>
              {extractedData?.author && (
                <div className="flex justify-between">
                  <span>Replying to:</span>
                  <span className="font-semibold">{extractedData.author}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Instruction */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Custom Instruction (Optional)</span>
          <input
            type="text"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="e.g. Congratulate them; reply as a senior backend developer..."
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200/10 bg-slate-200/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Generate Button / Output */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium text-xs tracking-wide shadow-lg flex items-center justify-center gap-1.5 transition-all transform active:scale-98"
          >
            {loading ? (
              <RotateCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {loading ? 'Analyzing post & generating...' : 'Generate Comment'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-red-300 flex gap-2 items-start">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Text Area */}
          {generatedComment && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Draft Comment</span>
              <textarea
                value={generatedComment}
                onChange={(e) => setGeneratedComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-200/10 bg-slate-200/5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y transition-colors font-sans leading-relaxed"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-slate-200/10 bg-slate-200/5 hover:bg-slate-200/10 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleInsert}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {inserted ? <Check size={12} className="text-green-200" /> : <FileInput size={12} />}
                  {inserted ? 'Inserted!' : 'Insert into Editor'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
