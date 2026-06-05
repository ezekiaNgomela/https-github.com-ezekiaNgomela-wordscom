// Phase 8 Extension Layer - Memory Engine
// Non-invasive additive architecture (NO modification to existing systems)

export type MemoryScope =
  | "ephemeral"
  | "persistent"
  | "semantic";

export type MemoryType =
  | "user"
  | "workspace"
  | "document"
  | "agent"
  | "system";

export interface MemoryRecord {
  id: string;
  scope: MemoryScope;
  type: MemoryType;
  key: string;
  value: any;
  timestamp: number;
  tags?: string[];
}

export interface SemanticMemoryRecord extends MemoryRecord {
  embedding?: number[];
  source?: string;
}

export class MemoryEngine {
  private ephemeralStore: Map<string, MemoryRecord> = new Map();

  constructor(
    private persistentAdapter?: {
      save: (record: MemoryRecord) => Promise<void>;
      load: (key: string) => Promise<MemoryRecord | null>;
      query: (filter: Partial<MemoryRecord>) => Promise<MemoryRecord[]>;
    }
  ) {}

  setEphemeral(key: string, value: any, type: MemoryType = "system") {
    const record: MemoryRecord = {
      id: `ep_${Date.now()}_${Math.random()}`,
      scope: "ephemeral",
      type,
      key,
      value,
      timestamp: Date.now(),
    };

    this.ephemeralStore.set(key, record);
  }

  getEphemeral(key: string): any {
    return this.ephemeralStore.get(key)?.value;
  }

  async setPersistent(record: MemoryRecord) {
    if (!this.persistentAdapter) return;

    await this.persistentAdapter.save({
      ...record,
      scope: "persistent",
      timestamp: Date.now(),
    });
  }

  async getPersistent(key: string): Promise<any> {
    if (!this.persistentAdapter) return null;

    const record = await this.persistentAdapter.load(key);
    return record?.value ?? null;
  }

  async queryPersistent(filter: Partial<MemoryRecord>) {
    if (!this.persistentAdapter) return [];
    return this.persistentAdapter.query(filter);
  }

  async setSemantic(record: SemanticMemoryRecord) {
    if (!this.persistentAdapter) return;

    await this.persistentAdapter.save({
      ...record,
      scope: "semantic",
      timestamp: Date.now(),
    });
  }

  async recallSemantic(query: string): Promise<SemanticMemoryRecord[]> {
    if (!this.persistentAdapter) return [];

    const results = await this.persistentAdapter.query({
      scope: "semantic",
    });

    return results as SemanticMemoryRecord[];
  }

  async resolve(key: string): Promise<any> {
    const ep = this.getEphemeral(key);
    if (ep !== undefined) return ep;

    return await this.getPersistent(key);
  }

  async buildContext(workspaceId: string) {
    const persistent = await this.queryPersistent({
      type: "workspace",
    });

    const ephemeral = Array.from(this.ephemeralStore.values());

    return {
      workspaceId,
      persistent,
      ephemeral,
      timestamp: Date.now(),
    };
  }
}
