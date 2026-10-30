import { useState, useRef, useEffect } from 'react';
import { LedgerBlock } from '../types';
import { generateHash, generateSessionId } from '../utils/chainUtils';

export const useConversationChain = () => {
  const [chain, setChain] = useState<LedgerBlock[]>([]);
  const conversationIdRef = useRef<string>('');
  
  // Mutex Lock for the chain to prevent forks when multiple AIs reply simultaneously
  const chainLock = useRef<Promise<void>>(Promise.resolve());

  // Initialize session ID once
  useEffect(() => {
    if (!conversationIdRef.current) {
      conversationIdRef.current = generateSessionId();
    }
  }, []);

  const addBlockToChain = async (participantId: string, payload: string, vibe: string = 'Neutral'): Promise<LedgerBlock> => {
    // We chain the promises so that addBlockToChain calls are executed sequentially
    // strictly in the order they were called, regardless of how long the async operations take.
    const newBlockPromise = chainLock.current.then(async () => {
      
      // Get the VERY latest chain state from the state updater to ensure we have the true tail
      let previousHash = 'GENESIS_HASH_0000000000000000000000000000000';
      let newIndex = 0;

      await new Promise<void>(resolve => {
        setChain(currentChain => {
          const lastBlock = currentChain[currentChain.length - 1];
          if (lastBlock) {
            previousHash = lastBlock.hash;
            newIndex = lastBlock.ledgerIndex + 1;
          }
          resolve();
          return currentChain; // Don't modify state here, just read
        });
      });

      const timestamp = Date.now();
      const conversationId = conversationIdRef.current;

      // Generate the cryptographic signature
      const hash = await generateHash(
        previousHash,
        timestamp,
        conversationId,
        newIndex,
        participantId,
        payload,
        vibe
      );

      const newBlock: LedgerBlock = {
        hash,
        previousHash,
        conversationId,
        ledgerIndex: newIndex,
        timestamp,
        participantId,
        payload,
        vibe,
        isFinal: true
      };

      setChain(prev => [...prev, newBlock]);
      return newBlock;
    });

    // Update the lock to wait for this new operation (catching both fulfillment and rejection to prevent deadlock)
    chainLock.current = newBlockPromise.then(() => {}, () => {});

    return newBlockPromise;
  };

  const loadChain = (newChain: LedgerBlock[], newConversationId?: string) => {
    setChain(newChain);
    if (newConversationId) {
      conversationIdRef.current = newConversationId;
    } else if (newChain.length > 0) {
      conversationIdRef.current = newChain[0].conversationId;
    }
  };

  const resetChain = () => {
    setChain([]);
    conversationIdRef.current = generateSessionId();
  };

  return { chain, addBlockToChain, loadChain, resetChain, conversationId: conversationIdRef.current };
};
