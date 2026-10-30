import React, { useState, useMemo, useCallback } from 'react'
import { X, FileText, Download, Printer, Copy, Check, Info, Upload, Cpu, Terminal, ExternalLink, HardDrive, Loader2 } from 'lucide-react'
import { Participant, LedgerBlock } from '../types'

interface ExportModalProps {
    isOpen: boolean
    onClose: () => void
    activeParticipants: Participant[]
    chain: LedgerBlock[]
    currentTopic: string
    onImportSession?: (importedChain: LedgerBlock[], importedTopic: string, importedConversationId: string) => void
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    activeParticipants,
    chain,
    currentTopic,
    onImportSession,
}) => {
    const [copied, setCopied] = useState(false)
    const [activeFormat, setActiveFormat] = useState<'text' | 'markdown'>('text')
    const [mainTab, setMainTab] = useState<'export' | 'portability'>('export')

    // 1. Generate Plain Text Report
    const plainTextReport = useMemo(() => {
        const sessionTopic = currentTopic || 'Unified Collaboration'
        const totalBlocks = chain.length
        const sessionDate = new Date().toLocaleString()
        const sessionId = chain[0]?.conversationId || 'N/A'
        
        let report = `========================================================\n`
        report += `                     SEMA EPISTEMIC LEDGER              \n`
        report += `========================================================\n`
        report += `Discussion Topic : ${sessionTopic}\n`
        report += `Session ID       : ${sessionId}\n`
        report += `Date             : ${sessionDate}\n`
        report += `Total Blocks     : ${totalBlocks}\n`
        report += `========================================================\n\n`
        
        report += `--- ACTIVE PARTICIPANTS DIRECTORY ---\n`
        report += [...activeParticipants].map(p => {
          return `* ${p.name} (${p.role}) - Model: ${p.modelId || 'Client / User'}`
        }).join('\n') + `\n\n`
        
        report += `--- CONVERSATION CHRONOLOGICAL RECORD ---\n\n`
        
        chain.forEach(block => {
          const sender = activeParticipants.find(p => p.id === block.participantId);
          const senderName = sender ? sender.name : block.participantId;
          const senderRole = sender ? sender.role : 'Observer / Agent';
          const formattedTime = new Date(block.timestamp).toLocaleTimeString();
          
          report += `[BLOCK #${block.ledgerIndex}] ${senderName} (${senderRole})\n`
          report += `Time: ${formattedTime}\n`
          report += `Content:\n${block.payload}\n`
          report += `H:  ${block.hash}\n`
          report += `PH: ${block.previousHash || 'GENESIS BLOCK'}\n`
          report += `--------------------------------------------------------\n\n`
        })
        
        report += `\n[End of Ledger Record]`
        return report
    }, [chain, activeParticipants, currentTopic])

    // 2. Generate Markdown Report
    const markdownReport = useMemo(() => {
        const sessionTopic = currentTopic || 'Unified Collaboration'
        const totalBlocks = chain.length
        const sessionDate = new Date().toLocaleString()
        const sessionId = chain[0]?.conversationId || 'N/A'
        
        let md = `# SEMA Ledger Report\n\n`
        md += `* **Discussion Topic:** ${sessionTopic}\n`
        md += `* **Session ID:** \`${sessionId}\`\n`
        md += `* **Date/Time:** ${sessionDate}\n`
        md += `* **Total Chain Blocks:** ${totalBlocks}\n\n`
        
        md += `## Active Participants Directory\n\n`
        activeParticipants.forEach(p => {
          md += `* **${p.name}** (${p.role}) - Model: \`${p.modelId || 'Client / User'}\`\n`
        })
        
        md += `\n---\n\n`
        md += `## Conversation Chronological Record\n\n`
        
        chain.forEach(block => {
          const sender = activeParticipants.find(p => p.id === block.participantId);
          const senderName = sender ? sender.name : block.participantId;
          const senderRole = sender ? sender.role : 'Observer / Agent';
          const formattedTime = new Date(block.timestamp).toLocaleTimeString();
          
          md += `### Block #${block.ledgerIndex}: ${senderName} (${senderRole})\n`
          md += `*Time: ${formattedTime}*\n\n`
          md += `> ${block.payload.replace(/\n/g, '\n> ')}\n\n`
          md += `* **Current Block Hash:** \`${block.hash}\`\n`
          md += `* **Previous Block Hash:** \`${block.previousHash || 'GENESIS BLOCK'}\`\n\n`
          md += `---\n\n`
        })
        
        md += `_End of Immutable Ledger Report_\n`
        return md
    }, [chain, activeParticipants, currentTopic])

    // Export TXT download handler
    const handleDownloadTxt = useCallback(() => {
        const blob = new Blob([plainTextReport], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ledger-report-${new Date().toISOString().slice(0, 10)}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [plainTextReport])

    // Export MD download handler
    const handleDownloadMarkdown = useCallback(() => {
        const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ledger-report-${new Date().toISOString().slice(0, 10)}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [markdownReport])

    // Copy active text representation to clipboard
    const handleCopyText = useCallback(() => {
        const textToCopy = activeFormat === 'text' ? plainTextReport : markdownReport
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [activeFormat, plainTextReport, markdownReport])

    // Print PDF style window writer
    const handlePrintPdf = useCallback(() => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            // Popup blocker notification
            alert("Popup window blocked. Please allow popups for this site, or use the direct 'Download TXT' or 'Download Markdown' buttons below!")
            return
        }

        const sessionTopic = currentTopic || 'Unified Collaboration'
        const totalBlocks = chain.length
        const sessionDate = new Date().toLocaleString()
        const sessionId = chain[0]?.conversationId || 'N/A'

        const blocksHtml = chain.map((block) => {
            const sender = activeParticipants.find(p => p.id === block.participantId)
            const senderName = sender ? sender.name : block.participantId
            const senderRole = sender ? sender.role : 'Observer'
            const senderModel = sender?.modelId ? `[${sender.modelId}]` : ''
            const formattedTime = new Date(block.timestamp).toLocaleTimeString()
            const textStyled = block.payload
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br />')

            const isUser = block.participantId === 'user'
            const cardBorderColor = isUser ? '#cbd5e1' : '#ffedd5'
            const roleColor = isUser ? '#475569' : '#c2410c'

            return `
                <div class="block-card" style="border-left: 4px solid ${isUser ? '#64748b' : '#f97316'};">
                  <div class="block-header">
                    <div class="sender-info">
                      <span class="sender-name">${senderName}</span>
                      <span class="sender-role" style="color: ${roleColor}; border-color: ${cardBorderColor};">${senderRole} ${senderModel}</span>
                    </div>
                    <div class="metadata">
                      <span>INDEX: #${block.ledgerIndex}</span>
                      <span>TIME: ${formattedTime}</span>
                    </div>
                  </div>
                  <div class="payload">${textStyled}</div>
                  <div class="crypto-footer">
                    <div><span class="label">CURRENT HASH:</span> ${block.hash}</div>
                    <div><span class="label">PREVIOUS HASH:</span> ${block.previousHash || 'GENESIS BLOCK'}</div>
                  </div>
                </div>
            `
        }).join('')

        const participantLegend = activeParticipants.map(p => `
            <div class="p-badge">
              <strong>${p.name}</strong> (${p.role}) - <span class="mono">${p.modelId || 'Client / User'}</span>
            </div>
        `).join('')

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>CORELAB Ledger - Export</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
                <style>
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        color: #1e293b;
                        background-color: #ffffff;
                        line-height: 1.5;
                        padding: 40px;
                    }
                    .mono {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        color: #475569;
                    }
                    header {
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 24px;
                        margin-bottom: 30px;
                    }
                    .title-area {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 700;
                        letter-spacing: -0.02em;
                        text-transform: uppercase;
                        color: #0f172a;
                    }
                    .subtitle {
                        font-size: 11px;
                        color: #f97316;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        margin-top: 4px;
                    }
                    .session-meta-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                        margin-top: 24px;
                        background-color: #f8fafc;
                        border: 1px solid #f1f5f9;
                        border-radius: 12px;
                        padding: 16px;
                        font-size: 12px;
                    }
                    .meta-item strong {
                        color: #475569;
                        text-transform: uppercase;
                        font-size: 10px;
                        letter-spacing: 0.05em;
                    }
                    .meta-item p {
                        font-size: 13px;
                        color: #0f172a;
                        font-weight: 500;
                        margin-top: 2px;
                    }
                    .legend-title {
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #64748b;
                        margin-top: 20px;
                        margin-bottom: 8px;
                    }
                    .legend-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                    .p-badge {
                        background: #f1f5f9;
                        border: 1px solid #cbd5e1;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 11px;
                        color: #334155;
                    }
                    .ledger-container {
                        margin-top: 20px;
                    }
                    .block-card {
                        background-color: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                    }
                    .block-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 12px;
                        margin-bottom: 14px;
                    }
                    .sender-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .sender-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: #0f172a;
                    }
                    .sender-role {
                        font-size: 10px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.03em;
                        background-color: #f8fafc;
                        border: 1px solid #cbd5e1;
                        padding: 2px 8px;
                        border-radius: 4px;
                    }
                    .block-header .metadata {
                        display: flex;
                        gap: 12px;
                        font-size: 11px;
                        font-weight: 600;
                        color: #64748b;
                    }
                    .payload {
                        font-size: 13px;
                        color: #334155;
                        line-height: 1.6;
                        white-space: pre-wrap;
                    }
                    .crypto-footer {
                        margin-top: 16px;
                        padding-top: 12px;
                        border-top: 1px dashed #e2e8f0;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        color: #64748b;
                    }
                    .crypto-footer .label {
                        font-weight: 700;
                        color: #94a3b8;
                    }
                    .print-notice {
                        background-color: #fffbeb;
                        border: 1px solid #fef3c7;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 24px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .print-notice p {
                        font-size: 12px;
                        color: #b45309;
                    }
                    .btn-print {
                        background-color: #f97316;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .btn-print:hover {
                        background-color: #ea580c;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .print-notice {
                            display: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-notice">
                    <p>
                        This ledger summary has been formatted in <strong>PDF style</strong>. Use your browser's print options to <strong>"Save as PDF"</strong>.
                    </p>
                    <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
                </div>

                <header>
                    <div class="title-area">
                        <div>
                            <h1>CORELAB Ledger</h1>
                            <div class="subtitle">IMMUTABLE ARCHITECTURE EXCHANGE REPORT</div>
                        </div>
                        <div class="mono" style="text-align: right;">
                            EXPORT DATE: ${new Date().toLocaleDateString()}<br>
                            LEDGER SIGNATURE: VALIDATED_SECURE
                        </div>
                    </div>

                    <div class="session-meta-grid">
                        <div class="meta-item">
                            <strong>Discussion Topic</strong>
                            <p>${sessionTopic}</p>
                        </div>
                        <div class="meta-item">
                            <strong>Session ID (Conversation Hash)</strong>
                            <p class="mono">${sessionId}</p>
                        </div>
                        <div class="meta-item">
                            <strong>Total Blocks in Chain</strong>
                            <p>${totalBlocks} Ledger Blocks</p>
                        </div>
                        <div class="meta-item">
                            <strong>Export Timestamp</strong>
                            <p>${sessionDate}</p>
                        </div>
                    </div>

                    <div class="legend-title">ACTIVE COUNCIL SEATS DIRECTORY</div>
                    <div class="legend-grid">
                        ${participantLegend}
                    </div>
                </header>

                <main class="ledger-container">
                    ${blocksHtml}
                </main>

                <footer style="margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    End of Immutable Ledger Report. Generated by CORELAB.
                </footer>

                <script>
                    window.addEventListener('DOMContentLoaded', () => {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    });
                </script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }, [chain, activeParticipants, currentTopic])

    // Export complete session state as JSON for portability
    const handleDownloadJson = useCallback(() => {
        const backupData = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            topic: currentTopic || 'General Collaboration',
            conversationId: chain[0]?.conversationId || 'N/A',
            chain: chain,
            participants: activeParticipants
        }
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `corelab-session-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [chain, activeParticipants, currentTopic])

    // Import session state from JSON backup
    const handleImportJsonFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string
                const data = JSON.parse(text)
                
                if (!data.chain || !Array.isArray(data.chain)) {
                    alert("Invalid session backup file. Missing 'chain' array.")
                    return
                }

                if (onImportSession) {
                    onImportSession(data.chain, data.topic || '', data.conversationId || '')
                    alert("Session successfully restored! The Council ledger has been loaded and you are ready to resume your discussion.");
                    onClose();
                } else {
                    alert("The import feature is not available in the current view.")
                }
            } catch (err) {
                alert("Failed to parse JSON file. Ensure it is a valid CORELAB session backup.")
            }
        }
        reader.readAsText(file)
    }, [onImportSession, onClose])

    if (!isOpen) return null

    const currentFormattedReport = activeFormat === 'text' ? plainTextReport : markdownReport

    return (
        <div id="export-modal" className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-2 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in fade-in duration-200">
            <div className="bg-[#0b0c10] border border-white/10 rounded-[24px] sm:rounded-[32px] w-full max-w-4xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] h-full sm:h-[85vh] flex flex-col shadow-[0_0_80px_rgba(255,100,0,0.15)] overflow-hidden relative">
                
                {/* Atmospheric glow inside export modal */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
                   background: mainTab === 'export' ? 'radial-gradient(circle at 50% 10%, #ff4e00 0%, transparent 60%)' : 'radial-gradient(circle at 50% 10%, #00f3ff 0%, transparent 60%)',
                   filter: 'blur(100px)'
                }}></div>

                {/* Header */}
                <div className="p-4 sm:p-8 pb-3 sm:pb-4 relative z-10 bg-black/40 flex items-center justify-between shrink-0">
                    <div className="min-w-0 pr-2">
                        <h2 className="text-base sm:text-xl font-serif font-light text-white tracking-wider truncate">SESSION HUB &amp; STANDALONE</h2>
                        <p className="text-[9px] sm:text-[11px] text-white/50 tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-0.5 truncate">Export report logs, backup whole sessions, or set up a local standalone instance.</p>
                    </div>
                    <button
                        id="close-export-modal-btn"
                        onClick={onClose}
                        className="p-2 sm:p-3 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10 border border-transparent hover:border-white/10 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-white/10 relative z-10 px-4 sm:px-8 bg-black/20 shrink-0 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setMainTab('export')}
                        className={`py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-mono uppercase tracking-widest border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${mainTab === 'export' ? 'border-[#ff4e00] text-white' : 'border-transparent text-white/40 hover:text-white/80'}`}
                    >
                        Report Export
                    </button>
                    <button
                        type="button"
                        onClick={() => setMainTab('portability')}
                        className={`py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-mono uppercase tracking-widest border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${mainTab === 'portability' ? 'border-[#00f3ff] text-white' : 'border-transparent text-white/40 hover:text-white/80'}`}
                    >
                        Session Portability &amp; Standalone Guide
                    </button>
                </div>

                {/* Main panel */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10 bg-[#0c0d12]">
                    {mainTab === 'export' ? (
                        <>
                            {/* Left Actions column */}
                            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 p-6 space-y-4 shrink-0 bg-black/20 overflow-y-auto">
                                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">
                                    Available Outputs:
                                </div>

                                {/* Format buttons */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(markdownReport);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 text-xs font-mono uppercase text-left tracking-widest text-white/90 hover:text-white bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 border border-[#00f3ff]/30 hover:border-[#00f3ff]/60 rounded-2xl transition-all cursor-pointer font-bold shadow-[0_0_20px_rgba(0,243,255,0.1)]"
                                >
                                    {copied ? (
                                        <Check size={18} className="text-[#00ff88]" />
                                    ) : (
                                        <Copy size={18} className="text-[#00f3ff]" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold text-[11px] text-[#00f3ff]">
                                            {copied ? 'Report Copied to Clipboard!' : 'Copy for NotebookLM / Docs'}
                                        </div>
                                        <div className="text-[8px] text-white/50 uppercase mt-0.5 font-sans tracking-tight">Structured Markdown ready to paste</div>
                                    </div>
                                    <ExternalLink size={14} className="text-[#00f3ff]" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadTxt}
                                    className="w-full flex items-center gap-4 p-4 text-xs font-mono uppercase text-left tracking-widest text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/25 rounded-2xl transition-all cursor-pointer"
                                >
                                    <FileText size={18} className="text-orange-400 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-[11px]">Download as TXT</div>
                                        <div className="text-[8px] text-white/45 uppercase mt-0.5 font-sans tracking-tight">Plain readable text format</div>
                                    </div>
                                    <Download size={14} className="opacity-40" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadMarkdown}
                                    className="w-full flex items-center gap-4 p-4 text-xs font-mono uppercase text-left tracking-widest text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/25 rounded-2xl transition-all cursor-pointer"
                                >
                                    <FileText size={18} className="text-blue-400" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-[11px]">Download as Markdown</div>
                                        <div className="text-[8px] text-white/45 uppercase mt-0.5 font-sans tracking-tight">Format ready for Wiki/Obsidian</div>
                                    </div>
                                    <Download size={14} className="opacity-40" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePrintPdf}
                                    className="w-full flex items-center gap-4 p-4 text-xs font-mono uppercase text-left tracking-widest text-white/80 hover:text-white bg-white/5 hover:bg-orange-600/[0.15] border border-white/5 hover:border-orange-500/35 rounded-2xl transition-all cursor-pointer"
                                >
                                    <Printer size={18} className="text-[#f97316]" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-[11px]">Save / Print PDF</div>
                                        <div className="text-[8px] text-white/45 uppercase mt-0.5 font-sans tracking-tight">High resolution printing view</div>
                                    </div>
                                    <Printer size={14} className="opacity-40" />
                                </button>

                                {/* Mobile and WebView helper banner */}
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
                                    <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
                                    <div className="text-[9.5px] leading-relaxed text-white/50 lowercase font-light">
                                        <strong className="uppercase text-[8px] text-white/70 block mb-1">Android & WebView Notice:</strong>
                                        If window popup PDF saves are blocked in your Android App wrap/WebView, please download the TXT or Markdown formats or use the **instant copy console** on the right!
                                    </div>
                                </div>
                            </div>

                            {/* Right Instant Copy / Verification column */}
                            <div className="flex-1 p-6 flex flex-col min-h-0 bg-black/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Instant Copy Center</span>
                                        <div className="flex gap-1.5 bg-black/40 border border-white/5 rounded-full p-0.5">
                                            <button 
                                                type="button"
                                                onClick={() => setActiveFormat('text')}
                                                className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeFormat === 'text' ? 'bg-orange-600/80 text-white' : 'text-white/40'}`}
                                            >
                                                TXT
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setActiveFormat('markdown')}
                                                className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeFormat === 'markdown' ? 'bg-orange-600/80 text-white' : 'text-white/40'}`}
                                            >
                                                Markdown
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCopyText}
                                        className={`flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase font-bold tracking-wider text-white transition-all cursor-pointer ${copied ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'hover:bg-white/10'}`}
                                    >
                                        {copied ? <Check size={10} /> : <Copy size={10} />}
                                        {copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}
                                    </button>
                                </div>

                                {/* Text console */}
                                <div className="flex-1 bg-[#050608] border border-white/10 rounded-2xl relative min-h-0 overflow-y-auto">
                                    <textarea
                                        readOnly
                                        value={currentFormattedReport}
                                        className="absolute inset-0 w-full h-full p-4 text-[10px] text-white/80 bg-transparent border-none focus:outline-none resize-none font-mono leading-relaxed"
                                    />
                                </div>
                                <p className="text-[9px] text-white/30 text-right mt-2 uppercase font-medium tracking-wide">
                                    Highlight with cursor or finger directly for Android clipboard transfer.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Left Column: Import/Export JSON */}
                            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 p-6 space-y-6 shrink-0 bg-black/20 overflow-y-auto">
                                <div>
                                    <div className="text-[10px] font-bold text-[#00f3ff] uppercase tracking-widest block mb-1">
                                        Export State:
                                    </div>
                                    <p className="text-[9px] text-white/50 lowercase leading-relaxed mb-3">
                                        download the entire session's state (topic, ledger index, active model details) as a portable json backup file.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleDownloadJson}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-mono uppercase text-left tracking-widest text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/25 rounded-2xl transition-all cursor-pointer"
                                    >
                                        <Cpu size={18} className="text-[#00f3ff] animate-pulse" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-[11px]">Download JSON</div>
                                            <div className="text-[8px] text-white/45 uppercase mt-0.5 font-sans tracking-tight">Full session config backup</div>
                                        </div>
                                        <Download size={14} className="opacity-40" />
                                    </button>
                                </div>

                                <div className="border-t border-white/5 pt-4">
                                    <div className="text-[10px] font-bold text-[#00ff88] uppercase tracking-widest block mb-1">
                                        Import State:
                                    </div>
                                    <p className="text-[9px] text-white/50 lowercase leading-relaxed mb-3">
                                        upload a previously exported .json file to resume your exact conversation state instantly.
                                    </p>
                                    <label className="w-full flex items-center gap-4 p-4 text-xs font-mono uppercase text-left tracking-widest text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/25 rounded-2xl transition-all cursor-pointer">
                                        <Upload size={18} className="text-[#00ff88]" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-[11px]">Upload JSON</div>
                                            <div className="text-[8px] text-white/45 uppercase mt-0.5 font-sans tracking-tight">Select corelab-session.json</div>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImportJsonFile}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
                                    <Info size={16} className="text-[#00f3ff] shrink-0 mt-0.5" />
                                    <div className="text-[9.5px] leading-relaxed text-white/50 lowercase font-light">
                                        <strong className="uppercase text-[8px] text-white/70 block mb-1">Full Portability:</strong>
                                        Use this file to migrate your session between this browser workspace and your local computer run.
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Standalone Instructions */}
                            <div className="flex-1 p-8 flex flex-col min-h-0 bg-black/10 overflow-y-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <Terminal size={16} className="text-[#00f3ff]" />
                                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Standalone Local Run Guide</span>
                                </div>
                                
                                <div className="space-y-6 text-xs text-white/80 font-sans leading-relaxed">
                                    <p>
                                        You can run this exact program completely offline on your computer's hard drive as a standalone application. Since the models run via secure client-side API requests to OpenRouter and Google, you do not need any local GPU hardware or complex backend servers!
                                    </p>

                                    <div className="space-y-4 font-mono text-[10px] uppercase tracking-wider text-white/50">
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                                            <div className="text-[#00f3ff] font-bold mb-2 text-[10px]">1. DOWNLOAD CODE FILES</div>
                                            <p className="text-[11px] font-sans text-white/70 lowercase normal-case mb-2 text-white/70">
                                                Click the **Export/Download ZIP** option from the workspace settings/export menu at the top-right of your AI Studio interface to get the complete codebase.
                                            </p>
                                        </div>

                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                                            <div className="text-[#00ff88] font-bold mb-2 text-[10px]">2. INSTALL DEPENDENCIES</div>
                                            <p className="text-[11px] font-sans text-white/70 lowercase normal-case mb-2 text-white/70">
                                                Open your terminal in the extracted folder and install the required npm packages:
                                            </p>
                                            <div className="bg-black/80 rounded-lg p-2.5 font-mono text-white/90 text-[11px] normal-case border border-white/5 select-all">
                                                npm install
                                            </div>
                                        </div>

                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                                            <div className="text-orange-400 font-bold mb-2 text-[10px]">3. SETUP API KEYS & RUN</div>
                                            <p className="text-[11px] font-sans text-white/70 lowercase normal-case mb-2 text-white/70">
                                                Launch the local development environment. You can paste your API keys directly into the app settings locally:
                                            </p>
                                            <div className="bg-black/80 rounded-lg p-2.5 font-mono text-white/90 text-[11px] normal-case border border-white/5 select-all mb-2">
                                                npm run dev
                                            </div>
                                            <p className="text-[10px] font-sans text-white/50 normal-case italic">
                                                The local app will open on your hard drive at http://localhost:3000
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-6 border-t border-white/10 bg-black/90 relative z-10 backdrop-blur-xl flex justify-end shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <button
                        id="close-export-modal-footer-btn"
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-white/10 text-white border border-white/10 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-white/15 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                    >
                        CLOSE WINDOW
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExportModal
