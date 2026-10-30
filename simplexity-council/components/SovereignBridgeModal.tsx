import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, Layers, CheckCircle2, AlertCircle, Send, Copy, Check, Terminal, Monitor, RefreshCw, Cpu } from 'lucide-react';
import { sovereignBridge, SOVEREIGN_PLATFORMS, SovereignPlatformStatus } from '../services/sovereignBridgeService';
import { Participant, LedgerBlock, NotebookSource } from '../types';

interface SovereignBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeParticipants: Participant[];
  chain: LedgerBlock[];
  activeSources: NotebookSource[];
  continuationPrompt: string;
  onIngestBlock: (participantId: string, content: string) => void;
}

export const SovereignBridgeModal: React.FC<SovereignBridgeModalProps> = ({
  isOpen,
  onClose,
  activeParticipants,
  chain,
  activeSources,
  continuationPrompt,
  onIngestBlock
}) => {
  const [isConnected, setIsConnected] = useState(sovereignBridge.getIsConnected());
  const [tabStatuses, setTabStatuses] = useState<Record<string, boolean>>(sovereignBridge.getTabStatuses());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'instructions'>('cockpit');

  // Manual ingest form state
  const [ingestPlatformId, setIngestPlatformId] = useState('chatgpt');
  const [ingestPayload, setIngestPayload] = useState('');

  useEffect(() => {
    const unsubscribe = sovereignBridge.subscribe((connected, statuses) => {
      setIsConnected(connected);
      setTabStatuses(statuses);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  // Build the turn prompt for a participant
  const getTurnPrompt = (participantId: string) => {
    const sorted = [...activeSources].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeA - timeB;
    });

    const canonicalDocs = sorted.filter(s => s.isCanonical);
    const chronologicalAddenda = sorted.filter(s => !s.isCanonical);

    let prompt = `--- ESTABLISHED FRAMEWORK & REPOSITORY ---\n`;
    if (canonicalDocs.length > 0) {
      prompt += `\n[CURRENT CANONICAL BASELINE]\n` +
        canonicalDocs.map(s => `Document: "${s.name}" (Version: ${s.version || 'Canonical'} | Date: ${s.timestamp})\n${s.content}\n`).join('\n');
    }
    if (chronologicalAddenda.length > 0) {
      prompt += `\n[CHRONOLOGICAL REVISIONS / ADDENDA]\n` +
        chronologicalAddenda.map(s => `Record: "${s.name}" (${s.origin || 'External'} | Date: ${s.timestamp})\n${s.content}\n`).join('\n');
    }

    prompt += `\n--- CONVERSATION RECORD ---\n`;
    prompt += chain.slice(-20).map(b => `[${b.participantId}]: ${b.payload}`).join('\n\n');

    prompt += `\n\nCross-audit checkpoint: Does any statement, assumption, deduction, or interpretation in the preceding round conflict with the established framework, contradict available evidence, misrepresent another participant's assertion, or present an unverified proposition as established? If so, identify the exact statement, the objection, and its evidentiary basis. If no specific objection is found, report NO OBJECTION.\n\nNO OBJECTION must not mean VERIFIED.\n\nThis is your turn.`;

    return prompt;
  };

  const handleCopyPrompt = (id: string) => {
    const prompt = getTurnPrompt(id);
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDispatchTurn = (id: string) => {
    const prompt = getTurnPrompt(id);
    const sent = sovereignBridge.dispatchTurnToPlatform(id, prompt);
    if (!sent) {
      handleCopyPrompt(id);
      sovereignBridge.openPlatformTab(id);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await sovereignBridge.downloadExtensionZip();
    } catch (e) {
      console.error('Failed to download zip:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLaunchConjoined = () => {
    sovereignBridge.launchConjoinedWindow();
  };

  const handleManualIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestPayload.trim()) return;
    onIngestBlock(ingestPlatformId, ingestPayload.trim());
    setIngestPayload('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl border border-[#e6c875]/40 bg-[#04060a] shadow-2xl shadow-[#e6c875]/10 overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6c875]/20 bg-[#070b12]">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/file_000000000c9082309860261c4dec81b8_b7b064da.png" 
              alt="Simplexity" 
              className="w-8 h-8 rounded-full border border-[#e6c875]/50 object-cover" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wider text-[#e6c875] uppercase">
                  Conjoined Sovereign Workspace & Extension Bridge
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  isConnected 
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
                    : 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                }`}>
                  {isConnected ? '● EXTENSION ACTIVE' : '○ EXTENSION STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct zero-API-cost interface across your sovereign Pro accounts in a unified conjoined browser environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-700 bg-slate-900/60 p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('cockpit')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'cockpit' ? 'bg-[#e6c875] text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sovereign Cockpit
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'instructions' ? 'bg-[#e6c875] text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Extension Setup (3 Steps)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Banner */}
        <div className="px-6 py-3 border-b border-slate-800 bg-[#090d16] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchConjoined}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-bold tracking-wide transition-all shadow-lg shadow-cyan-500/10"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>🚀 LAUNCH CONJOINED BROWSER WINDOW</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Opens all 6 sovereign platforms + NotebookLM in a single conjoined Chrome tab group
            </span>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e6c875]/20 hover:bg-[#e6c875]/30 border border-[#e6c875] text-[#e6c875] text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'PACKAGING EXTENSION...' : 'DOWNLOAD CHROME EXTENSION (.ZIP)'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'cockpit' ? (
            <>
              {/* Sovereign Platforms Matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#e6c875] uppercase tracking-wider flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    Sovereign Platform Matrix (6 Frontier Models)
                  </h3>
                  <button
                    onClick={() => sovereignBridge.ping()}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Tab Status</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SOVEREIGN_PLATFORMS.map(p => {
                    const isTabOpen = tabStatuses[p.id] || false;
                    const isCopied = copiedId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="rounded-xl border border-slate-800 bg-[#090e18]/80 hover:border-slate-700 transition-all p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="font-bold text-sm text-white">{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {p.tier}
                              </span>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isTabOpen
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isTabOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                              {isTabOpen ? 'TAB DETECTED' : 'TAB CLOSED'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 mb-4 line-clamp-1">
                            {p.url}
                          </p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => sovereignBridge.openPlatformTab(p.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Open Web Tab</span>
                            </button>

                            <button
                              onClick={() => handleCopyPrompt(p.id)}
                              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors"
                              title="Copy Turn Prompt (Framework + Baseline + Checkpoint)"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDispatchTurn(p.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-[#e6c875]/10 hover:bg-[#e6c875]/20 border border-[#e6c875]/50 text-[#e6c875] text-xs font-semibold transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>⚡ Dispatch Turn via Bridge</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Response Ingestion Form */}
              <div className="rounded-xl border border-slate-800 bg-[#080d16] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#e6c875]" />
                    Manual Ingest Fallback (Paste Any Sovereign Response)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    If using without the extension, paste response text directly into the master ledger
                  </span>
                </div>

                <form onSubmit={handleManualIngest} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400 font-medium">Authoring Sovereign Model:</label>
                    <select
                      value={ingestPlatformId}
                      onChange={e => setIngestPlatformId(e.target.value)}
                      className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#e6c875]"
                    >
                      {SOVEREIGN_PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.tier})</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    value={ingestPayload}
                    onChange={e => setIngestPayload(e.target.value)}
                    placeholder="Paste the output, derivation, or critique generated in your sovereign web tab here..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#e6c875] font-mono leading-relaxed"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!ingestPayload.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e6c875] hover:bg-[#f3d98c] text-black font-bold text-xs disabled:opacity-50 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ingest into Master Ledger</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Setup Instructions Tab */
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 text-xs leading-relaxed">
                <p className="font-semibold text-sm mb-1 text-cyan-300">
                  How the Sovereign Bridge Operates:
                </p>
                The Simplexity Theory extension runs locally in your browser. It injects turn prompts into your open Pro accounts (ChatGPT, Claude, Grok, Gemini, DeepSeek, Kimi) and captures their responses, letting you collaborate across frontier models at <strong>zero API per-token cost</strong>.
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-[#090e18]">
                  <div className="w-8 h-8 rounded-full bg-[#e6c875]/20 border border-[#e6c875] text-[#e6c875] flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Download and Extract the Extension</h4>
                    <p className="text-xs text-slate-400">
                      Click the gold <strong>"Download Chrome Extension (.zip)"</strong> button at the top of this modal. Extract the downloaded zip file into a known folder on your computer (e.g., in your Documents or Projects folder).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-[#090e18]">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Load Unpacked in Chrome / Brave / Edge</h4>
                    <p className="text-xs text-slate-400">
                      Open a new browser tab and navigate to: <code className="px-1.5 py-0.5 rounded bg-black border border-slate-700 text-cyan-300 font-mono">chrome://extensions</code>
                    </p>
                    <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 pt-1">
                      <li>Toggle <strong>Developer mode</strong> ON in the upper-right corner.</li>
                      <li>Click the <strong>Load unpacked</strong> button in the upper-left.</li>
                      <li>Select the unzipped folder containing <code className="text-[#e6c875] font-mono">manifest.json</code>.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-[#090e18]">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Launch the Conjoined Window & Deliberate</h4>
                    <p className="text-xs text-slate-400">
                      Click <strong>"Launch Conjoined Browser Window"</strong>. The extension automatically groups your Simplexity Cockpit, ChatGPT, Claude, Grok, Gemini, DeepSeek, Kimi, and NotebookLM into a single conjoined window with live tab detection and automated turn routing!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#070b12] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Simplexity Theory Council Bridge</span>
            <span>•</span>
            <span>Manifest V3</span>
            <span>•</span>
            <span className="text-[#e6c875]">Zero API Per-Token Overhead</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
