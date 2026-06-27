import { ExtractedPostData } from '../types';

export function extractPostData(commentInput: HTMLElement): ExtractedPostData {
  // Find the parent post container.
  // LinkedIn feed items usually have feed-shared-update-v2 classes, article tags, 
  // or data-urn/data-id attributes.
  let parent: HTMLElement | null = commentInput;
  while (parent && !parent.classList.contains('feed-shared-update-v2') && parent.tagName !== 'ARTICLE' && !parent.hasAttribute('data-urn')) {
    parent = parent.parentElement;
  }

  if (!parent) {
    // Fallback: search closest card or major section if parent post class changes
    parent = commentInput.closest('.feed-shared-update-v2') || 
             commentInput.closest('article') || 
             commentInput.closest('.feed-shared-update-detail-vertical');
  }

  const postData: ExtractedPostData = {
    postText: '',
    hashtags: [],
  };

  if (!parent) {
    // If no parent found, search for visible text near the editor
    return postData;
  }

  // 1. Extract Author Name
  // Common LinkedIn selectors for actor title:
  // - .update-components-actor__title
  // - .feed-shared-actor__title
  // - .feed-shared-actor__name
  const authorEl = parent.querySelector(
    '.update-components-actor__title, .feed-shared-actor__title, .feed-shared-actor__name, [class*="actor__title"], [class*="actor__name"]'
  );
  if (authorEl) {
    // Clean up text (remove suffix/prefix/pronouns like "• 1st" or "He/Him")
    let rawAuthor = (authorEl as HTMLElement).innerText || '';
    rawAuthor = rawAuthor.split('\n')[0].trim();
    // Strip trailing degree connection info like " • 1st" or " • 2nd"
    postData.author = rawAuthor.replace(/\s*•\s*\d+\w*$/, '').trim();
  }

  // 2. Extract Post Text
  // Common LinkedIn selectors for post text:
  // - .feed-shared-update-v2__commentary
  // - .update-components-text
  // - .feed-shared-inline-show-more-text
  const textEl = parent.querySelector(
    '.feed-shared-update-v2__commentary, .update-components-text, .feed-shared-inline-show-more-text, [class*="commentary"], [class*="show-more-text"]'
  );
  if (textEl) {
    let rawText = (textEl as HTMLElement).innerText || '';
    // Clean up "see more" or similar LinkedIn text triggers
    rawText = rawText.replace(/\s*\.\.\.see\s+more$/i, '').trim();
    postData.postText = rawText;

    // Extract hashtags dynamically from post text
    const hashtagRegex = /#\w+/g;
    const matches = rawText.match(hashtagRegex);
    if (matches) {
      postData.hashtags = matches.map(tag => tag.substring(1));
    }
  }

  // 3. Extract Media/Image description (alt text of images)
  const imgEl = parent.querySelector('img.update-components-image__image, .update-components-article__description img, [class*="image__image"]') as HTMLImageElement | null;
  if (imgEl && imgEl.alt && !imgEl.alt.startsWith('Photo') && !imgEl.alt.startsWith('Image')) {
    postData.mediaDescription = imgEl.alt.trim();
  }

  // 4. Extract Post URL
  // We can try to build it from the URN (data-urn)
  const urn = parent.getAttribute('data-urn');
  if (urn) {
    postData.postUrl = `https://www.linkedin.com/feed/update/${urn}`;
  } else {
    // Fallback: look for a share link or control menu option link
    const controlMenuLink = parent.querySelector('.feed-shared-control-menu__trigger, [class*="control-menu"]') as HTMLElement | null;
    if (controlMenuLink) {
      // Sometimes we can extract an ID or find direct links
    }
  }

  return postData;
}
