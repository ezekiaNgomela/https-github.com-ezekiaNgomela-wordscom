// Phase 30.0 - Database Layer (Abstracted Client)
// Provides pluggable persistence layer for users, workspaces, OTP, and documents
// Designed to replace in-memory stores with real DB (Postgres / Mongo / Supabase)

export type DBRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export interface DBAdapter<T extends DBRecord> {
  get(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  create(record: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// In-memory fallback implementation (used in dev + early deployment)
export class MemoryDB<T extends DBRecord> implements DBAdapter<T> {
  private store = new Map<string, T>();

  async get(id: string): Promise<T | null> {
    return this.store.get(id) || null;
  }

  async list(): Promise<T[]> {
    return Array.from(this.store.values());
  }

  async create(record: T): Promise<T> {
    this.store.set(record.id, record);
    return record;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

// Singleton DB client registry
export class DBClient {
  private static adapters: Record<string, DBAdapter<any>> = {};

  static register<T extends DBRecord>(name: string, adapter: DBAdapter<T>) {
    this.adapters[name] = adapter;
  }

  static get<T extends DBRecord>(name: string): DBAdapter<T> {
    const adapter = this.adapters[name];
    if (!adapter) {
      throw new Error(`DB adapter not registered: ${name}`);
    }
    return adapter;
  }
}
