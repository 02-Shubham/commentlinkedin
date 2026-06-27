export type AIProviderName = 'gemini' | 'openai' | 'groq' | 'openrouter';

export type CommentTone =
  | 'professional'
  | 'friendly'
  | 'straight'
  | 'technical'
  | 'thought-leader'
  | 'curious'
  | 'supportive'
  | 'founder'
  | 'recruiter'
  | 'student'
  | 'contrarian'
  | 'inspirational';

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
  tone: CommentTone;
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
  defaultTone: CommentTone;
  defaultLength: CommentLength;
  theme: 'light' | 'dark' | 'system';
  temperature: number;
  maxTokens: number;
}

export interface GenerateRequest {
  provider: AIProviderName;
  apiKey: string;
  model: string;
  postData: ExtractedPostData;
  tone: CommentTone;
  length: CommentLength;
  customInstruction?: string;
  temperature: number;
  maxTokens: number;
}
