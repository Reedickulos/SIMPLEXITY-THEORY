const fs = require('fs');
let appStr = fs.readFileSync('App.tsx', 'utf8');

// Insert import if not exists
if (!appStr.includes("import { storageService }")) {
  appStr = appStr.replace(
    "import { useConversationChain } from './hooks/useConversationChain';",
    "import { useConversationChain } from './hooks/useConversationChain';\nimport { storageService } from './services/storageService';"
  );
}

// Target the start of the block
const startMarker = "// Load saved sessions history and total count on boot";
const endMarker = "// Notebook Sources state (Google NotebookLM functionality)";

const startIndex = appStr.indexOf(startMarker);
const endIndex = appStr.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = `// Load saved sessions history and total count on boot
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const traces = await storageService.getAllSessionTraces();
        traces.sort((a, b) => b.timestamp - a.timestamp);
        const history: SavedSession[] = traces.map(t => ({
          id: t.id,
          timestamp: new Date(t.timestamp).toISOString(),
          topic: t.topic,
          chain: t.chain
        }));
        setSavedSessionsList(history.slice(0, 5));
        
        const totalCountStr = localStorage.getItem('council_total_session_count_v1');
        if (totalCountStr) {
          setTotalSessionsCount(parseInt(totalCountStr, 10));
        }
      } catch (e) {
        console.error("Failed to load session history from storageService:", e);
      }
    };
    loadHistory();
  }, []);

  // Save changes whenever chain updates and update history
  useEffect(() => {
    if (chain.length > 0) {
      const firstBlock = chain[0];
      const conversationId = firstBlock.conversationId || 'unknown_session';
      const topic = currentTopicRef.current || 'General Collaboration';

      const updateTrace = async () => {
        try {
          await storageService.saveSessionTrace({
            id: conversationId,
            timestamp: Date.now(),
            topic: topic,
            chain: chain
          });

          // Also save each block payload
          for (const block of chain) {
            await storageService.saveProsePayload({
              id: block.hash,
              content: block.payload
            });
          }

          const traces = await storageService.getAllSessionTraces();
          traces.sort((a, b) => b.timestamp - a.timestamp);
          const history: SavedSession[] = traces.map(t => ({
            id: t.id,
            timestamp: new Date(t.timestamp).toISOString(),
            topic: t.topic,
            chain: t.chain
          }));
          
          setSavedSessionsList(history.slice(0, 5));
        } catch (err) {
          console.error("Failed to update session history in storageService", err);
        }
      };
      
      updateTrace();

      localStorage.setItem('current_session_topic_v1', topic);
      localStorage.setItem('current_session_id_v1', conversationId);
    }
  }, [chain]);

  const handleRestoreSpecificSession = useCallback((session: SavedSession) => {
    if (session && session.chain && session.chain.length > 0) {
      loadChain(session.chain, session.id);
      currentTopicRef.current = session.topic;
      
      localStorage.setItem('current_session_topic_v1', session.topic);
      localStorage.setItem('current_session_id_v1', session.id);

      setCallState(CallState.ACTIVE);
    }
  }, [loadChain]);

  const handleDeleteSessionFromHistory = useCallback((sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any session restore handler on the card click
    const doDelete = async () => {
      try {
        await storageService.deleteSessionTrace(sessionId);
        
        const traces = await storageService.getAllSessionTraces();
        traces.sort((a, b) => b.timestamp - a.timestamp);
        const history: SavedSession[] = traces.map(t => ({
          id: t.id,
          timestamp: new Date(t.timestamp).toISOString(),
          topic: t.topic,
          chain: t.chain
        }));
        setSavedSessionsList(history.slice(0, 5));
           
        const currentId = localStorage.getItem('current_session_id_v1');
        if (currentId === sessionId) {
          localStorage.removeItem('current_session_topic_v1');
          localStorage.removeItem('current_session_id_v1');
        }
      } catch (err) {
        console.error("Failed to delete session from history:", err);
      }
    };
    doDelete();
  }, []);

  const handleStartFreshSession = useCallback(() => {
    resetChain();
    localStorage.removeItem('current_session_topic_v1');
    localStorage.removeItem('current_session_id_v1');
    currentTopicRef.current = '';
    setCallState(CallState.ACTIVE);
  }, [resetChain]);

  `;

  const finalStr = appStr.substring(0, startIndex) + newBlock + appStr.substring(endIndex);
  fs.writeFileSync('App.tsx', finalStr);
  console.log("Updated App.tsx successfully.");
} else {
  console.log("Could not find markers.");
}
