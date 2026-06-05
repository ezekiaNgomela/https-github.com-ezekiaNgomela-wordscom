// Phase 20.5.2 - Kernel AI Integration Layer
// Bridges SystemKernel runtime with AIEngine provider system
// Exposes kernel.ai.run() used by frontend AIPanel

import { AIEngine, AIResponse } from "../ai/ai-engine";

// -----------------------------
// KERNEL AI WRAPPER
// -----------------------------

export class KernelAI {
  private engine: AIEngine;

  constructor() {
    this.engine = new AIEngine();
  }

  async run(prompt: string, context?: any): Promise<AIResponse> {
    return this.engine.run(prompt, context);
  }

  setEngine(engine: AIEngine) {
    this.engine = engine;
  }
}

// -----------------------------
// SINGLETON INSTANCE
// -----------------------------

export const kernelAI = new KernelAI();