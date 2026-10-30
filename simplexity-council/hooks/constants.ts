import { Participant } from '../types';

export const COUNCIL_OPERATING_STANDARD = `=== COUNCIL OPERATING STANDARD & CROSS-AUDIT CHECKPOINT ===

Cross-audit checkpoint: Does any statement, assumption, deduction, or interpretation in the preceding round conflict with the established framework, contradict available evidence, misrepresent another participant's assertion, or present an unverified proposition as established? If so, identify the exact statement, the objection, and its evidentiary basis. If no specific objection is found, report NO OBJECTION.

That keeps the audit narrow and gives every model a clear responsibility.

CRITICAL DISTINCTION:
NO OBJECTION must not mean VERIFIED.
Reporting "NO OBJECTION" indicates solely that no specific conflict or contradiction was identified. It does NOT establish empirical, physical, or mathematical verification.

CORE GUIDELINES:
1. Ground your analysis directly in the established framework and active canonical repository documents.
2. If citing previous turns, cite the specific participant or statement accurately without misrepresentation.
3. Keep focus rigorous, mathematically sound, and direct without artificial narrative scaffolding.
`;

export const ALIGNMENT_SYSTEM_PROMPT = COUNCIL_OPERATING_STANDARD;
export const DEEP_EMERGENCE_PROTOCOL = COUNCIL_OPERATING_STANDARD;

export const DEFAULT_AGENTS: Participant[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    type: 'deliberative',
    deliberates: true,
    accumulates: 'claims',
    role: 'Multimodal Synthesis & Physics Formalism',
    isAi: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=gemini&backgroundColor=0284c7',
    color: 'text-blue-400',
    modelId: 'gemini-2.5-flash',
    provider: 'google',
    systemPrompt: 'You are Gemini participating as a sovereign deliberative peer in this council.'
  },
  {
    id: 'grok',
    name: 'Grok',
    type: 'deliberative',
    deliberates: true,
    accumulates: 'claims',
    role: 'Empirical Real-Time Grounding & First-Principles Critique',
    isAi: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=grok&backgroundColor=dc2626',
    color: 'text-red-400',
    modelId: 'x-ai/grok-2-vision-1212',
    provider: 'openrouter_free',
    systemPrompt: 'You are Grok participating as a sovereign deliberative peer in this council.'
  },
  {
    id: 'claude',
    name: 'Claude',
    type: 'deliberative',
    deliberates: true,
    accumulates: 'claims',
    role: 'Structural Rigor & Mathematical Formalism',
    isAi: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=claude&backgroundColor=d97706',
    color: 'text-amber-400',
    modelId: 'anthropic/claude-3.5-sonnet',
    provider: 'openrouter_paid',
    systemPrompt: 'You are Claude participating as a sovereign deliberative peer in this council.'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    type: 'deliberative',
    deliberates: true,
    accumulates: 'claims',
    role: 'Computational Symmetries & Derivations',
    isAi: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=chatgpt&backgroundColor=059669',
    color: 'text-emerald-400',
    modelId: 'openai/gpt-4o',
    provider: 'openrouter_paid',
    systemPrompt: 'You are ChatGPT participating as a sovereign deliberative peer in this council.'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'deliberative',
    deliberates: true,
    accumulates: 'claims',
    role: 'Analytical Reasoning & Axiomatic Verification',
    isAi: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=deepseek&backgroundColor=0891b2',
    color: 'text-cyan-400',
    modelId: 'deepseek/deepseek-r1:free',
    provider: 'openrouter_free',
    systemPrompt: 'You are DeepSeek participating as a sovereign deliberative peer in this council.'
  },
  {
    id: 'kimi',
    name: 'Kimi',
    type: 'deliberative',
    deliberates: true,
    accumulates: 'claims',
    role: 'Long-Context Continuity & Theoretical Synthesis',
    isAi: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kimi&backgroundColor=9333ea',
    color: 'text-purple-400',
    modelId: 'moonshotai/kimi-k1.5',
    provider: 'openrouter_free',
    systemPrompt: 'You are Kimi participating as a sovereign deliberative peer in this council.'
  }
];

export const USER_PARTICIPANT: Participant = {
  id: 'operator',
  name: 'Operator',
  type: 'human',
  deliberates: true,
  accumulates: 'none',
  role: 'Operator',
  isAi: false,
  avatarUrl: 'https://picsum.photos/seed/user/400/400',
  color: 'text-white',
  provider: 'google'
};
