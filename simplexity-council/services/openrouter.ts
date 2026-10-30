import { ModelMetadata } from '../types/models';

interface OpenRouterModelResponse {
  data: {
    id: string;
    name: string;
    pricing: {
      prompt: string;
      completion: string;
    };
    context_length: number;
    description?: string;
    alias_target?: {
      slug?: string;
    };
  }[];
}

let modelCache: ModelMetadata[] | null = null;

export const STATIC_FALLBACK_MODELS: ModelMetadata[] = [
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'NVIDIA: Nemotron 3 Ultra (Free)',
    provider: 'nvidia',
    pricing: { prompt: 0, completion: 0 },
    contextLength: 131072,
    isFree: true,
    capabilities: ['text'],
    description: 'High-reasoning free model by NVIDIA'
  },
  {
    id: 'qwen/qwen3.7-flash',
    name: 'Qwen 3.7 Flash (Free)',
    provider: 'qwen',
    pricing: { prompt: 0, completion: 0 },
    contextLength: 131072,
    isFree: true,
    capabilities: ['text'],
    description: 'Fast versatile language model from Qwen'
  },
  {
    id: 'qwen/qwen3.5-flash-02-23',
    name: 'Qwen 3.5 Flash',
    provider: 'qwen',
    pricing: { prompt: 0, completion: 0 },
    contextLength: 131072,
    isFree: true,
    capabilities: ['text'],
    description: 'Fast Qwen flash model'
  },
  {
    id: 'deepseek/deepseek-v4-flash-latest',
    name: 'DeepSeek V4 Flash Latest',
    provider: 'deepseek',
    pricing: { prompt: 0.14, completion: 0.28 },
    contextLength: 128000,
    isFree: false,
    capabilities: ['text'],
    description: 'High performance reasoning model from DeepSeek'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'deepseek',
    pricing: { prompt: 0, completion: 0 },
    contextLength: 128000,
    isFree: true,
    capabilities: ['text'],
    description: 'DeepSeek open-weights reasoning model'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    provider: 'meta-llama',
    pricing: { prompt: 0, completion: 0 },
    contextLength: 131072,
    isFree: true,
    capabilities: ['text'],
    description: 'Meta open source 70B model'
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    pricing: { prompt: 0.8, completion: 4.0 },
    contextLength: 200000,
    isFree: false,
    capabilities: ['text'],
    description: 'Ultra fast paid model from Anthropic'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    pricing: { prompt: 0.15, completion: 0.6 },
    contextLength: 128000,
    isFree: false,
    capabilities: ['text'],
    description: 'Fast lightweight model from OpenAI'
  },
  {
    id: 'nousresearch/hermes-3-llama-3.1-405b:free',
    name: 'Hermes 3 (Llama 3.1 405B Free)',
    provider: 'nousresearch',
    pricing: { prompt: 0, completion: 0 },
    contextLength: 131072,
    isFree: true,
    capabilities: ['text'],
    description: 'Nous Research flag-ship free model'
  }
];

export async function getModelsWithCache(apiKey?: string): Promise<ModelMetadata[]> {
  if (modelCache && modelCache.length > 0) return modelCache;

  const currentApiKey = 
    apiKey || 
    (typeof window !== 'undefined' ? localStorage.getItem('openrouter_api_key') : null) || 
    (typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY : null) || 
    '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (currentApiKey && currentApiKey.trim() !== '') {
      headers["Authorization"] = `Bearer ${currentApiKey.trim()}`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      signal: controller.signal,
      headers
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: OpenRouterModelResponse = await response.json();

    if (!data || !Array.isArray(data.data)) {
      throw new Error("Invalid response format");
    }

    const seenIds = new Set<string>();
    const models: ModelMetadata[] = [];
    for (const m of data.data) {
      const promptPrice = parseFloat(m.pricing?.prompt || '0');
      const completionPrice = parseFloat(m.pricing?.completion || '0');
      const isFree = (promptPrice === 0 && completionPrice === 0) || (m.id && m.id.includes(':free'));
      const rawId = m.alias_target?.slug || (m.id && m.id.startsWith('~') ? m.id.slice(1) : m.id);
      const validId = rawId ? rawId.trim() : '';
      
      if (!validId || seenIds.has(validId)) continue;
      seenIds.add(validId);

      const provider = validId.split('/')[0] || 'unknown';

      models.push({
        id: validId,
        name: m.name || validId,
        provider: provider,
        pricing: { prompt: promptPrice, completion: completionPrice },
        contextLength: m.context_length || 128000,
        isFree: isFree,
        capabilities: ['text'],
        description: m.description
      });
    }

    if (models.length > 0) {
      modelCache = models;
      return models;
    }
    modelCache = STATIC_FALLBACK_MODELS;
    return STATIC_FALLBACK_MODELS;
  } catch (error) {
    console.warn("OpenRouter API models endpoint unavailable, using static models fallback.");
    modelCache = STATIC_FALLBACK_MODELS;
    return STATIC_FALLBACK_MODELS;
  }

  console.warn("OpenRouter API models endpoint unavailable, using static models fallback.");
  modelCache = STATIC_FALLBACK_MODELS;
  return STATIC_FALLBACK_MODELS;
}

export async function getDefaultModel(apiKey?: string): Promise<ModelMetadata> {
  return STATIC_FALLBACK_MODELS[0];
}

export async function getModelById(id: string, apiKey?: string): Promise<ModelMetadata | undefined> {
  const models = await getModelsWithCache(apiKey);
  return models.find(m => m.id === id) || STATIC_FALLBACK_MODELS.find(m => m.id === id);
}
