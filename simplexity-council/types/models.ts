export interface ModelPricing {
  prompt: number;
  completion: number;
}

export interface ModelMetadata {
  id: string;
  name: string;
  provider: string;
  pricing: ModelPricing;
  contextLength: number;
  isFree: boolean;
  capabilities: string[];
  description?: string;
}