import type { AIAgent, AgentContext } from '../agent-manager';
import { EventBus } from '../../events/event-bus';

export class EditorAgent implements AIAgent {
  name = 'editor-agent';

  // reacts to document-level and block-level edits
  onEvent = [
    'block.update',
    'block.update',
    'document.updated'
  ];

  constructor(private eventBus: EventBus) {}

  async handle(context: AgentContext, payload?: any) {
    const { document, blockId } = context;

    // Find target block if exists
    const block = blockId
      ? document.blocks.find(b => b.id === blockId)
      : undefined;

    // BASIC EDITING INTELLIGENCE LAYER (placeholder for LLM later)

    if (block && block.content) {
      const text = block.content;

      // simple grammar heuristic checks
      const hasTooShortSentence = text.length > 0 && text.length < 15;
      const missingCapital = /^[a-z]/.test(text);
      const missingPeriod = !/[.!?]$/.test(text);

      if (hasTooShortSentence) {
        this.eventBus.emit('ai.suggestion', {
          type: 'editor-expand',
          blockId,
          suggestion: 'Expand this sentence for clarity and detail',
        });
      }

      if (missingCapital || missingPeriod) {
        this.eventBus.emit('ai.suggestion', {
          type: 'editor-grammar',
          blockId,
          suggestion: 'Fix grammar: capitalization or punctuation missing',
        });
      }

      if (text.split(' ').length > 40) {
        this.eventBus.emit('ai.suggestion', {
          type: 'editor-split',
          blockId,
          suggestion: 'Consider splitting this long paragraph for readability',
        });
      }
    }

    // document-level intelligence
    if (document.blocks.length > 5) {
      this.eventBus.emit('ai.suggestion', {
        type: 'editor-structure',
        message: 'Consider adding headings to improve document structure',
      });
    }
  }
}
