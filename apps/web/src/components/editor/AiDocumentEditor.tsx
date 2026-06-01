import { useEffect, useRef, useState } from 'react';
import { Table, Type, ListChecks, Heading2 } from 'lucide-react';
import { AI_COMMANDS, AiCommandId } from '../../lib/ai/commands';

type AiDocumentEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onRunCommand: (command: AiCommandId) => void;
};

export function AiDocumentEditor({ content, onChange, onRunCommand }: AiDocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [slashOpen, setSlashOpen] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const emitChange = () => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
    setSlashOpen(html.includes('/'));
  };

  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    emitChange();
  };

  const runSlashCommand = (command: AiCommandId) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/\/(rewrite|formal|summarize|expand|table|proposal)/g, '');
      onChange(editorRef.current.innerHTML);
    }
    setSlashOpen(false);
    onRunCommand(command);
  };

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button onClick={() => format('formatBlock', 'h1')} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100">H1</button>
        <button onClick={() => format('formatBlock', 'h2')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><Heading2 size={15} /> H2</button>
        <button onClick={() => format('formatBlock', 'p')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><Type size={15} /> Paragraph</button>
        <button onClick={() => format('insertUnorderedList')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><ListChecks size={15} /> List</button>
        <button onClick={() => format('insertHTML', '<table><thead><tr><th>Column</th><th>Detail</th></tr></thead><tbody><tr><td>Item</td><td>Value</td></tr></tbody></table><p></p>')} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100"><Table size={15} /> Table</button>
      </div>

      <div className="relative">
        {slashOpen && (
          <div className="absolute left-10 top-16 z-20 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Slash commands</p>
            </div>
            {AI_COMMANDS.map((command) => (
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
          className="prose prose-slate min-h-[900px] max-w-none rounded-[2rem] border border-slate-200 bg-white px-16 py-14 shadow-xl shadow-slate-200/70 outline-none focus:ring-4 focus:ring-cyan-200/70"
          data-placeholder="Create a startup proposal..."
        />
      </div>
    </section>
  );
}
