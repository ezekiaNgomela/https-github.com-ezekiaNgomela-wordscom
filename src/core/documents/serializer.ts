import type { DocumentBlock } from './types';

export class DocumentSerializer {
  static blocksToMarkdown(blocks: DocumentBlock[]): string {
    return blocks.map(b => b.content).join('\n\n');
  }

  static markdownToBlocks(markdown: string): DocumentBlock[] {
    return markdown
      .split(/\n\n+/)
      .filter(Boolean)
      .map((content, index) => ({
        id: `block-${index}`,
        type: 'paragraph',
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
  }

  static tiptapToBlocks(text: string): DocumentBlock[] {
    return this.markdownToBlocks(text);
  }
}
