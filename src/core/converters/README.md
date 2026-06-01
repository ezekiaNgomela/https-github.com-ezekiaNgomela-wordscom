# WordCom Converter Framework

## Goal
Provide a single conversion pipeline for all document formats.

## Planned Adapters
- DOCX
- PDF
- Markdown
- HTML
- PPTX
- XLSX
- Images
- Audio

## Flow
Document Runtime -> Serializer -> Converter Adapter -> Output Format

This architecture allows future plugins and AI tools to share the same document model.