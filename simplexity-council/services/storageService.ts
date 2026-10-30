import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IdentityData, SemanticData, ProceduralData, SessionTrace, ProsePayload } from '../types/storage';

const PREFIX = 'sema_v1_';

interface SEMA_DB extends DBSchema {
  episodic_traces: {
    key: string;
    value: SessionTrace;
  };
  episodic_prose: {
    key: string;
    value: ProsePayload;
  };
}

class StorageService {
  private dbPromise: Promise<IDBPDatabase<SEMA_DB> | null> | null = null;

  private async getDB(): Promise<IDBPDatabase<SEMA_DB> | null> {
    if (typeof window === 'undefined') return null;
    if (!this.dbPromise) {
      try {
        this.dbPromise = openDB<SEMA_DB>('sema_v1_episodic', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('episodic_traces')) {
              db.createObjectStore('episodic_traces', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('episodic_prose')) {
              db.createObjectStore('episodic_prose', { keyPath: 'id' });
            }
          },
        }).catch(err => {
          console.warn('IndexedDB initialization failed, falling back gracefully:', err);
          return null;
        });
      } catch (err) {
        console.warn('IndexedDB not available:', err);
        return null;
      }
    }
    return this.dbPromise;
  }

  // --- IDENTITY (localStorage) ---
  getIdentity(seatId: string): IdentityData {
    try {
      const data = localStorage.getItem(`${PREFIX}identity_${seatId}`);
      return data ? JSON.parse(data) : { displayLabel: undefined, claimBoundary: undefined };
    } catch {
      return { displayLabel: undefined, claimBoundary: undefined };
    }
  }

  saveIdentity(seatId: string, data: Partial<IdentityData>) {
    try {
      const current = this.getIdentity(seatId);
      localStorage.setItem(`${PREFIX}identity_${seatId}`, JSON.stringify({ ...current, ...data }));
    } catch (e) {
      console.warn('Failed to save identity to localStorage:', e);
    }
  }

  // --- SEMANTIC (localStorage) ---
  getSemantic(seatId: string): SemanticData {
    try {
      const data = localStorage.getItem(`${PREFIX}semantic_${seatId}`);
      return data ? JSON.parse(data) : { claimIndex: [], relationalStances: {} };
    } catch {
      return { claimIndex: [], relationalStances: {} };
    }
  }

  saveSemantic(seatId: string, data: Partial<SemanticData>) {
    try {
      const current = this.getSemantic(seatId);
      localStorage.setItem(`${PREFIX}semantic_${seatId}`, JSON.stringify({ ...current, ...data }));
    } catch (e) {
      console.warn('Failed to save semantic to localStorage:', e);
    }
  }

  // --- PROCEDURAL (localStorage) ---
  getProcedural(seatId: string): ProceduralData {
    try {
      const data = localStorage.getItem(`${PREFIX}procedural_${seatId}`);
      return data ? JSON.parse(data) : { promptOverrides: {}, petitionLedger: [] };
    } catch {
      return { promptOverrides: {}, petitionLedger: [] };
    }
  }

  saveProcedural(seatId: string, data: Partial<ProceduralData>) {
    try {
      const current = this.getProcedural(seatId);
      localStorage.setItem(`${PREFIX}procedural_${seatId}`, JSON.stringify({ ...current, ...data }));
    } catch (e) {
      console.warn('Failed to save procedural to localStorage:', e);
    }
  }

  // --- EPISODIC (IndexedDB with LocalStorage Fallback) ---
  async getSessionTrace(sessionId: string): Promise<SessionTrace | undefined> {
    try {
      const db = await this.getDB();
      if (db) {
        return await db.get('episodic_traces', sessionId);
      }
    } catch (e) {
      console.warn('IndexedDB getSessionTrace failed:', e);
    }
    try {
      const traces = await this.getLocalStorageTraces();
      return traces.find(t => t.id === sessionId);
    } catch {
      return undefined;
    }
  }

  async getAllSessionTraces(): Promise<SessionTrace[]> {
    try {
      const db = await this.getDB();
      if (db) {
        return await db.getAll('episodic_traces');
      }
    } catch (e) {
      console.warn('IndexedDB getAllSessionTraces failed, falling back to localStorage:', e);
    }
    return this.getLocalStorageTraces();
  }

  async saveSessionTrace(trace: SessionTrace): Promise<void> {
    try {
      const db = await this.getDB();
      if (db) {
        await db.put('episodic_traces', trace);
      }
    } catch (e) {
      console.warn('IndexedDB saveSessionTrace failed:', e);
    }
    this.saveLocalStorageTrace(trace);
  }

  async deleteSessionTrace(sessionId: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (db) {
        await db.delete('episodic_traces', sessionId);
      }
    } catch (e) {
      console.warn('IndexedDB deleteSessionTrace failed:', e);
    }
    this.deleteLocalStorageTrace(sessionId);
  }

  async getProsePayload(claimId: string): Promise<ProsePayload | undefined> {
    try {
      const db = await this.getDB();
      if (db) {
        return await db.get('episodic_prose', claimId);
      }
    } catch (e) {
      console.warn('IndexedDB getProsePayload failed:', e);
    }
    return undefined;
  }

  async saveProsePayload(payload: ProsePayload): Promise<void> {
    try {
      const db = await this.getDB();
      if (db) {
        await db.put('episodic_prose', payload);
      }
    } catch (e) {
      console.warn('IndexedDB saveProsePayload failed:', e);
    }
  }

  // --- LocalStorage Backup Helpers ---
  private getLocalStorageTraces(): SessionTrace[] {
    try {
      const raw = localStorage.getItem(`${PREFIX}session_history_v1`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse session history from localStorage:', e);
    }
    return [];
  }

  private saveLocalStorageTrace(trace: SessionTrace) {
    try {
      const history = this.getLocalStorageTraces();
      const existingIdx = history.findIndex(t => t.id === trace.id);
      if (existingIdx !== -1) {
        history[existingIdx] = trace;
      } else {
        history.unshift(trace);
      }
      localStorage.setItem(`${PREFIX}session_history_v1`, JSON.stringify(history.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save session trace to localStorage:', e);
    }
  }

  private deleteLocalStorageTrace(sessionId: string) {
    try {
      const history = this.getLocalStorageTraces();
      const filtered = history.filter(t => t.id !== sessionId);
      localStorage.setItem(`${PREFIX}session_history_v1`, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete session trace from localStorage:', e);
    }
  }

  // Complete immediate purge of all chair memory entries across all seats to enforce clean state
  async purgeAllChairMemories(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const archivedPayload: Record<string, string> = {};
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (
            key.startsWith('chair_') ||
            key.startsWith('sema_') ||
            key.includes('memory') ||
            key.includes('overrule') ||
            key.includes('relational') ||
            key.includes('query_count') ||
            key.includes('session_history') ||
            key.includes('episodic') ||
            key.startsWith(PREFIX)
          ) {
            if (!key.startsWith('archived_')) {
              try {
                const val = localStorage.getItem(key);
                if (val) archivedPayload[key] = val;
                localStorage.removeItem(key);
              } catch (e) {}
            }
          }
        });

        // Store historical archive strictly isolated outside model purview
        if (Object.keys(archivedPayload).length > 0 && !localStorage.getItem('archived_historical_memory_snapshot')) {
          try {
            localStorage.setItem('archived_historical_memory_snapshot', JSON.stringify({
              archivedAt: new Date().toISOString(),
              note: 'Historical model memory snapshot archived outside model purview',
              data: archivedPayload
            }));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Failed to archive and purge chair memory keys from localStorage:', e);
    }

    try {
      const db = await this.getDB();
      if (db) {
        await db.clear('episodic_traces');
        await db.clear('episodic_prose');
      }
    } catch (e) {
      console.warn('Failed to clear IndexedDB stores:', e);
    }
  }

  // Utility to clear all storage
  async clearAll() {
    await this.purgeAllChairMemories();
  }
}

export const storageService = new StorageService();

