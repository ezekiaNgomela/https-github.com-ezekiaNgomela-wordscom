export type PlanStep = {
  tool: string;
  input: any;
};

export type Plan = {
  steps: PlanStep[];
};

export function createPlan(userInput: string): Plan {
  // minimal deterministic planner (Phase 5A baseline)

  if (userInput.includes("summarize")) {
    return {
      steps: [
        { tool: "summarize_document", input: { text: userInput } }
      ]
    };
  }

  if (userInput.includes("convert")) {
    return {
      steps: [
        { tool: "convert_format", input: { text: userInput } }
      ]
    };
  }

  return {
    steps: [
      { tool: "generate_text", input: { prompt: userInput } }
    ]
  };
}
