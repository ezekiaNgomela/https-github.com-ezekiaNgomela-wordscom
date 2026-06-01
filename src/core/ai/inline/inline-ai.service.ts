import { EventBus } from '../../events/event-bus';
import { RewriteEngine } from '../rewrite-engine';
import type { Document } from '../../documents/types';

export class InlineAIService {
  private timers: Map<string, any> = new Map();

  constructor(
    private eventBus: EventBus,
    private rewriteEngine: RewriteEngine,
    private document: Document
  ) {
    this.bind();
  }

  private bind() {
    this.eventBus.on('block.update', (payload: any) => {
      const { blockId } = payload;
      if (!blockId) return;

      // debounce per block
      if (this.timers.has(blockId)) {
        clearTimeout(this.timers.get(blockId));
      }

      const timer = setTimeout(async () => {
        const block = this.document.blocks.find(b => b.id === blockId);
        if (!block) return;

        try {
          const rewritten = await this.rewriteEngine.rewriteBlock(
            block,
            'Improve clarity, grammar, word order, and natural flow while preserving meaning'
          );

          this.eventBus.emit('ai.inline.suggestion', {
            blockId,
            original: block.content,
            suggestion: rewritten,
          });
        } catch (err) {
          console.error('Inline AI error:', err);
        }
      }, 600);

      this.timers.set(blockId, timer);
    });
  }
}
