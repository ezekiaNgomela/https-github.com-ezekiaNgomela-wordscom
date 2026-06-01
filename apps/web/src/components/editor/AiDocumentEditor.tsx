import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Table, Type, ListChecks, Heading2, WandSparkles } from 'lucide-react';
import { AI_COMMANDS, AiCommandId } from '../../lib/ai/commands';

type AiDocumentEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onRunCommand: (command: AiCommandId) => void;
  onAutoFormat: () => void;
};

export function AiDocumentEditor({ content, onChange, onRunCommand, onAutoFormat }: AiDocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [slashQuery, setSlashQuery] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const updateSlashQuery = (html: string) => {
    const text = editorRef.current?.innerText ?? html.replace(/<[^>]*>/g, ' ');
    const match = text.match(/(?:^|\s)\/(\w*)$/);
    setSlashQuery(match?.[1] ?? '');
  };

  const emitChange = () => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
    updateSlashQuery(html);
  };

  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    emitChange();
  };

  const runSlashCommand = (command: AiCommandId) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/\/(rewrite|formal|summarize|expand|table|proposal)\b/g, '');
      onChange(editorRef.current.innerHTML);
    }
    setSlashQuery('');
    onRunCommand(command);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.altKey && event.key === '1') {
      event.preventDefault();
      format('formatBlock', 'h1');
    }
    if ((event.metaKey || event.ctrlKey) && event.altKey && event.key === '2') {
      event.preventDefault();
      format('formatBlock', 'h2');
    }
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === '8') {
      event.preventDefault();
      format('insertUnorderedList');
    }
    if ((event.metaKey || event.ctrlKey) && event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault();
      format('insertHTML', '<table><thead><tr><th>Column</th><th>Detail</th></tr></thead><tbody><tr><td>Item</td><td>Value</td></tr></tbody></table><p></p>');
    }
    if ((event.metaKey || event.ctrlKey) && event.altKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      onAutoFormat();
    }
  };

  const matchingCommands = AI_COMMANDS.filter((command) => command.id.startsWith(slashQuery as AiCommandId));
  const slashOpen = slashQuery.length > 0 || (editorRef.current?.innerText ?? '').endsWith('/');

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button onClick={() => format('formatBlock', 'h1')} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100">H1</button>
        <button onClick={() => format('formatBlock', 'h2')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><Heading2 size={15} /> H2</button>
        <button onClick={() => format('formatBlock', 'p')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><Type size={15} /> Paragraph</button>
        <button onClick={() => format('insertUnorderedList')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><ListChecks size={15} /> List</button>
        <button onClick={() => format('insertHTML', '<table><thead><tr><th>Column</th><th>Detail</th></tr></thead><tbody><tr><td>Item</td><td>Value</td></tr></tbody></table><p></p>')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><Table size={15} /> Table</button>
        <button onClick={onAutoFormat} className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"><WandSparkles size={15} /> Auto</button>
      </div>

      <div className="relative">
        {slashOpen && matchingCommands.length > 0 && (
          <div className="absolute left-4 top-12 z-20 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:left-10 sm:top-16">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Slash commands</p>
            </div>
            {matchingCommands.map((command) => (
              <button key={command.id} onClick={() => runSlashCommand(command.id)} className="block w-full px-4 py-3 text-left hover:bg-cyan-50">
                <span className="font-semibold text-slate-950">{command.slash}</span>
                <span className="ml-2 text-sm text-slate-500">{command.description}</span>
              </button>
            ))}
          </div>
        )}

        <article
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onKeyUp={emitChange}
          onKeyDown={handleKeyDown}
          className="prose prose-slate min-h-[70vh] max-w-none rounded-[1.5rem] border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-slate-200/70 outline-none focus:ring-4 focus:ring-cyan-200/70 sm:rounded-[2rem] sm:px-12 sm:py-12 xl:min-h-[900px] xl:px-16 xl:py-14"
          data-placeholder="Create a startup proposal..."
        />
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Shortcuts: Ctrl/⌘+Alt+1 for H1, Ctrl/⌘+Alt+2 for H2, Ctrl/⌘+Shift+8 for list, Ctrl/⌘+Alt+T for table, Ctrl/⌘+Alt+F for auto format.
      </p>
    </section>
  );
}
