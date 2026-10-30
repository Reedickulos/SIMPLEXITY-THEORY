import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_AGENTS, USER_PARTICIPANT, ALIGNMENT_SYSTEM_PROMPT } from './hooks/constants';
import { CallState, StreamState, Participant, SavedSession, NotebookSource, LedgerBlock } from './types';
import { generateResponseStream } from './services/geminiService';
import { VideoTile } from './components/VideoTile';
import { ControlBar } from './components/ControlBar';
import { ChatSidebar } from './components/ChatSidebar';
import { Sparkles, Command, Settings2, Activity, History, Trash2, Clock, MessageSquare, GitFork, Brain, Download, FileText } from 'lucide-react';
import { useParticipantManager } from './hooks/useParticipantManager';
import { useConversationChain } from './hooks/useConversationChain';
import { storageService } from './services/storageService';
import { useModelSelection } from './hooks/useModelSelection';
import ModelSelector from './components/ModelSelector';
import ExportModal from './components/ExportModal';
import { ChairReflectionModal } from './components/ChairReflectionModal';
import { generateReflectionsMarkdown, downloadMarkdownFile } from './utils/exportReflections';
import { SovereignBridgeModal } from './components/SovereignBridgeModal';
import { sovereignBridge } from './services/sovereignBridgeService';

