import { EventBus } from '../events/event-bus';
import type { Document } from '../documents/types';

export type AgentContext = {
  document: Document;
  blockId?: string;
  metadata?: Record<string, any>;
};

export interface AIAgent {
  name: string;
  onEvent?: string[];
  handle(context: AgentContext, payload?: any): void | Promise<void>;
}

export class AgentManager {
  private agents: AIAgent[] = [];

  constructor(private eventBus: EventBus, private document: Document) {}

  register(agent: AIAgent) {
    this.agents.push(agent);

    if (agent.onEvent) {
      for (const event of agent.onEvent) {
        this.eventBus.on(event, async (payload) => {
          await agent.handle(
            { document: this.document },
            payload
          );
        });
      }
    }
  }

  runAgent(name: string, context: AgentContext, payload?: any) {
    const agent = this.agents.find(a => a.name === name);
    if (!agent) return;

    return agent.handle(context, payload);
  }

  listAgents() {
    return this.agents.map(a => a.name);
  }
}
