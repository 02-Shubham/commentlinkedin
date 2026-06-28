import { AIProviderName, ExtractedPostData, CommentLength } from '../types';
import { buildPrompt } from '../prompts';

export interface GenerationParams {
  apiKey: string;
  model: string;
  postData: ExtractedPostData;
  length: CommentLength;
  customInstruction?: string;
  temperature: number;
  maxTokens: number;
}

export interface ProviderInfo {
  name: string;
  defaultModel: string;
  models: { label: string; value: string }[];
  placeholderKey: string;
  testUrl: string;
}

export const PROVIDERS_INFO: Record<AIProviderName, ProviderInfo> = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: [
      { label: 'Gemini 1.5 Flash (Recommended)', value: 'gemini-1.5-flash' },
      { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
    ],
    placeholderKey: 'AIzaSy...',
    testUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: [
      { label: 'GPT-4o mini (Recommended)', value: 'gpt-4o-mini' },
      { label: 'GPT-4o', value: 'gpt-4o' },
    ],
    placeholderKey: 'sk-proj-...',
    testUrl: 'https://api.openai.com/v1/models',
  },
  groq: {
    name: 'Groq',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { label: 'Llama 3.3 70B (Recommended)', value: 'llama-3.3-70b-versatile' },
      { label: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' },
      { label: 'Mixtral 8x7b Instruct', value: 'mixtral-8x7b-32768' },
    ],
    placeholderKey: 'gsk_...',
    testUrl: 'https://api.groq.com/openai/v1/models',
  },
  openrouter: {
    name: 'OpenRouter',
    defaultModel: 'meta-llama/llama-3-8b-instruct:free',
    models: [
      { label: 'Llama 3 8B Free', value: 'meta-llama/llama-3-8b-instruct:free' },
      { label: 'Gemini Flash 1.5', value: 'google/gemini-flash-1.5' },
      { label: 'GPT-4o mini', value: 'openai/gpt-4o-mini' },
    ],
    placeholderKey: 'sk-or-...',
    testUrl: 'https://openrouter.ai/api/v1/models',
  }
};

export async function testProviderConnection(provider: AIProviderName, apiKey: string, model: string): Promise<boolean> {
  if (!apiKey) return false;
  
  try {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`;
      const res = await fetch(url);
      return res.ok;
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    } else if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    } else if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    }
    return false;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

export async function generateComment(
  provider: AIProviderName,
  params: GenerationParams
): Promise<string> {
  const { systemPrompt, userPrompt } = buildPrompt(
    params.postData,
    params.length,
    params.customInstruction
  );

  switch (provider) {
    case 'gemini':
      return callGemini(params.apiKey, params.model, systemPrompt, userPrompt, params.temperature, params.maxTokens);
    case 'openai':
      return callOpenAI(params.apiKey, params.model, systemPrompt, userPrompt, params.temperature, params.maxTokens);
    case 'groq':
      return callGroq(params.apiKey, params.model, systemPrompt, userPrompt, params.temperature, params.maxTokens);
    case 'openrouter':
      return callOpenRouter(params.apiKey, params.model, systemPrompt, userPrompt, params.temperature, params.maxTokens);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini API returned an empty response.');
  return text.trim();
}

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI API returned an empty response.');
  return text.trim();
}

async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq API returned an empty response.');
  return text.trim();
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/google-deepmind/antigravity',
      'X-Title': 'LinkedIn AI Comment Assistant',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter API returned an empty response.');
  return text.trim();
}
