import React from 'react';
import { Mic, Video, MonitorUp, PhoneOff, MessageSquare, Hand, RefreshCw, Settings2, Volume2, VolumeX, ChevronUp, Download, Square, GitFork, Flame } from 'lucide-react';

interface ControlBarProps {
  onEndCall: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleHand: () => void;
  isHandRaised: boolean;
  isAutonomous: boolean;
  onToggleAutonomous: () => void;
  onOpenModelSelector: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onExportSession: () => void;
  isProcessing?: boolean;
  onHaltDeliberation?: () => void;
  isVoiceMode: boolean;
  onToggleVoiceMode: () => void;
  isListening: boolean;
  isVoiceSupported: boolean;
  isInversionActive?: boolean;
  inversionRoundsRemaining?: number;
  onToggleInversionProtocol?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  onEndCall, 
  onToggleChat, 
  isChatOpen,
  onToggleHand,
  isHandRaised,
  isAutonomous,
  onToggleAutonomous,
  onOpenModelSelector,
  isAudioEnabled,
  onToggleAudio,
  onExportSession,
  isProcessing = false,
  onHaltDeliberation,
  isVoiceMode,
  onToggleVoiceMode,
  isListening,
  isVoiceSupported,
  isInversionActive = false,
  inversionRoundsRemaining = 0,
  onToggleInversionProtocol
}) => {
  const ButtonBase = "flex flex-col items-center justify-center gap-1 group cursor-pointer shrink-0 select-none px-0.5 sm:px-1";
  const IconContainer = "p-2.5 sm:p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-md";
  const ActionCircle = "p-2.5 sm:p-3.5 rounded-full transition-all duration-300 border backdrop-blur-md shadow-lg";
  const Label = "text-[9px] sm:text-xs text-white/50 font-medium group-hover:text-white transition-colors duration-300 whitespace-nowrap text-center select-none leading-none";

  return (
    <div className="fixed bottom-0 sm:bottom-4 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-40 w-full sm:w-auto px-2 sm:px-0 flex justify-center pointer-events-auto pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]">
      <div className="flex items-center gap-1.5 sm:gap-4 px-2.5 sm:px-6 py-2 sm:py-3 bg-black/90 sm:bg-black/80 border-t sm:border border-[#e6c875]/25 rounded-t-2xl sm:rounded-full backdrop-blur-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.8),0_8px_32px_rgba(230,200,117,0.12)] max-w-full overflow-x-auto scrollbar-hide">
        
        {/* Center controls: Main Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Model Selector */}
          <div className={ButtonBase} onClick={onOpenModelSelector}>
            <div className={IconContainer}>
              <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/95" />
            </div>
            <span className={Label}>Config</span>
          </div>

          {/* Autonomous Toggle */}
          <div className={ButtonBase} onClick={onToggleAutonomous}>
            <div className={`${ActionCircle} ${isAutonomous ? 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.35)]' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isAutonomous ? 'animate-spin-slow text-[#00ff88]' : ''}`} />
            </div>
            <span className={`${Label} ${isAutonomous ? 'text-[#00ff88] font-semibold' : ''}`}>Auto</span>
          </div>

          {/* Divergent Inversion Protocol Button */}
          {onToggleInversionProtocol && (
            <div className={ButtonBase} onClick={onToggleInversionProtocol} title="Divergent Inversion Protocol: Force models to take inverse position with full rigor & sincerity for 3 rounds to break stagnation">
              <div className={`${ActionCircle} ${
                isInversionActive 
                  ? 'bg-purple-500/30 border-purple-400/80 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse' 
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}>
                <GitFork className={`w-4 h-4 sm:w-5 sm:h-5 ${isInversionActive ? 'text-purple-300 rotate-180 transition-transform duration-500' : ''}`} />
              </div>
              <span className={`${Label} ${isInversionActive ? 'text-purple-300 font-bold' : ''}`}>
                {isInversionActive ? `Invert (${inversionRoundsRemaining}/3)` : 'Invert'}
              </span>
            </div>
          )}

          {/* Global Audio Toggle */}
          <div className={ButtonBase} onClick={onToggleAudio}>
            <div className={`${ActionCircle} ${isAudioEnabled ? 'bg-[#00f3ff]/20 border-[#00f3ff]/50 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.35)]' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>
              {isAudioEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f3ff]" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <span className={`${Label} ${isAudioEnabled ? 'text-[#00f3ff] font-semibold' : ''}`}>Audio</span>
          </div>

          {/* Hands-free Voice Mode */}
          {isVoiceSupported && (
            <div className={ButtonBase} onClick={onToggleVoiceMode}>
              <div className={`${ActionCircle} ${isVoiceMode ? (isListening ? 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.5)] animate-pulse' : 'bg-[#00f3ff]/20 border-[#00f3ff]/50 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.35)]') : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`${Label} ${isVoiceMode ? (isListening ? 'text-[#00ff88] font-semibold' : 'text-[#00f3ff] font-semibold') : ''}`}>
                {isVoiceMode ? (isListening ? 'Listening' : 'Talk Active') : 'Talk'}
              </span>
            </div>
          )}

          {/* Halt Deliberation Action (glowing red call intervention) */}
          {isProcessing && (
            <div className={ButtonBase} onClick={onHaltDeliberation}>
              <div className="p-2.5 sm:p-3.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse">
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500/30" />
              </div>
              <span className={`${Label} text-red-400 font-bold group-hover:text-red-300`}>Halt</span>
            </div>
          )}

          <div className={ButtonBase} onClick={onToggleHand}>
             <div className={`${ActionCircle} ${isHandRaised ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>
              <Hand className={`w-4 h-4 sm:w-5 sm:h-5 ${isHandRaised ? 'fill-yellow-500' : ''}`} />
            </div>
            <span className={`${Label} ${isHandRaised ? 'text-yellow-500 font-semibold group-hover:text-yellow-400' : ''}`}>Raise Hand</span>
          </div>

        </div>

        {/* Right controls: End Call & Aux */}
        <div className="flex gap-2 sm:gap-4 border-l border-[#00f3ff]/15 pl-2.5 sm:pl-5 items-center shrink-0">
          {/* Export Session */}
          <div className={ButtonBase} onClick={onExportSession}>
            <div className={IconContainer}>
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
            </div>
            <span className={Label}>Export</span>
          </div>

          <div className={ButtonBase} onClick={onToggleChat}>
            <div className={`p-2.5 sm:p-3 rounded-xl transition-colors border backdrop-blur-md ${isChatOpen ? 'bg-[#00f3ff]/20 border-[#00f3ff]/50 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>
              <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${isChatOpen ? 'text-[#00f3ff]' : ''}`} />
            </div>
            <span className={`${Label} ${isChatOpen ? 'text-[#00f3ff] font-semibold' : ''}`}>Ledger</span>
          </div>

          <button 
            onClick={onEndCall}
            className="flex items-center gap-1.5 sm:gap-2 bg-red-600/80 hover:bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 border border-red-500/50 rounded-xl sm:rounded-2xl font-sans font-medium transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] backdrop-blur-md text-[10px] sm:text-xs uppercase tracking-wider shrink-0 whitespace-nowrap cursor-pointer"
          >
            <PhoneOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="leading-none text-[10px] sm:text-xs font-semibold tracking-wider">End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};