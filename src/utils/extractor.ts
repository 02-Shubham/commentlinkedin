import { ExtractedPostData } from '../types';

export function extractPostData(commentInput: HTMLElement): ExtractedPostData {
  console.log('[AI Extractor] Starting extraction from editor element:', commentInput);

  let parent = commentInput.parentElement;
  let postTextEl: HTMLElement | null = null;

  // 1. Climb up to find the closest ancestor containing the post commentary element.
  // We identify it by looking for the stable data-testid="expandable-text-box" or componentkey="feed-commentary_..."
  // while ensuring we don't accidentally stop inside a nested reply/comment item.
  while (parent && parent !== document.body) {
    postTextEl = parent.querySelector('[data-testid="expandable-text-box"], [componentkey*="feed-commentary"]');
    if (postTextEl && !parent.closest('.comments-comment-item')) {
      break;
    }
    parent = parent.parentElement;
  }

  const postData: ExtractedPostData = {
    postText: '',
    hashtags: [],
  };

  if (!parent || !postTextEl) {
    console.error('[AI Extractor] Failed to find parent container or post text element.');
    return postData;
  }

  console.log('[AI Extractor] Identified parent post container:', parent);

  // 2. Extract Author Name
  // We look for a profile link. The profile image alt tag "View [Name]’s profile" is the most stable source.
  // We query within the actor/author container first to avoid social headers (e.g. "Devyani Chavan commented") at the top of the card.
  const actorContainer = parent.querySelector('.update-components-actor, .feed-shared-actor, [class*="actor" i]');
  const profileLink = (actorContainer || parent).querySelector('a[href*="/in/"]:not([class*="comment" i])') as HTMLAnchorElement | null;
  if (profileLink) {
    const profileImg = profileLink.querySelector('img');
    if (profileImg && profileImg.alt) {
      // Clean "View Sundas Khalid’s profile" -> "Sundas Khalid"
      postData.author = profileImg.alt
        .replace(/^View /i, '')
        .replace(/[’']s profile/i, '')
        .trim();
    } else {
      postData.author = profileLink.innerText.split('\n')[0].trim();
    }
  }

  // 3. Extract Post Text
  let rawText = postTextEl.innerText || '';
  
  // Clean up "see more" or translation triggers
  rawText = rawText.replace(/\s*\.\.\.see\s+more$/i, '')
                   .replace(/\s*\.\.\.see\s+translation$/i, '')
                   .trim();
  postData.postText = rawText;

  // Extract hashtags
  const hashtagRegex = /#\w+/g;
  const matches = rawText.match(hashtagRegex);
  if (matches) {
    postData.hashtags = matches.map(tag => tag.substring(1));
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

  console.log('[AI Extractor] Final Extracted Post Data:', {
    author: postData.author,
    textLength: postData.postText.length,
    hashtagsCount: postData.hashtags.length,
    hasMediaDescription: !!postData.mediaDescription,
    preview: postData.postText.substring(0, 100) + '...'
  });

  return postData;
}
