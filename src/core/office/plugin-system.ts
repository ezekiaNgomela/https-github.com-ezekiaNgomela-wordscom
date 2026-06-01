export interface OfficePlugin {
  name: string;
  version: string;
  capabilities: string[];

  initialize?(context: any): void;
  execute?(action: string, payload: any): any;
}

export class PluginSystem {
  private plugins: Map<string, OfficePlugin> = new Map();

  register(plugin: OfficePlugin) {
    this.plugins.set(plugin.name, plugin);
  }

  unregister(name: string) {
    this.plugins.delete(name);
  }

  get(name: string) {
    return this.plugins.get(name);
  }

  list() {
    return Array.from(this.plugins.values());
  }

  execute(pluginName: string, action: string, payload: any) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin?.execute) return;

    return plugin.execute(action, payload);
  }

  initializeAll(context: any) {
    for (const plugin of this.plugins.values()) {
      plugin.initialize?.(context);
    }
  }
}
