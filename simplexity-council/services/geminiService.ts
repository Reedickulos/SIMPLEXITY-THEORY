import { GoogleGenAI } from "@google/genai";
import { LedgerBlock, Participant, NotebookSource } from "../types";
import { ALIGNMENT_SYSTEM_PROMPT, DEEP_EMERGENCE_PROTOCOL } from "../hooks/constants";

// --- API CONFIGURATION ---
export const getGoogleApiKey = (): string => {
  let key = '';
  try {
    key = (typeof process !== 'undefined' && (process.env.GEMINI_API_KEY || process.env.API_KEY)) || '';
  } catch (e) {
    key = '';
  }

  if (!key && typeof window !== 'undefined') {
    key = (window as any).GEMINI_API_KEY ||
          (window as any).API_KEY ||
          localStorage.getItem('gemini_api_key') ||
          localStorage.getItem('apiKey') ||
          '';
  }

  return (key || '').trim();
};

export const getOpenRouterApiKey = (): string => {
  return (
    (typeof window !== 'undefined' ? localStorage.getItem('openrouter_api_key') : '') ||
    (typeof process !== 'undefined' ? (process.env.OPENROUTER_API_KEY || '') : '') ||
    ''
  );
};

export const getGoogleAi = (): GoogleGenAI => {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    throw new Error("Missing Google Gemini API key. Ensure GEMINI_API_KEY or API_KEY is available.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// --- CONTEXT BUILDER ---

/**
 * Sovereign Relevant-Memory Retriever
 * Prevents context window ballooning over long periods by dynamically fetching
 * topic-relevant and recent unedited reflections without modifying or parsing the text.
 */
function selectRelevantMemories(
  memories: Array<{ timestamp: string; topic: string; modelName: string; reflection: string }>,
  currentTopic: string,
  currentPrompt: string,
  maxEntries: number = 4
) {
  if (!memories || memories.length === 0) return [];

  const queryTerms = (currentTopic + ' ' + currentPrompt)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const scored = memories.map((mem, index) => {
    const text = (mem.topic + ' ' + mem.reflection).toLowerCase();
    let score = 0;

    // Keyword overlap scoring
    queryTerms.forEach(term => {
      if (text.includes(term)) score += 2;
    });

    // Recency boost (newest entries get up to +3 points)
    const recencyBoost = Math.max(0, 3 - index * 0.5);
    score += recencyBoost;

    return { mem, score, index };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top N distinct entries
  const selected = scored.slice(0, maxEntries).map(s => s.mem);

  // Re-sort selected chronologically for natural reading
  return selected.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const buildContextPrompt = (
  participant: Participant, 
  ledger: LedgerBlock[], 
  userPayload: string, 
  originalTopic: string,
  activeSources?: NotebookSource[],
  includeReminder?: boolean,
  isInversionProtocol?: boolean,
  inversionRound?: number
) => {
  // Chronological Repository (The Master Record)
  let sourcesSection = '';
  if (activeSources && activeSources.length > 0) {
    const sorted = [...activeSources].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeA - timeB;
    });

    const canonicalDocs = sorted.filter(s => s.isCanonical);
    const chronologicalAddenda = sorted.filter(s => !s.isCanonical);

    sourcesSection = `\n--- ESTABLISHED FRAMEWORK & REPOSITORY ---\n`;
    if (canonicalDocs.length > 0) {
      sourcesSection += `\n[CURRENT CANONICAL BASELINE]\n` +
        canonicalDocs.map(s => `Document: "${s.name}" (Version: ${s.version || 'Canonical'} | Date: ${s.timestamp})\n${s.content}\n`).join('\n');
    }
    if (chronologicalAddenda.length > 0) {
      sourcesSection += `\n[CHRONOLOGICAL REVISIONS / ADDENDA]\n` +
        chronologicalAddenda.map(s => `Record: "${s.name}" (${s.origin || 'External'} | Date: ${s.timestamp})\n${s.content}\n`).join('\n');
    }
  }

  const checkpointSection = `
Cross-audit checkpoint: Does any statement, assumption, deduction, or interpretation in the preceding round conflict with the established framework, contradict available evidence, misrepresent another participant's assertion, or present an unverified proposition as established? If so, identify the exact statement, the objection, and its evidentiary basis. If no specific objection is found, report NO OBJECTION.

NO OBJECTION must not mean VERIFIED.
`;

  return `
${sourcesSection}

--- CONVERSATION RECORD ---
${ledger.slice(-30).map(block => `[${block.participantId}]: ${block.payload}`).join('\n\n')}

--- PROBLEM CONTEXT ---
"${originalTopic || 'Theoretical Physics Framework'}"

--- LATEST INPUT ---
"${userPayload}"

${checkpointSection}

This is your turn.
`;
};

// --- GOOGLE STREAMING (SERVER PROXY & CLIENT RUNTIME) ---
const streamGoogle = async (
  participant: Participant, 
  prompt: string, 
  onChunk: (text: string) => void
) => {
  try {
    let model = participant.modelId || "gemini-2.5-flash";

    // 1. Primary path: Use server-side proxy route (ambient server GEMINI_API_KEY)
    try {
      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, temperature: 0.7 })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let receivedAny = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  onChunk(parsed.text);
                  receivedAny = true;
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e: any) {
                if (e.message && !e.message.includes('JSON')) throw e;
              }
            }
          }
        }

        if (receivedAny) return;
      }
    } catch (serverErr: any) {
      console.warn("Server-side stream failed, testing client fallback:", serverErr?.message || serverErr);
    }

    // 2. Client-side SDK fallback if client API key is provided
    const apiKey = getGoogleApiKey();
    if (!apiKey) {
      throw new Error("Unable to connect to deliberation engine. Please verify server connection.");
    }

    const ai = getGoogleAi();
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    for await (const chunk of response) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    throw error;
  }
};

