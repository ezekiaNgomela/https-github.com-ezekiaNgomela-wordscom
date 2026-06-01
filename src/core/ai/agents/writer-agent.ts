import type { AIAgent, AgentContext } from '../agent-manager';
import { EventBus } from '../../events/event-bus';

export class WriterAgent implements AIAgent {
  name = 'writer-agent';

  onEvent = ['document.created', 'block.insert'];

  constructor(private eventBus: EventBus) {}

  async handle(context: AgentContext, payload?: any) {
    const { document, blockId } = context;

    // Simple intelligent writing behavior placeholder
    // (will later connect to real AI model)

    if (blockId) {
      const block = document.blocks.find(b => b.id === blockId);
      if (!block) return;

      // Auto-enhance weak text structure (basic intelligence layer)
      if (block.content && block.content.length < 20) {
        this.eventBus.emit('ai.suggestion', {
          type: 'writer-improve',
          blockId,
          suggestion: `Expand and improve: ${block.content}`,
        });
      }
    }

    // Document-level auto structure suggestion
    if (document.blocks.length === 1) {
      this.eventBus.emit('ai.suggestion', {
        type: 'structure',
        message: 'Consider adding headings and sections for better structure',
      });
    }
  }
}
