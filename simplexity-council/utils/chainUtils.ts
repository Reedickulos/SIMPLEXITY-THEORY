export function generateSessionId(): string {
  return 'session-' + crypto.randomUUID().slice(0, 8);
}

export async function generateHash(
  previousHash: string,
  timestamp: number,
  conversationId: string,
  ledgerIndex: number,
  participantId: string,
  payload: string,
  vibe: string = 'Neutral'
): Promise<string> {
  // The data string represents the strict structure of the block
  // We include all immutable fields in the hash generation, including the Vibe
  const data = `${previousHash}|${conversationId}|${ledgerIndex}|${timestamp}|${participantId}|${vibe}|${payload}`;
  
  // Encode as UTF-8
  const msgBuffer = new TextEncoder().encode(data);
  
  // Hash the data using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
