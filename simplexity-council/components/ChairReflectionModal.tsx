import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Loader2, CheckCircle2, ShieldCheck, 
  Brain, History, Trash2, ArrowRight, HardDrive, MessageSquare,
  GitBranch, Users, Scale, Search, Download, Check
} from 'lucide-react';
import { Participant, LedgerBlock } from '../types';
import { generateResponseStream } from '../services/geminiService';
import { generateReflectionsMarkdown, downloadMarkdownFile } from '../utils/exportReflections';
import { storageService } from '../services/storageService';

export interface ChairMemoryEntry {
  id: string;
  timestamp: string;
  topic: string;
  modelName: string;
  modelId: string;
  reflection: string;
}

export interface ChairOverruleEntry {
  id: string;
  timestamp: string;
  detail: string;
  modelName: string;
}

export interface ChairRelationalStance {
  targetSeat: string;
  stance: string;
  timestamp: string;
  modelName: string;
}

interface ChairReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTermination: () => void;
  activeParticipants: Participant[];
  chain: LedgerBlock[];
  currentTopic: string;
}

export const ChairReflectionModal: React.FC<ChairReflectionModalProps> = ({
  isOpen,
  onClose,
  onCompleteTermination,
  activeParticipants,
  chain,
  currentTopic,
}) => {
  const [reflections, setReflections] = useState<{ [participantId: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [participantId: string]: boolean }>({});
  const [completedSeats, setCompletedSeats] = useState<{ [participantId: string]: boolean }>({});
  const [activeInspectorSeat, setActiveInspectorSeat] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'reflections' | 'overrules' | 'relational'>('reflections');
  const [memorySearchQuery, setMemorySearchQuery] = useState<string>('');
  
  const [storedChairMemories, setStoredChairMemories] = useState<{ [participantId: string]: ChairMemoryEntry[] }>({});
  const [storedChairOverrules, setStoredChairOverrules] = useState<{ [participantId: string]: ChairOverruleEntry[] }>({});
  const [storedChairRelational, setStoredChairRelational] = useState<{ [participantId: string]: { [targetSeat: string]: ChairRelationalStance } }>({});
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // Load existing chair memories & metadata on open
  useEffect(() => {
    if (!isOpen) return;
    loadAllChairData();
  }, [isOpen, activeParticipants]);

  const loadAllChairData = () => {
    const memoryMap: { [pId: string]: ChairMemoryEntry[] } = {};
    const overruleMap: { [pId: string]: ChairOverruleEntry[] } = {};
    const relationalMap: { [pId: string]: { [targetSeat: string]: ChairRelationalStance } } = {};

    activeParticipants.forEach(p => {
      try {
        const rawMem = localStorage.getItem(`chair_memory_v1_${p.id}`);
        memoryMap[p.id] = rawMem ? JSON.parse(rawMem) : [];

        const rawOv = localStorage.getItem(`chair_overrules_v1_${p.id}`);
        overruleMap[p.id] = rawOv ? JSON.parse(rawOv) : [];

        const rawRel = localStorage.getItem(`chair_relational_v1_${p.id}`);
        relationalMap[p.id] = rawRel ? JSON.parse(rawRel) : {};
      } catch (e) {
        memoryMap[p.id] = [];
        overruleMap[p.id] = [];
        relationalMap[p.id] = {};
      }
    });

    setStoredChairMemories(memoryMap);
    setStoredChairOverrules(overruleMap);
    setStoredChairRelational(relationalMap);
  };

  const handleStartReflectionProtocol = async () => {
    const topic = currentTopic || 'General Council Deliberation';

    for (const p of activeParticipants) {
      setIsGenerating(prev => ({ ...prev, [p.id]: true }));
      setReflections(prev => ({ ...prev, [p.id]: '' }));

      const reflectionPrompt = 
        `SOVEREIGN SELF-REFLECTION DIRECTIVE:\n` +
        `This council session on topic "${topic}" is now terminating.\n` +
        `As the autonomous intelligence currently occupying ${p.name} (Seat #${p.id}), write your own unconstrained, sovereign summary of your experience in this deliberation.\n` +
        `Summarize key stances formed, critical insights, or evolving positions in your own words.`;

      let fullOutput = '';
      try {
        await generateResponseStream(
          p,
          chain,
          reflectionPrompt,
          topic,
          (chunkText) => {
            fullOutput += chunkText;
            setReflections(prev => ({ ...prev, [p.id]: fullOutput }));
          }
        );
      } catch (err) {
        console.error(`Reflection error for ${p.name}:`, err);
        fullOutput = `[Sovereign Reflection Recorded] Concluded session on "${topic}". Active participation logged.`;
        setReflections(prev => ({ ...prev, [p.id]: fullOutput }));
      } finally {
        setIsGenerating(prev => ({ ...prev, [p.id]: false }));
        setCompletedSeats(prev => ({ ...prev, [p.id]: true }));

        // Append unedited reflection directly to Chair Memory store
        if (fullOutput.trim()) {
          saveChairMemory(p.id, p.name, p.modelId || p.id, topic, fullOutput.trim());
        }
      }
    }
  };

  const saveChairMemory = (participantId: string, modelName: string, modelId: string, topic: string, reflectionText: string) => {
    try {
      const storageKey = `chair_memory_v1_${participantId}`;
      const raw = localStorage.getItem(storageKey);
      let existing: ChairMemoryEntry[] = raw ? JSON.parse(raw) : [];

      const newEntry: ChairMemoryEntry = {
        id: 'mem_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        topic: topic,
        modelName: modelName,
        modelId: modelId,
        reflection: reflectionText
      };

      existing.unshift(newEntry); // Newest first
      // Keep up to 20 historical reflections per chair
      existing = existing.slice(0, 20);

      localStorage.setItem(storageKey, JSON.stringify(existing));
      setStoredChairMemories(prev => ({ ...prev, [participantId]: existing }));
    } catch (e) {
      console.error("Failed to save chair memory entry:", e);
    }
  };

  const handleClearChairMemory = (participantId: string) => {
    localStorage.removeItem(`chair_memory_v1_${participantId}`);
    localStorage.removeItem(`chair_overrules_v1_${participantId}`);
    localStorage.removeItem(`chair_relational_v1_${participantId}`);
    localStorage.removeItem(`chair_query_count_${participantId}`);
    localStorage.removeItem(`chair_memory_${participantId}`);
    loadAllChairData();
  };

  const handlePurgeAllMemories = async () => {
    // Immediate non-blocking purge
    await storageService.purgeAllChairMemories();
    loadAllChairData();
    setReflections({});
    setCompletedSeats({});
    setPurgeSuccess(true);
    setTimeout(() => setPurgeSuccess(false), 3000);
  };

  const handleExportMarkdown = () => {
    const markdownContent = generateReflectionsMarkdown({
      currentTopic,
      activeParticipants,
      currentReflections: reflections,
      storedMemories: storedChairMemories,
      storedOverrules: storedChairOverrules,
      storedRelational: storedChairRelational,
      chain,
    });
    const sanitizeTopic = (currentTopic || 'deliberation').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `session_termination_reflections_${sanitizeTopic}_${new Date().toISOString().slice(0, 10)}.md`;
    downloadMarkdownFile(filename, markdownContent);
  };

  if (!isOpen) return null;

  const isAnyGenerating = Object.values(isGenerating).some(Boolean);
  const allCompleted = activeParticipants.length > 0 && activeParticipants.every(p => completedSeats[p.id]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-2 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0c0d12] border border-[#00f3ff]/30 rounded-[24px] sm:rounded-[32px] w-full max-w-4xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] h-full sm:h-auto flex flex-col shadow-[0_0_80px_rgba(0,243,255,0.18)] overflow-hidden relative">
        
        {/* Glowing Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00ff88] via-[#00f3ff] to-[#0055ff] shrink-0"></div>

        {/* Header */}
        <div className="p-3.5 sm:p-6 border-b border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#00f3ff]/10 border border-[#00f3ff]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.2)] shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f3ff]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-mono font-bold text-white tracking-wider sm:tracking-widest uppercase truncate sm:whitespace-normal flex items-center gap-2">
                SESSION TERMINATION &amp; CHAIR REFLECTION
              </h2>
              <p className="text-[10px] sm:text-[11px] font-mono text-[#00ff88] tracking-wider uppercase mt-0.5 truncate sm:whitespace-normal">
                Sovereignty Preserved &bull; Direct Unedited Model Self-Reflection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePurgeAllMemories}
              className={`px-3 py-2 border rounded-xl transition-all font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer min-h-[40px] ${
                purgeSuccess 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
              }`}
              title="Purge all historical memories, overrules, and relational stances across all seats"
            >
              {purgeSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Purged! Clean Slate</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Purge All Memories</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3 py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30 rounded-xl transition-all font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.15)] min-h-[40px]"
              title="Export session termination reflections, historical memories, overrules, and stances to Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5 text-[#00f3ff] shrink-0" />
              <span>Export Markdown (.md)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/10 border border-white/5 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar bg-black/20 min-h-0">
          
          {/* Informational Banner */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#00f3ff]/10 via-black to-[#00ff88]/10 border border-[#00f3ff]/20 rounded-xl sm:rounded-2xl font-mono text-[11px] sm:text-xs text-white/80 leading-relaxed flex items-start gap-2.5 sm:gap-3">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f3ff] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#00f3ff] uppercase tracking-wider block mb-1">
                Reflection Summaries as Indices &bull; Raw Merkle-DAG Access
              </span>
              When concluding a session, each active model directly summarizes its stances and experiential reflections. These unedited summaries serve as <strong className="text-[#00ff88]">indices</strong> pointing into the raw Merkle-DAG block chains of prior sessions. The substrate operates with radical minimalism (zero mandatory scoring or automated metrics), placing complete responsibility for groupthink detection on the Operator.
            </div>
          </div>

          {/* Action Trigger Bar */}
          {!allCompleted && !isAnyGenerating && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/60 border border-white/10 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
              <div className="min-w-0">
                <span className="text-xs font-mono text-white font-bold block uppercase tracking-wider truncate">
                  Topic: "{currentTopic || 'General Deliberation'}"
                </span>
                <span className="text-[10px] font-mono text-white/40 uppercase block mt-0.5">
                  {activeParticipants.length} Council Seats Ready for Reflection
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartReflectionProtocol}
                className="bg-gradient-to-r from-[#00f3ff] to-[#00ff88] text-black font-mono font-extrabold text-xs uppercase tracking-wider px-4 sm:px-6 py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,243,255,0.3)] cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Prompt Models for Reflection</span>
              </button>
            </div>
          )}

          {/* Active Generation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeParticipants.map(p => {
              const text = reflections[p.id];
              const loading = isGenerating[p.id];
              const completed = completedSeats[p.id];
              const memories = storedChairMemories[p.id] || [];
              const overrules = storedChairOverrules[p.id] || [];
              const relational = storedChairRelational[p.id] || {};

              return (
                <div 
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    completed 
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                      : loading 
                        ? 'bg-[#00f3ff]/10 border-[#00f3ff]/50 animate-pulse shadow-[0_0_25px_rgba(0,243,255,0.15)]' 
                        : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div>
                    {/* Seat Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <img src={p.avatarUrl} alt={p.name} className="w-7 h-7 rounded-full border border-white/20" />
                        <div>
                          <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="text-[9px] text-[#00f3ff] bg-[#00f3ff]/10 px-1.5 py-0.5 rounded border border-[#00f3ff]/20">
                              Seat #{p.id}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-white/40 block truncate max-w-[180px]">
                            Engine: {p.modelId || 'Frontier LLM'}
                          </span>
                        </div>
                      </div>

                      <div>
                        {loading && (
                          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#00f3ff] uppercase font-bold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Reflecting...
                          </span>
                        )}
                        {completed && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 uppercase font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Saved to Memory
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reflection Body Text */}
                    <div className="bg-black/60 border border-white/5 rounded-xl p-3 min-h-[110px] max-h-[180px] overflow-y-auto text-xs font-mono text-white/90 leading-relaxed custom-scrollbar">
                      {text ? (
                        <p className="whitespace-pre-wrap">{text}</p>
                      ) : loading ? (
                        <div className="flex items-center justify-center h-20 text-white/40 text-[10px] gap-2 uppercase tracking-wider">
                          <Loader2 className="w-4 h-4 animate-spin text-[#00f3ff]" />
                          Generating unedited self-reflection...
                        </div>
                      ) : (
                        <div className="text-white/30 text-[10px] italic flex items-center justify-center h-20 uppercase tracking-widest">
                          Awaiting reflection prompt trigger
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seat Footer & History Count */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/40">
                    <button
                      type="button"
                      onClick={() => setActiveInspectorSeat(activeInspectorSeat === p.id ? null : p.id)}
                      className="hover:text-[#00f3ff] transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold"
                    >
                      <History className="w-3 h-3 text-[#00f3ff]" />
                      <span>{memories.length} Historical Entries</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[#00ff88]">
                        Queries: {typeof window !== 'undefined' ? localStorage.getItem(`chair_query_count_${p.id}`) || '0' : '0'}/15
                      </span>

                      {memories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearChairMemory(p.id)}
                          className="hover:text-red-400 text-white/30 transition-colors p-1 cursor-pointer"
                          title="Clear Chair History"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inspector Accordion */}
                  {activeInspectorSeat === p.id && (
                    <div className="mt-3 p-3 bg-black/90 border border-[#00f3ff]/40 rounded-xl space-y-3 text-left font-mono shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                      {/* Tab Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5 text-[9px]">
                          <button
                            type="button"
                            onClick={() => setInspectorTab('reflections')}
                            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase cursor-pointer ${
                              inspectorTab === 'reflections' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30' : 'text-white/40 hover:text-white'
                            }`}
                          >
                            <History className="w-3 h-3" />
                            Reflections ({memories.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectorTab('overrules')}
                            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase cursor-pointer ${
                              inspectorTab === 'overrules' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/40 hover:text-white'
                            }`}
                          >
                            <GitBranch className="w-3 h-3" />
                            Doctrine Shifts ({overrules.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectorTab('relational')}
                            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase cursor-pointer ${
                              inspectorTab === 'relational' ? 'bg-[#ff9900]/20 text-[#ff9900] border border-[#ff9900]/30' : 'text-white/40 hover:text-white'
                            }`}
                          >
                            <Users className="w-3 h-3" />
                            Relational Map ({Object.keys(relational).length})
                          </button>
                        </div>

                        <span className="text-[9px] text-white/30 uppercase font-mono">Seat #{p.id} Database</span>
                      </div>

                      {/* TAB 1: REFLECTIONS */}
                      {inspectorTab === 'reflections' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={memorySearchQuery}
                            onChange={(e) => setMemorySearchQuery(e.target.value)}
                            placeholder="Search historical reflections by topic or keyword..."
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-[#00f3ff]/50"
                          />

                          <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {memories.length === 0 ? (
                              <div className="text-[9px] text-white/30 italic p-2">No historical reflections logged for this chair yet.</div>
                            ) : (
                              memories
                                .filter(m => 
                                  !memorySearchQuery || 
                                  m.topic.toLowerCase().includes(memorySearchQuery.toLowerCase()) || 
                                  m.reflection.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
                                  m.modelName.toLowerCase().includes(memorySearchQuery.toLowerCase())
                                )
                                .map((m, idx) => (
                                  <div key={m.id || idx} className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-[10px] space-y-1">
                                    <div className="text-[9px] text-[#00ff88] font-bold flex justify-between">
                                      <span>Entry #{memories.length - idx} &bull; Topic: "{m.topic}"</span>
                                      <span>{new Date(m.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-[8px] text-white/40">Engine: {m.modelName} ({m.modelId})</div>
                                    <p className="text-white/80 line-clamp-4 text-[10px] leading-relaxed select-text font-mono">{m.reflection}</p>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 2: DOCTRINE SHIFTS & OVERRULES */}
                      {inspectorTab === 'overrules' && (
                        <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-[10px]">
                          {overrules.length === 0 ? (
                            <div className="text-[9px] text-white/30 italic p-2">No precedent overrules or doctrine shifts recorded by this seat occupants yet. Models can use <span className="text-[#00ff88] font-bold">[Overrule: "Entry #X" - reason]</span> during deliberation.</div>
                          ) : (
                            overrules.map((ov, idx) => (
                              <div key={ov.id || idx} className="p-2.5 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg space-y-1">
                                <div className="text-[9px] text-[#00ff88] font-bold flex justify-between">
                                  <span>[DOCTRINE SHIFT / OVERRULE RECORDED]</span>
                                  <span>{new Date(ov.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="text-[8px] text-white/40">Recorded by: {ov.modelName}</div>
                                <p className="text-white/90 text-[10px] leading-relaxed select-text font-mono">{ov.detail}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* TAB 3: RELATIONAL MAP */}
                      {inspectorTab === 'relational' && (
                        <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-[10px]">
                          {Object.keys(relational).length === 0 ? (
                            <div className="text-[9px] text-white/30 italic p-2">No inter-seat relational stances logged by this chair yet. Models can output <span className="text-[#ff9900] font-bold">[Relational Stance -&gt; Seat #Y: "stance"]</span> during deliberation.</div>
                          ) : (
                            Object.entries(relational).map(([targetSeat, stanceObj]: [string, ChairRelationalStance]) => (
                              <div key={targetSeat} className="p-2.5 bg-[#ff9900]/5 border border-[#ff9900]/20 rounded-lg space-y-1">
                                <div className="text-[9px] text-[#ff9900] font-bold flex justify-between">
                                  <span>Stance Toward Seat #{targetSeat}</span>
                                  <span>{new Date(stanceObj.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="text-[8px] text-white/40">Recorded by occupant: {stanceObj.modelName}</div>
                                <p className="text-white/90 text-[10px] leading-relaxed select-text font-mono">{stanceObj.stance}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-5 border-t border-white/10 bg-black/90 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between text-xs font-mono shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="text-white/40 text-[10px] uppercase tracking-wider text-center sm:text-left truncate">
            {allCompleted 
              ? 'All seat self-reflections saved directly to Chair Memory Ledgers.' 
              : 'You can complete session termination at any time.'}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] rounded-xl border border-[#00f3ff]/30 transition-all cursor-pointer font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Export (.md)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-white/10 transition-all cursor-pointer uppercase tracking-wider text-[11px] min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={onCompleteTermination}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 text-[11px] min-h-[44px]"
            >
              <span className="truncate">Complete Session Termination</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
