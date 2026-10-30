import React, { useEffect, useRef, useState } from "react";
import { Participant } from "../types";
import { Mic, MicOff, Hand, Activity, Terminal, Sparkles, Disc, Layers } from "lucide-react";
import { GraphicAvatarCanvas } from "./GraphicAvatarCanvas";

interface VideoTileProps {
  participant: Participant;
  currentStreamText?: string;
  isStreaming?: boolean;
  lastMessage?: string;
  isMuted: boolean;
  isHandRaised: boolean;
  onToggleMute: () => void;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  currentStreamText,
  isStreaming,
  lastMessage,
  isMuted,
  isHandRaised,
  onToggleMute,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [avatarMode, setAvatarMode] = useState<"graphic" | "hybrid" | "portrait">("graphic");

  const cycleAvatarMode = () => {
    setAvatarMode((prev) => {
      if (prev === "graphic") return "hybrid";
      if (prev === "hybrid") return "portrait";
      return "graphic";
    });
  };

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [currentStreamText]);

  const displayText = !isMuted ? (isStreaming ? currentStreamText : lastMessage) : null;
  const isSpeaking = isStreaming && !!currentStreamText && currentStreamText.length > 0 && !isMuted;
  
  // Simplexity Theory color scheme: Gold/metallic for Operator, Cyan/Electric Blue for AI models
  const borderColor = participant.id === 'user' ? 'border-[#e6c875]/35' : 'border-[#00f3ff]/25 hover:border-[#e6c875]/40';
  const glowColor = participant.id === 'user' ? 'shadow-[0_0_25px_rgba(230,200,117,0.3)] border-[#e6c875]/70' : 'shadow-[0_0_25px_rgba(0,243,255,0.3)] border-[#00f3ff]/70';

  return (
    <div
      className={`relative flex flex-col w-full h-full bg-[#030304]/90 rounded-2xl overflow-hidden transition-all duration-500 items-stretch border ${isSpeaking ? 'scale-[1.01] z-20 ' + glowColor : borderColor + ' z-0 flex'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 z-0 pointer-events-none`}></div>

      {/* Top HUD */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]' : 'bg-white/20'}`} />
            <span className={`text-[9px] sm:text-[10px] font-mono tracking-widest uppercase ${isSpeaking ? 'text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.3)] font-semibold' : 'text-white/40'}`}>
              {isSpeaking ? 'TRANSMITTING' : 'STANDBY'}
            </span>
          </div>
          <span className={`text-xs sm:text-sm font-sans font-medium tracking-wide uppercase text-white/95 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] flex items-center gap-1.5 sm:gap-2`}>
            {participant.name}
            {participant.id !== 'user' && <Terminal className="w-3 h-3 text-[#00f3ff]/50" />}
          </span>
        </div>

        <div className="flex gap-1.5 sm:gap-2 pointer-events-auto items-center">
          {/* Avatar Motion Mode Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleAvatarMode();
            }}
            title={`Avatar Visual Mode: ${avatarMode.toUpperCase()}`}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl transition-all duration-300 border backdrop-blur-md bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-wider cursor-pointer"
          >
            {avatarMode === "graphic" && <Sparkles className="w-3 h-3 text-[#00f3ff]" />}
            {avatarMode === "hybrid" && <Layers className="w-3 h-3 text-[#00ff88]" />}
            {avatarMode === "portrait" && <Disc className="w-3 h-3 text-white/50" />}
            <span className="hidden sm:inline uppercase text-[9px] font-semibold">
              {avatarMode}
            </span>
          </button>

          {isHandRaised && (
            <div className="bg-yellow-500/10 text-yellow-500 p-1.5 sm:p-2 rounded-xl animate-pulse backdrop-blur-md border border-yellow-500/20">
              <Hand className="w-3 h-3" />
            </div>
          )}

          {participant.id !== "user" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 border backdrop-blur-md ${isMuted ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"}`}
            >
              {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Visuals Area: Real Graphic Motion Avatar */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-10 p-3 sm:p-6">
        <GraphicAvatarCanvas
          participant={participant}
          isSpeaking={!!isSpeaking}
          isMuted={isMuted}
          currentStreamText={currentStreamText}
          avatarMode={avatarMode}
        />
      </div>

      {/* Output Stream / Captions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 min-h-[70px] sm:min-h-[120px] flex flex-col justify-end pointer-events-auto z-30 bg-gradient-to-t from-black via-black/80 to-transparent">
        {displayText ? (
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
                <Activity className={`w-3 h-3 ${participant.id === 'user' ? 'text-[#00ff88]/50' : 'text-[#00f3ff]/50'}`} />
                <span className={`text-[9px] font-mono tracking-widest ${participant.id === 'user' ? 'text-[#00ff88]' : 'text-[#00f3ff]'} uppercase font-bold`}>LIVE STREAM</span>
            </div>
            <p
              ref={textRef}
              className="text-white/90 font-mono text-xs md:text-sm leading-relaxed max-h-[30vh] overflow-y-auto scrollbar-hide"
            >
              <span className="opacity-95">{displayText}</span>
              {isStreaming && (
                <span className={`inline-block w-1.5 h-3 ml-2 ${participant.id === 'user' ? 'bg-[#00ff88]' : 'bg-[#00f3ff]'} animate-pulse align-middle`} />
              )}
            </p>
          </div>
        ) : isMuted && isStreaming ? (
          <div className="flex justify-start">
            <span className="bg-red-500/10 text-red-500 text-[9px] px-3 py-1.5 rounded-md border border-red-500/20 flex items-center gap-2 font-mono tracking-widest uppercase">
              <MicOff className="w-3 h-3" /> AUDIO STREAM SUPPRESSED
            </span>
          </div>
        ) : (
          <div className="h-4" />
        )}
      </div>
      
      {/* Corner Brackets for HUD feel */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t border-l ${participant.id === 'user' ? 'border-[#00ff88]/40' : 'border-[#00f3ff]/40'} rounded-tl-2xl pointer-events-none z-30`} />
      <div className={`absolute top-0 right-0 w-8 h-8 border-t border-r ${participant.id === 'user' ? 'border-[#00ff88]/40' : 'border-[#00f3ff]/40'} rounded-tr-2xl pointer-events-none z-30`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-b border-l ${participant.id === 'user' ? 'border-[#00ff88]/40' : 'border-[#00f3ff]/40'} rounded-bl-2xl pointer-events-none z-30`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b border-r ${participant.id === 'user' ? 'border-[#00ff88]/40' : 'border-[#00f3ff]/40'} rounded-br-2xl pointer-events-none z-30`} />
    </div>
  );
};
