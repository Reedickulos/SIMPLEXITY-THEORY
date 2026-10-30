import React, { useEffect, useRef, useState } from 'react';
import { LedgerBlock, Participant, NotebookSource } from '../types';
import { 
  Send, X, Hash, Database, Activity, Paperclip, Loader2, Terminal,
  FileText, BookOpen, Plus, Trash2, Check, Sparkles, Volume2, VolumeX,
  Copy, CheckCircle2, Bookmark, Clock, ExternalLink
} from 'lucide-react';
import { parseDocument } from '../utils/documentParser';
import { MarkdownMessage } from './MarkdownMessage';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chain: LedgerBlock[];
  participants: Participant[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
  pendingSearch?: {
    query: string;
    participantId: string;
    blockHash: string;
    status: 'pending' | 'searching' | 'completed' | 'declined';
  } | null;
  onApproveSearch?: () => void;
  onDeclineSearch?: () => void;
  onHaltDeliberation?: () => void;
  
  // Notebook / Repository Sources Props
  notebookSources: NotebookSource[];
  onAddNotebookSource: (source: Omit<NotebookSource, 'id' | 'timestamp'>) => void;
  onToggleNotebookSource: (id: string) => void;
  onToggleCanonicalSource?: (id: string) => void;
  onDeleteNotebookSource: (id: string) => void;

  // Audio Playback Props
  currentlySpeakingBlockId?: string | null;
  onPlayBlockAudio?: (block: LedgerBlock) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  chain, 
  participants, 
  onSendMessage,
  isSending,
  pendingSearch,
  onApproveSearch,
  onDeclineSearch,
  onHaltDeliberation,
  notebookSources,
  onAddNotebookSource,
  onToggleNotebookSource,
  onToggleCanonicalSource,
  onDeleteNotebookSource,
  currentlySpeakingBlockId,
  onPlayBlockAudio
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'notebook'>('ledger');
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Note Creation State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // External Consolidation State (From sovereign tabs: Claude, ChatGPT, Grok, etc.)
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [externalTitle, setExternalTitle] = useState('');
  const [externalOrigin, setExternalOrigin] = useState('Claude Pro');
  const [externalVersion, setExternalVersion] = useState('v1.0');
  const [externalContent, setExternalContent] = useState('');
  const [externalIsCanonical, setExternalIsCanonical] = useState(false);

  // Copy Brief Status Feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  // Source Preview State
  const [previewingSourceId, setPreviewingSourceId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'ledger') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chain, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isUploading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const parsedText = await parseDocument(file);
        
        onAddNotebookSource({
          name: file.name,
          type: 'file',
          content: parsedText,
          size: formatBytes(file.size),
          isActive: true
        });
      }
      setActiveTab('notebook');
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getParticipant = (id: string) => participants.find(p => p.id === id);

  if (!isOpen) return null;

  return (
    <div className="w-auto sm:w-[420px] sm:max-w-[420px] bg-black/95 sm:bg-black/90 border border-[#e6c875]/25 flex flex-col fixed sm:absolute left-2 right-2 sm:left-auto sm:right-6 top-2 sm:top-6 bottom-[76px] sm:bottom-28 landscape:max-sm:left-auto landscape:max-sm:right-2 landscape:max-sm:w-[48vw] landscape:max-sm:max-w-[480px] rounded-2xl sm:rounded-3xl z-40 shadow-[0_0_50px_rgba(230,200,117,0.1)] animate-in slide-in-from-right duration-300 backdrop-blur-3xl font-sans pointer-events-auto overflow-hidden">
      
      {/* Header */}
      <div className="h-14 sm:h-16 border-b border-[#e6c875]/20 flex items-center justify-between px-3 sm:px-5 bg-transparent relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e6c875]/10 via-[#00f3ff]/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10 min-w-0 pr-2 flex items-center gap-2.5">
          <img 
            src="/assets/aistudio/file_000000000c9082309860261c4dec81b8_b7b064da.png" 
            alt="Simplexity" 
            className="h-8 w-auto object-contain rounded border border-[#e6c875]/30 shrink-0 shadow-[0_0_8px_rgba(230,200,117,0.2)]" 
          />
          <div className="min-w-0">
            <h2 className="font-mono text-xs sm:text-sm flex items-center gap-1.5 text-white tracking-wider uppercase font-bold truncate">
              <span>SIMPLE<span className="text-[#00f3ff]">X</span>ITY</span>
              <span className="text-[#e6c875] font-serif font-normal">COUNCIL</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e6c875] animate-pulse shadow-[0_0_8px_#e6c875] shrink-0" />
              <p className="text-[8px] sm:text-[9px] text-[#e6c875]/70 font-mono tracking-wider uppercase truncate">
                Eight Dimensions · {chain.length} Turns
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white border border-white/5 relative z-10 shrink-0 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-header Tabs selector */}
      <div className="flex border-b border-white/5 bg-black/30 p-1 sm:p-1.5 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 font-bold cursor-pointer select-none ${
            activeTab === 'ledger' 
              ? 'bg-[#00f3ff]/15 text-[#00f3ff] border border-[#00f3ff]/30 shadow-[0_0_12px_rgba(0,243,255,0.1)]' 
              : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Conversation Ledger</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notebook')}
          className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 font-bold cursor-pointer relative select-none ${
            activeTab === 'notebook' 
              ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_12px_rgba(0,255,136,0.1)]' 
              : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Master Repository</span>
          {notebookSources.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[8px] rounded-full bg-[#00ff88] text-black font-extrabold animate-pulse">
              {notebookSources.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 sm:space-y-5 custom-scrollbar">
        
        {activeTab === 'ledger' && (
          <>
            {chain.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4 py-20">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                  <Database className="w-6 h-6 opacity-50 text-white" />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-mono">Awaiting First Deliberation Entry...</p>
              </div>
            )}
            
            {chain.map((block, idx) => {
              const sender = getParticipant(block.participantId);
              const isMe = block.participantId === 'user';
              const isSpeakingThisBlock = currentlySpeakingBlockId === block.hash;
              
              return (
                <div key={`${block.hash || 'block'}-${idx}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group w-full`}>
                  <div className="flex items-center justify-between w-full mb-1.5 px-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isMe ? 'text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.3)]' : 'text-[#00f3ff] drop-shadow-[0_0_6px_rgba(0,243,255,0.3)]'}`}>
                        {sender?.name || block.participantId}
                      </span>
                      {block.vibe && block.vibe !== 'Neutral' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-white/40 border border-white/10 shrink-0 font-mono tracking-widest uppercase">
                          [{block.vibe}]
                        </span>
                      )}
                    </div>

                    {/* Interactive Audio Control Button per Block */}
                    {onPlayBlockAudio && (
                      <button
                        type="button"
                        onClick={() => onPlayBlockAudio(block)}
                        className={`px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer text-[9px] font-mono ${
                          isSpeakingThisBlock
                            ? 'bg-[#00f3ff]/20 border-[#00f3ff]/50 text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.3)] animate-pulse'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                        title={isSpeakingThisBlock ? "Stop Audio" : "Play Audio for this response"}
                      >
                        {isSpeakingThisBlock ? (
                          <>
                            <VolumeX className="w-3 h-3 text-[#00f3ff]" />
                            <span className="text-[#00f3ff] font-bold uppercase tracking-wider">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-[#00f3ff]" />
                            <span className="uppercase tracking-wider">Audio</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className={`px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[95%] text-xs leading-relaxed relative ${
                    isMe 
                      ? 'bg-[#00ff88]/10 text-[#d4ffe1] border border-[#00ff88]/20 rounded-xl rounded-tr-sm' 
                      : 'bg-[#00f3ff]/5 text-[#d9f6ff] border border-[#00f3ff]/10 rounded-xl rounded-tl-sm'
                  }`}>
                    <MarkdownMessage content={block.payload} />
                  </div>

                  {/* Interactive Inline Pending Search Request Card */}
                  {pendingSearch && pendingSearch.blockHash === block.hash && (
                    <div className="w-[95%] mt-2.5 bg-[#00f3ff]/5 border border-[#00f3ff]/25 rounded-xl p-3.5 space-y-3 shadow-[0_0_20px_rgba(0,243,255,0.05)] animate-in fade-in">
                      <div className="flex items-center gap-2 text-[#00f3ff]">
                        <Activity className={`w-3.5 h-3.5 ${pendingSearch.status === 'searching' ? 'animate-spin' : 'animate-pulse'}`} />
                        <span className="text-[9px] uppercase font-mono tracking-widest font-extrabold">
                          {pendingSearch.status === 'searching' ? 'Querying Google Grounding...' : 'SEARCH AUTHORIZATION REQUESTED'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Target Query:</div>
                        <div className="text-xs font-mono text-white bg-black/60 px-2.5 py-2 rounded border border-white/5 font-semibold">
                          "{pendingSearch.query}"
                        </div>
                      </div>

                      {pendingSearch.status === 'pending' && (
                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              onApproveSearch?.();
                            }}
                            className="flex-1 bg-gradient-to-r from-[#00f3ff] to-[#00ff88] hover:brightness-110 text-black font-extrabold py-2 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              onDeclineSearch?.();
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 py-2 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {pendingSearch.status === 'searching' && (
                        <p className="text-[9px] font-mono text-white/50 animate-pulse text-center pt-1 tracking-wider uppercase">
                          Gathering trusted sources...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cryptographic Hash Indicator */}
                  <div className="mt-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1.5">
                       <Hash className="w-3 h-3 text-white/20" />
                       <span className="text-[9px] font-mono text-white/30 truncate max-w-[120px]" title={block.hash}>
                         {block.hash}
                       </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {activeTab === 'notebook' && (() => {
          // Sort sources in reverse chronological order (newest first for record view)
          const sortedSources = [...notebookSources].sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
          });

          const canonicalSource = sortedSources.find(s => s.isCanonical);
          const nonCanonicalSources = sortedSources.filter(s => !s.isCanonical);

          const handleCopyCanonicalBrief = () => {
            const canonical = canonicalSource || sortedSources[0];
            const canonicalText = canonical 
              ? `=== CURRENT CANONICAL BASELINE ===\nDocument: "${canonical.name}" (Version: ${canonical.version || 'Canonical'} | Date: ${new Date(canonical.timestamp).toLocaleString()})\nAuthor / Origin: ${canonical.origin || 'Consolidated Master Record'}\n\n${canonical.content}\n`
              : `=== CURRENT CANONICAL BASELINE ===\n(No document currently marked canonical in repository.)\n`;

            const briefText = `${canonicalText}
=== CROSS-AUDIT CHECKPOINT ===
Cross-audit checkpoint: Does any statement, assumption, deduction, or interpretation in the preceding round conflict with the established framework, contradict available evidence, misrepresent another participant's assertion, or present an unverified proposition as established? If so, identify the exact statement, the objection, and its evidentiary basis. If no specific objection is found, report NO OBJECTION.

NO OBJECTION must not mean VERIFIED.

This is your turn.`;

            if (navigator.clipboard) {
              navigator.clipboard.writeText(briefText).then(() => {
                setCopyFeedback('Canonical Brief Copied!');
                setTimeout(() => setCopyFeedback(null), 3000);
              }).catch(err => {
                console.error('Failed to copy brief:', err);
              });
            }
          };

          const handleExportToNotebookLM = () => {
            let compiled = `# THEORETICAL FRAMEWORK KNOWLEDGE SOURCE FOR NOTEBOOKLM\nGenerated: ${new Date().toLocaleString()}\n\n`;

            if (canonicalSource) {
              compiled += `## CURRENT CANONICAL BASELINE: ${canonicalSource.name} (${canonicalSource.version || 'Canonical'})\nDate: ${new Date(canonicalSource.timestamp).toLocaleString()}\nOrigin: ${canonicalSource.origin || 'Master Record'}\n\n${canonicalSource.content}\n\n---\n\n`;
            }

            if (nonCanonicalSources.length > 0) {
              compiled += `## CHRONOLOGICAL REVISIONS & REPOSITORY DOCUMENTS\n\n`;
              nonCanonicalSources.forEach(doc => {
                compiled += `### Document: ${doc.name} (${doc.version || 'Draft'})\nOrigin: ${doc.origin || doc.type} | Date: ${new Date(doc.timestamp).toLocaleString()}\n\n${doc.content}\n\n---\n\n`;
              });
            }

            if (chain.length > 0) {
              compiled += `## RECENT DELIBERATION RECORD\n\n`;
              chain.slice(-25).forEach(block => {
                compiled += `**[${block.participantId}]**:\n${block.payload}\n\n`;
              });
            }

            const blob = new Blob([compiled], { type: 'text/markdown;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NotebookLM_Source_${new Date().toISOString().slice(0, 10)}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            if (navigator.clipboard) {
              navigator.clipboard.writeText(compiled);
            }

            setCopyFeedback('Source Exported for NotebookLM!');
            setTimeout(() => setCopyFeedback(null), 3500);
          };

          return (
            <div className="space-y-4">
              
              {/* Top Actions Deck */}
              <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl space-y-3">
                {isConsolidating ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#00f3ff] font-bold flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-[#00f3ff]" />
                      Consolidate External Work
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Origin Platform</label>
                        <select
                          value={externalOrigin}
                          onChange={(e) => setExternalOrigin(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-[#00f3ff]/50"
                        >
                          <option value="Claude Pro">Claude Pro</option>
                          <option value="ChatGPT Canvas">ChatGPT Canvas</option>
                          <option value="ChatGPT Plus">ChatGPT Plus</option>
                          <option value="Grok 3">Grok 3</option>
                          <option value="DeepSeek-R1">DeepSeek-R1</option>
                          <option value="Gemini Advanced">Gemini Advanced</option>
                          <option value="User Synthesis">User Synthesis</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Version Tag</label>
                        <input 
                          type="text" 
                          value={externalVersion}
                          onChange={(e) => setExternalVersion(e.target.value)}
                          placeholder="e.g. v2.1"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-[#00f3ff]/50"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Postulate / Document Title</label>
                      <input 
                        type="text" 
                        value={externalTitle}
                        onChange={(e) => setExternalTitle(e.target.value)}
                        placeholder="e.g. Metric Invariant Formulation"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f3ff]/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Consolidated Content / Derivations</label>
                      <textarea 
                        value={externalContent}
                        onChange={(e) => setExternalContent(e.target.value)}
                        placeholder="Paste output from your external sovereign model session..."
                        rows={6}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f3ff]/50 resize-none custom-scrollbar"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                      <input 
                        type="checkbox"
                        checked={externalIsCanonical}
                        onChange={(e) => setExternalIsCanonical(e.target.checked)}
                        className="rounded border-white/20 bg-black/60 text-[#00ff88] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-[#00ff88] font-bold">
                        Set as Current Canonical Baseline (Active Ground Truth)
                      </span>
                    </label>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (externalContent.trim()) {
                            onAddNotebookSource({
                              name: externalTitle.trim() || `Consolidated from ${externalOrigin}`,
                              type: 'external_consolidation',
                              content: externalContent.trim(),
                              isActive: true,
                              version: externalVersion.trim() || 'v1.0',
                              origin: externalOrigin,
                              isCanonical: externalIsCanonical,
                              size: `${externalContent.trim().length} chars`
                            });
                            setExternalTitle('');
                            setExternalContent('');
                            setIsConsolidating(false);
                          }
                        }}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00f3ff] to-[#00ff88] text-black font-extrabold text-[10px] font-mono uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Commit to Repository
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConsolidating(false)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isAddingNote ? (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#00ff88] font-bold">Create Handwritten Note</div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Note Title</label>
                      <input 
                        type="text" 
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="e.g. Derivation Note"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00ff88]/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Content</label>
                      <textarea 
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Type mathematical notes, questions, or definitions..."
                        rows={5}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00ff88]/50 resize-none custom-scrollbar"
                      />
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (newNoteContent.trim()) {
                            onAddNotebookSource({
                              name: newNoteTitle.trim() || 'Untitled Note',
                              type: 'note',
                              content: newNoteContent.trim(),
                              isActive: true,
                              origin: 'Operator Note',
                              version: 'v1.0',
                              size: `${newNoteContent.trim().length} chars`
                            });
                            setNewNoteTitle('');
                            setNewNoteContent('');
                            setIsAddingNote(false);
                          }
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#00ff88] text-black font-extrabold text-[10px] font-mono uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Save Note
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNoteTitle('');
                          setNewNoteContent('');
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Primary Button: Consolidate External Work */}
                    <button
                      type="button"
                      onClick={() => setIsConsolidating(true)}
                      className="w-full py-2.5 px-3 border border-[#00f3ff]/40 bg-gradient-to-r from-[#00f3ff]/15 to-[#00ff88]/15 hover:from-[#00f3ff]/25 hover:to-[#00ff88]/25 rounded-xl text-[10px] font-mono tracking-widest uppercase text-white flex items-center justify-center gap-2 transition-all cursor-pointer font-bold shadow-[0_0_15px_rgba(0,243,255,0.15)]"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#00f3ff]" />
                      Consolidate External Work
                    </button>

                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCanonicalBrief}
                        className={`flex-1 py-2 px-2.5 border rounded-xl text-[9px] font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
                          copyFeedback 
                            ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.3)]' 
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/90 hover:text-white'
                        }`}
                        title="Copy current canonical baseline + cross-audit checkpoint to paste into Claude, ChatGPT, or Grok"
                      >
                        {copyFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5 text-[#00ff88]" />}
                        <span className="truncate">{copyFeedback || 'Copy Canonical Brief'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-3 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-[9px] font-mono tracking-wider uppercase text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Upload document file"
                      >
                        <Paperclip className="w-3 h-3 text-[#00f3ff]" />
                        Upload
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAddingNote(true)}
                        className="py-2 px-3 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-[9px] font-mono tracking-wider uppercase text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Add handwritten note"
                      >
                        <Plus className="w-3 h-3 text-[#00ff88]" />
                        Note
                      </button>
                    </div>

                    {/* NotebookLM Direct Knowledge Integration */}
                    <div className="flex gap-2 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={handleExportToNotebookLM}
                        className="flex-1 py-1.5 px-2 border border-[#00f3ff]/25 bg-[#00f3ff]/5 hover:bg-[#00f3ff]/15 rounded-lg text-[8px] font-mono tracking-widest uppercase text-[#00f3ff] hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
                        title="Compile and copy canonical knowledge package for NotebookLM"
                      >
                        <Sparkles className="w-3 h-3 text-[#00f3ff]" />
                        Export to NotebookLM
                      </button>

                      <a
                        href="https://notebooklm.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] rounded-lg text-[8px] font-mono tracking-widest uppercase text-white/60 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Open NotebookLM in new tab"
                      >
                        <span>NotebookLM</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Chronological Repository Stream */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex justify-between items-center px-1">
                  <span>Chronological Record</span>
                  <span>{sortedSources.length} Total Records</span>
                </div>

                {sortedSources.length === 0 ? (
                  <div className="border border-dashed border-white/10 p-8 rounded-2xl text-center text-white/30 space-y-2">
                    <Clock className="w-7 h-7 mx-auto opacity-30 text-[#00f3ff]" />
                    <p className="text-[10px] font-mono leading-relaxed max-w-[240px] mx-auto uppercase">
                      Repository is empty. Consolidate work or add notes to establish the canonical baseline.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Pinned Current Canonical Baseline */}
                    {canonicalSource && (
                      <div className="p-3.5 border border-[#00ff88]/50 bg-[#00ff88]/10 rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.12)] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
                            <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#00ff88]">
                              Active Canonical Baseline
                            </span>
                          </div>
                          {canonicalSource.version && (
                            <span className="px-1.5 py-0.5 rounded bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88] text-[8px] font-mono font-bold uppercase">
                              {canonicalSource.version}
                            </span>
                          )}
                        </div>

                        <div 
                          onClick={() => setPreviewingSourceId(canonicalSource.id)}
                          className="cursor-pointer group"
                        >
                          <h4 className="text-xs font-mono font-bold text-white group-hover:text-[#00ff88] transition-colors truncate">
                            {canonicalSource.name}
                          </h4>
                          <p className="text-[9px] font-mono text-white/50 mt-0.5 flex items-center gap-2">
                            <span>Origin: {canonicalSource.origin || 'Master'}</span>
                            <span>•</span>
                            <span>{new Date(canonicalSource.timestamp).toLocaleDateString()}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#00ff88]/20 text-[9px] font-mono">
                          <button
                            type="button"
                            onClick={() => onToggleCanonicalSource?.(canonicalSource.id)}
                            className="text-[#00ff88] hover:underline cursor-pointer"
                          >
                            Canonical Active ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewingSourceId(canonicalSource.id)}
                            className="text-white/60 hover:text-white cursor-pointer"
                          >
                            Inspect &amp; Copy →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Chronological History / Non-Canonical Items */}
                    {nonCanonicalSources.map((source) => (
                      <div 
                        key={source.id}
                        className={`p-3 border rounded-2xl transition-all flex items-center justify-between gap-3 bg-black/40 ${
                          source.isActive 
                            ? 'border-white/15 hover:border-white/30' 
                            : 'border-white/5 opacity-50 hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Active toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleNotebookSource(source.id)}
                            className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                              source.isActive 
                                ? 'bg-[#00f3ff] border-[#00f3ff] text-black' 
                                : 'border-white/30 bg-transparent hover:border-[#00f3ff]/50'
                            }`}
                            title={source.isActive ? "Active in Deliberation Context" : "Muted from Deliberation Context"}
                          >
                            {source.isActive && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div 
                            onClick={() => setPreviewingSourceId(source.id)}
                            className="min-w-0 flex-1 cursor-pointer select-none group/title"
                            title="Click to preview content"
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {source.type === 'file' ? (
                                <FileText className="w-3.5 h-3.5 text-[#00f3ff] shrink-0" />
                              ) : source.type === 'external_consolidation' ? (
                                <Bookmark className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              ) : (
                                <BookOpen className="w-3.5 h-3.5 text-[#00ff88] shrink-0" />
                              )}
                              <span className="text-xs font-mono font-bold text-white truncate group-hover/title:text-[#00f3ff] transition-colors">
                                {source.name}
                              </span>
                              {source.version && (
                                <span className="px-1 py-0.2 rounded bg-white/5 text-white/50 text-[8px] font-mono shrink-0">
                                  {source.version}
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] font-mono text-white/40 flex items-center gap-2">
                              <span>{source.origin || source.type}</span>
                              <span>•</span>
                              <span>{new Date(source.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onToggleCanonicalSource && (
                            <button
                              type="button"
                              onClick={() => onToggleCanonicalSource(source.id)}
                              className="px-2 py-1 bg-white/5 hover:bg-[#00ff88]/20 hover:text-[#00ff88] text-white/40 text-[8px] font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                              title="Promote to Current Canonical Baseline"
                            >
                              Make Baseline
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteNotebookSource(source.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

      </div>

      {/* Source Preview Overlay Panel */}
      {previewingSourceId && (() => {
        const src = notebookSources.find(s => s.id === previewingSourceId);
        if (!src) return null;
        return (
          <div className="absolute inset-0 bg-black/95 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-[#00ff88]/10 to-transparent">
              <div className="min-w-0 flex-1 pr-4">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#00ff88] mb-0.5 font-bold">Previewing Notebook Source</div>
                <h3 className="text-xs font-mono font-bold text-white truncate">{src.name}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewingSourceId(null)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-white/70 select-text whitespace-pre-wrap selection:bg-[#00f3ff]/30 custom-scrollbar">
              {src.content}
            </div>
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-[10px] text-white/40 font-mono shrink-0">
              <span>Type: {src.type === 'file' ? 'Uploaded Document' : 'Written Note'}</span>
              <span>Size: {src.size || `${src.content.length} characters`}</span>
            </div>
          </div>
        );
      })()}

      {/* Interruption & Directing Banner when Agents are active */}
      {isSending && (
        <div className="mx-2.5 sm:mx-4 mb-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-[10px] sm:text-[11px] font-sans tracking-wide animate-pulse shrink-0">
          <div className="flex items-center gap-2 text-red-400 min-w-0 pr-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="truncate font-semibold">Council Deliberating...</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onHaltDeliberation?.();
            }}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-[8px] sm:text-[9px] rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.4)] active:scale-[0.98] cursor-pointer font-sans whitespace-nowrap shrink-0"
          >
            Halt &amp; Intervene
          </button>
        </div>
      )}

      {/* Input controls form (Ledger message posting / standard input) */}
      <form onSubmit={handleSubmit} className="p-2 sm:p-3.5 border-t border-white/10 bg-black/80 backdrop-blur-xl relative z-10 shrink-0">
        <input 
          type="file" 
          multiple
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf,.docx,.doc,.txt,.md,.csv,.json,.rtf,.gdoc,.ipynb,.py,.jpg,.jpeg,.png" 
        />
        <div className={`relative flex items-center bg-[#111] border rounded-xl p-1 transition-colors ${
          isSending ? 'border-red-500/30 focus-within:border-red-500/60' : 'border-white/10 focus-within:border-[#00f3ff]/50'
        }`}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 sm:p-2.5 text-white/40 hover:text-[#00ff88] disabled:opacity-50 transition-colors"
            title="Upload Document"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-[#00f3ff]" /> : <Paperclip className="w-4 h-4" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isUploading ? "Uploading document..." : (isSending ? "Interrupt with counter-argument..." : "Contribute to discussion...")}
            disabled={isUploading}
            className={`w-full bg-transparent px-2 py-2 focus:outline-none text-xs font-sans tracking-normal disabled:opacity-50 ${
              isSending ? 'text-red-300 placeholder-red-500/40' : 'text-white placeholder-white/30'
            }`}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isUploading}
            className={`p-2 sm:p-2.5 mx-1 rounded-lg transition-all duration-300 disabled:opacity-50 font-bold cursor-pointer select-none shrink-0 ${
              isSending 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-gradient-to-r from-[#00f3ff] to-[#00ff88] text-black hover:scale-105 hover:brightness-110 shadow-[0_0_12px_rgba(0,243,255,0.4)]'
            }`}
            title={isSending ? "Interrupt and send rebuttal" : "Send message"}
          >
            {isSending ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </form>

    </div>
  );
};
