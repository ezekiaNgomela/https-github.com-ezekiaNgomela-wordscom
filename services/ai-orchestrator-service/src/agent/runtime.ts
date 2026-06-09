export type ToolDefinition = {
  name: string;
  description: string;
  endpoint: string;
  method: "GET" | "POST";
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
};

export type PlanStep = {
  tool: string;
  input: any;
};

export type Plan = {
  steps: PlanStep[];
};

export type ExecutionResult = {
  tool: string;
  data?: any;
  error?: string;
};

// -----------------------------
// VALIDATION LAYER
// -----------------------------

export function validateStep(step: PlanStep, registry: Record<string, ToolDefinition>) {
  const tool = registry[step.tool];

  if (!tool) {
    return { valid: false, error: `Tool not found: ${step.tool}` };
  }

  if (!step.input || typeof step.input !== "object") {
    return { valid: false, error: "Invalid input format" };
  }

  const requiredKeys = Object.keys(tool.inputSchema || {});

  for (const key of requiredKeys) {
    if (!(key in step.input)) {
      return { valid: false, error: `Missing required field: ${key}` };
    }
  }

  return { valid: true };
}

// -----------------------------
// AGGREGATOR LAYER
// -----------------------------

export function aggregateResults(results: ExecutionResult[]) {
  const errors = results.filter(r => r.error);

  return {
    success: errors.length === 0,
    stepCount: results.length,
    errors,
    finalResult: results[results.length - 1]?.data || null
  };
}

// -----------------------------
// PLANNER INTERFACE (LLM READY)
// -----------------------------

export interface Planner {
  createPlan(input: string): Plan;
}

// -----------------------------
// EXECUTION CONTEXT
// -----------------------------

export type ExecutionContext = {
  traceId?: string;
  userId?: string;
  metadata?: Record<string, any>;
};
