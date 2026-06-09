export function parsePlan(raw: string) {
  try {
    // extract JSON safely from model output
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found");
    }

    const json = raw.slice(start, end + 1);
    const parsed = JSON.parse(json);

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid plan structure");
    }

    return parsed;
  } catch (err: any) {
    return {
      steps: [
        {
          tool: "generate_text",
          input: { prompt: "Fallback plan failed: " + err.message }
        }
      ]
    };
  }
}
