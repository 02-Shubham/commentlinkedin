import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Copy, Check, RotateCw, FileInput, 
  Sliders, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { useStore } from '../../store';
import { extractPostData } from '../../utils/extractor';
import { CommentLength, ExtractedPostData } from '../../types';

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
  const { settings, updateSettings, addHistoryItem } = useStore();
  
  // UI states
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 400 });
  const [activeInput, setActiveInput] = useState<HTMLElement | null>(null);
  
  // Generation parameters
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

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panelStart = useRef({ top: 0, left: 0 });

  const panelRef = useRef<HTMLDivElement>(null);

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

  // Sync defaults from store settings once loaded
  useEffect(() => {
    if (settings) {
      setSelectedLength(settings.defaultLength);
    }
  }, [settings]);

  // Listen for the custom trigger event dispatched by the injected button
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<TriggerEventDetail>;
      const { inputElement, rect } = customEvent.detail;
      
      setActiveInput(inputElement);

      const panelWidth = 400;
      const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 450;

      // Determine starting coordinate relative to viewport (fixed layout)
      const viewportTop = rect.top + rect.height + 8 - window.scrollY;
      const viewportLeft = Math.max(16, rect.left - window.scrollX);

      // Load position from store settings if user has previously dragged it.
      let initialTop = settings?.savedPosition?.top ?? viewportTop;
      let initialLeft = settings?.savedPosition?.left ?? viewportLeft;

      // Clamp initial coordinates to ensure it stays inside Chrome window boundaries
      initialTop = Math.max(10, Math.min(window.innerHeight - panelHeight - 10, initialTop));
      initialLeft = Math.max(10, Math.min(window.innerWidth - panelWidth - 10, initialLeft));

      setPosition({
        top: initialTop,
        left: initialLeft,
        width: panelWidth
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
  }, [settings]);

  // Close panel on clicking outside the panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!isOpen || !panelRef.current || isDragging) return;
      
      const path = e.composedPath();
      if (!path.includes(panelRef.current) && (!activeInput || !path.includes(activeInput))) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, activeInput, isDragging]);

  // Dragging event listener attachment with window boundary constraints
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 450;
      const panelWidth = position.width;

      // Clamp coords so widget remains fully visible inside Chrome window
      const newTop = Math.max(10, Math.min(window.innerHeight - panelHeight - 10, panelStart.current.top + dy));
      const newLeft = Math.max(10, Math.min(window.innerWidth - panelWidth - 10, panelStart.current.left + dx));
      
      setPosition({
        top: newTop,
        left: newLeft,
        width: panelWidth
      });

      updateSettings({
        savedPosition: { top: newTop, left: newLeft }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position.width, updateSettings]);

  // Initialize drag action on header mousedown
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return; // Avoid drag on button clicks

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panelStart.current = { top: position.top, left: position.left };
    e.preventDefault();
  };

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
      const response = await chrome.runtime.sendMessage({
        type: 'generate-comment',
        payload: {
          provider: settings.selectedProvider,
          params: {
            apiKey: providerConfig.apiKey,
            model: providerConfig.model,
            postData: extractedData,
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
      document.execCommand('selectAll', false, undefined);
      document.execCommand('delete', false, undefined);
      document.execCommand('insertText', false, generatedComment);
      
      activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      setInserted(true);
      setTimeout(() => setIsOpen(false), 800);
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

  // STRICT LIGHT THEME FOR THE FLOATING PANEL
  // background: white (#ffffff)
  // borders: light grey (#e0e0e0)
  // text: LinkedIn charcoal charcoal (#191919)
  const themeClass = 'bg-[#ffffff] text-[#191919] border-[#e0e0e0] shadow-slate-300/50';
  const secondaryTextClass = 'text-[#5e5e5e]';
  const dividerClass = 'border-[#e0e0e0]';

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: `${position.width}px`,
        maxWidth: '90vw',
        pointerEvents: 'auto',
        zIndex: 999999,
        fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, BlinkMacSystemFont, sans-serif"
      }}
      className={`rounded-md border shadow-2xl overflow-hidden transition-shadow duration-200 ${themeClass} ${isDragging ? 'select-none shadow-2xl scale-[1.01]' : ''}`}
    >
      <div className="p-5 flex flex-col gap-5">
        
        {/* Draggable Header */}
        <div 
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between border-b pb-3 cursor-move select-none ${dividerClass}`}
          title="Drag to reposition"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-[#0a66c2]" />
            <span className="font-bold text-[18px] tracking-wide">AI Comment Assistant</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full transition-colors hover:bg-[#00000008] text-[#5e5e5e]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Spacing & Length */}
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <span className={`text-[13px] font-bold tracking-wider uppercase ${secondaryTextClass}`}>Length</span>
            <div className="flex p-1 rounded-md border bg-[#f4f2ee] border-[#e0e0e0]">
              {(['short', 'medium', 'long'] as CommentLength[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLength(l)}
                  className={`flex-1 py-1 rounded-md text-[15px] font-semibold capitalize transition-all ${
                    selectedLength === l
                      ? 'bg-[#0a66c2] text-[#ffffff] shadow-sm'
                      : 'text-[#5e5e5e] hover:bg-[#00000008]'
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
              className="flex items-center justify-between px-4 py-2 rounded-md border text-[14px] font-semibold transition-all border-[#e0e0e0] bg-[#ffffff] text-[#5e5e5e] hover:bg-[#f4f2ee]"
            >
              <span className="flex items-center gap-1.5"><Sliders size={15} /> Advanced</span>
              {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
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
              className={`overflow-hidden flex flex-col gap-2 text-[14px] border-t border-b py-3 ${dividerClass} ${secondaryTextClass}`}
            >
              <div className="flex justify-between">
                <span>Active Provider:</span>
                <span className="font-semibold capitalize text-[#0a66c2]">{settings.selectedProvider}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="font-mono text-[13px]">{settings.providers[settings.selectedProvider]?.model}</span>
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
        <div className="flex flex-col gap-2">
          <span className={`text-[13px] font-bold tracking-wider uppercase ${secondaryTextClass}`}>Custom Instruction (Optional)</span>
          <input
            type="text"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="e.g. Reply as a senior developer..."
            className="w-full px-4 py-2 rounded-md border text-[15px] focus:outline-none focus:ring-1 transition-all border-[#e0e0e0] bg-[#ffffff] text-[#191919] focus:border-[#0a66c2] focus:ring-[#0a66c2]"
          />
        </div>

        {/* Generate Button / Output */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3 rounded-md font-bold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 ${
              loading 
                ? 'opacity-65 cursor-not-allowed bg-[#0a66c2]' 
                : 'bg-[#0a66c2] hover:bg-[#004182]'
            } text-[#ffffff]`}
          >
            {loading ? (
              <RotateCw size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {loading ? 'Generating comment...' : 'Generate Comment'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-md border border-red-500/20 bg-red-500/10 text-[14px] text-red-700 flex gap-2.5 items-start">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Text Area */}
          {generatedComment && (
            <div className="flex flex-col gap-2.5">
              <span className={`text-[13px] font-bold tracking-wider uppercase ${secondaryTextClass}`}>Draft Comment</span>
              <textarea
                value={generatedComment}
                onChange={(e) => setGeneratedComment(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-md border text-[15px] focus:outline-none focus:ring-1 resize-y leading-relaxed border-[#e0e0e0] bg-[#ffffff] text-[#191919] focus:border-[#0a66c2] focus:ring-[#0a66c2]"
              />
              <div className="flex gap-3 justify-end mt-1">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-md border text-[14px] font-semibold flex items-center gap-2 transition-all border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleInsert}
                  className="px-5 py-2 rounded-md text-[14px] font-bold flex items-center gap-2 transition-all bg-[#0a66c2] text-[#ffffff] hover:bg-[#004182]"
                >
                  {inserted ? <Check size={14} /> : <FileInput size={14} />}
                  {inserted ? 'Inserted!' : 'Insert'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
