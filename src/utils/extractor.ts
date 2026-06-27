import { ExtractedPostData } from '../types';

export function extractPostData(commentInput: HTMLElement): ExtractedPostData {
  console.log('[AI Extractor] Starting extraction from editor element:', commentInput);

  // 1. Find the parent post card wrapper by traversing up the DOM.
  // We look for elements that mark a feed update card, or walk up until we find the root container.
  let parent: HTMLElement | null = commentInput;
  let foundCard = false;

  while (parent && parent !== document.body) {
    // Check common LinkedIn post container triggers
    if (
      parent.hasAttribute('data-urn') || 
      parent.hasAttribute('data-id') ||
      parent.classList.contains('feed-shared-update-v2') ||
      parent.classList.contains('update-outlet') ||
      parent.classList.contains('occludable-update') ||
      parent.tagName === 'ARTICLE' ||
      parent.querySelector('[class*="actor__title"]') || 
      parent.querySelector('a[href*="/in/"]:not(.comments-comment-meta__profile-link)')
    ) {
      // Confirm it's the full update card (must contain text content area and not just the comment container)
      if (parent.querySelector('[class*="commentary" i], [class*="show-more-text" i], [class*="update-components-text" i]')) {
        foundCard = true;
        break;
      }
    }
    parent = parent.parentElement;
  }

  // Fallback: if walking up semantically failed, get the 7th parent (standard nesting height of comment box inside feed update card)
  if (!foundCard || !parent) {
    console.warn('[AI Extractor] Semantic card parent not found. Using fallback traversal.');
    let fallbackParent = commentInput.parentElement;
    for (let i = 0; i < 8 && fallbackParent; i++) {
      if (fallbackParent.querySelector('[class*="commentary" i], [class*="show-more-text" i]')) {
        parent = fallbackParent;
        foundCard = true;
        break;
      }
      fallbackParent = fallbackParent.parentElement;
    }
  }

  const postData: ExtractedPostData = {
    postText: '',
    hashtags: [],
  };

  if (!parent) {
    console.error('[AI Extractor] Failed to find the parent post update container.');
    return postData;
  }

  console.log('[AI Extractor] Identified parent post container:', parent);

  // 2. Extract Author Name
  // Walk through potential author selectors, prioritizing profile links outside the comment list
  const authorEl = parent.querySelector(
    '.update-components-actor__title, .feed-shared-actor__title, .feed-shared-actor__name, [class*="actor__title" i], [class*="actor__name" i]'
  );
  
  if (authorEl) {
    let rawAuthor = (authorEl as HTMLElement).innerText || '';
    rawAuthor = rawAuthor.split('\n')[0].trim();
    postData.author = rawAuthor.replace(/\s*•\s*\d+\w*$/, '').trim();
  } else {
    // Fallback: look for the first profile link inside the post header
    const profileLink = parent.querySelector('a[href*="/in/"]') as HTMLElement | null;
    if (profileLink) {
      postData.author = profileLink.innerText.split('\n')[0].trim();
    }
  }

  // 3. Extract Post Text
  // Search using partial class match for commentary or text contents
  const textEl = parent.querySelector(
    '[class*="commentary" i], [class*="show-more-text" i], [class*="update-components-text" i], [class*="feed-shared-text-view" i]'
  );

  if (textEl) {
    let rawText = (textEl as HTMLElement).innerText || '';
    // Clean up "see more" triggers
    rawText = rawText.replace(/\s*\.\.\.see\s+more$/i, '').trim();
    postData.postText = rawText;

    // Extract hashtags
    const hashtagRegex = /#\w+/g;
    const matches = rawText.match(hashtagRegex);
    if (matches) {
      postData.hashtags = matches.map(tag => tag.substring(1));
    }
  }

  // 4. Extract Media descriptions
  const imgEl = parent.querySelector('img[class*="image__image" i], [class*="article__description" i] img') as HTMLImageElement | null;
  if (imgEl && imgEl.alt && !/^(photo|image|picture)/i.test(imgEl.alt)) {
    postData.mediaDescription = imgEl.alt.trim();
  }

  // 5. Extract Post URL
  const urn = parent.getAttribute('data-urn') || parent.getAttribute('data-id');
  if (urn) {
    postData.postUrl = `https://www.linkedin.com/feed/update/${urn}`;
  }

  console.log('[AI Extractor] Extracted Post Data successfully:', {
    author: postData.author,
    textLength: postData.postText.length,
    hashtagsCount: postData.hashtags.length,
    hasMediaDescription: !!postData.mediaDescription,
    preview: postData.postText.substring(0, 100) + '...'
  });

  return postData;
}
