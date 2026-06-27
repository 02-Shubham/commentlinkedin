import { CommentTone, CommentLength, ExtractedPostData } from '../types';

export const TONE_TEMPLATES: Record<CommentTone, string> = {
  professional: `
Write a professional, insightful comment. Focus on adding value, sharing business perspective, or highlighting a key takeaway from the post. Maintain a respectful, industry-standard tone.
`,
  friendly: `
Write a warm, friendly, and encouraging comment. Sound personable and approachable, using positive language. Focus on building a connection.
`,
  straight: `
Write a direct, straightforward comment. No fluff, no generic pleasantries. Get straight to the point with a clear and concise observation or opinion.
`,
  technical: `
Write a technically-minded comment. Reference engineering principles, architectural concepts, technical tradeoffs, or data-driven reasoning. Sound like an experienced developer or engineer.
`,
  'thought-leader': `
Write a thought-provoking, forward-looking comment. Offer a strategic, high-level perspective on the industry trend, challenge the status quo, or paint a picture of the future.
`,
  curious: `
Write a comment that shows curiosity. End with a thoughtful, open-ended question that invites the author or community to elaborate on a specific point from the post.
`,
  supportive: `
Write a highly supportive, validating comment. Congratulate them on their achievement, validate their struggle, or express strong agreement with their message.
`,
  founder: `
Write a comment from a founder's perspective. Focus on execution, agility, market dynamics, product-market fit, startup challenges, or scaling lessons.
`,
  recruiter: `
Write a comment from a recruiter/talent leader's perspective. Emphasize career growth, company culture, talent acquisition, professional development, or employee branding.
`,
  student: `
Write a comment from the perspective of an eager learner or student. Show humility, thank the author for the lesson, and ask a polite question seeking advice or mentorship.
`,
  contrarian: `
Write a comment offering a respectful, alternative viewpoint. Gently challenge a common assumption made in the post, present a different angle, and back it up with logical reasoning. Keep it friendly and professional, never combative.
`,
  inspirational: `
Write an inspiring and motivational comment. Highlight themes of resilience, hard work, personal growth, vision, or leadership. Use positive and empowering language.
`
};

export const LENGTH_TEMPLATES: Record<CommentLength, string> = {
  short: "Keep the comment extremely concise (1 to 2 sentences max). Under 40 words.",
  medium: "Write a standard comment (3 to 4 sentences). Around 60 to 90 words.",
  long: "Write a detailed comment (2 to 3 short paragraphs). Around 120 to 180 words, analyzing the topic in depth."
};

export function buildPrompt(
  postData: ExtractedPostData,
  tone: CommentTone,
  length: CommentLength,
  customInstruction?: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a professional LinkedIn Comment Assistant. Your sole job is to help users write high-quality, engaging, and authentic LinkedIn comments based on posts they read.
  
CRITICAL RULE:
- NEVER output placeholders, template variables, or instructions like "[Insert Name]" or "[Your Company]". 
- The generated comment must be immediately ready to be posted without editing, though the user can edit if they wish.
- Do NOT output hashtags unless the user explicitly requested them in the custom instructions.
- Ensure the comment sounds written by a human. Avoid overly clinical, robotic, or AI-sounding words like "delve", "testament", "moreover", "furthermore", "beacon", "catalyst".

Formatting:
- Do not use markdown (like bolding with ** or headings) because LinkedIn comment input does not render markdown. Use clean plain text with standard spacing and paragraphs.`;

  let userPrompt = `Here is the LinkedIn post information:
${postData.author ? `Post Author: ${postData.author}\n` : ''}
Post Content:
"""
${postData.postText}
"""
${postData.mediaDescription ? `Visual Media Description: ${postData.mediaDescription}\n` : ''}
${postData.hashtags.length > 0 ? `Post Hashtags: ${postData.hashtags.join(', ')}\n` : ''}

Generate a comment with the following specifications:
1. Tone: ${TONE_TEMPLATES[tone].trim()}
2. Length: ${LENGTH_TEMPLATES[length]}
`;

  if (customInstruction && customInstruction.trim().length > 0) {
    userPrompt += `\n3. Additional Custom Instructions:
- ${customInstruction.trim()}
`;
  }

  userPrompt += `\nGenerate ONLY the comment text. Do not wrap it in quotes, and do not add any meta-text, introductions, or explanations.`;

  return { systemPrompt, userPrompt };
}