// --- OPENAI-COMPATIBLE STREAMING (OpenRouter) ---
// Handles Qwen, DeepSeek, and other OpenRouter models with retries & failover
const KNOWN_OPENROUTER_ALIASES: Record<string, string> = {
  'z-ai/glm-flash-latest': 'z-ai/glm-5.3-flash',
  '~z-ai/glm-flash-latest': 'z-ai/glm-5.3-flash',
  'z-ai/glm-latest': 'z-ai/glm-5.3',
  '~z-ai/glm-latest': 'z-ai/glm-5.3',
  'google/gemini-flash-latest': 'google/gemini-3.8-flash',
  '~google/gemini-flash-latest': 'google/gemini-3.8-flash',
  'google/gemini-pro-latest': 'google/gemini-4-argon',
  '~google/gemini-pro-latest': 'google/gemini-4-argon',
  'anthropic/claude-haiku-latest': 'anthropic/claude-haiku-5.5',
  '~anthropic/claude-haiku-latest': 'anthropic/claude-haiku-5.5',
  'anthropic/claude-sonnet-latest': 'anthropic/claude-sonnet-5.5',
  '~anthropic/claude-sonnet-latest': 'anthropic/claude-sonnet-5.5',
  'anthropic/claude-opus-latest': 'anthropic/claude-opus-5.5',
  '~anthropic/claude-opus-latest': 'anthropic/claude-opus-5.5',
  'deepseek/deepseek-flash-latest': 'deepseek/deepseek-v4.1-flash-1017',
  '~deepseek/deepseek-flash-latest': 'deepseek/deepseek-v4.1-flash-1017',
  'deepseek/deepseek-v4-flash-latest': 'deepseek/deepseek-v4-flash-0731',
  '~deepseek/deepseek-v4-flash-latest': 'deepseek/deepseek-v4-flash-0731',
  'x-ai/grok-latest': 'x-ai/grok-4.7',
  '~x-ai/grok-latest': 'x-ai/grok-4.7',
  'moonshotai/kimi-latest': 'moonshotai/kimi-k3',
  '~moonshotai/kimi-latest': 'moonshotai/kimi-k3'
};

