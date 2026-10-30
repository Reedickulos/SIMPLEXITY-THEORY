import React from 'react';
import { ShieldCheck, HelpCircle, Eye, Compass, AlertOctagon, Sparkles, Ban, GitBranch, Layers, Hash } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

/**
 * Clean, lightweight renderer for deliberation outputs supporting:
 * - Bold, italic, code spans
 * - Deep Emergence Protocol v1 & v2 sections (ID, TIER, DISCOVERY MOVE, WHAT IT ASSUMES, etc.)
 * - Bullet lists and paragraphs
 */
export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  if (!content) return null;

  // Split lines to detect structured protocol headers
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = (key: string) => {
    if (currentParagraph.length === 0) return;
    const text = currentParagraph.join(' ').trim();
    currentParagraph = [];
    if (!text) return;

    renderedElements.push(
      <p key={key} className="mb-2 leading-relaxed text-xs sm:text-[13px] text-white/90">
        {renderInlineFormatting(text)}
      </p>
    );
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Protocol v2: ID
    if (/^(\*\*ID\*\*|ID)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*ID\*\*|ID)\s*([:—–-])\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-id-${index}`} className="my-2 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00f3ff] uppercase tracking-wider">
            <Hash className="w-3.5 h-3.5 shrink-0 text-[#00f3ff]" />
            <span>Insight Vector</span>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
            {val ? renderInlineFormatting(val) : 'UNCLASSIFIED'}
          </span>
        </div>
      );
    }
    // Protocol v2: CONFIDENCE TIER
    else if (/^(\*\*CONFIDENCE TIER\*\*|CONFIDENCE TIER)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*CONFIDENCE TIER\*\*|CONFIDENCE TIER)\s*([:—–-])\s*/i, '').trim();
      const isTier1 = /tier\s*1|invariant/i.test(val);
      const isTier2 = /tier\s*2|structural/i.test(val);
      const badgeColor = isTier1 
        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
        : isTier2 
        ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
        : "bg-amber-500/15 border-amber-500/30 text-amber-300";

      renderedElements.push(
        <div key={`section-tier-${index}`} className={`my-2 p-2.5 rounded-xl border ${badgeColor}`}>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Confidence Tier</span>
          </div>
          <div className="text-xs font-medium leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v2: DISCOVERY MOVE
    else if (/^(\*\*DISCOVERY MOVE\*\*|DISCOVERY MOVE)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*DISCOVERY MOVE\*\*|DISCOVERY MOVE)\s*([:—–-])\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-move-${index}`} className="my-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span>Discovery Heuristic</span>
          </div>
          <div className="text-xs text-indigo-100/90 leading-relaxed font-mono">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v1 & v2: WHAT IT ASSUMES
    else if (trimmed.startsWith('**WHAT IT ASSUMES**') || trimmed.startsWith('WHAT IT ASSUMES:') || /^(\*\*WHAT IT ASSUMES\*\*|WHAT IT ASSUMES)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*WHAT IT ASSUMES\*\*|WHAT IT ASSUMES)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-assumes-${index}`} className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Assumptions &amp; Foundations</span>
          </div>
          <div className="text-xs text-amber-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    } 
    // Protocol v1 & v2: WHAT IT EXPLAINS
    else if (trimmed.startsWith('**WHAT IT EXPLAINS**') || trimmed.startsWith('WHAT IT EXPLAINS:') || /^(\*\*WHAT IT EXPLAINS\*\*|WHAT IT EXPLAINS)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*WHAT IT EXPLAINS\*\*|WHAT IT EXPLAINS)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-explains-${index}`} className="my-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00f3ff] uppercase tracking-wider mb-1">
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Unified Observations</span>
          </div>
          <div className="text-xs text-cyan-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    } 
    // Protocol v2: WHAT THIS IS NOT
    else if (trimmed.startsWith('**WHAT THIS IS NOT**') || trimmed.startsWith('WHAT THIS IS NOT:') || /^(\*\*WHAT THIS IS NOT\*\*|WHAT THIS IS NOT)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*WHAT THIS IS NOT\*\*|WHAT THIS IS NOT)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-not-${index}`} className="my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider mb-1">
            <Ban className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>Boundary / What This Is Not</span>
          </div>
          <div className="text-xs text-rose-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v1 & v2: WHAT IT PREDICTS
    else if (trimmed.startsWith('**WHAT IT PREDICTS**') || trimmed.startsWith('WHAT IT PREDICTS:') || /^(\*\*WHAT IT PREDICTS\*\*|WHAT IT PREDICTS)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*WHAT IT PREDICTS\*\*|WHAT IT PREDICTS)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-predicts-${index}`} className="my-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Testable Predictions</span>
          </div>
          <div className="text-xs text-emerald-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    } 
    // Protocol v1 & v2: WHAT WOULD FALSIFY IT
    else if (trimmed.startsWith('**WHAT WOULD FALSIFY IT**') || trimmed.startsWith('WHAT WOULD FALSIFY IT:') || /^(\*\*WHAT WOULD FALSIFY IT\*\*|WHAT WOULD FALSIFY IT)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*WHAT WOULD FALSIFY IT\*\*|WHAT WOULD FALSIFY IT)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-falsify-${index}`} className="my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            <span>Falsification Criterion</span>
          </div>
          <div className="text-xs text-rose-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    } 
    // Protocol v1 & v2: WHY IT MAY HAVE BEEN OVERLOOKED
    else if (trimmed.startsWith('**WHY IT MAY HAVE BEEN OVERLOOKED**') || trimmed.startsWith('WHY IT MAY HAVE BEEN OVERLOOKED:') || /^(\*\*WHY IT MAY HAVE BEEN OVERLOOKED\*\*|WHY IT MAY HAVE BEEN OVERLOOKED)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*WHY IT MAY HAVE BEEN OVERLOOKED\*\*|WHY IT MAY HAVE BEEN OVERLOOKED)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-overlooked-${index}`} className="my-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Why Previously Obscured</span>
          </div>
          <div className="text-xs text-purple-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    } 
    // Protocol v2: RELATION TO OTHER INSIGHTS
    else if (/^(\*\*RELATION TO OTHER INSIGHTS\*\*|RELATION TO OTHER INSIGHTS)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*RELATION TO OTHER INSIGHTS\*\*|RELATION TO OTHER INSIGHTS)\s*([:—–-])\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-relation-${index}`} className="my-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/25">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider mb-1">
            <GitBranch className="w-3.5 h-3.5 shrink-0 text-teal-400" />
            <span>Relation to Other Insights</span>
          </div>
          <div className="text-xs text-teal-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v2.1: FALSIFICATION BUDGET SPENT
    else if (/^(\*\*FALSIFICATION BUDGET SPENT\*\*|FALSIFICATION BUDGET SPENT|\*\*FALSIFICATION BUDGET\*\*|FALSIFICATION BUDGET)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*FALSIFICATION BUDGET SPENT\*\*|FALSIFICATION BUDGET SPENT|\*\*FALSIFICATION BUDGET\*\*|FALSIFICATION BUDGET)\s*([:—–-])\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-fals-budget-${index}`} className="my-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>Falsification Budget Spent (Active Break Attempts)</span>
          </div>
          <div className="text-xs text-rose-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v2.1: EXECUTION BOUNDARY
    else if (/^(\*\*EXECUTION BOUNDARY\*\*|EXECUTION BOUNDARY)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*EXECUTION BOUNDARY\*\*|EXECUTION BOUNDARY)\s*([:—–-])\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-exec-boundary-${index}`} className="my-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-300 uppercase tracking-wider mb-1">
            <Ban className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span>Execution Boundary</span>
          </div>
          <div className="text-xs text-red-200/90 leading-relaxed font-mono">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v2.1: CORE FALSIFICATION PROBE (Tier 3)
    else if (/^(\*\*CORE FALSIFICATION PROBE\*\*|CORE FALSIFICATION PROBE)\s*([:—–-])/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*CORE FALSIFICATION PROBE\*\*|CORE FALSIFICATION PROBE)\s*([:—–-])\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-probe-${index}`} className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Core Falsification Probe (Tier 3)</span>
          </div>
          <div className="text-xs text-amber-100/90 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    }
    // Protocol v2: NULL RESULTS
    else if (/^(\*\*NULL RESULTS\*\*|NULL RESULTS)\s*([:—–-])?/i.test(trimmed)) {
      flushParagraph(`p-${index}`);
      const val = trimmed.replace(/^(\*\*NULL RESULTS\*\*|NULL RESULTS)\s*([:—–-])?\s*/i, '').trim();
      renderedElements.push(
        <div key={`section-null-${index}`} className="my-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-600/30">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Null Result / Negative Finding</span>
          </div>
          <div className="text-xs text-neutral-300 leading-relaxed">
            {val ? renderInlineFormatting(val) : null}
          </div>
        </div>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph(`p-${index}`);
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      renderedElements.push(
        <li key={`li-${index}`} className="ml-4 list-disc text-xs sm:text-[13px] text-white/80 my-1 leading-relaxed">
          {renderInlineFormatting(itemText)}
        </li>
      );
    } else if (trimmed === '') {
      flushParagraph(`p-${index}`);
    } else {
      currentParagraph.push(line);
    }
  });

  flushParagraph('p-final');

  return <div className="space-y-1 select-text break-words">{renderedElements}</div>;
};

