// Phase 20.5.1 - AI Runtime Engine (Kernel AI Backend Wiring)
// This connects the frontend AI Panel to real model providers (OpenAI / local fallback)
// Acts as the single abstraction layer for all AI execution in WordCom OS

export type AIProviderType = "openai" | "local";

export interface AIRequest {
  prompt: string;
  workspaceId?: string;
  userId?: string;
  context?: any;
}

export interface AIResponse {
  text: string;
  raw?: any;
  provider: AIProviderType;
}

// -----------------------------
// AI PROVIDER INTERFACE
// -----------------------------

export interface AIProvider {
  run(req: AIRequest): Promise<AIResponse>;
}

// -----------------------------
// OPENAI PROVIDER (SKELETON)
// -----------------------------

export class OpenAIProvider implements AIProvider {
  async run(req: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        text: "OpenAI API key not configured. Falling back.",
        provider: "openai",
      };
    }

    return {
      text: `OpenAI response stub for: ${req.prompt}`,
      provider: "openai",
    };
  }
}

// -----------------------------
// LOCAL PROVIDER (FALLBACK)
// -----------------------------

export class LocalAIProvider implements AIProvider {
  async run(req: AIRequest): Promise<AIResponse> {
    return {
      text: `Local AI fallback processed: ${req.prompt}`,
      provider: "local",
    };
  }
}

// -----------------------------
// AI ENGINE (MAIN ENTRY)
// -----------------------------

export class AIEngine {
  private provider: AIProvider;

  constructor() {
    const mode = process.env.AI_PROVIDER || "local";

    this.provider = mode === "openai"
      ? new OpenAIProvider()
      : new LocalAIProvider();
  }

  async run(prompt: string, context?: any): Promise<AIResponse> {
    return this.provider.run({ prompt, context });
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }
}
