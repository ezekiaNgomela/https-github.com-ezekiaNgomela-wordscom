// Phase 8 Extension Layer - Workspace Graph Engine
// Non-invasive additive architecture (no modification to existing systems)

export type WorkspaceNodeType =
  | "document"
  | "spreadsheet"
  | "presentation"
  | "asset"
  | "agent";

export type WorkspaceEdgeType =
  | "references"
  | "derived-from"
  | "summarizes"
  | "depends-on"
  | "edited-with"
  | "generated-by-ai";

export interface WorkspaceNode {
  id: string;
  type: WorkspaceNodeType;
  refId: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceEdge {
  id: string;
  from: string;
  to: string;
  type: WorkspaceEdgeType;
  metadata?: Record<string, any>;
}

export interface WorkspaceContext {
  activeNodeId?: string;
  selectedNodeIds: string[];
  timestamp: number;
}

export interface Workspace {
  id: string;
  name: string;
  nodes: WorkspaceNode[];
  edges: WorkspaceEdge[];
  context: WorkspaceContext;
  createdAt: number;
  updatedAt: number;
}

export class WorkspaceGraphEngine {
  private workspace: Workspace;

  constructor(workspace?: Workspace) {
    this.workspace = workspace || this.createEmptyWorkspace();
  }

  private createEmptyWorkspace(): Workspace {
    return {
      id: `ws_${Date.now()}`,
      name: "Default Workspace",
      nodes: [],
      edges: [],
      context: {
        selectedNodeIds: [],
        timestamp: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  addNode(node: WorkspaceNode): void {
    this.workspace.nodes.push(node);
    this.workspace.updatedAt = Date.now();
  }

  addEdge(edge: WorkspaceEdge): void {
    this.workspace.edges.push(edge);
    this.workspace.updatedAt = Date.now();
  }

  getWorkspace(): Workspace {
    return this.workspace;
  }

  getNode(id: string): WorkspaceNode | undefined {
    return this.workspace.nodes.find(n => n.id === id);
  }

  getContext(): WorkspaceContext {
    return this.workspace.context;
  }

  setActiveNode(nodeId: string): void {
    this.workspace.context.activeNodeId = nodeId;
    this.workspace.context.timestamp = Date.now();
    this.workspace.updatedAt = Date.now();
  }

  resolveDependencies(nodeId: string): WorkspaceNode[] {
    const connectedEdges = this.workspace.edges.filter(e => e.from === nodeId);
    return connectedEdges
      .map(e => this.getNode(e.to))
      .filter(Boolean) as WorkspaceNode[];
  }
}
