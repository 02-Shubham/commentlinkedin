import { ExtractedPostData } from '../types';

export function extractPostData(commentInput: HTMLElement): ExtractedPostData {
  console.log('[AI Extractor] Starting extraction from editor element:', commentInput);

  // 1. Climb up to find the closest ancestor representing the entire post card/container.
  const parent = commentInput.closest('.feed-shared-update-v2, [data-urn], .occludable-update, article, .feed-shared-update') as HTMLElement | null;

  const postData: ExtractedPostData = {
    postText: '',
    hashtags: [],
    hasImages: false,
    imageCount: 0,
  };

  if (!parent) {
    console.error('[AI Extractor] Failed to find parent post container.');
    return postData;
  }

  console.log('[AI Extractor] Identified parent post container:', parent);

  // Find post commentary element (expandable text box or component keys/classes)
  const postTextEl = parent.querySelector(
    '[data-testid="expandable-text-box"], [componentkey*="feed-commentary"], .feed-shared-update-v2__commentary, .update-components-text, .feed-shared-inline-show-more-text'
  ) as HTMLElement | null;

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
  let rawText = '';
  if (postTextEl) {
    rawText = postTextEl.innerText || '';
    // Clean up "see more" or translation triggers
    rawText = rawText.replace(/\s*\.\.\.see\s+more$/i, '')
                     .replace(/\s*\.\.\.see\s+translation$/i, '')
                     .trim();
  }
  postData.postText = rawText;

  // Extract hashtags
  const hashtagRegex = /#\w+/g;
  const matches = rawText.match(hashtagRegex);
  if (matches) {
    postData.hashtags = matches.map(tag => tag.substring(1));
  }

  // 4. Extract Media descriptions
  const mediaImgEls = parent.querySelectorAll(
    'img[class*="image__image" i], [class*="update-components-image" i] img, .feed-shared-image__container img, .update-components-article__image img, .update-components-carousel img, [class*="update-components-multiple-images" i] img, [class*="carousel" i] img'
  );

  const cleanedAlts: string[] = [];
  mediaImgEls.forEach((imgEl) => {
    const img = imgEl as HTMLImageElement;
    const alt = img.getAttribute('alt') || '';
    const trimmed = alt.trim();
    if (trimmed) {
      const isGeneric = /^(photo|image|picture|thumbnail|preview)$/i.test(trimmed) || 
                        /^(no photo description|no alternative text)/i.test(trimmed);
      if (!isGeneric) {
        cleanedAlts.push(trimmed);
      }
    }
  });

  if (cleanedAlts.length > 0) {
    postData.mediaDescription = cleanedAlts.join('; ');
  }
  postData.hasImages = mediaImgEls.length > 0;
  postData.imageCount = mediaImgEls.length;

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
    hasImages: postData.hasImages,
    imageCount: postData.imageCount,
    preview: postData.postText.substring(0, 100) + '...'
  });

  return postData;
}
