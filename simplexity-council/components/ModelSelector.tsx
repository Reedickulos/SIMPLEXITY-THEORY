import React, { useState, useMemo, useEffect } from 'react'
import { Search, X, Check, Zap, DollarSign, Filter, Plus, Key } from 'lucide-react'
import type { ModelMetadata } from '../types/models'
import { Participant } from '../types'
import { ALIGNMENT_SYSTEM_PROMPT, DEEP_EMERGENCE_PROTOCOL } from '../hooks/constants'

// Define curated OpenRouter seed models (all deliberation routes strictly through OpenRouter)
const OPENROUTER_CURATED_SEEDS: ModelMetadata[] = [
    {
        id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
        name: 'Nemotron 3 Ultra 550B (Altair Seed)',
        provider: 'nvidia',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 131072,
        isFree: true,
        capabilities: ['text'],
        description: 'Analytical baseline seed for Seat 1 (Altair) via OpenRouter.'
    },
    {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku (Deneb Seed)',
        provider: 'anthropic',
        pricing: { prompt: 0.25, completion: 1.25 },
        contextLength: 200000,
        isFree: false,
        capabilities: ['text'],
        description: 'Methodological & structural critique seed for Seat 2 (Deneb) via OpenRouter.'
    },
    {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        pricing: { prompt: 0.8, completion: 4.0 },
        contextLength: 200000,
        isFree: false,
        capabilities: ['text'],
        description: 'Fast structural critique model via OpenRouter.'
    },
    {
        id: 'qwen/qwen3.5-flash-02-23',
        name: 'Qwen 3.5 Flash (Izar Seed)',
        provider: 'qwen',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 131072,
        isFree: true,
        capabilities: ['text'],
        description: 'Mathematical and formal logic seed for Seat 3 (Izar) via OpenRouter.'
    },
    {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1 Free (Merak Seed)',
        provider: 'deepseek',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 128000,
        isFree: true,
        capabilities: ['text'],
        description: 'Generative inversion and counter-modeling seed for Seat 4 (Merak) via OpenRouter.'
    },
    {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek V3',
        provider: 'deepseek',
        pricing: { prompt: 0.14, completion: 0.28 },
        contextLength: 128000,
        isFree: false,
        capabilities: ['text'],
        description: 'DeepSeek production model routed via OpenRouter.'
    },
    {
        id: 'google/gemini-2.5-flash',
        name: 'Gemini 2.5 Flash (OpenRouter Route)',
        provider: 'google',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 1048576,
        isFree: true,
        capabilities: ['text'],
        description: 'Google Gemini 2.5 Flash routed through OpenRouter catalog.'
    },
    {
        id: 'google/gemini-2.5-pro',
        name: 'Gemini 2.5 Pro (OpenRouter Route)',
        provider: 'google',
        pricing: { prompt: 1.25, completion: 5.0 },
        contextLength: 1048576,
        isFree: false,
        capabilities: ['text'],
        description: 'Google Gemini 2.5 Pro routed through OpenRouter catalog.'
    },
    {
        id: 'openai/o3-mini',
        name: 'OpenAI o3-mini (OpenRouter Route)',
        provider: 'openai',
        pricing: { prompt: 1.1, completion: 4.4 },
        contextLength: 200000,
        isFree: false,
        capabilities: ['text'],
        description: 'OpenAI o3-mini reasoning model routed through OpenRouter catalog.'
    },
    {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B Instruct (Free)',
        provider: 'meta-llama',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 131072,
        isFree: true,
        capabilities: ['text'],
        description: 'Meta open weights 70B model via OpenRouter.'
    }
];

interface ModelSelectorProps {
    models: ModelMetadata[]
    onClose: () => void
    activeParticipants: Participant[]
    onSelectModelForParticipant: (participantId: string, model: ModelMetadata) => void
    onUpdateSystemPrompt: (id: string, text: string) => void
    continuationPrompt: string
    onUpdateContinuationPrompt: (text: string) => void
}

const API_KEY_STORAGE_KEY = 'openrouter_api_key'

