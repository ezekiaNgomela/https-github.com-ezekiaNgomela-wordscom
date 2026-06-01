import type { Document } from '../documents/types';
import { BaseConverter } from './base';

export class DocxConverter extends BaseConverter {
  id = 'docx';
  name = 'Microsoft Word DOCX';

  async export(document: Document): Promise<unknown> {
    return {
      format: 'docx',
      title: document.title,
      blocks: document.blocks,
    };
  }
}
