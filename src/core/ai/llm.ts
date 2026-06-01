// LLM abstraction layer for WordCom
// Supports future providers (Google GenAI, OpenAI, local models)

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMProvider {
  generate(req: LLMRequest): Promise<string>;
}

// Default lightweight adapter using placeholder structure
// (will later connect to @google/genai properly)
export class MockLLMProvider implements LLMProvider {
  async generate(req: LLMRequest): Promise<string> {
    const last = req.messages[req.messages.length - 1];
    return `AI_RESPONSE: ${last?.content || ''}`;
  }
}

export class LLMService {
  constructor(private provider: LLMProvider = new MockLLMProvider()) {}

  async chat(messages: LLMMessage[]) {
    return this.provider.generate({ messages });
  }
}
