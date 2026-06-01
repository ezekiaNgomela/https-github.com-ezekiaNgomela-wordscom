import type { Document } from '../documents/types';

export interface Converter {
  id: string;
  name: string;
  export(document: Document): Promise<unknown>;
  import?(source: unknown): Promise<Document>;
}

export abstract class BaseConverter implements Converter {
  abstract id: string;
  abstract name: string;

  abstract export(document: Document): Promise<unknown>;

  async import(source: unknown): Promise<Document> {
    throw new Error(`${this.name} import not implemented`);
  }
}
