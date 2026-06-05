// Phase 20.5.3 - Advanced AI Runtime (Streaming + Tools + Memory + Context)
// Final AI capability layer for WordCom OS
// Adds: streaming responses, tool calling, memory injection, document-aware context

import { AIEngine, AIResponse } from "./ai-engine";

export interface AIStreamChunk {
  text: string;
  done?: boolean;
}

export interface AITool {
  name: string;
  description: string;
  execute(input: any): Promise<any>;
}

export class ToolRegistry {
  private tools = new Map<string, AITool>();

  register(tool: AITool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  async execute(name: string, input: any) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return tool.execute(input);
  }
}

export interface MemoryContext {
  userId?: string;
  workspaceId?: string;
  recentDocs?: string[];
  chatHistory?: string[];
  preferences?: Record<string, any>;
}

export interface DocumentContext {
  documentId: string;
  content: string;
  metadata?: any;
}

export class ContextBuilder {
  build(prompt: string, memory?: MemoryContext, doc?: DocumentContext) {
    return {
      messages: [
        {
          role: "system",
          content: "You are WordCom AI inside a document editor system."
        },
        {
          role: "user",
          content: prompt
        },
        ...(doc ? [{ role: "system", content: `Document Context: ${doc.content}` }] : []),
        ...(memory?.chatHistory ? memory.chatHistory.map(m => ({ role: "user", content: m })) : [])
      ]
    };
  }
}

export class AIStreamingEngine {
  private engine: AIEngine;

  constructor(engine: AIEngine) {
    this.engine = engine;
  }

  async *stream(prompt: string): AsyncGenerator<AIStreamChunk> {
    const response = await this.engine.run(prompt);
    const words = response.text.split(" ");

    for (let i = 0; i < words.length; i++) {
      yield {
        text: words.slice(0, i + 1).join(" "),
        done: i === words.length - 1
      };
    }
  }
}

export class AdvancedAI {
  private engine: AIEngine;
  private tools: ToolRegistry;
  private contextBuilder: ContextBuilder;

  constructor(engine: AIEngine) {
    this.engine = engine;
    this.tools = new ToolRegistry();
    this.contextBuilder = new ContextBuilder();
  }

  registerTool(tool: AITool) {
    this.tools.register(tool);
  }

  async run(prompt: string, memory?: MemoryContext, doc?: DocumentContext) {
    const context = this.contextBuilder.build(prompt, memory, doc);
    return this.engine.run(prompt, context);
  }

  async stream(prompt: string) {
    const streamer = new AIStreamingEngine(this.engine);
    return streamer.stream(prompt);
  }
}
