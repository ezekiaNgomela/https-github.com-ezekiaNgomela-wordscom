import { EventBus } from '../../events/event-bus';
import type { AIAgent, AgentContext } from '../agent-manager';
import { SuggestionStore } from '../suggestions/suggestion-store';

export class AgentCoordinator {
  constructor(
    private eventBus: EventBus,
    private suggestionStore: SuggestionStore,
    private agents: AIAgent[]
  ) {
    this.bindEvents();
  }

  private bindEvents() {
    this.eventBus.on('ai.suggestion', (payload: any) => {
      this.suggestionStore.add({
        type: payload.type,
        message: payload.message,
        suggestion: payload.suggestion,
        blockId: payload.blockId,
        language: payload.language,
      });
    });
  }

  runAll(context: AgentContext, payload?: any) {
    for (const agent of this.agents) {
      agent.handle(context, payload);
    }
  }

  runByEvent(event: string, context: AgentContext, payload?: any) {
    for (const agent of this.agents) {
      if (agent.onEvent?.includes(event)) {
        agent.handle(context, payload);
      }
    }
  }
}
