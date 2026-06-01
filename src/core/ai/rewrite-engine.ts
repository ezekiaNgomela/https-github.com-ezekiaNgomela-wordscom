import type { Document, DocumentBlock } from '../documents/types';
import { LLMService } from './llm';

export class RewriteEngine {
  constructor(private llm: LLMService) {}

  async rewriteBlock(block: DocumentBlock, instruction: string) {
    const prompt = `Rewrite the following text with instruction: ${instruction}\n\nText:\n${block.content}`;

    return this.llm.chat([
      { role: 'system', content: 'You are a professional multilingual editor.' },
      { role: 'user', content: prompt },
    ]);
  }

  async rewriteDocument(document: Document, instruction: string) {
    const results: Record<string, string> = {};

    for (const block of document.blocks) {
      const rewritten = await this.rewriteBlock(block, instruction);
      results[block.id] = rewritten;
    }

    return results;
  }
}