const ModelSelector: React.FC<ModelSelectorProps> = ({
    models,
    onClose,
    activeParticipants,
    onSelectModelForParticipant,
    onUpdateSystemPrompt,
    continuationPrompt,
    onUpdateContinuationPrompt,
}) => {
    // Merge the curated OpenRouter seed models with all dynamically loaded OpenRouter models (strictly deduplicated by ID)
    const allAvailableModels = useMemo(() => {
        const seenIds = new Set<string>();
        const uniqueModels: ModelMetadata[] = [];

        // Add curated seeds first
        for (const seed of OPENROUTER_CURATED_SEEDS) {
            if (seed.id && !seenIds.has(seed.id)) {
                seenIds.add(seed.id);
                uniqueModels.push(seed);
            }
        }

        // Add dynamic models that are not already present
        for (const m of models) {
            if (m.id && !seenIds.has(m.id)) {
                seenIds.add(m.id);
                uniqueModels.push(m);
            }
        }

        return uniqueModels;
    }, [models]);

    const [activeSlotId, setActiveSlotId] = useState<string>(activeParticipants[0]?.id || '')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid' | 'prompts'>('all')
    const [selectedProvider, setSelectedProvider] = useState<string>('all')
    const [sortByPrice, setSortByPrice] = useState<'none' | 'asc' | 'desc'>('none')
    const [apiKey, setApiKey] = useState('')
    
    useEffect(() => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
        if (storedKey) setApiKey(storedKey)
    }, [])

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim()
        setApiKey(value)
        if (value) {
            localStorage.setItem(API_KEY_STORAGE_KEY, value)
        } else {
            localStorage.removeItem(API_KEY_STORAGE_KEY)
        }
        window.dispatchEvent(new Event('storage'))
    }

    // Get unique providers
    const providers = useMemo(() => {
        const providerSet = new Set(allAvailableModels.map(m => m.provider))
        return ['all', ...Array.from(providerSet).sort()]
    }, [allAvailableModels])

    // Filter models
    const filteredModels = useMemo(() => {
        let result = allAvailableModels.filter(model => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.provider.toLowerCase().includes(searchQuery.toLowerCase())

            // Tab filter: 'all' shows all models, 'free' shows free, 'paid' shows paid
            const matchesTab = activeTab === 'all' ? true : (activeTab === 'free' ? model.isFree : !model.isFree)

            // Provider filter
            const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider

            return matchesSearch && matchesTab && matchesProvider
        })

        if (activeTab === 'paid' && sortByPrice !== 'none') {
            result.sort((a, b) => {
                const costA = (a.pricing?.prompt || 0) + (a.pricing?.completion || 0)
                const costB = (b.pricing?.prompt || 0) + (b.pricing?.completion || 0)
                return sortByPrice === 'asc' ? costA - costB : costB - costA
            })
        }

        return result
    }, [allAvailableModels, searchQuery, activeTab, selectedProvider, sortByPrice])

    const isSelected = (modelId: string) => {
        const activeParticipant = activeParticipants.find(p => p.id === activeSlotId)
        return activeParticipant?.modelId === modelId
    }

    const handleSelectModel = (model: ModelMetadata) => {
        onSelectModelForParticipant(activeSlotId, model)
    }

    const activeParticipant = activeParticipants.find(p => p.id === activeSlotId)

    return (
        <div id="model-selector-container" className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-300 font-sans overflow-hidden">
            <div className="bg-[#0b0c10] border-0 sm:border border-white/10 rounded-none sm:rounded-[32px] w-full max-w-4xl h-[100dvh] sm:h-[88vh] max-h-[100dvh] sm:max-h-[88vh] flex flex-col shadow-[0_0_80px_rgba(255,100,0,0.15)] overflow-hidden relative">
                {/* Atmospheric glow inside modal */}
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{
                   background: 'radial-gradient(circle at 50% 10%, #ff4e00 0%, transparent 60%)',
                   filter: 'blur(100px)'
                }}></div>

                {/* Compact Header */}
                <div className="p-3 sm:p-4 md:p-5 border-b border-white/10 relative z-10 bg-black/50 shrink-0 space-y-2 sm:space-y-2.5">
                    {/* Title & Close */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-lg font-serif font-light text-white tracking-wider uppercase truncate">
                                Council Interchange Config
                            </h2>
                            <p className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase truncate hidden sm:block">
                                Assign sovereign models to council seats independently
                            </p>
                        </div>
                        <button
                            id="close-model-selector-btn"
                            onClick={onClose}
                            className="p-1.5 sm:p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10 border border-transparent hover:border-white/10 shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Seat Selector (Compact Single Row on all screens) */}
                    <div>
                        <div className="text-[8px] sm:text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1 font-mono">
                            Configure Seat:
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                            {activeParticipants.map((p, idx) => {
                                const isActive = activeSlotId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setActiveSlotId(p.id)}
                                        className={`p-1.5 sm:p-2 rounded-xl border text-left transition-all relative ${
                                            isActive
                                                ? 'bg-orange-500/20 border-orange-500/60 shadow-[0_0_12px_rgba(255,78,0,0.2)]'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-[8px] uppercase tracking-wider text-orange-400 font-mono font-bold truncate">
                                                Seat {idx + 1}
                                            </span>
                                            {isActive && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0 animate-pulse" />}
                                        </div>
                                        <div className="font-serif text-[11px] sm:text-xs text-white truncate font-light mt-0.5">
                                            {p.name}
                                        </div>
                                        <div className="text-[8px] font-mono text-white/40 truncate hidden sm:block mt-0.5">
                                            {p.modelId ? p.modelId.split('/').pop()?.replace(':free', '') : 'Direct'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Compact API Key Input Row */}
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 sm:py-2">
                        <Key size={13} className="text-orange-400 shrink-0" />
                        <input
                            type="password"
                            value={apiKey}
                            onChange={handleKeyChange}
                            placeholder="OpenRouter API Key (sk-or-...)"
                            className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/30 focus:outline-none font-mono"
                        />
                        {apiKey ? (
                            <span className="text-[8px] sm:text-[9px] text-[#00ff88] uppercase font-mono font-bold shrink-0">Key Active</span>
                        ) : (
                            <span className="text-[8px] sm:text-[9px] text-orange-400 uppercase font-mono font-bold shrink-0">Key Needed</span>
                        )}
                    </div>

                    {/* Navigation Tabs (All Models, Free, Paid, Prompts) */}
                    <div className="flex gap-1 sm:gap-1.5 bg-black/50 p-1 rounded-xl border border-white/5">
                        <button 
                            type="button"
                            className={`flex-1 py-1 sm:py-1.5 text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-orange-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Models ({allAvailableModels.length})
                        </button>
                        <button 
                            type="button"
                            className={`flex-1 py-1 sm:py-1.5 text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold rounded-lg transition-all ${activeTab === 'free' ? 'bg-orange-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                            onClick={() => setActiveTab('free')}
                        >
                            Free ({allAvailableModels.filter(m => m.isFree).length})
                        </button>
                        <button 
                            type="button"
                            className={`flex-1 py-1 sm:py-1.5 text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold rounded-lg transition-all ${activeTab === 'paid' ? 'bg-orange-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                            onClick={() => setActiveTab('paid')}
                        >
                            Paid
                        </button>
                        <button 
                            type="button"
                            className={`flex-1 py-1 sm:py-1.5 text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold rounded-lg transition-all ${activeTab === 'prompts' ? 'bg-orange-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                            onClick={() => setActiveTab('prompts')}
                        >
                            Prompts
                        </button>
                    </div>

                    {/* Search & Provider Filter (Single Row) */}
                    {activeTab !== 'prompts' && (
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search models..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-black/30 border border-white/10 rounded-xl text-[10px] sm:text-[11px] text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none uppercase tracking-wider font-mono"
                                />
                            </div>

                            <select
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white/70 focus:outline-none cursor-pointer shrink-0"
                            >
                                {providers.map(provider => (
                                    <option key={provider} value={provider} className="bg-[#111318] text-white">
                                        {provider === 'all' ? 'All Providers' : provider}
                                    </option>
                                ))}
                            </select>

                            {activeTab === 'paid' && (
                                <select
                                    value={sortByPrice}
                                    onChange={(e) => setSortByPrice(e.target.value as any)}
                                    className="px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white/70 focus:outline-none cursor-pointer shrink-0"
                                >
                                    <option value="none" className="bg-[#111318] text-white">Sort</option>
                                    <option value="asc" className="bg-[#111318] text-white">$ Low</option>
                                    <option value="desc" className="bg-[#111318] text-white">$ High</option>
                                </select>
                            )}

                            <span className="text-[9px] font-mono text-white/40 shrink-0 hidden md:inline">
                                {filteredModels.length} shown
                            </span>
                        </div>
                    )}
                </div>

                {/* Scrollable Model List & Prompts Container */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-3 relative z-10 custom-scrollbar bg-[#0c0d12]">
                    {activeTab === 'prompts' ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                <h4 className="text-xs font-semibold text-orange-400 tracking-wider uppercase mb-1">
                                    Prompt Injection Override (System Prompts)
                                </h4>
                                <p className="text-[10px] text-white/60 leading-relaxed font-light">
                                    Each agent's perspective, behavioral alignment, and pattern discovery objectives can be customized here. Settings are active immediately in the ongoing session.
                                </p>
                            </div>

                            {/* Autonomous Continuation Prompt Block */}
                            <div className="p-5 bg-white/5 border border-[#00f3ff]/20 rounded-[20px] space-y-3 shadow-[0_0_15px_rgba(0,243,255,0.02)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-serif text-base font-light text-[#00f3ff] tracking-wide uppercase">
                                            Autonomous Continuation Directive
                                        </h3>
                                        <p className="text-[9px] text-[#00f3ff]/50 uppercase tracking-widest mt-0.5 font-mono">
                                            Instruction used to prompt the next speaking agent in the discussion loop
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onUpdateContinuationPrompt("Analyze the previous statement from your architectural perspective.")}
                                        className="px-3 py-1.5 rounded-lg border border-[#00f3ff]/20 text-[9px] uppercase font-mono tracking-wider font-semibold text-[#00f3ff]/60 hover:text-[#00f3ff] hover:bg-[#00f3ff]/5 transition-all shrink-0"
                                    >
                                        Reset Default
                                    </button>
                                </div>

                                <textarea
                                    value={continuationPrompt}
                                    onChange={(e) => onUpdateContinuationPrompt(e.target.value)}
                                    rows={3}
                                    className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-white placeholder:text-white/35 focus:border-[#00f3ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00f3ff]/50 font-mono leading-relaxed"
                                    placeholder="Enter directive to trigger the next agent..."
                                />
                            </div>

                            {activeParticipants.map(participant => {
                                const isSelectedSeat = participant.id === activeSlotId;
                                return (
                                    <div 
                                        key={participant.id} 
                                        className={`p-5 rounded-[20px] space-y-3 transition-all duration-300 border ${
                                            isSelectedSeat
                                                ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(255,78,0,0.08)]'
                                                : 'bg-white/5 border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className={`font-serif text-base font-light ${participant.color || 'text-white'} tracking-wide`}>
                                                            {participant.name}
                                                        </h3>
                                                        {isSelectedSeat && (
                                                            <span className="text-[8px] text-orange-400 font-bold uppercase tracking-widest bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">
                                                                Configuring Seat
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5 font-mono">
                                                        {participant.role} — {participant.modelId || 'Direct'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdateSystemPrompt(participant.id, DEEP_EMERGENCE_PROTOCOL)}
                                                    className="px-2.5 py-1.5 rounded-lg border border-cyan-500/25 text-[9px] uppercase font-mono tracking-wider font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all shrink-0"
                                                    title="Apply Deep Emergence Protocol v2"
                                                >
                                                    Protocol v2
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdateSystemPrompt(participant.id, ALIGNMENT_SYSTEM_PROMPT)}
                                                    className="px-2.5 py-1.5 rounded-lg border border-white/10 text-[9px] uppercase font-mono tracking-wider font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all shrink-0"
                                                >
                                                    Reset Default
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            value={participant.systemPrompt || ''}
                                            onChange={(e) => onUpdateSystemPrompt(participant.id, e.target.value)}
                                            rows={4}
                                            className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-white placeholder:text-white/35 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-mono leading-relaxed"
                                            placeholder="Enter custom prompt instructions for this agent..."
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : filteredModels.length === 0 ? (
                        <div className="text-center py-16 text-white/30">
                            <Filter size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="text-xs tracking-widest uppercase font-mono">No models matching search filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                            {filteredModels.map((model, idx) => {
                                const selected = isSelected(model.id)
                                return (
                                    <button
                                        key={`${model.id}-${idx}`}
                                        type="button"
                                        onClick={() => handleSelectModel(model)}
                                        className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 relative ${selected
                                            ? 'bg-orange-500/15 border-orange-500/50 shadow-[0_2px_15px_rgba(255,78,0,0.12)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2.5 sm:gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                                                    <h3 className="font-serif text-xs sm:text-sm font-light text-white truncate tracking-wide">{model.name}</h3>
                                                    {model.isFree ? (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[8px] font-bold uppercase tracking-widest shrink-0 border border-green-500/20">
                                                            <Zap size={7} />
                                                            Free
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-400/20 text-orange-400 rounded-full text-[8px] font-bold uppercase tracking-widest shrink-0 border border-orange-400/20">
                                                            <DollarSign size={7} />
                                                            Paid
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[8px] sm:text-[9px] text-white/40 mb-2 truncate font-mono tracking-wider">{model.id}</p>
                                                
                                                <div className="p-2 sm:p-2.5 bg-black/40 rounded-lg sm:rounded-xl border border-white/5 mb-2">
                                                    <p className="text-[10px] sm:text-[11px] text-white/60 line-clamp-2 leading-normal font-light">
                                                        {model.description || 'Sovereign language model available for council deliberation.'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                                        <span className="text-[8px] sm:text-[9px] font-mono text-white/60 tracking-wider">
                                                            <span className="text-white/30 mr-1 uppercase">Ctx:</span> 
                                                            {model.contextLength >= 1000000 
                                                                ? `${(model.contextLength / 1000000).toFixed(1)}M` 
                                                                : `${(model.contextLength / 1000).toFixed(0)}K`}
                                                        </span>
                                                        {!model.isFree && (
                                                            <span className="text-[8px] sm:text-[9px] font-mono text-orange-300/80 tracking-wider">
                                                                <span className="text-white/30 mr-1 uppercase">1M IN:</span> 
                                                                ${(model.pricing.prompt * 1000000).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-[8px] font-bold tracking-widest uppercase text-white/30 font-mono">
                                                    PROVIDER // {model.provider}
                                                </div>
                                            </div>
                                            
                                            <div className="shrink-0 flex items-center justify-center pt-0.5">
                                                {selected ? (
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(255,78,0,0.5)]">
                                                        <Check size={12} className="text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/20 flex items-center justify-center bg-black/30">
                                                        <Plus size={12} className="text-white/45" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Compact Responsive Footer */}
                <div className="px-3 py-2.5 sm:px-6 sm:py-3.5 border-t border-white/10 bg-black/90 relative z-10 backdrop-blur-xl flex flex-row items-center justify-between shrink-0 gap-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
                    <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-widest truncate min-w-0 pr-2">
                        Seat: <span className="text-orange-400 font-bold font-mono">{(activeParticipants.find(p => p.id === activeSlotId)?.name) || 'None'}</span>
                    </div>
                    <button
                        id="confirm-model-selector-btn"
                        onClick={onClose}
                        className="px-5 sm:px-8 py-2 sm:py-2.5 bg-white text-black rounded-full font-bold tracking-widest uppercase text-[10px] sm:text-[11px] hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.15)] min-h-[38px] sm:min-h-[44px] flex items-center justify-center cursor-pointer shrink-0"
                    >
                        CONFIRM SETUP
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModelSelector;
