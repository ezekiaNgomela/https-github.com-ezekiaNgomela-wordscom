import { PluginSystem } from './plugin-system';
import { EventBus } from '../events/event-bus';

export class OfficeHub {
  constructor(
    public plugins: PluginSystem,
    public eventBus: EventBus
  ) {}

  initialize() {
    this.plugins.initializeAll({
      eventBus: this.eventBus,
      officeHub: this,
    });
  }

  execute(tool: string, action: string, payload: any) {
    return this.plugins.execute(tool, action, payload);
  }

  availableTools() {
    return this.plugins.list().map(p => ({
      name: p.name,
      capabilities: p.capabilities,
    }));
  }
}
