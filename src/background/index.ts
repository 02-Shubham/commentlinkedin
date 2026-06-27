import { generateComment, testProviderConnection } from '../services/providers';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'generate-comment') {
    const { provider, params } = message.payload;
    (async () => {
      try {
        const comment = await generateComment(provider, params);
        sendResponse({ success: true, comment });
      } catch (err: any) {
        console.error('API Generation Error:', err);
        sendResponse({ success: false, error: err.message || 'Unknown error' });
      }
    })();
    return true; // Keep the message channel open for async response
  }

  if (message.type === 'test-connection') {
    const { provider, apiKey, model } = message.payload;
    (async () => {
      try {
        const status = await testProviderConnection(provider, apiKey, model);
        sendResponse({ success: true, status });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message || 'Connection test failed' });
      }
    })();
    return true;
  }
});
