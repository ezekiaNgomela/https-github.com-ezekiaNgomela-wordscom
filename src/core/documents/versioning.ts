import type { Document, DocumentVersion } from './types';

export class VersionManager {
  constructor(private document: Document) {}

  listVersions(): DocumentVersion[] {
    return [...this.document.versions].sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  getVersion(versionId: string): DocumentVersion | undefined {
    return this.document.versions.find(v => v.id === versionId);
  }

  restoreVersion(versionId: string): boolean {
    const version = this.getVersion(versionId);
    if (!version) return false;

    this.document.blocks = structuredClone(version.blocks);
    this.document.updatedAt = Date.now();

    return true;
  }

  compareVersions(versionAId: string, versionBId: string) {
    const a = this.getVersion(versionAId);
    const b = this.getVersion(versionBId);

    if (!a || !b) return null;

    return {
      versionA: a.id,
      versionB: b.id,
      blockCountDelta: b.blocks.length - a.blocks.length,
      timestampDelta: b.timestamp - a.timestamp,
    };
  }
}
