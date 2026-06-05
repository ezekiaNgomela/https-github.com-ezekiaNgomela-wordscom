// Phase 9 Core Layer - Version Merge System
// Final foundation layer: conflict resolution + multi-source merge orchestration
// Safety-first additive architecture (builds on Event + Sync + Persistence)

export type VersionSource = "user" | "ai" | "sync" | "import";

export interface VersionNode {
  id: string;
  entityType: "document" | "workspace" | "memory";
  entityId: string;
  content: any;
  parentVersionIds: string[];
  createdAt: number;
  source: VersionSource;
}

export interface MergeConflict {
  field: string;
  baseValue: any;
  incomingValue: any;
  localValue?: any;
}

export interface MergeResult {
  resolved: any;
  conflicts: MergeConflict[];
  strategy: "auto" | "manual" | "ai-assisted";
}

export interface MergeStrategy {
  resolve: (base: any, incoming: any, local?: any) => MergeResult;
}

export class VersionMergeSystem {
  private versions: Map<string, VersionNode> = new Map();

  constructor(private strategy?: MergeStrategy) {}

  createVersion(node: Omit<VersionNode, "id" | "createdAt">): VersionNode {
    const version: VersionNode = {
      id: `v_${Date.now()}_${Math.random()}`,
      createdAt: Date.now(),
      ...node,
    };

    this.versions.set(version.id, version);
    return version;
  }

  merge(base: any, incoming: any, local?: any): MergeResult {
    if (this.strategy) {
      return this.strategy.resolve(base, incoming, local);
    }

    const conflicts: MergeConflict[] = [];
    const resolved: any = { ...base };

    const keys = new Set([
      ...Object.keys(base || {}),
      ...Object.keys(incoming || {}),
      ...Object.keys(local || {}),
    ]);

    for (const key of keys) {
      const baseVal = base?.[key];
      const incVal = incoming?.[key];
      const localVal = local?.[key];

      const hasConflict =
        incVal !== undefined &&
        localVal !== undefined &&
        incVal !== localVal;

      if (hasConflict) {
        conflicts.push({
          field: key,
          baseValue: baseVal,
          incomingValue: incVal,
          localValue: localVal,
        });

        resolved[key] = localVal;
        continue;
      }

      resolved[key] = localVal ?? incVal ?? baseVal;
    }

    return {
      resolved,
      conflicts,
      strategy: conflicts.length ? "manual" : "auto",
    };
  }

  getVersion(id: string): VersionNode | undefined {
    return this.versions.get(id);
  }

  getAllVersions(entityId: string): VersionNode[] {
    return Array.from(this.versions.values()).filter(
      v => v.entityId === entityId
    );
  }

  async aiMerge(
    base: any,
    incoming: any,
    local?: any,
    aiResolver?: (conflicts: MergeConflict[]) => Promise<any>
  ): Promise<MergeResult> {

    const result = this.merge(base, incoming, local);

    if (result.conflicts.length === 0) {
      return result;
    }

    if (aiResolver) {
      const aiResolved = await aiResolver(result.conflicts);
      return {
        resolved: aiResolved,
        conflicts: result.conflicts,
        strategy: "ai-assisted",
      };
    }

    return result;
  }
}
