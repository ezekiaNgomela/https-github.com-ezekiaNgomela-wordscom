import { SuggestionStore } from '../../core/ai/suggestions/suggestion-store';
import { EventBus } from '../../core/events/event-bus';

export class SuggestionCenter {
  constructor(
    private store: SuggestionStore,
    private eventBus: EventBus
  ) {
    this.bindUIEvents();
  }

  private bindUIEvents() {
    this.eventBus.on('ai.suggestion', (payload: any) => {
      console.log('AI Suggestion:', payload);
    });
  }

  getSuggestions() {
    return this.store.list();
  }

  accept(id: string) {
    this.store.updateStatus(id, 'accepted');
    this.eventBus.emit('ai.suggestion.accepted', { id });
  }

  reject(id: string) {
    this.store.updateStatus(id, 'rejected');
    this.eventBus.emit('ai.suggestion.rejected', { id });
  }
}