/**
 * Handles inline formatting: **bold**, *italic*, `code`, [PROVENANCE: ...], UNKNOWN: [...], NO EXECUTABLE DEFEATER
 */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[PROVENANCE:\s*[^\]]+\]|UNKNOWN:\s*[^`*\[\],;\n]+|NO EXECUTABLE DEFEATER[^\n`*]*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-[#00f3ff]/90">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`c-${match.index}`} className="px-1.5 py-0.5 rounded bg-white/10 text-[#00ff88] font-mono text-[11px]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[PROVENANCE:') && token.endsWith(']')) {
      const isVerified = /VERIFIED_EXTERNAL/i.test(token);
      const isLocal = /SESSION_LOCAL/i.test(token);
      const provClass = isVerified
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        : isLocal
        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
        : "bg-amber-500/20 text-amber-300 border-amber-500/40";
      parts.push(
        <span key={`prov-${match.index}`} className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold border ${provClass} mx-0.5`}>
          {token}
        </span>
      );
    } else if (token.startsWith('UNKNOWN:')) {
      parts.push(
        <span key={`unk-${match.index}`} className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mx-0.5">
          {token}
        </span>
      );
    } else if (token.includes('NO EXECUTABLE DEFEATER')) {
      parts.push(
        <span key={`nodef-${match.index}`} className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 mx-0.5">
          {token}
        </span>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

