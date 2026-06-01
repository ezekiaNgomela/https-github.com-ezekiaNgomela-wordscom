import type { Document } from '../documents/types';
import { BaseConverter } from './base';

export class PdfConverter extends BaseConverter {
  id = 'pdf';
  name = 'Portable Document Format';

  async export(document: Document): Promise<unknown> {
    return {
      format: 'pdf',
      title: document.title,
      blocks: document.blocks,
    };
  }
}
