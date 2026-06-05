// Phase 8 Extension Layer - Excel Runtime Engine
// Non-invasive additive architecture (wraps AI engine, does NOT replace existing spreadsheet system)

export type CellId = string;

export interface Cell {
  id: CellId;
  value?: any;
  formula?: string;
  dependsOn: CellId[];
}

export interface Sheet {
  id: string;
  cells: Map<CellId, Cell>;
}

export interface DependencyGraph {
  nodes: Map<CellId, Cell>;
}

export class ExcelRuntimeEngine {
  private graph: DependencyGraph = {
    nodes: new Map(),
  };

  constructor(
    private aiEngine?: {
      suggestFormula: (input: string) => Promise<string>;
    }
  ) {}

  // Register or update a cell
  upsertCell(cell: Cell) {
    this.graph.nodes.set(cell.id, cell);
  }

  // Resolve dependencies for a cell
  getDependencies(cellId: CellId): Cell[] {
    const cell = this.graph.nodes.get(cellId);
    if (!cell) return [];

    return cell.dependsOn
      .map(id => this.graph.nodes.get(id))
      .filter(Boolean) as Cell[];
  }

  // Recalculate a single cell (basic runtime execution layer)
  recalcCell(cellId: CellId): any {
    const cell = this.graph.nodes.get(cellId);
    if (!cell) return null;

    // Placeholder formula evaluation (Phase 9 will replace with full parser)
    if (!cell.formula) return cell.value;

    // VERY basic safe evaluation placeholder
    // Real engine later: parser + AST + dependency scheduling
    try {
      const expr = cell.formula.replace("=", "");
      const result = Function(`return (${expr})`)();
      cell.value = result;
      return result;
    } catch {
      return "#ERROR";
    }
  }

  // Recalculate full graph
  recalcAll(): Map<CellId, any> {
    const results = new Map<CellId, any>();

    for (const id of this.graph.nodes.keys()) {
      results.set(id, this.recalcCell(id));
    }

    return results;
  }

  // AI-assisted formula generation
  async generateFormula(input: string): Promise<string | null> {
    if (!this.aiEngine) return null;
    return await this.aiEngine.suggestFormula(input);
  }

  // Topological dependency resolution (basic)
  resolveExecutionOrder(): CellId[] {
    const visited = new Set<CellId>();
    const order: CellId[] = [];

    const visit = (id: CellId) => {
      if (visited.has(id)) return;
      visited.add(id);

      const cell = this.graph.nodes.get(id);
      if (!cell) return;

      for (const dep of cell.dependsOn) {
        visit(dep);
      }

      order.push(id);
    };

    for (const id of this.graph.nodes.keys()) {
      visit(id);
    }

    return order;
  }
}
