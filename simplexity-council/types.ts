export type SeatType = 'deliberative' | 'arbiter' | 'human';

export interface Participant {
  id: string;
  name: string;
  type: SeatType;
  deliberates: boolean;
  accumulates: 'claims' | 'rulings' | 'none';
  role: string;
  avatarUrl: string;
  isAi: boolean;
  systemPrompt?: string;
  color: string;
  modelId?: string;
  provider: 'google' | 'openrouter' | 'openrouter_free' | 'openrouter_paid';
}

export interface LedgerBlock {
  // The cryptographic signature of this block
  hash: string;
  // Link to the previous block
  previousHash: string;
  
  // Ledger Metadata
  conversationId: string;
  ledgerIndex: number;
  timestamp: number;
  
  // Content
  participantId: string;
  payload: string; // The actual content or error message
  vibe?: string;   // The emotional context (e.g., "Skeptical", "Excited")
  
  // UI State (not part of hash usually, but kept for UI flow)
  isFinal: boolean;
}

export interface StreamState {
  [participantId: string]: {
    isStreaming: boolean;
    currentText: string;
    currentVibe?: string;
  };
}

export interface ParticipantState {
  [participantId: string]: {
    isMuted: boolean;
    isHandRaised: boolean;
  };
}

export enum CallState {
  LOBBY = 'LOBBY',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export interface SavedSession {
  id: string; // conversationId
  timestamp: string; // ISO string
  topic: string;
  chain: LedgerBlock[];
}

export interface NotebookSource {
  id: string;
  name: string;
  type: 'file' | 'note' | 'external_consolidation';
  content: string;
  size?: string;
  timestamp: string;
  isActive: boolean;
  version?: string;
  isCanonical?: boolean;
  origin?: string;
  notes?: string;
}


export type ClaimClass = 'empirical' | 'framing';

export interface BaseClaim {
  id: string; // Claim ID
  authorSeatId: string;
  claimClass: ClaimClass;
  content: string;
}

export interface EmpiricalClaim extends BaseClaim {
  claimClass: 'empirical';
  falsificationConditions: string;
}

export interface FramingClaim extends BaseClaim {
  claimClass: 'framing';
  reductionCriteria: string;
}

export type Claim = EmpiricalClaim | FramingClaim;

export interface Edge {
  sourceClaimId: string;
  targetClaimId: string;
  relationship: 'supports' | 'contests';
  justification: string;
}

