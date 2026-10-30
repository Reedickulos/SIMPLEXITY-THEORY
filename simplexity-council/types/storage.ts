import { LedgerBlock } from '../types';

export interface IdentityData {
  displayLabel?: string;
  claimBoundary?: string;
}

export interface SemanticData {
  claimIndex: string[]; // List of claim IDs this seat holds
  relationalStances: Record<string, string>; // Map of targetSeatId to stance
  rulings?: string[]; // If we decide to use it later
}

export interface ProceduralData {
  promptOverrides: Record<string, string>;
  petitionLedger: any[];
}

export interface SessionTrace {
  id: string; // Session ID
  timestamp: number;
  topic: string;
  chain: LedgerBlock[];
}

export interface ProsePayload {
  id: string; // Claim ID or message ID
  content: string;
}
