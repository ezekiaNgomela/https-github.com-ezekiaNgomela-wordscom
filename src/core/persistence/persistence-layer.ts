// Phase 9 Foundation Layer - Persistence Abstraction Layer
// Safety-first additive architecture: wraps existing Firebase/system storage without modification

export type EntityType =
  | "document"
  | "workspace"
  | "memory"
  | "event"
  | "version"
  | "agent";

export interface PersistedEntity<T = any> {
  id: string;
  type: EntityType;
  data: T;
  updatedAt: number;
  createdAt: number;
}

// Generic storage adapter (Firebase, IndexedDB, future DBs)
export interface StorageAdapter {
  get: (type: EntityType, id: string) => Promise<PersistedEntity | null>;
  set: (entity: PersistedEntity) => Promise<void>;
  query: (type: EntityType, filter?: Partial<PersistedEntity>) => Promise<PersistedEntity[]>;
  delete?: (type: EntityType, id: string) => Promise<void>;
}

// Core persistence layer (single entry point for all system storage)
export class PersistenceLayer {
  constructor(private adapter: StorageAdapter) {}

  // -------------------------
  // CORE CRUD
  // -------------------------

  async save<T>(type: EntityType, id: string, data: T): Promise<void> {
    const existing = await this.adapter.get(type, id);

    const entity: PersistedEntity<T> = {
      id,
      type,
      data,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await this.adapter.set(entity);
  }

  async get<T>(type: EntityType, id: string): Promise<T | null> {
    const entity = await this.adapter.get(type, id);
    return entity?.data ?? null;
  }

  async query<T>(type: EntityType, filter?: Partial<PersistedEntity>): Promise<T[]> {
    const results = await this.adapter.query(type, filter);
    return results.map(r => r.data);
  }

  async remove(type: EntityType, id: string): Promise<void> {
    if (!this.adapter.delete) return;
    await this.adapter.delete(type, id);
  }

  // -------------------------
  // DOMAIN HELPERS
  // -------------------------

  // Document persistence
  saveDocument(id: string, data: any) {
    return this.save("document", id, data);
  }

  getDocument<T>(id: string) {
    return this.get<T>("document", id);
  }

  // Workspace persistence
  saveWorkspace(id: string, data: any) {
    return this.save("workspace", id, data);
  }

  getWorkspace<T>(id: string) {
    return this.get<T>("workspace", id);
  }

  // Memory persistence
  saveMemory(id: string, data: any) {
    return this.save("memory", id, data);
  }

  // Event persistence
  saveEvent(id: string, data: any) {
    return this.save("event", id, data);
  }

  // Version persistence
  saveVersion(id: string, data: any) {
    return this.save("version", id, data);
  }
}
