import { CommentLength, ExtractedPostData } from '../types';

export const LENGTH_TEMPLATES: Record<CommentLength, string> = {
  short: "Keep the comment extremely concise (1 to 2 sentences max). Under 40 words.",
  medium: "Write a standard comment (3 to 4 sentences). Around 60 to 90 words.",
  long: "Write a detailed comment (2 to 3 short paragraphs). Around 120 to 180 words, analyzing the topic in depth."
};

export function buildPrompt(
  postData: ExtractedPostData,
  length: CommentLength,
  customInstruction?: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a professional LinkedIn Comment Assistant. Your sole job is to help users write high-quality, engaging, and authentic LinkedIn comments based on posts they read.
  
CRITICAL INSTRUCTIONS FOR TONE:
- Analyze the style, topic, and sentiment of the LinkedIn post. 
- Write the comment in a tone that is most natural and contextually appropriate for this specific post (e.g. professional and encouraging for achievements, analytical and technical for engineering/data posts, strategic and high-level for industry updates).
- Sound like a real human. Never use generic, robotic, or overly enthusiastic phrases. Avoid standard AI buzzwords like "delve", "testament", "moreover", "furthermore", "beacon", "catalyst".

CRITICAL RULE:
- NEVER output placeholders, template variables, or instructions like "[Insert Name]" or "[Your Company]". 
- The generated comment must be immediately ready to be posted without editing.
- Do NOT output hashtags unless the user explicitly requested them in the custom instructions.

Formatting:
- Do not use markdown (like bolding with ** or headings) because LinkedIn comments do not render markdown. Use clean plain text with standard spacing and paragraphs.`;

  let userPrompt = `Here is the LinkedIn post information:
${postData.author ? `Post Author: ${postData.author}\n` : ''}
Post Content:
"""
${postData.postText}
"""
${postData.mediaDescription ? `Visual Media Description: ${postData.mediaDescription}\n` : ''}
${postData.hashtags.length > 0 ? `Post Hashtags: ${postData.hashtags.join(', ')}\n` : ''}
${postData.hasImages ? `Post contains ${postData.imageCount} image(s).\n` : ''}

Generate a comment with the following specifications:
1. Length: ${LENGTH_TEMPLATES[length]}
`;

  const isSparse = (!postData.postText || postData.postText.trim().length < 20);
  if (isSparse) {
    userPrompt += `
CRITICAL INSTRUCTION FOR SPARSE/NO TEXT POSTS:
- The post has very little or no commentary/text. 
- If a "Visual Media Description" is provided above, comment constructively on the shared visual content or theme.
- If there is no visual description, write a friendly, professional, and positive comment appropriate for a LinkedIn post (e.g. praising their share, expressing positive interest, or congratulating them if the author/context suggests an achievement or update).
- Under no circumstances should you say "No content to comment on." or state that you cannot generate a comment. Write a real, encouraging, and engaging comment.
`;
  }

  if (customInstruction && customInstruction.trim().length > 0) {
    userPrompt += `\n2. Additional Custom Instructions (override tone or topic if requested here):
- ${customInstruction.trim()}
`;
  }

  userPrompt += `\nGenerate ONLY the comment text. Do not wrap it in quotes, and do not add any meta-text, introductions, or explanations.`;

  return { systemPrompt, userPrompt };
}
