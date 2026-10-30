import { useState, useEffect } from 'react'
import type { ModelMetadata } from '../types/models'
import { getDefaultModel, getModelsWithCache, getModelById } from '../services/openrouter'

const SELECTED_MODELS_KEY = 'selected_model_ids' 
const API_KEY_STORAGE_KEY = 'openrouter_api_key'

export function useModelSelection() {
    // We will ensure this array always has at most 1 free and 1 paid model.
    const [selectedModels, setSelectedModels] = useState<ModelMetadata[]>([]) 
    const [availableModels, setAvailableModels] = useState<ModelMetadata[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Get API key from localStorage
    const getApiKey = (): string | undefined => {
        return localStorage.getItem(API_KEY_STORAGE_KEY) || undefined
    }

    // Load models on mount
    useEffect(() => {
        loadModels()
    }, [])

    const loadModels = async () => {
        try {
            setLoading(true)
            setError(null)

            const apiKey = getApiKey()
            const models = await getModelsWithCache(apiKey)
            setAvailableModels(models)

            // Setup default openrouter paid fallback
            const defaultPaidFallback: ModelMetadata = {
                id: 'anthropic/claude-3-haiku',
                name: 'Claude 3 Haiku',
                provider: 'anthropic',
                pricing: { prompt: 0.25, completion: 1.25 },
                contextLength: 200000,
                isFree: false,
                capabilities: ['text'],
                description: 'Fast paid alternative'
            }
            
            // Load previously selected models or default
            const savedModelIds = localStorage.getItem(SELECTED_MODELS_KEY)

            let loadedModels: ModelMetadata[] = []
            if (savedModelIds) {
                try {
                    const ids: string[] = JSON.parse(savedModelIds)
                    for (const id of ids) {
                        let model = await getModelById(id, apiKey)
                        // If model isn't returned correctly but we know the fallback, intercept it:
                        if (!model && id === defaultPaidFallback.id) model = defaultPaidFallback
                        if (model) {
                            loadedModels.push(model)
                        }
                    }
                } catch {
                    // Ignore JSON parsing errors
                }
            }

            // Ensure we have a free model and a paid model
            const hasFree = loadedModels.some(m => m.isFree)
            const hasPaid = loadedModels.some(m => !m.isFree)

            if (!hasFree) {
                const defaultFree = await getDefaultModel(apiKey)
                loadedModels.push(defaultFree)
            }
            if (!hasPaid) {
                // If the user's fetched models includes Claude Haiku, use it
                const foundPaid = models.find(m => m.id === defaultPaidFallback.id)
                loadedModels.push(foundPaid || defaultPaidFallback)
            }

            setSelectedModels(loadedModels)

        } catch (err) {
            console.error('Error loading models:', err)
            setError('Failed to load models. Using fallback.')

            const fallbackFree: ModelMetadata = {
                id: 'meta-llama/llama-3.2-3b-instruct:free',
                name: 'Llama 3.2 3B Instruct (Free)',
                provider: 'meta-llama',
                pricing: { prompt: 0, completion: 0 },
                contextLength: 131072,
                isFree: true,
                capabilities: ['text'],
                description: 'Fallback model',
            }
            const fallbackPaid: ModelMetadata = {
                id: 'anthropic/claude-3-haiku',
                name: 'Claude 3 Haiku',
                provider: 'anthropic',
                pricing: { prompt: 0.25, completion: 1.25 },
                contextLength: 200000,
                isFree: false,
                capabilities: ['text'],
                description: 'Fallback paid model',
            }
            setSelectedModels([fallbackFree, fallbackPaid])
            setAvailableModels([fallbackFree, fallbackPaid])
        } finally {
            setLoading(false)
        }
    }

    const selectModel = (modelId: string) => {
        const model = availableModels.find(m => m.id === modelId)
        if (model) {
            setSelectedModels(prev => {
                // Replace the model of the same tier (free or paid)
                const newModels = prev.filter(m => m.isFree !== model.isFree)
                newModels.push(model)
                localStorage.setItem(SELECTED_MODELS_KEY, JSON.stringify(newModels.map(m => m.id)))
                return newModels
            })
        }
    }

    const removeModel = (modelId: string) => {
        // Instead of removing completely, let's keep it robust for this UI and just ignore removing.
        // It's a radio-style selection per tier anyway.
    }

    const refreshModels = async () => {
        await loadModels()
    }

    return {
        selectedModels,
        availableModels,
        loading,
        error,
        selectModel,
        removeModel,
        refreshModels,
    }
}