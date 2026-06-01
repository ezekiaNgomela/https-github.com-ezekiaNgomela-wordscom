import { converterRegistry } from './registry';
import { DocxConverter } from './docx.adapter';
import { PdfConverter } from './pdf.adapter';

converterRegistry.register(new DocxConverter());
converterRegistry.register(new PdfConverter());

export { converterRegistry };