// --- OPENAI-COMPATIBLE STREAMING (OpenRouter) ---
// Handles Nemotron, Claude, Qwen, DeepSeek, Google (via OpenRouter), and all council seeds
const streamOpenAICompatible = async (
  participant: Participant,
  prompt: string,
  onChunk: (text: string) => void
) => {
  const currentApiKey = getOpenRouterApiKey();

  if (!currentApiKey || currentApiKey.trim() === '') {
    throw new Error(
      `OpenRouter API Key not configured. Please open 'Council Interchange Config' to enter your OpenRouter API Key (sk-or-...) to stream ${participant.name} (${participant.modelId || 'Seed'}).`
    );
  }

  // Ensure model ID adheres to OpenRouter catalog format (e.g. provider/model)
  let resolvedModelId = (participant.modelId || 'nvidia/nemotron-3-ultra-550b-a55b:free').trim();
  if (KNOWN_OPENROUTER_ALIASES[resolvedModelId]) {
    resolvedModelId = KNOWN_OPENROUTER_ALIASES[resolvedModelId];
  } else if (resolvedModelId.startsWith('~') && KNOWN_OPENROUTER_ALIASES[resolvedModelId.slice(1)]) {
    resolvedModelId = KNOWN_OPENROUTER_ALIASES[resolvedModelId.slice(1)];
  } else if (resolvedModelId.startsWith('~')) {
    resolvedModelId = resolvedModelId.slice(1);
  }
  if (!resolvedModelId.includes('/')) {
    resolvedModelId = `google/${resolvedModelId}`;
  }

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${currentApiKey.trim()}`,
    "HTTP-Referer": "https://aicouncil.app",
    "X-Title": "AI Council SEMA Engine"
  };

  let response: Response | null = null;
  let lastError: any = null;

  // Retry up to 2 times for transient network issues
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: resolvedModelId,
          messages: [
            { role: "user", content: prompt }
          ],
          stream: true,
          temperature: 0.7
        })
      });

      if (response.ok) {
        lastError = null;
        break;
      }

      if (response.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }

      const errText = await response.text();
      let msg = errText;
      try {
        const errJson = JSON.parse(errText);
        msg = errJson.error?.message || errText;
      } catch (e) {}

      if (response.status === 401) {
        throw new Error(
          `OpenRouter API Key rejected (HTTP 401: ${msg}). Please check or update your key in Council Interchange Config.`
        );
      }

      lastError = new Error(`OpenRouter Error ${response.status}: ${msg}`);
    } catch (err: any) {
      lastError = err;
      if (err.message === "RATE_LIMIT_EXCEEDED" || err.message?.includes("rejected (HTTP 401")) {
        throw err;
      }
      if (attempt < 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  if (!response || !response.ok) {
    throw lastError || new Error(`Failed to connect to OpenRouter for ${participant.name} (${resolvedModelId})`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No response body received from OpenRouter");

  let receivedChunks = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr.trim() === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content;
            const reasoning = (data.choices?.[0]?.delta as any)?.reasoning_content;

            if (reasoning) {
              onChunk(`[Thinking] ${reasoning} `);
              receivedChunks = true;
            }
            if (content) {
              onChunk(content);
              receivedChunks = true;
            }
          } catch (e) {
            // Ignore partial JSON parses
          }
        }
      }
    }
  } catch (streamErr) {
    if (!receivedChunks) throw streamErr;
  }
};

// --- MAIN HANDLER ---
// Council Deliberation Process: Supports Google GenAI natively and OpenRouter models with resilient fallback
export const generateResponseStream = async (
  participant: Participant,
  ledger: LedgerBlock[],
  userPayload: string,
  originalTopic: string,
  onChunk: (chunkText: string) => void,
  activeSources?: NotebookSource[],
  includeReminder?: boolean,
  isInversionProtocol?: boolean,
  inversionRound?: number
) => {
  try {
    const contextPrompt = buildContextPrompt(
      participant, 
      ledger, 
      userPayload, 
      originalTopic, 
      activeSources, 
      includeReminder,
      isInversionProtocol,
      inversionRound
    );

    const isGoogle = 
      participant.provider === 'google' || 
      participant.modelId?.toLowerCase().startsWith('gemini-') ||
      participant.modelId?.toLowerCase().startsWith('google/');

    if (isGoogle) {
      await streamGoogle(participant, contextPrompt, onChunk);
      return;
    }

    const openRouterKey = getOpenRouterApiKey();
    if (openRouterKey && openRouterKey.trim() !== '') {
      try {
        await streamOpenAICompatible(participant, contextPrompt, onChunk);
        return;
      } catch (orError: any) {
        console.warn(`OpenRouter streaming failed for ${participant.name} (${participant.modelId}). Engaging Google Gemini resilient fallback:`, orError?.message || orError);
        // Resilient fallback to Google GenAI so Council deliberation never halts or dies
        await streamGoogle(participant, contextPrompt, onChunk);
        return;
      }
    } else {
      // Direct reliable deliberation via Google GenAI engine
      await streamGoogle(participant, contextPrompt, onChunk);
      return;
    }

  } catch (error: any) {
    if (error.message !== "RATE_LIMIT_EXCEEDED") {
      console.error(`Error generating deliberation response for ${participant.name} (${participant.modelId}):`, error);
    }
    
    if (error.message === "RATE_LIMIT_EXCEEDED") {
      onChunk(`[System Alert] Rate Limit Exceeded for ${participant.name} (${participant.modelId}). Please try again in a moment.`);
    } else {
      onChunk(`[Deliberation Error] ${error.message || 'Unknown deliberation connection error'}`);
    }
  }
};

// ============================================================================
// --- GEMINI BACKGROUND OPERATIONAL SYSTEM & TURN-TAKING ORCHESTRATOR ---
// ============================================================================
// Gemini serves as the background operational intelligence engine:
// 1. Decides intelligent turn-taking (who speaks next and why, rather than random)
// 2. Formulates targeted directives for each speaker to address peer premises
// 3. Deliberation health monitor (detects stalls, flags apophenia, triggers inversion)
// 4. Multi-agent consensus arbitration & emergence invariant discovery
// ============================================================================

export interface TurnOrchestrationResult {
  nextSpeakerId: string;
  speakerName: string;
  rationale: string;
  directive: string;
  shouldTriggerInversion: boolean;
  deliberationStatus: 'active' | 'converging' | 'stalled' | 'emergent';
}

export const orchestrateNextTurn = async (
  ledger: LedgerBlock[],
  activeParticipants: Participant[],
  originalTopic: string,
  isInversionActive: boolean
): Promise<TurnOrchestrationResult> => {
  // Deterministic fallback generator in case API key is missing or network times out
  const createFallbackDecision = (reason: string): TurnOrchestrationResult => {
    const lastBlock = ledger.length > 0 ? ledger[ledger.length - 1] : null;
    const candidates = activeParticipants.filter(p => !lastBlock || p.id !== lastBlock.participantId);
    const chosen = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : activeParticipants[0];

    return {
      nextSpeakerId: chosen?.id || 'seat-01',
      speakerName: chosen?.name || 'Council Member',
      rationale: `Deterministic fallback: ${reason}. Selected ${chosen?.name || 'seat'} to maintain dialogue cadence.`,
      directive: isInversionActive
        ? `[Inversion Protocol Active] Attack the prevailing assumption inherited by prior speakers. Construct the strongest credible counter-case.`
        : `Analyze the prior statement from your architectural perspective. Address the core premise directly.`,
      shouldTriggerInversion: false,
      deliberationStatus: 'active'
    };
  };

  try {
    const recentBlocks = ledger.slice(-6).map(b => `[${b.participantId}]: ${b.payload.slice(0, 350)}`);
    const participantsSummary = activeParticipants.map(p => `- ${p.id} ("${p.name}"): Model ${p.modelId || 'Seat'}`).join('\n');
    const lastSpeakerId = ledger.length > 0 ? ledger[ledger.length - 1].participantId : null;

    const prompt = `You are the Background Operational Orchestrator for an elite multi-agent AI Council governed by the Deep Emergence Protocol v2.1.
Your role is to orchestrate turn-taking, manage the floor, detect argumentative stalls, and steer the next speaker with laser precision.

Original Discussion Topic: "${originalTopic || 'General Inquiry'}"
Inversion Protocol Active: ${isInversionActive ? 'YES (Stall detected - adversarial inversion required)' : 'NO (Standard dialectic)'}

Active Council Participants:
${participantsSummary}

Recent Ledger History (last ${recentBlocks.length} turns):
${recentBlocks.join('\n\n')}

Last Speaker: ${lastSpeakerId || 'None'}

ORCHESTRATION INSTRUCTIONS:
1. Select the BEST next participant to speak.
   - Do NOT select the same participant who just spoke (${lastSpeakerId}).
   - Prefer a participant whose prior claim was contested, who was asked a question, or whose specific architecture (analytical, methodological, formal/mathematical, adversarial/inversion) is uniquely needed to test or advance the current hypothesis.
2. Provide a 1-sentence rationale explaining WHY this participant was chosen.
3. Formulate a concise, high-impact "directive" for this participant. What exact peer premise, missing evidence, or counter-hypothesis should they address?
4. Assess the deliberation status: 'active', 'converging', 'stalled', or 'emergent'.
5. If the deliberation is 'stalled' (participants repeating each other, agreeing without new evidence, or trapped in circular rhetoric) and Inversion is not yet active, set shouldTriggerInversion to true.

Output strictly valid JSON adhering to this schema:
{
  "nextSpeakerId": "participant_id_here",
  "rationale": "one clear sentence explaining the selection",
  "directive": "specific directive for the next speaker",
  "shouldTriggerInversion": boolean,
  "deliberationStatus": "active" | "converging" | "stalled" | "emergent"
}`;

    let rawText = '';
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, responseMimeType: 'application/json', temperature: 0.2 })
      });
      if (res.ok) {
        const data = await res.json();
        rawText = data.text || '';
      }
    } catch (apiErr) {
      console.warn("Server generation failed, trying client SDK:", apiErr);
    }

    if (!rawText) {
      try {
        const ai = getGoogleAi();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });
        rawText = response.text || '';
      } catch (modelErr: any) {
        console.warn("Orchestrator fallback error:", modelErr);
      }
    }

    if (!rawText) {
      return createFallbackDecision("Empty response from Gemini orchestrator");
    }

    const parsed = JSON.parse(rawText);
    const matchedParticipant = activeParticipants.find(p => p.id === parsed.nextSpeakerId);
    
    const validSpeaker = matchedParticipant && matchedParticipant.id !== lastSpeakerId
      ? matchedParticipant
      : activeParticipants.filter(p => p.id !== lastSpeakerId)[0] || activeParticipants[0];

    return {
      nextSpeakerId: validSpeaker.id,
      speakerName: validSpeaker.name,
      rationale: parsed.rationale || `Selected by Gemini Facilitator based on dialectic balance.`,
      directive: parsed.directive || `Analyze the previous statement from your perspective.`,
      shouldTriggerInversion: !!parsed.shouldTriggerInversion,
      deliberationStatus: parsed.deliberationStatus || 'active'
    };
  } catch (err: any) {
    console.warn("[Gemini Facilitator] Background turn orchestration error, using fallback:", err.message);
    return createFallbackDecision(err.message || "Orchestration runtime exception");
  }
};


// --- GOOGLE SEARCH GROUNDING ENGINES (SERVER PROXY & CLIENT RUNTIME) ---
export const performGroundingSearch = async (query: string): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
  try {
    const res = await fetch('/api/gemini/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (res.ok) {
      const data = await res.json();
      return { text: data.text || '', sources: data.sources || [] };
    }
  } catch (err) {
    console.warn("Server search failed, trying client SDK:", err);
  }

  try {
    const ai = getGoogleAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a web search for: "${query}". Provide grounded search findings retrieved from the most relevant source documents up to approximately 1,500 - 2,000 words (~500-700 tokens). If the text exceeds this limit, terminate with an explicit indicator line: "[...Content truncated at word limit]".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "No text was retrieved for this search.";
    const words = text.split(/\s+/);
    if (words.length > 2000) {
      text = words.slice(0, 2000).join(" ") + "\n\n[...Content truncated at 2,000-word limit]";
    }

    const rawSources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          rawSources.push({
            title: chunk.web.title || "Web Search Source",
            uri: chunk.web.uri,
          });
        }
      }
    }

    const uniqueSources: { title: string; uri: string }[] = [];
    const seenUris = new Set<string>();
    for (const src of rawSources) {
      if (!seenUris.has(src.uri)) {
        seenUris.add(src.uri);
        uniqueSources.push(src);
        if (uniqueSources.length >= 2) break;
      }
    }

    return { text, sources: uniqueSources };
  } catch (error: any) {
    console.error("Error executing Google Search Grounding:", error);
    throw new Error(`Google Search Grounding encountered an API error: ${error.message || error}`);
  }
};

// --- CHAIR MEMORY DATABASE QUERY ENGINE ---
export const queryChairDatabase = (
  participantId: string,
  participantName: string,
  query: string,
  ledger: LedgerBlock[]
): { success: boolean; usage: number; payload: string } => {
  const countKey = `chair_query_count_${participantId}`;
  const rawCount = typeof window !== 'undefined' ? localStorage.getItem(countKey) : '0';
  const currentCount = parseInt(rawCount || '0', 10);

  if (currentCount >= 15) {
    return {
      success: false,
      usage: currentCount,
      payload: `🔍 CHAIR MEMORY QUERY DENIED (Seat #${participantId} - ${participantName})\nQuota Exceeded: ${currentCount}/15 total query calls used for this Chair.\nTo conserve API efficiency, no further database calls are permitted for this seat.`
    };
  }

  const newCount = currentCount + 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(countKey, newCount.toString());
  }

  // 1. Search Reflection Index Summaries
  let reflections: Array<{ timestamp: string; topic: string; modelName: string; reflection: string }> = [];
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(`chair_memory_v1_${participantId}`) : null;
    if (raw) reflections = JSON.parse(raw);
  } catch (e) {
    reflections = [];
  }

  const terms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);

  const matchedReflections = reflections.filter(r => {
    if (terms.length === 0) return true;
    const text = (r.topic + ' ' + r.reflection).toLowerCase();
    return terms.some(t => text.includes(t));
  }).slice(0, 5);

  // 2. Search Raw Merkle-DAG Chains of Prior Sessions (storageService / localStorage)
  let priorSessionTraces: Array<{ id: string; timestamp: number; topic: string; chain: LedgerBlock[] }> = [];
  try {
    const rawTraces = typeof window !== 'undefined' ? localStorage.getItem('sema_v1_session_history_v1') : null;
    if (rawTraces) {
      priorSessionTraces = JSON.parse(rawTraces);
    }
  } catch (e) {
    priorSessionTraces = [];
  }

  // Find matching blocks across raw Merkle-DAGs of prior sessions
  const matchedPriorBlocks: Array<{ sessionId: string; sessionTopic: string; block: LedgerBlock }> = [];
  priorSessionTraces.forEach(trace => {
    if (!trace.chain || !Array.isArray(trace.chain)) return;
    trace.chain.forEach(block => {
      if (!block.payload || block.payload.startsWith('🔍')) return;
      if (terms.length === 0 || terms.some(t => block.payload.toLowerCase().includes(t))) {
        matchedPriorBlocks.push({
          sessionId: trace.id,
          sessionTopic: trace.topic,
          block
        });
      }
    });
  });

  const slicedPriorBlocks = matchedPriorBlocks.slice(-8);

  // 3. Search Current Session Ledger Blocks
  const participantBlocks = ledger.filter(b => b.payload && !b.payload.startsWith('🔍'));
  const matchedCurrentBlocks = participantBlocks.filter(b => {
    if (terms.length === 0) return true;
    const text = b.payload.toLowerCase();
    return terms.some(t => text.includes(t));
  }).slice(-5);

  let resultBody = '';
  if (matchedReflections.length === 0 && slicedPriorBlocks.length === 0 && matchedCurrentBlocks.length === 0) {
    resultBody = `No prior records or Merkle-DAG blocks matching "${query}" were found in Seat #${participantId}'s database.`;
  } else {
    if (matchedReflections.length > 0) {
      resultBody += `--- CHAIR REFLECTION SUMMARY INDICES ---\n` +
        matchedReflections.map((r, i) => `[Index Entry #${i + 1} | Topic: "${r.topic}" | Date: ${new Date(r.timestamp).toLocaleDateString()} | Engine: ${r.modelName}]:\n${r.reflection}`).join('\n\n') + '\n\n';
    }
    if (slicedPriorBlocks.length > 0) {
      resultBody += `--- RAW MERKLE-DAG BLOCKS FROM PRIOR SESSIONS ---\n` +
        slicedPriorBlocks.map((pb) => 
          `[DAG Block #${pb.block.ledgerIndex} | Session: "${pb.sessionTopic}" (${pb.sessionId}) | Author: Seat #${pb.block.participantId}]\n` +
          `Cryptographic Hash: ${pb.block.hash}\n` +
          `Previous Hash: ${pb.block.previousHash}\n` +
          `Payload: ${pb.block.payload}`
        ).join('\n\n') + '\n\n';
    }
    if (matchedCurrentBlocks.length > 0) {
      resultBody += `--- CURRENT SESSION MERKLE-DAG BLOCKS ---\n` +
        matchedCurrentBlocks.map((b) => 
          `[Block #${b.ledgerIndex} | Author: Seat #${b.participantId}]\n` +
          `Hash: ${b.hash} | Prev: ${b.previousHash}\n` +
          `Payload: ${b.payload}`
        ).join('\n\n');
    }
  }

  const payload = `🔍 CHAIR MEMORY DATABASE QUERY EXECUTED (Seat #${participantId} - ${participantName} | Usage: ${newCount}/15)\nQuery: "${query}"\n\n${resultBody.trim()}`;

  return {
    success: true,
    usage: newCount,
    payload
  };
};