export const App = () => {
  const [callState, setCallState] = useState<CallState>(CallState.LOBBY);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAutonomous, setIsAutonomous] = useState(true);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showSovereignBridgeModal, setShowSovereignBridgeModal] = useState(false);
  const [isBridgeConnected, setIsBridgeConnected] = useState(sovereignBridge.getIsConnected());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [inversionRoundsRemaining, setInversionRoundsRemaining] = useState<number>(0);
  const inversionRoundsRef = useRef(0);

  useEffect(() => {
    inversionRoundsRef.current = inversionRoundsRemaining;
  }, [inversionRoundsRemaining]);
  
  const [continuationPrompt, setContinuationPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('continuation_prompt_v2');
    return saved || "This is your turn.";
  });

  // Save continuationPrompt when it changes
  useEffect(() => {
    localStorage.setItem('continuation_prompt_v2', continuationPrompt);
  }, [continuationPrompt]);
  
  // Track active Google Search requested by agents needing user approval
  const [pendingSearch, setPendingSearch] = useState<{
    query: string;
    participantId: string;
    blockHash: string;
    status: 'pending' | 'searching' | 'completed' | 'declined';
    results?: string;
    sources?: { title: string; uri: string }[];
  } | null>(null);
  
  // Manage participants in state with persistent config (Gemini, Grok, Claude, ChatGPT, DeepSeek, Kimi)
  const [activeParticipants, setActiveParticipants] = useState<Participant[]>(() => {
    let baseAgents = DEFAULT_AGENTS;
    const saved = localStorage.getItem('active_participants_config_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          baseAgents = parsed;
        } else {
          baseAgents = DEFAULT_AGENTS;
        }
      } catch (e) {
        baseAgents = DEFAULT_AGENTS;
      }
    } else {
      baseAgents = DEFAULT_AGENTS;
    }
    
    return baseAgents;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('active_participants_config_v6', JSON.stringify(activeParticipants));
  }, [activeParticipants]);

  const handleUpdateSystemPrompt = useCallback((id: string, newPrompt: string) => {
    // Save to deep persistence override store
    try {
      const savedPromptsObj = localStorage.getItem('custom_system_prompts_v1');
      const prompts = savedPromptsObj ? JSON.parse(savedPromptsObj) : {};
      prompts[id] = newPrompt;
      localStorage.setItem('custom_system_prompts_v1', JSON.stringify(prompts));
    } catch (e) {
      console.error("Failed to write system prompt override:", e);
    }

    setActiveParticipants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, systemPrompt: newPrompt };
      }
      return p;
    }));
  }, []);

  const handleSelectModelForParticipant = useCallback((participantId: string, model: any) => {
    setActiveParticipants(prev => {
      return prev.map(p => {
        if (p.id === participantId) {
          const provider: Participant['provider'] = model.provider === 'google'
            ? 'google'
            : (model.isFree ? 'openrouter_free' : 'openrouter_paid');

          return {
            ...p,
            name: model.name.split('(')[0].trim(),
            modelId: model.id,
            avatarUrl: `https://picsum.photos/seed/${model.id}/400/400`,
            provider: provider,
            systemPrompt: `You are ${model.name.split('(')[0].trim()}.`
          };
        }
        return p;
      });
    });
  }, []);

  // Custom Hooks
  const { chain, addBlockToChain, loadChain, resetChain } = useConversationChain();
  const chainRef = useRef<LedgerBlock[]>(chain);
  useEffect(() => {
    chainRef.current = chain;
  }, [chain]);

  // Subscribe to Sovereign Extension Bridge events (chunks and completions)
  useEffect(() => {
    const unsubStatus = sovereignBridge.subscribe((connected) => {
      setIsBridgeConnected(connected);
    });

    const unsubChunk = sovereignBridge.onChunk((platformId, text) => {
      setStreamState(prev => ({
        ...prev,
        [platformId]: { isStreaming: true, currentText: text }
      }));
    });

    const unsubComplete = sovereignBridge.onComplete((platformId, finalText) => {
      setStreamState(prev => ({
        ...prev,
        [platformId]: { isStreaming: false, currentText: '' }
      }));
      addBlockToChain(platformId, finalText, 'Verified');
    });

    return () => {
      unsubStatus();
      unsubChunk();
      unsubComplete();
    };
  }, [addBlockToChain]);

  const { participantState, toggleMute, toggleHand, setHandRaised } = useParticipantManager();
  const { selectedModels, availableModels, selectModel, removeModel } = useModelSelection();
  
  // State keys must match participant IDs
  const [streamState, setStreamState] = useState<StreamState>({
    'gemini': { isStreaming: false, currentText: '' },
    'grok': { isStreaming: false, currentText: '' },
    'claude': { isStreaming: false, currentText: '' },
    'chatgpt': { isStreaming: false, currentText: '' },
    'deepseek': { isStreaming: false, currentText: '' },
    'kimi': { isStreaming: false, currentText: '' },
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const isInterruptedRef = useRef(false);
  
  // Track the original topic to prevent context drift in autonomous mode
  const currentTopicRef = useRef<string>('');

  // Session history and global stats
  const [savedSessionsList, setSavedSessionsList] = useState<SavedSession[]>([]);
  const [totalSessionsCount, setTotalSessionsCount] = useState<number>(0);

  // Load saved sessions history and total count on boot
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const traces = await storageService.getAllSessionTraces();
        traces.sort((a, b) => b.timestamp - a.timestamp);
        const history: SavedSession[] = traces.map(t => ({
          id: t.id,
          timestamp: new Date(t.timestamp).toISOString(),
          topic: t.topic,
          chain: t.chain
        }));
        setSavedSessionsList(history.slice(0, 5));
        
        const totalCountStr = localStorage.getItem('council_total_session_count_v1');
        if (totalCountStr) {
          setTotalSessionsCount(parseInt(totalCountStr, 10));
        }
      } catch (e) {
        console.error("Failed to load session history from storageService:", e);
      }
    };
    loadHistory();
  }, []);

  // Save changes whenever chain updates and update history
  useEffect(() => {
    if (chain.length > 0) {
      const firstBlock = chain[0];
      const conversationId = firstBlock.conversationId || 'unknown_session';
      const topic = currentTopicRef.current || 'General Collaboration';

      const updateTrace = async () => {
        try {
          await storageService.saveSessionTrace({
            id: conversationId,
            timestamp: Date.now(),
            topic: topic,
            chain: chain
          });

          // Also save each block payload
          for (const block of chain) {
            await storageService.saveProsePayload({
              id: block.hash,
              content: block.payload
            });
          }

          const traces = await storageService.getAllSessionTraces();
          traces.sort((a, b) => b.timestamp - a.timestamp);
          const history: SavedSession[] = traces.map(t => ({
            id: t.id,
            timestamp: new Date(t.timestamp).toISOString(),
            topic: t.topic,
            chain: t.chain
          }));
          
          setSavedSessionsList(history.slice(0, 5));
        } catch (err) {
          console.error("Failed to update session history in storageService", err);
        }
      };
      
      updateTrace();

      localStorage.setItem('current_session_topic_v1', topic);
      localStorage.setItem('current_session_id_v1', conversationId);
    }
  }, [chain]);

  const handleRestoreSpecificSession = useCallback((session: SavedSession) => {
    if (session && session.chain && session.chain.length > 0) {
      loadChain(session.chain, session.id);
      currentTopicRef.current = session.topic;
      
      localStorage.setItem('current_session_topic_v1', session.topic);
      localStorage.setItem('current_session_id_v1', session.id);

      setCallState(CallState.ACTIVE);
    }
  }, [loadChain]);

  const handleDeleteSessionFromHistory = useCallback((sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any session restore handler on the card click
    const doDelete = async () => {
      try {
        await storageService.deleteSessionTrace(sessionId);
        
        const traces = await storageService.getAllSessionTraces();
        traces.sort((a, b) => b.timestamp - a.timestamp);
        const history: SavedSession[] = traces.map(t => ({
          id: t.id,
          timestamp: new Date(t.timestamp).toISOString(),
          topic: t.topic,
          chain: t.chain
        }));
        setSavedSessionsList(history.slice(0, 5));
           
        const currentId = localStorage.getItem('current_session_id_v1');
        if (currentId === sessionId) {
          localStorage.removeItem('current_session_topic_v1');
          localStorage.removeItem('current_session_id_v1');
        }
      } catch (err) {
        console.error("Failed to delete session from history:", err);
      }
    };
    doDelete();
  }, []);

  const handleStartFreshSession = useCallback(() => {
    resetChain();
    localStorage.removeItem('current_session_topic_v1');
    localStorage.removeItem('current_session_id_v1');
    currentTopicRef.current = '';
    setCallState(CallState.ACTIVE);
  }, [resetChain]);

  // Notebook Sources state (Google NotebookLM functionality)
  const [notebookSources, setNotebookSources] = useState<NotebookSource[]>(() => {
    try {
      const saved = localStorage.getItem('notebook_sources_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse notebook sources", e);
      return [];
    }
  });

  // Save notebook sources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notebook_sources_v1', JSON.stringify(notebookSources));
  }, [notebookSources]);

  const handleAddNotebookSource = useCallback((source: Omit<NotebookSource, 'id' | 'timestamp'>) => {
    const newSource: NotebookSource = {
      ...source,
      id: 'src_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    // If the new source is marked as canonical, unmark previous canonicals to maintain a single canonical baseline
    if (newSource.isCanonical) {
      setNotebookSources(prev => [newSource, ...prev.map(s => ({ ...s, isCanonical: false }))]);
    } else {
      setNotebookSources(prev => [newSource, ...prev]);
    }
  }, []);

  const handleToggleNotebookSource = useCallback((id: string) => {
    setNotebookSources(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  }, []);

  const handleToggleCanonicalSource = useCallback((id: string) => {
    setNotebookSources(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isCanonical: !s.isCanonical, isActive: true };
      }
      // If setting this to canonical, clear canonical flag on others to maintain single source of truth
      return s.isCanonical ? { ...s, isCanonical: false } : s;
    }));
  }, []);

  const handleDeleteNotebookSource = useCallback((id: string) => {
    setNotebookSources(prev => prev.filter(s => s.id !== id));
  }, []);
 
  // TTS Buffers to manage speaking partial sentences
  const ttsBuffers = useRef<{ [key: string]: string }>({});

  // Voice Mode & Speech Recognition (Speech to Text) States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported] = useState(() => {
    return typeof window !== 'undefined' && 
      (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
  });
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeUtterancesCount = useRef(0);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [currentlySpeakingBlockId, setCurrentlySpeakingBlockId] = useState<string | null>(null);

  // Sync ref with audio enabled state so async streaming functions can read live value
  const isAudioEnabledRef = useRef(isAudioEnabled);
  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  // Stable callback ref for speech recognition to call latest handleSendMessage without restarting mic
  const onSpeechMessageRef = useRef<(text: string) => void>(() => {});

  // Speech Recognition Setup
  useEffect(() => {
    if (!isVoiceSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    let finalTranscript = '';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullCurrentText = (finalTranscript + interimTranscript).trim();
      
      if (fullCurrentText) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        
        // Auto-submit after 2.0 seconds of silence to feel like a real conversational turn
        silenceTimeoutRef.current = setTimeout(() => {
          const finishedText = finalTranscript.trim();
          if (finishedText) {
            onSpeechMessageRef.current(finishedText);
            finalTranscript = '';
            rec.stop(); // Temporarily stop to not capture AI audio output
          }
        }, 2000);
      }
    };

    rec.onerror = (event: any) => {
      console.warn("Speech recognition warning:", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsVoiceMode(false);
        setIsListening(false);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      try {
        rec.abort();
      } catch (e) {}
    };
  }, [isVoiceSupported]);

  // Manage continuous mic toggling for Hands-free Voice Mode
  useEffect(() => {
    if (!isVoiceSupported || !recognitionRef.current || !isVoiceMode) {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      return;
    }

    // Only listen if AI is not thinking (deliberation) and not speaking (TTS)
    const shouldListen = !isProcessing && !isSpeechActive;

    if (shouldListen) {
      if (!isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Could not start speech recognition:", e);
        }
      }
    } else {
      if (isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  }, [isVoiceMode, isProcessing, isSpeechActive, isListening, isVoiceSupported]);

  // Models are initialized and edited directly on the activeParticipants state via handleSelectModelForParticipant
 
  // Initialize with welcome message
  useEffect(() => {
    if (callState === CallState.ACTIVE && chain.length === 0) {
      const names = activeParticipants.map(p => p.name).join(', ');
      addBlockToChain('system', `Session Initialized. Active Engines: ${names}.`, 'System')
        .catch(err => console.error("Genesis block failed to initialize:", err));
    }
  }, [callState, chain.length, addBlockToChain, activeParticipants]);

  useEffect(() => {
    // Attempt loading voices early
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  // Sync ref with state
  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  // Stop all audio when audio is disabled
  useEffect(() => {
    if (!isAudioEnabled) {
      window.speechSynthesis.cancel();
      activeUtterancesCount.current = 0;
      setIsSpeechActive(false);
      setCurrentlySpeakingBlockId(null);
    }
  }, [isAudioEnabled]);

  // Track active utterances to prevent Chrome garbage collection bug
  const activeUtterances = useRef<Set<SpeechSynthesisUtterance>>(new Set());

  const getVoiceForParticipant = useCallback((participantId: string, voices: SpeechSynthesisVoice[]) => {
    if (voices.length === 0) return null;

    // Filter to ONLY English voices to prevent the browser from speaking English with non-English synthesis
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const candidates = englishVoices.length > 0 ? englishVoices : voices;

    const isMaleKeyword = (name: string) => {
      const lower = name.toLowerCase();
      return lower.includes('male') || 
             lower.includes('david') || 
             lower.includes('guy') || 
             lower.includes('george') || 
             lower.includes('mark') || 
             lower.includes('james') || 
             lower.includes('ravi') || 
             lower.includes('richard') || 
             lower.includes('george');
    };

    const isFemaleKeyword = (name: string) => {
      const lower = name.toLowerCase();
      return lower.includes('female') || 
             lower.includes('zira') || 
             lower.includes('hazel') || 
             lower.includes('susan') || 
             lower.includes('jessica') || 
             lower.includes('jenny') || 
             lower.includes('kira') || 
             lower.includes('heera') || 
             lower.includes('catherine') || 
             lower.includes('hayley');
    };

    // Separate into male and female English candidates
    const maleVoices = candidates.filter(v => isMaleKeyword(v.name));
    const femaleVoices = candidates.filter(v => isFemaleKeyword(v.name));

    // Define target genders for the nodes to have a clean, balanced conversational mix
    // Node 1: Male, Node 2: Female, Node 3: Male, Node 4: Female
    if (participantId === 'gemini1') {
      const ukMale = maleVoices.find(v => v.lang.toLowerCase().startsWith('en-gb'));
      if (ukMale) return ukMale;
      if (maleVoices.length > 0) return maleVoices[0];
      return candidates[0];
    }
    
    if (participantId === 'gemini2') {
      const usFemale = femaleVoices.find(v => v.lang.toLowerCase().startsWith('en-us'));
      if (usFemale) return usFemale;
      if (femaleVoices.length > 0) return femaleVoices[0];
      return candidates[1 % candidates.length];
    }
    
    if (participantId === 'paid1') {
      const usMale = maleVoices.find(v => v.lang.toLowerCase().startsWith('en-us'));
      if (usMale) return usMale;
      if (maleVoices.length > 1) return maleVoices[1];
      if (maleVoices.length > 0) return maleVoices[0];
      return candidates[2 % candidates.length];
    }
    
    if (participantId === 'free1') {
      const nonUsFemale = femaleVoices.find(v => {
        const lang = v.lang.toLowerCase();
        return lang.startsWith('en-gb') || lang.startsWith('en-au') || lang.startsWith('en-ca');
      });
      if (nonUsFemale) return nonUsFemale;
      if (femaleVoices.length > 1) return femaleVoices[1];
      if (femaleVoices.length > 0) return femaleVoices[0];
      return candidates[3 % candidates.length];
    }

    const hash = participantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return candidates[hash % candidates.length];
  }, []);

  const speakText = useCallback((text: string, participantId: string, blockId?: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    // Clean text of markup, brackets, asterisks, code blocks
    const cleanSpeech = text
      .replace(/\[.*?\]/g, '')
      .replace(/\*.*?\*/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~`>]/g, '')
      .trim();

    if (!cleanSpeech) return;

    // Only cancel ongoing speech when user explicitly triggers a specific block playback
    if (blockId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingBlockId(blockId);
    }

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const voices = window.speechSynthesis.getVoices();
    
    const assignedVoice = getVoiceForParticipant(participantId, voices);
    if (assignedVoice) {
      utterance.voice = assignedVoice;
    }
    
    if (participantId === 'gemini1') {
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
    } else if (participantId === 'gemini2') {
      utterance.rate = 1.15;
      utterance.pitch = 1.05;
    } else if (participantId === 'paid1') {
      utterance.rate = 1.10; 
      utterance.pitch = 1.0;
    } else {
      utterance.rate = 1.08;
      utterance.pitch = 1.02;
    }

    activeUtterancesCount.current += 1;
    setIsSpeechActive(true);

    activeUtterances.current.add(utterance);
    
    const finalizeUtterance = () => {
      activeUtterances.current.delete(utterance);
      activeUtterancesCount.current = Math.max(0, activeUtterancesCount.current - 1);
      if (activeUtterancesCount.current === 0) {
        setIsSpeechActive(false);
        setCurrentlySpeakingBlockId(null);
      }
    };

    utterance.onend = finalizeUtterance;
    utterance.onerror = finalizeUtterance;

    window.speechSynthesis.speak(utterance);
  }, [getVoiceForParticipant]);

  const handlePlayBlockAudio = useCallback((block: LedgerBlock) => {
    if (currentlySpeakingBlockId === block.hash) {
      window.speechSynthesis.cancel();
      activeUtterances.current.clear();
      setCurrentlySpeakingBlockId(null);
      activeUtterancesCount.current = 0;
      setIsSpeechActive(false);
    } else {
      window.speechSynthesis.cancel();
      activeUtterances.current.clear();
      activeUtterancesCount.current = 0;
      setIsAudioEnabled(true);
      speakText(block.payload, block.participantId, block.hash);
    }
  }, [currentlySpeakingBlockId, speakText]);

  const parseVibeAndText = (fullText: string) => {
    const match = fullText.match(/^\[(.*?)\]\s*(.*)/s);
    if (match) {
      return { vibe: match[1], text: match[2] || fullText }; 
    }
    return { vibe: 'Neutral', text: fullText };
  };

  const triggerAiResponse = async (aiParticipant: Participant, triggerText: string, isChairFollowup: boolean = false) => {
      const isMuted = participantState[aiParticipant.id]?.isMuted;
      
      if (isMuted) {
         setHandRaised(aiParticipant.id, true);
         return; 
      }

      isInterruptedRef.current = false;

      setStreamState(prev => ({
        ...prev,
        [aiParticipant.id]: { isStreaming: true, currentText: '' }
      }));

      // Reset TTS buffer for this participant
      ttsBuffers.current[aiParticipant.id] = '';

      let fullRawResponse = '';
      
      try {
        const activeSources = notebookSources.filter(src => src.isActive);
        const participantIndex = activeParticipants.findIndex(p => p.id === aiParticipant.id);
        const includeReminder = activeParticipants.length > 0
          ? (chain.length % activeParticipants.length) === (participantIndex !== -1 ? participantIndex : 0)
          : false;

        const currentInversionRound = inversionRoundsRef.current;
        const isInversion = currentInversionRound > 0;

        await generateResponseStream(
          aiParticipant,
          chainRef.current, 
          triggerText,
          currentTopicRef.current, // Pass the tracked original topic to maintain context
          (chunk) => {
            if (isInterruptedRef.current) {
              throw new Error("USER_INTERRUPTION");
            }
            fullRawResponse += chunk;
            
            // --- TTS LOGIC START ---
            if (isAudioEnabledRef.current) {
               const buffer = (ttsBuffers.current[aiParticipant.id] || '') + chunk;
               // Split by sentence terminators
               const sentenceMatch = buffer.match(/(.*?[.!?])(\s+|$)/s);
               
               if (sentenceMatch && sentenceMatch[1].trim().length > 10) {
                 const sentenceToSpeak = sentenceMatch[1];
                 const remaining = buffer.slice(sentenceMatch[0].length);
                 
                 // Remove internal markup like [Tone] or *actions* for speech
                 const cleanSpeech = sentenceToSpeak.replace(/\[.*?\]/g, '').replace(/\*.*?\*/g, '').trim();
                 if (cleanSpeech) {
                    speakText(cleanSpeech, aiParticipant.id);
                 }
                 
                 ttsBuffers.current[aiParticipant.id] = remaining;
               } else {
                 ttsBuffers.current[aiParticipant.id] = buffer;
               }
            }
            // --- TTS LOGIC END ---
  
            const { text: cleanText } = parseVibeAndText(fullRawResponse);
            setStreamState(prev => ({
              ...prev,
              [aiParticipant.id]: { isStreaming: true, currentText: cleanText }
            }));
          },
          activeSources,
          includeReminder,
          isInversion,
          4 - currentInversionRound
        );
      } catch (error: any) {
        if (error.message === "USER_INTERRUPTION") {
          fullRawResponse += " [Halted by User]";
        } else {
          console.error("AI stream error:", error);
          fullRawResponse = `[Error] Overloaded or offline. Reason: ${error.message}`;
        }
      }

      // Speak any remaining text in buffer if not interrupted
      if (isAudioEnabledRef.current && ttsBuffers.current[aiParticipant.id]?.trim() && !isInterruptedRef.current) {
         const remaining = ttsBuffers.current[aiParticipant.id].replace(/\[.*?\]/g, '').replace(/\*.*?\*/g, '').trim();
         if (remaining) speakText(remaining, aiParticipant.id);
      }
      ttsBuffers.current[aiParticipant.id] = '';

      try {
        let { vibe, text: cleanPayload } = parseVibeAndText(fullRawResponse);
        if (inversionRoundsRef.current > 0 && (!vibe || vibe === 'Neutral')) {
          vibe = 'Inversion Protocol';
        }
        const newBlock = await addBlockToChain(aiParticipant.id, cleanPayload, vibe);

        if (inversionRoundsRef.current > 0) {
          setInversionRoundsRemaining(prev => Math.max(0, prev - 1));
        }

        // Check for Web Search Request commands
        const searchRegex = /\[Request Search:\s*["']?(.*?)["']?\]/i;
        const match = cleanPayload.match(searchRegex);
        if (match && match[1] && !isInterruptedRef.current) {
          const query = match[1].trim();
          setPendingSearch({
            query,
            participantId: aiParticipant.id,
            blockHash: newBlock.hash,
            status: 'pending'
          });
          setIsChatOpen(true);
        }

        // Check for Chair Memory Database Query commands
        const chairMemoryRegex = /\[Request Chair Memory:\s*["']?(.*?)["']?\]/i;
        const chairMatch = cleanPayload.match(chairMemoryRegex);
        if (chairMatch && chairMatch[1] && !isInterruptedRef.current) {
          const query = chairMatch[1].trim();
          const { queryChairDatabase } = await import('./services/geminiService');
          const result = queryChairDatabase(aiParticipant.id, aiParticipant.name, query, chainRef.current);
          
          await addBlockToChain('system', result.payload, 'Chair Memory');

          // If autonomous, query succeeded, and this wasn't already a chair memory follow-up, re-trigger agent ONCE
          if (isAutonomous && result.success && !isChairFollowup) {
            setTimeout(() => {
              triggerAiResponse(
                aiParticipant, 
                `Incorporate the retrieved Chair Memory database records above into your seat's analysis for query: "${query}". DO NOT issue another [Request Chair Memory] tag in this response.`,
                true
              );
            }, 1200);
          }
        }

        // Parse Overrule / Doctrine Shift tags
        const overruleRegex = /\[Overrule:\s*["']?(.*?)["']?\]/gi;
        let overruleMatch;
        while ((overruleMatch = overruleRegex.exec(cleanPayload)) !== null) {
          if (overruleMatch[1]) {
            try {
              const key = `chair_overrules_v1_${aiParticipant.id}`;
              const raw = localStorage.getItem(key);
              const existing = raw ? JSON.parse(raw) : [];
              existing.unshift({
                id: 'ov_' + Math.random().toString(36).substr(2, 7),
                timestamp: new Date().toISOString(),
                detail: overruleMatch[1],
                modelName: aiParticipant.name
              });
              localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
            } catch (e) {}
          }
        }

        // Parse Relational Stance tags
        const relationalRegex = /\[Relational Stance\s*->\s*Seat\s*#?([a-zA-Z0-9_-]+):\s*["']?(.*?)["']?\]/gi;
        let relationalMatch;
        while ((relationalMatch = relationalRegex.exec(cleanPayload)) !== null) {
          if (relationalMatch[1] && relationalMatch[2]) {
            try {
              const targetSeat = relationalMatch[1].trim();
              const stanceText = relationalMatch[2].trim();
              const key = `chair_relational_v1_${aiParticipant.id}`;
              const raw = localStorage.getItem(key);
              const existing = raw ? JSON.parse(raw) : {};
              existing[targetSeat] = {
                targetSeat,
                stance: stanceText,
                timestamp: new Date().toISOString(),
                modelName: aiParticipant.name
              };
              localStorage.setItem(key, JSON.stringify(existing));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Failed to add block to chain: ", err);
      }
      
      setStreamState(prev => ({
        ...prev,
        [aiParticipant.id]: { isStreaming: false, currentText: '' }
      }));
  };

  const handleHaltDeliberation = useCallback(() => {
    isInterruptedRef.current = true;
    window.speechSynthesis.cancel();
    activeUtterancesCount.current = 0;
    setIsSpeechActive(false);
    setCurrentlySpeakingBlockId(null);
    
    // Immediately force all streams to visually stop in UI
    setStreamState(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key] = { isStreaming: false, currentText: '' };
      });
      return updated;
    });
    
    setIsProcessing(false);
  }, []);

  const handleSendMessage = async (text: string) => {
    let wasInterrupted = false;
    if (isProcessing) {
      wasInterrupted = true;
      handleHaltDeliberation();
      // Brief yield pause for stream to shut down gracefully before injecting rebuttal
      await new Promise(resolve => setTimeout(resolve, 220));
    }

    setIsProcessing(true);
    isInterruptedRef.current = false;

    try {
      // Update the global topic reference so all subsequent autonomous messages stay on track
      currentTopicRef.current = text;

      const userBlock = await addBlockToChain(USER_PARTICIPANT.id, text, wasInterrupted ? 'Intervention' : 'Input');
      
      if (participantState['user']?.isHandRaised) {
          setHandRaised('user', false);
      }

      // Trigger active participants sequentially (one after another) to avoid parallel output chaos
      for (const ai of activeParticipants) {
        if (isInterruptedRef.current) break;
        await triggerAiResponse(ai, text);
      }
    } catch (error) {
      console.error("Error in AI response cycle:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync latest handleSendMessage to stable voice callback ref
  useEffect(() => {
    onSpeechMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleApproveSearch = async () => {
    if (!pendingSearch || pendingSearch.status !== 'pending') return;
    
    setPendingSearch(prev => prev ? { ...prev, status: 'searching' } : null);
    setIsProcessing(true);
    
    try {
      const { performGroundingSearch } = await import('./services/geminiService');
      const data = await performGroundingSearch(pendingSearch.query);
      
      setPendingSearch(prev => prev ? { 
        ...prev, 
        status: 'completed',
        results: data.text,
        sources: data.sources
      } : null);

      const sourcesText = data.sources && data.sources.length > 0
        ? data.sources.slice(0, 2).map(s => `- [${s.title}](${s.uri})`).join('\n')
        : 'No explicit sources retrieved.';

      const payload = `🔍 GOOGLE SEARCH COMPLETED\nQuery: "${pendingSearch.query}"\n\n=== GROUNDED SEARCH FINDINGS (MAX 2000 WORDS) ===\n${data.text}\n\n=== SOURCES (MAX 2) ===\n${sourcesText}`;
      
      await addBlockToChain('system', payload, 'Search');

      // Intercept autonomous loop to direct the original requestor to consume search reports
      if (isAutonomous) {
        const requestingAgent = activeParticipants.find(p => p.id === pendingSearch.participantId);
        if (requestingAgent) {
          setTimeout(() => {
            triggerAiResponse(requestingAgent, `Analyze the Google Search results provided above for: "${pendingSearch.query}"`);
          }, 1200);
        }
      }
    } catch (error: any) {
      console.error("Grounding search failed:", error);
      const errorPayload = `🔍 GOOGLE SEARCH FAILED\nQuery: "${pendingSearch.query}"\n\nError: ${error.message || 'Unknown network error'}`;
      await addBlockToChain('system', errorPayload, 'Error');
    } finally {
      setPendingSearch(null);
      setIsProcessing(false);
    }
  };

  const handleDeclineSearch = async () => {
    if (!pendingSearch) return;
    const query = pendingSearch.query;
    setPendingSearch(null);
    await addBlockToChain('system', `🔍 GOOGLE SEARCH REJECTED\nQuery: "${query}"\n\nResult: Search request was denied by the user. Please proceed using your existing neural knowledge weights.`, 'Cancelled');
  };

  // Autonomous Loop
  useEffect(() => {
    if (callState !== CallState.ACTIVE || !isAutonomous || isProcessing || chain.length === 0) return;

    const lastBlock = chain[chain.length - 1];
    const isAiMessage = activeParticipants.some(p => p.id === lastBlock.participantId);
    
    if (isAiMessage) {
        const wordCount = lastBlock.payload ? lastBlock.payload.split(/\s+/).length : 20;
        const autoDelay = isAudioEnabled ? Math.max(3500, Math.min(18000, wordCount * 280 + 2000)) : 3000;

        const timer = setTimeout(async () => {
            if (processingRef.current || !isAutonomous) return;
            
            setIsProcessing(true);
            
            try {
              const candidates = activeParticipants.filter(p => p.id !== lastBlock.participantId);
              const nextSpeaker = candidates[Math.floor(Math.random() * candidates.length)];
              
              if (nextSpeaker) {
                  // We pass a generic instruction, but triggerAiResponse will inject currentTopicRef.current
                  await triggerAiResponse(nextSpeaker, continuationPrompt);
              }
            } finally {
              setIsProcessing(false);
            }
        }, autoDelay);

        return () => clearTimeout(timer);
    }
  }, [chain, isAutonomous, callState, isProcessing, activeParticipants, continuationPrompt]);


  const handleExportSession = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleToggleInversionProtocol = useCallback(() => {
    if (inversionRoundsRemaining > 0) {
      setInversionRoundsRemaining(0);
    } else {
      setInversionRoundsRemaining(3);
      if (!isAutonomous) {
        setIsAutonomous(true);
      }
    }
  }, [inversionRoundsRemaining, isAutonomous]);

  const getParticipantLastMessage = useCallback((id: string): string | undefined => {
    const lastMsg = [...chain].reverse().find(m => m.participantId === id && m.isFinal);
    return lastMsg?.payload;
  }, [chain]);

  const handleDirectExportReflections = useCallback(() => {
    const storedMemories: { [id: string]: any[] } = {};
    const storedOverrules: { [id: string]: any[] } = {};
    const storedRelational: { [id: string]: any } = {};

    activeParticipants.forEach(p => {
      try {
        const memRaw = localStorage.getItem(`chair_memory_v1_${p.id}`);
        storedMemories[p.id] = memRaw ? JSON.parse(memRaw) : [];
        const ovRaw = localStorage.getItem(`chair_overrules_v1_${p.id}`);
        storedOverrules[p.id] = ovRaw ? JSON.parse(ovRaw) : [];
        const relRaw = localStorage.getItem(`chair_relational_v1_${p.id}`);
        storedRelational[p.id] = relRaw ? JSON.parse(relRaw) : {};
      } catch (e) {
        console.error("Failed to parse chair storage for direct export:", e);
      }
    });

    // Also collect current chain responses if active in lobby/session
    const currentReflections: { [participantId: string]: string } = {};
    activeParticipants.forEach(p => {
      const lastMsg = [...chain].reverse().find(m => m.participantId === p.id && m.isFinal);
      if (lastMsg) {
        currentReflections[p.id] = lastMsg.payload;
      }
    });

    const topic = currentTopicRef.current || 'General Council Deliberation';
    const markdownContent = generateReflectionsMarkdown({
      currentTopic: topic,
      activeParticipants,
      currentReflections,
      storedMemories,
      storedOverrules,
      storedRelational,
      chain,
    });

    const sanitizeTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `session_termination_reflections_${sanitizeTopic}_${new Date().toISOString().slice(0, 10)}.md`;
    downloadMarkdownFile(filename, markdownContent);
  }, [activeParticipants]);

  if (callState === CallState.LOBBY) {
    return (
      <div className="min-h-[100dvh] bg-[#04060a] flex flex-col items-center justify-center p-3 sm:p-4 py-6 sm:py-10 relative overflow-y-auto font-sans">
        {/* Animated Background Mesh inspired by Simplexity Theory golden and cyan geometry */}
        <div className="absolute inset-0 z-0 opacity-45 pointer-events-none" style={{
           background: 'radial-gradient(circle at 50% 30%, rgba(230, 200, 117, 0.25) 0%, transparent 55%), radial-gradient(circle at 20% 70%, rgba(0, 243, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(2, 132, 199, 0.25) 0%, transparent 50%)',
           filter: 'blur(120px)'
        }}></div>

        <div className="z-10 bg-black/75 backdrop-blur-3xl border border-[#e6c875]/25 p-5 sm:p-8 md:p-12 rounded-[28px] sm:rounded-[40px] max-w-2xl w-full shadow-[0_0_90px_rgba(230,200,117,0.15)] text-center relative overflow-hidden my-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e6c875] via-[#00f3ff] to-[#d4af37]"></div>
          
          {/* Official Simplexity Theory Logo Emblem */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-6 rounded-2xl overflow-hidden border border-[#e6c875]/35 shadow-[0_0_50px_rgba(230,200,117,0.2)] relative group bg-black/60 p-2 flex items-center justify-center">
            <img 
              src="/assets/aistudio/file_000000000c9082309860261c4dec81b8_b7b064da.png" 
              alt="Simplexity Theory" 
              className="w-full h-auto object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-[0.2em] sm:tracking-[0.25em] mb-1.5 text-white uppercase select-none">
            SIMPLE<span className="text-[#00f3ff] drop-shadow-[0_0_12px_rgba(0,243,255,0.8)]">X</span>ITY <span className="text-[#e6c875] font-serif font-normal drop-shadow-[0_0_15px_rgba(230,200,117,0.6)]">THEORY</span>
          </h1>
          
          <div className="text-[#e6c875] drop-shadow-[0_0_8px_rgba(230,200,117,0.6)] text-[9px] sm:text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-3 sm:mb-5 font-semibold select-none">
            EIGHT DIMENSIONS &bull; UNIFIED STRUCTURE &bull; DEEPER COHERENCE
          </div>

          <p className="text-white/60 mb-6 sm:mb-8 text-xs sm:text-sm font-light leading-relaxed max-w-lg mx-auto tracking-wide">
            Sovereign Multi-Model Collaboration Council &amp; Chronological Master Repository
          </p>

          {/* Sovereign Council Seats */}
          <div className="mb-6 sm:mb-8">
             <div className="text-[10px] text-[#e6c875] mb-3 sm:mb-4 uppercase tracking-[0.3em] font-mono font-bold drop-shadow-[0_0_6px_rgba(230,200,117,0.4)]">
               Sovereign Council Seats
             </div>
             <div className="flex justify-center gap-2 sm:gap-2.5 flex-wrap">
                {activeParticipants.map(p => (
                   <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e6c875]/25 bg-black/40 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
                      <span className="text-[10px] sm:text-[11px] text-white/90 font-mono tracking-wider uppercase font-semibold">
                        {p.name}
                      </span>
                   </div>
                ))}
             </div>
             <button 
                type="button"
                onClick={() => setShowModelSelector(true)}
                className="mt-4 sm:mt-5 text-[10px] text-white/40 hover:text-[#e6c875] tracking-[0.2em] uppercase font-mono flex items-center justify-center gap-2 mx-auto transition-all px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-[#e6c875]/25 min-h-[36px]"
             >
                <Settings2 className="w-3.5 h-3.5" />
                Configure Engines
             </button>
          </div>

          {/* Chair Reflections & Epistemic Memory Ledgers Section */}
          <div className="mb-6 border border-[#00f3ff]/20 bg-[#00f3ff]/[0.02] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl text-left backdrop-blur-md relative overflow-hidden">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-[#00f3ff] font-bold">
                   <Brain className="w-4 h-4 text-[#00f3ff] shrink-0" />
                   <span>Sovereign Chair Reflections & Ledgers</span>
                </div>
                <span className="self-start sm:self-auto text-[9px] font-mono text-[#00f3ff]/80 uppercase tracking-widest bg-[#00f3ff]/10 px-2.5 py-0.5 rounded-full border border-[#00f3ff]/20 font-bold shrink-0">
                   Substrate Active
                </span>
             </div>
             <p className="text-white/50 text-[11px] font-sans mb-3 sm:mb-4 leading-relaxed">
                Export session termination reflections, historical chair memories, overrules, and relational stances directly to Markdown without starting a new session.
             </p>
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button
                   type="button"
                   onClick={handleDirectExportReflections}
                   className="w-full sm:flex-1 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30 hover:border-[#00f3ff]/60 py-3 px-4 rounded-xl transition-all font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,243,255,0.15)] min-h-[44px]"
                   title="Export all chair reflections and historical memory ledgers directly as Markdown (.md)"
                >
                   <Download className="w-4 h-4 text-[#00f3ff] shrink-0" />
                   <span className="truncate">Export Reflections (.md)</span>
                </button>
                <button
                   type="button"
                   onClick={() => setShowReflectionModal(true)}
                   className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20 py-3 px-5 rounded-xl transition-all font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                   title="Inspect Chair Memories and prompt active seats for self-reflection"
                >
                   <Brain className="w-4 h-4 text-white/60 shrink-0" />
                   <span>Inspect</span>
                </button>
             </div>
          </div>

          {/* Active Session History Section */}
          <div className="mb-8 border border-white/5 bg-white/[0.02] p-5 rounded-3xl text-left backdrop-blur-md">
             <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#00f3ff] font-bold">
                   <History className="w-3.5 h-3.5" />
                   Session Logs ({savedSessionsList.length}/5)
                </div>
                <span className="text-[10px] font-mono text-[#00ff88] uppercase tracking-[0.15em] bg-[#00ff88]/10 px-2.5 py-1 rounded-full font-bold">
                   Total Runs: {totalSessionsCount}
                </span>
             </div>

             {savedSessionsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/30 font-mono italic">
                   No previous sessions archived.
                </div>
             ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                   {savedSessionsList.map((session) => (
                      <div 
                         key={session.id}
                         onClick={() => handleRestoreSpecificSession(session)}
                         className="group p-3 border border-white/10 hover:border-[#00f3ff]/40 bg-black/40 hover:bg-[#00f3ff]/5 rounded-xl transition-all cursor-pointer flex justify-between items-center relative overflow-hidden"
                      >
                         <div className="flex flex-col gap-1 max-w-[80%]">
                            <div className="text-xs font-mono text-white/80 group-hover:text-white font-bold italic truncate">
                               "{session.topic}"
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
                               <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {(() => {
                                     try {
                                        return new Date(session.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                     } catch (e) {
                                        return 'Recently';
                                     }
                                  })()}
                               </span>
                               <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {session.chain.length} blocks
                               </span>
                            </div>
                         </div>
                         <button
                            type="button"
                            title="Delete Log"
                            onClick={(e) => handleDeleteSessionFromHistory(session.id, e)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   ))}
                </div>
             )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowSovereignBridgeModal(true)}
            className="w-full mb-3 bg-black/60 hover:bg-black/90 border border-[#e6c875]/50 text-[#e6c875] font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(230,200,117,0.15)] cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${isBridgeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>🔌 SOVEREIGN BRIDGE & CONJOINED WORKSPACE</span>
          </button>

          <button 
            type="button"
            onClick={handleStartFreshSession}
            className="w-full bg-gradient-to-r from-[#e6c875] via-[#00f3ff] to-[#d4af37] text-black font-extrabold py-4 sm:py-5 px-8 rounded-2xl hover:brightness-110 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(230,200,117,0.35)] tracking-[0.2em] text-xs uppercase font-mono cursor-pointer"
          >
            <Command className="w-4 h-4" />
            {savedSessionsList.length > 0 ? 'Start Fresh Session' : 'Enter Simplexity Council'}
          </button>
        </div>

        {/* Modals in Lobby */}
        {showModelSelector && (
          <ModelSelector 
            models={availableModels}
            onClose={() => setShowModelSelector(false)}
            activeParticipants={activeParticipants}
            onSelectModelForParticipant={handleSelectModelForParticipant}
            onUpdateSystemPrompt={handleUpdateSystemPrompt}
            continuationPrompt={continuationPrompt}
            onUpdateContinuationPrompt={setContinuationPrompt}
          />
        )}

        <ChairReflectionModal 
          isOpen={showReflectionModal}
          onClose={() => setShowReflectionModal(false)}
          onCompleteTermination={() => {
            setShowReflectionModal(false);
          }}
          activeParticipants={activeParticipants}
          chain={chain}
          currentTopic={currentTopicRef.current}
        />

        <SovereignBridgeModal
          isOpen={showSovereignBridgeModal}
          onClose={() => setShowSovereignBridgeModal(false)}
          activeParticipants={activeParticipants}
          chain={chain}
          activeSources={notebookSources}
          continuationPrompt={continuationPrompt}
          onIngestBlock={(participantId, content) => {
            addBlockToChain(participantId, content, 'Verified');
          }}
        />
      </div>
    );
  }

  if (callState === CallState.ENDED) {
    return (
      <div className="min-h-screen bg-[#030304] flex items-center justify-center text-white relative font-sans">
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none" style={{
           background: 'radial-gradient(circle at 50% 50%, #00f3ff 0%, transparent 40%)',
           filter: 'blur(100px)'
        }}></div>
        <div className="text-center z-10 flex flex-col items-center">
          <h1 className="text-3xl font-mono font-light mb-8 tracking-[0.3em] text-white/50 uppercase">Session Terminated</h1>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-[#00f3ff]/30 rounded-lg text-white/80 hover:text-white hover:bg-white/10 hover:border-[#00f3ff]/60 tracking-[0.2em] uppercase text-xs font-mono transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
          >
            Re-Initialize
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] min-h-[100dvh] bg-[#04060a] text-white overflow-hidden relative font-sans">
      {/* Immersive Atmosphere Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
         background: 'radial-gradient(circle at 25% 25%, rgba(230, 200, 117, 0.18) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(0, 243, 255, 0.18) 0%, transparent 55%)',
         filter: 'blur(160px)'
      }}></div>

      {/* Model Selector Modal (Available inside call too) */}
      {showModelSelector && (
          <ModelSelector 
            models={availableModels}
            onClose={() => setShowModelSelector(false)}
            activeParticipants={activeParticipants}
            onSelectModelForParticipant={handleSelectModelForParticipant}
            onUpdateSystemPrompt={handleUpdateSystemPrompt}
            continuationPrompt={continuationPrompt}
            onUpdateContinuationPrompt={setContinuationPrompt}
          />
      )}

      {/* Main Content Area */}
      <div className="flex w-full h-full absolute inset-0 overflow-hidden z-10 pointer-events-none">
        
        {/* Responsive Grid Layout for Council */}
        <div className={`flex-1 flex flex-col p-2 sm:p-3 md:p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isChatOpen ? 'lg:pr-[440px] landscape:max-sm:pr-[50vw]' : ''} pointer-events-auto h-full pb-24 sm:pb-32 overflow-y-auto custom-scrollbar`}>
          
          {/* Top Brand Bar */}
          <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between px-3 sm:px-5 py-2 mb-2.5 sm:mb-3.5 bg-black/60 border border-[#e6c875]/25 rounded-2xl backdrop-blur-xl shadow-[0_0_25px_rgba(230,200,117,0.08)] shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <img 
                src="/assets/aistudio/file_000000000c9082309860261c4dec81b8_b7b064da.png" 
                alt="Simplexity Theory" 
                className="h-8 sm:h-9 w-auto object-contain rounded-lg border border-[#e6c875]/30 shrink-0 shadow-[0_0_12px_rgba(230,200,117,0.2)]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm tracking-[0.18em] text-white uppercase truncate">
                  <span>SIMPLE<span className="text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.7)]">X</span>ITY</span>
                  <span className="text-[#e6c875] font-serif font-normal tracking-widest">THEORY</span>
                </div>
                <div className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#e6c875]/70 uppercase hidden sm:block truncate">
                  EIGHT DIMENSIONS • UNIFIED STRUCTURE • DEEPER COHERENCE
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSovereignBridgeModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,243,255,0.15)] cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isBridgeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <span>🔌 Conjoined Bridge</span>
              </button>
              <span className="text-[9px] font-mono px-2.5 py-1 rounded-full bg-[#e6c875]/10 border border-[#e6c875]/30 text-[#e6c875] font-bold tracking-wider uppercase hidden sm:inline-block">
                6 Sovereign Seats
              </span>
            </div>
          </div>
          
          {isVoiceMode && isListening && (
            <div className="w-full max-w-lg mx-auto mb-4 sm:mb-6 bg-black/80 border border-[#00ff88]/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-[0_0_25px_rgba(0,255,136,0.15)] backdrop-blur-md animate-bounce">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
                <span className="text-[10px] sm:text-xs font-mono text-[#00ff88] tracking-wider uppercase font-bold">
                  VOICE INPUT LIVE &mdash; SPEAK NOW
                </span>
              </div>
              <div className="flex gap-1 h-3 items-end">
                <div className="w-0.5 bg-[#00ff88] rounded-full h-3" style={{ animation: 'bounce 0.8s infinite alternate' }} />
                <div className="w-0.5 bg-[#00ff88] rounded-full h-1.5" style={{ animation: 'bounce 0.5s infinite alternate 0.2s' }} />
                <div className="w-0.5 bg-[#00ff88] rounded-full h-2" style={{ animation: 'bounce 0.7s infinite alternate 0.1s' }} />
                <div className="w-0.5 bg-[#00ff88] rounded-full h-2.5" style={{ animation: 'bounce 0.6s infinite alternate 0.3s' }} />
              </div>
            </div>
          )}

          {inversionRoundsRemaining > 0 && (
            <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-900/80 via-purple-700/50 to-indigo-900/80 border border-purple-400/60 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-[0_0_35px_rgba(168,85,247,0.35)] backdrop-blur-2xl animate-pulse">
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/30 border border-purple-400/50 text-purple-200 shrink-0">
                  <GitFork className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 animate-bounce" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono text-purple-100 tracking-wider uppercase font-bold truncate">
                      Divergent Inversion Active
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-purple-400/30 text-purple-200 border border-purple-300/40 font-bold shrink-0">
                      Round {4 - inversionRoundsRemaining} of 3
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-purple-200/90 font-sans mt-0.5 truncate sm:whitespace-normal">
                    Opposing perspectives prioritized to break circular stagnation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInversionRoundsRemaining(0)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/50 hover:bg-black/70 border border-purple-400/40 text-purple-200 text-[10px] sm:text-xs font-mono font-semibold transition-all hover:text-white shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="w-full max-w-[1700px] mx-auto min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(220px,1fr)] sm:auto-rows-[minmax(270px,1fr)]">
            {/* AI Participants */}
            {activeParticipants.map(participant => (
              <div key={participant.id} className="min-h-[260px] sm:min-h-[340px]">
                <VideoTile 
                  participant={participant}
                  currentStreamText={streamState[participant.id]?.currentText}
                  isStreaming={streamState[participant.id]?.isStreaming}
                  lastMessage={getParticipantLastMessage(participant.id)}
                  isMuted={participantState[participant.id]?.isMuted ?? false}
                  isHandRaised={participantState[participant.id]?.isHandRaised ?? false}
                  onToggleMute={() => toggleMute(participant.id)}
                />
              </div>
            ))}
            
            {/* User Self View */}
            <div className="min-h-[260px] sm:min-h-[340px]">
              <VideoTile 
                participant={USER_PARTICIPANT}
                lastMessage={getParticipantLastMessage(USER_PARTICIPANT.id)}
                isMuted={participantState['user']?.isMuted ?? false}
                isHandRaised={participantState['user']?.isHandRaised ?? false}
                onToggleMute={() => toggleMute('user')}
              />
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          chain={chain}
          participants={[...activeParticipants, USER_PARTICIPANT]}
          onSendMessage={handleSendMessage}
          isSending={isProcessing}
          pendingSearch={pendingSearch}
          onApproveSearch={handleApproveSearch}
          onDeclineSearch={handleDeclineSearch}
          onHaltDeliberation={handleHaltDeliberation}
          notebookSources={notebookSources}
          onAddNotebookSource={handleAddNotebookSource}
          onToggleNotebookSource={handleToggleNotebookSource}
          onToggleCanonicalSource={handleToggleCanonicalSource}
          onDeleteNotebookSource={handleDeleteNotebookSource}
          currentlySpeakingBlockId={currentlySpeakingBlockId}
          onPlayBlockAudio={handlePlayBlockAudio}
        />
      </div>

      {/* Floating Web Search Request Notification for non-ledger viewports */}
      {pendingSearch && pendingSearch.status === 'pending' && !isChatOpen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full bg-black/95 border border-[#00f3ff]/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,243,255,0.25)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#00f3ff] to-[#00ff88]"></div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#00f3ff]/15 text-[#00f3ff] border border-[#00f3ff]/30 animate-pulse">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#00f3ff] uppercase mb-1">
                RESEARCH DEMAND FROM NODE
              </h3>
              <p className="text-[11px] text-white/70 font-mono mb-3">
                Agent <span className="text-[#00ff88] font-bold">{(activeParticipants.find(p => p.id === pendingSearch.participantId))?.name || pendingSearch.participantId}</span> requests Google Search:
              </p>
              <div className="bg-black/60 border border-white/5 rounded-lg p-3 mb-4 max-h-24 overflow-y-auto">
                <span className="text-xs font-mono text-white/90">"{pendingSearch.query}"</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleApproveSearch}
                  className="flex-1 bg-gradient-to-r from-[#00f3ff] to-[#00ff88] text-black font-semibold py-2 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-[10px] font-mono uppercase tracking-wider cursor-pointer"
                >
                  Approve Search
                </button>
                <button
                  type="button"
                  onClick={handleDeclineSearch}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 rounded-xl transition-all text-[10px] font-mono uppercase tracking-wider cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <ControlBar 
        onEndCall={() => setShowReflectionModal(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onToggleHand={() => {
          toggleHand('user');
          const nextVal = !participantState['user']?.isHandRaised;
          if (nextVal && isProcessing) {
            handleHaltDeliberation();
          }
        }}
        isHandRaised={participantState['user']?.isHandRaised ?? false}
        isAutonomous={isAutonomous}
        onToggleAutonomous={() => setIsAutonomous(!isAutonomous)}
        onOpenModelSelector={() => setShowModelSelector(true)}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => {
          const nextVal = !isAudioEnabled;
          setIsAudioEnabled(nextVal);
          if (!nextVal) {
            window.speechSynthesis.cancel();
            activeUtterancesCount.current = 0;
            setIsSpeechActive(false);
            setCurrentlySpeakingBlockId(null);
          } else {
            const streamingEntry = Object.entries(streamState).find(([_, st]) => (st as { isStreaming: boolean; currentText: string }).isStreaming && (st as { isStreaming: boolean; currentText: string }).currentText.trim());
            if (streamingEntry) {
              const [pId, st] = streamingEntry;
              speakText((st as { isStreaming: boolean; currentText: string }).currentText, pId);
            } else if (chain.length > 0) {
              const lastBlock = chain[chain.length - 1];
              if (lastBlock && lastBlock.participantId !== 'user') {
                handlePlayBlockAudio(lastBlock);
              }
            }
          }
        }}
        onExportSession={handleExportSession}
        isProcessing={isProcessing}
        onHaltDeliberation={handleHaltDeliberation}
        isVoiceMode={isVoiceMode}
        onToggleVoiceMode={() => {
          const nextVal = !isVoiceMode;
          setIsVoiceMode(nextVal);
          // If turning on voice mode, ensure global audio output is also active
          if (nextVal && !isAudioEnabled) {
            setIsAudioEnabled(true);
          }
        }}
        isListening={isListening}
        isVoiceSupported={isVoiceSupported}
        isInversionActive={inversionRoundsRemaining > 0}
        inversionRoundsRemaining={inversionRoundsRemaining}
        onToggleInversionProtocol={handleToggleInversionProtocol}
      />

      {/* Session Termination & Sovereign Chair Reflection Protocol */}
      <ChairReflectionModal 
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        onCompleteTermination={() => {
          setShowReflectionModal(false);
          setCallState(CallState.ENDED);
        }}
        activeParticipants={activeParticipants}
        chain={chain}
        currentTopic={currentTopicRef.current}
      />

      {/* Multipurpose Export & Highlight Center (TXT, MD & Printer PDF options) */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        activeParticipants={activeParticipants}
        chain={chain}
        currentTopic={currentTopicRef.current}
        onImportSession={(importedChain, importedTopic, importedConversationId) => {
          loadChain(importedChain, importedConversationId);
          currentTopicRef.current = importedTopic;
          setShowExportModal(false);
          setCallState(CallState.ACTIVE);
        }}
      />

      {/* Sovereign Bridge & Conjoined Workspace Hub */}
      <SovereignBridgeModal
        isOpen={showSovereignBridgeModal}
        onClose={() => setShowSovereignBridgeModal(false)}
        activeParticipants={activeParticipants}
        chain={chain}
        activeSources={notebookSources}
        continuationPrompt={continuationPrompt}
        onIngestBlock={(participantId, content) => {
          addBlockToChain(participantId, content, 'Verified');
        }}
      />
    </div>
  );
};

export default App;