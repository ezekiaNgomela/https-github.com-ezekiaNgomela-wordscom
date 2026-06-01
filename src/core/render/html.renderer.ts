import type { Document, DocumentBlock } from '../documents/types';

export class HTMLRenderer {
  static renderBlock(block: DocumentBlock): string {
    switch (block.type) {
      case 'heading':
        return `<h2 data-block-id="${block.id}">${block.content}</h2>`;

      case 'paragraph':
        return `<p data-block-id="${block.id}">${block.content}</p>`;

      case 'list':
        return `<ul data-block-id="${block.id}">${block.content
          .split('\n')
          .map(item => `<li>${item}</li>`)
          .join('')}</ul>`;

      case 'code':
        return `<pre data-block-id="${block.id}"><code>${block.content}</code></pre>`;

      case 'quote':
        return `<blockquote data-block-id="${block.id}">${block.content}</blockquote>`;

      case 'table':
        return `<div data-block-id="${block.id}" class="table-block">${block.content}</div>`;

      case 'image':
        return `<img data-block-id="${block.id}" src="${block.content}" alt="image" />`;

      default:
        return `<p data-block-id="${block.id}">${block.content}</p>`;
    }
  }

  static renderDocument(document: Document): string {
    return document.blocks.map(this.renderBlock).join('\n');
  }
}
