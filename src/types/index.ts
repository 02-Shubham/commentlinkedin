export type AIProviderName = 'gemini' | 'openai' | 'groq' | 'openrouter';

export type CommentLength = 'short' | 'medium' | 'long';

export interface ExtractedPostData {
  author?: string;
  postText: string;
  hashtags: string[];
  mediaDescription?: string;
  postUrl?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  postAuthor?: string;
  postText: string;
  generatedComment: string;
  length: CommentLength;
  provider: AIProviderName;
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
}

export interface AppSettings {
  selectedProvider: AIProviderName;
  providers: Record<AIProviderName, ProviderConfig>;
  defaultLength: CommentLength;
  theme: 'light' | 'dark' | 'system';
  temperature: number;
  maxTokens: number;
  savedPosition?: { top: number; left: number };
}

export interface GenerateRequest {
  provider: AIProviderName;
  apiKey: string;
  model: string;
  postData: ExtractedPostData;
  length: CommentLength;
  customInstruction?: string;
  temperature: number;
  maxTokens: number;
}
