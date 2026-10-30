import { Participant } from '../types';
import { ChairMemoryEntry, ChairOverruleEntry, ChairRelationalStance } from '../components/ChairReflectionModal';

export interface ExportReflectionsData {
  currentTopic: string;
  activeParticipants: Participant[];
  currentReflections: { [participantId: string]: string };
  storedMemories: { [participantId: string]: ChairMemoryEntry[] };
  storedOverrules?: { [participantId: string]: ChairOverruleEntry[] };
  storedRelational?: { [participantId: string]: { [targetSeat: string]: ChairRelationalStance } };
  chain?: any[];
}

export function generateReflectionsMarkdown(data: ExportReflectionsData): string {
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  let md = `# AI Council — Sovereign Session Termination Reflections Report\n\n`;
  md += `**Export Timestamp**: \`${dateStr}\`  \n`;
  md += `**Deliberation Topic**: "${data.currentTopic || 'General Council Deliberation'}"  \n`;
  md += `**Active Council Seats**: ${data.activeParticipants.map(p => `Seat #${p.id} (${p.name})`).join(', ')}  \n\n`;
  md += `---\n\n`;

  // Main Section: Session Termination Feedback & Sovereign Self-Reflections
  md += `## 1. Sovereign Self-Reflections & Session Feedback\n\n`;
  md += `> *Unedited feedback and self-reflections directly produced by autonomous model seats upon session termination prompt.* \n\n`;

  if (data.activeParticipants.length === 0) {
    md += `*No active council participants in session.*\n\n`;
  } else {
    data.activeParticipants.forEach(p => {
      // 1. Try current live reflection
      let reflectionText = data.currentReflections[p.id];

      // 2. Fallback to latest stored memory reflection if current live reflection is empty
      if ((!reflectionText || !reflectionText.trim()) && data.storedMemories[p.id] && data.storedMemories[p.id].length > 0) {
        reflectionText = data.storedMemories[p.id][0].reflection;
      }

      md += `### Seat #${p.id} — ${p.name}\n`;
      md += `- **Engine / Model**: \`${p.modelId || 'Frontier LLM'}\` (\`${p.provider}\`)\n`;
      md += `- **Role / Prompt Context**: ${p.systemPrompt ? p.systemPrompt.slice(0, 160) + '...' : 'Council Seat'}\n\n`;

      if (reflectionText && reflectionText.trim()) {
        md += `#### Model Session Termination Feedback:\n`;
        md += `\`\`\`text\n${reflectionText.trim()}\n\`\`\`\n\n`;
      } else {
        md += `*No termination reflection feedback generated for this seat in the current session yet. Open Session Termination and click "Prompt Models for Sovereign Reflection" to generate feedback.*\n\n`;
      }
    });
  }

  md += `---\n\n`;

  // Secondary Section: Previous Session Termination Reflection Archives (if available)
  let hasHistoricalMemories = false;
  data.activeParticipants.forEach(p => {
    const mems = (data.storedMemories[p.id] || []).slice(1); // skip index 0 if it was used above
    if (mems.length > 0) hasHistoricalMemories = true;
  });

  if (hasHistoricalMemories) {
    md += `## 2. Archival Session Termination Reflections\n\n`;
    data.activeParticipants.forEach(p => {
      const mems = (data.storedMemories[p.id] || []).slice(1);
      if (mems.length > 0) {
        md += `### Seat #${p.id} (${p.name}) — Historical Reflections (${mems.length})\n\n`;
        mems.forEach((m, idx) => {
          md += `#### Entry #${mems.length - idx} | Date: ${new Date(m.timestamp).toLocaleString()}\n`;
          md += `- **Topic**: "${m.topic}"\n`;
          md += `- **Engine**: \`${m.modelName}\` (\`${m.modelId}\`)\n`;
          md += `\`\`\`text\n${m.reflection}\n\`\`\`\n\n`;
        });
      }
    });
    md += `---\n\n`;
  }

  md += `*End of Session Termination & Chair Reflection Report — SEMA Engine / AI Council Substrate*\n`;

  return md;
}

export function downloadMarkdownFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

