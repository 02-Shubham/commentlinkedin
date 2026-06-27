import { createRoot } from 'react-dom/client';
import FloatingPanel from './components/FloatingPanel';

// Base64 CSS placeholder that will be injected at build time and decoded at runtime
const tailwindStylesBase64 = '__TAILWIND_CSS_PLACEHOLDER__';
const tailwindStyles = atob(tailwindStylesBase64);

// Custom event to communicate between injected buttons and our floating panel React app
export interface TriggerEventDetail {
  inputElement: HTMLElement;
  rect: DOMRect;
}

const TRIGGER_EVENT = 'linkedin-ai-trigger-panel';

// Helper to inject the styling link inside the shadow root
function injectStyles(shadowRoot: ShadowRoot) {
  const styleEl = document.createElement('style');
  styleEl.textContent = tailwindStyles;
  shadowRoot.appendChild(styleEl);
}

// 1. Initialize our React application in a Shadow DOM attached to document.body
function initShadowDOM() {
  const container = document.createElement('div');
  container.id = 'linkedin-ai-comment-assistant-root';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.pointerEvents = 'none'; // Allow clicking through empty overlay space
  container.style.zIndex = '999999';

  const shadowRoot = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  injectStyles(shadowRoot);

  const reactRootDiv = document.createElement('div');
  reactRootDiv.id = 'app-root';
  reactRootDiv.style.pointerEvents = 'auto'; // Re-enable pointer events for the UI elements
  shadowRoot.appendChild(reactRootDiv);

  const root = createRoot(reactRootDiv);
  root.render(<FloatingPanel />);
}

// 2. Button Injection Logic
function injectAIButton(editor: HTMLElement) {
  if (editor.getAttribute('data-ai-assistant-injected') === 'true') {
    return;
  }

  console.log('[AI Assistant] Found comment editor:', editor);

  // Find the actions container by walking up the DOM and searching for native action buttons (Emoji, GIF, Photo)
  let ancestor = editor.parentElement;
  let actionsContainer: HTMLElement | null = null;

  while (ancestor && ancestor !== document.body) {
    const nativeBtn = ancestor.querySelector(
      'button[aria-label*="emoji" i], button[aria-label*="GIF" i], button[aria-label*="photo" i]'
    );
    if (nativeBtn) {
      actionsContainer = nativeBtn.parentElement;
      console.log('[AI Assistant] Found native actions container by traversing ancestor:', actionsContainer);
      break;
    }
    ancestor = ancestor.parentElement;
  }

  // Create the ✨ button matching LinkedIn's native styling
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'linkedin-ai-inject-btn';
  button.title = 'AI Comment Assistant';
  
  // Custom SVG icon matching LinkedIn's clean stroke style
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" style="stroke: #a855f7; fill: #a855f7;"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" style="stroke: #6366f1; fill: #6366f1;"/>
    </svg>
  `;

  // Apply styles to match native LinkedIn comment actions (gray outline, circular hover)
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.background = 'transparent';
  button.style.border = 'none';
  button.style.borderRadius = '50%';
  button.style.width = '32px';
  button.style.height = '32px';
  button.style.color = '#666666'; // LinkedIn gray icon color
  button.style.transition = 'background-color 0.2s, color 0.2s';
  button.style.marginLeft = '4px';
  button.style.marginRight = '4px';

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    button.style.color = '#333333';
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'transparent';
    button.style.color = '#666666';
  });

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch custom event with target info
    const rect = editor.getBoundingClientRect();
    const event = new CustomEvent<TriggerEventDetail>(TRIGGER_EVENT, {
      detail: {
        inputElement: editor,
        rect: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
          bottom: rect.bottom,
          right: rect.right,
          toJSON: () => {}
        }
      }
    });
    window.dispatchEvent(event);
  });

  if (actionsContainer) {
    // Inject it in the actions container (at the beginning or next to other icons)
    actionsContainer.insertBefore(button, actionsContainer.firstChild);
    editor.setAttribute('data-ai-assistant-injected', 'true');
    console.log('[AI Assistant] Successfully injected inline button inside actions container.');
  } else {
    // Fallback: float it absolutely in bottom-right if actions bar is not found
    const editorParent = editor.parentElement;
    if (editorParent) {
      editorParent.style.position = 'relative';
      button.style.position = 'absolute';
      button.style.right = '12px';
      button.style.bottom = '8px';
      button.style.zIndex = '100';
      button.style.background = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';
      button.style.color = '#ffffff';
      button.style.width = '24px';
      button.style.height = '24px';
      button.style.borderRadius = '50%';
      button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      editorParent.appendChild(button);
      editor.setAttribute('data-ai-assistant-injected', 'true');
      console.log('[AI Assistant] Actions container not found. Injected absolutely as fallback.');
    } else {
      console.error('[AI Assistant] Could not find editorParent. Injection failed.');
    }
  }
}

// 3. Scan the DOM for comment inputs (using broad selector matchers)
function scanForCommentInputs() {
  const editors = document.querySelectorAll(
    '.ql-editor[role="textbox"], div[contenteditable="true"][role="textbox"], .comments-comment-box__editor, div[data-testid="ui-core-tiptap-text-editor-wrapper"] div[contenteditable="true"]'
  );
  
  if (editors.length > 0) {
    console.log(`[AI Assistant] Scanning... found ${editors.length} candidate comment editors.`);
  }
  
  editors.forEach((el) => {
    injectAIButton(el as HTMLElement);
  });
}

// 4. Start MutationObserver to handle dynamically loaded posts / editors
function startObserver() {
  console.log('[AI Assistant] Starting MutationObserver to track dynamically loaded editors...');
  scanForCommentInputs();

  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      scanForCommentInputs();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Initialize on page load
if (typeof window !== 'undefined') {
  console.log('%c[LinkedIn AI Comment Assistant] Content script injected & running!', 'color: #6366f1; font-weight: bold; font-size: 14px;');
  initShadowDOM();
  // Delay observation slightly to let the initial page structure settle
  setTimeout(startObserver, 2000);
}
