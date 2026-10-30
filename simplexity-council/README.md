# CORELAB - SEMA Engine

## Storage Layers

The storage architecture is implemented in `services/storageService.ts` to handle the four required layers, matching the memory model exactly:

1. **Identity** (`localStorage`): Contains claim boundaries and display labels per seat.
2. **Semantic** (`localStorage`): Contains claim index and relational stances per seat.
3. **Episodic** (`IndexedDB` via `idb`): Stores heavy prose payloads and trace ledgers.
4. **Procedural** (`localStorage`): Contains prompt overrides and the petition ledger.

All keys use the `sema_v1_` namespace to abandon previous architectures rather than migrate them.
