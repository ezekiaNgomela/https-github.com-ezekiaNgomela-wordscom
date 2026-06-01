export type DocumentSuggestion = {
  title: string;
  detail: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const looksLikeHeading = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) return false;
  if (/^(executive summary|overview|problem|solution|market|timeline|next steps|budget|risks?)$/i.test(trimmed)) return true;
  return /^[A-Z][A-Za-z0-9 &:,/-]+$/.test(trimmed) && !/[.!?]$/.test(trimmed);
};

export const autoFormatPlainTextToHtml = (text: string) => {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return '<h1>Untitled document</h1><p>Start writing with WordCom AI.</p>';

  return lines
    .map((line, index) => {
      if (/^#\s+/.test(line)) return `<h1>${escapeHtml(line.replace(/^#\s+/, ''))}</h1>`;
      if (/^##\s+/.test(line)) return `<h2>${escapeHtml(line.replace(/^##\s+/, ''))}</h2>`;
      if (/^[-*]\s+/.test(line)) return `<ul><li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li></ul>`;
      if (index === 0 || looksLikeHeading(line)) return `<h${index === 0 ? '1' : '2'}>${escapeHtml(line)}</h${index === 0 ? '1' : '2'}>`;
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join('');
};

export const autoDetectHeadings = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;

  container.querySelectorAll('p').forEach((paragraph, index) => {
    const text = paragraph.textContent?.trim() ?? '';
    if (!looksLikeHeading(text)) return;

    const heading = document.createElement(index === 0 ? 'h1' : 'h2');
    heading.textContent = text;
    paragraph.replaceWith(heading);
  });

  return container.innerHTML;
};

export const getDocumentSuggestions = (html: string): DocumentSuggestion[] => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const text = container.innerText.trim();
  const suggestions: DocumentSuggestion[] = [];

  if (!container.querySelector('h1')) {
    suggestions.push({ title: 'Add a title', detail: 'A clear H1 helps AI understand the document intent.' });
  }

  if (!container.querySelector('h2')) {
    suggestions.push({ title: 'Break into sections', detail: 'Use headings for problem, solution, timeline, and next steps.' });
  }

  if (text.split(/\s+/).filter(Boolean).length < 120) {
    suggestions.push({ title: 'Expand the draft', detail: 'Use /expand to turn notes into complete paragraphs.' });
  }

  if (/proposal|startup|plan/i.test(text) && !container.querySelector('table')) {
    suggestions.push({ title: 'Add structure', detail: 'A table can clarify phases, owners, costs, or milestones.' });
  }

  return suggestions.slice(0, 3);
};
