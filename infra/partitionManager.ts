/**
 * partitionManager.ts
 * -------------------------------------------------
 * Phase 12 (Continuation): Partition Assignment Layer
 *
 * Assigns entity streams to cluster nodes using deterministic hashing.
 */

export class PartitionManager {
  private nodes: string[];

  constructor(nodes: string[]) {
    this.nodes = nodes.sort();
  }

  updateNodes(nodes: string[]) {
    this.nodes = nodes.sort();
  }

  /**
   * Simple deterministic hash
   */
  private hash(input: string): number {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = (h * 31 + input.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  /**
   * Get owner node for entity
   */
  getOwner(entityId: string): string {
    if (this.nodes.length === 0) throw new Error('No nodes in cluster');

    const idx = this.hash(entityId) % this.nodes.length;
    return this.nodes[idx];
  }

  /**
   * Get entities owned by this node
   */
  getOwnedEntities(entityIds: string[], nodeId: string): string[] {
    return entityIds.filter(id => this.getOwner(id) === nodeId);
  }
}