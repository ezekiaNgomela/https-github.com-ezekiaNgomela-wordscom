import { Converter } from './base';

export class ConverterRegistry {
  private converters = new Map<string, Converter>();

  register(converter: Converter) {
    this.converters.set(converter.id, converter);
  }

  get(id: string) {
    return this.converters.get(id);
  }

  list() {
    return Array.from(this.converters.values());
  }
}

export const converterRegistry = new ConverterRegistry();
