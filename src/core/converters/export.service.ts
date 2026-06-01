import type { Document } from '../documents/types';
import { converterRegistry } from './registry';

export async function exportDocument(document: Document, format: string) {
  const converter = converterRegistry.get(format);

  if (!converter) {
    throw new Error(`Converter '${format}' not found`);
  }

  return converter.export(document);
}
