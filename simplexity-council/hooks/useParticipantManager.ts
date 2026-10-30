import { useState, useCallback } from 'react';
import { ParticipantState } from '../types';
import { DEFAULT_AGENTS, USER_PARTICIPANT } from './constants';

const INITIAL_STATE: ParticipantState = {
  [USER_PARTICIPANT.id]: { isMuted: false, isHandRaised: false },
  // Initialize AIs
  ...DEFAULT_AGENTS.reduce((acc, p) => ({ ...acc, [p.id]: { isMuted: false, isHandRaised: false } }), {})
};

export const useParticipantManager = () => {
  const [participantState, setParticipantState] = useState<ParticipantState>(INITIAL_STATE);

  const toggleMute = useCallback((id: string) => {
    setParticipantState(prev => {
      const currentState = prev[id] || { isMuted: false, isHandRaised: false };
      const isNowMuted = !currentState.isMuted;
      
      return {
        ...prev,
        [id]: {
          ...currentState,
          isMuted: isNowMuted,
          // If a user un-mutes, we assume they are ready to speak, so we lower their hand automatically
          // If they mute, we keep the hand state as is (maybe they are waiting to speak but muted background noise)
          isHandRaised: !isNowMuted ? false : currentState.isHandRaised
        }
      };
    });
  }, []);

  const toggleHand = useCallback((id: string) => {
    setParticipantState(prev => {
      const currentState = prev[id] || { isMuted: false, isHandRaised: false };
      return {
        ...prev,
        [id]: {
          ...currentState,
          isHandRaised: !currentState.isHandRaised
        }
      };
    });
  }, []);

  const setHandRaised = useCallback((id: string, isRaised: boolean) => {
    setParticipantState(prev => {
      const currentState = prev[id] || { isMuted: false, isHandRaised: false };
      return {
        ...prev,
        [id]: {
          ...currentState,
          isHandRaised: isRaised
        }
      };
    });
  }, []);

  return { 
    participantState, 
    toggleMute, 
    toggleHand, 
    setHandRaised 
  };
};