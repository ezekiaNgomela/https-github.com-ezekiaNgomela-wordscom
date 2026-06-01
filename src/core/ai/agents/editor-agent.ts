import type { AIAgent, AgentContext } from '../agent-manager';
import { EventBus } from '../../events/event-bus';

export class EditorAgent implements AIAgent {
  name = 'editor-agent';

  // reacts to document-level and block-level edits
  onEvent = [
    'block.update',
    'block.insert',
    'document.updated'
  ];

  constructor(private eventBus: EventBus) {}

  private detectLanguage(text: string): string {
    // lightweight heuristic (placeholder for real NLP/LLM detection)
    const latin = /[a-zA-Z]/.test(text);
    const swahiliMarkers = /(na|ya|wa|ni|kwa|katika)/i.test(text);

    if (swahiliMarkers && latin) return 'mixed';
    if (swahiliMarkers) return 'swahili';
    if (latin) return 'english';

    return 'unknown';
  }

  async handle(context: AgentContext, payload?: any) {
    const { document, blockId } = context;

    const block = blockId
      ? document.blocks.find(b => b.id === blockId)
      : undefined;

    if (block && block.content) {
      const text = block.content;
      const language = this.detectLanguage(text);

      const words = text.trim().split(/\s+/);
      const wordCount = words.length;

      const hasWeakStructure = wordCount > 0 && wordCount < 5;
      const missingCapital = /^[a-z]/.test(text);
      const missingPunctuation = !/[.!?]$/.test(text);
      const repeatedWords = /(\b\w+\b)(?:\s+\1\b)+/i.test(text);

      // structural intelligence
      if (hasWeakStructure) {
        this.eventBus.emit('ai.suggestion', {
          type: 'editor-semantic-expand',
          blockId,
          language,
          suggestion: 'Strengthen this phrase with more context and meaning',
        });
      }

      // grammar + style
      if (missingCapital || missingPunctuation) {
        this.eventBus.emit('ai.suggestion', {
          type: 'editor-grammar',
          blockId,
          language,
          suggestion: 'Fix sentence structure: capitalization or punctuation issues',
        });
      }

      // repetition detection
      if (repeatedWords) {
        this.eventBus.emit('ai.suggestion', {
          type: 'editor-redundancy',
          blockId,
          language,
          suggestion: 'Remove repeated words to improve clarity',
        });
      }

      // word order / fluency heuristic (basic placeholder)
      if (language === 'english' && wordCount > 6) {
        const likelyAwkwardOrder = /\b(very|really|just)\b.*\b(very|really|just)\b/i.test(text);

        if (likelyAwkwardOrder) {
          this.eventBus.emit('ai.suggestion', {
            type: 'editor-word-order',
            blockId,
            language,
            suggestion: 'Reorder words for smoother natural English flow',
          });
        }
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
