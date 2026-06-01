import { FormEvent, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { AI_COMMANDS, AiCommandId } from '../../lib/ai/commands';

type AiAssistantSidebarProps = {
  onRunCommand: (command: AiCommandId) => void;
  onAsk: (message: string) => void;
  isProcessing: boolean;
  status: string;
};

export function AiAssistantSidebar({ onRunCommand, onAsk, isProcessing, status }: AiAssistantSidebarProps) {
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    onAsk(trimmed);
    setMessage('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
            <Bot size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">AI Assistant</p>
            <h2 className="text-lg font-bold text-slate-950">Chat with the document</h2>
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
          Ask WordCom to improve writing, generate sections, restructure content, or convert raw ideas into a formatted document.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">AI commands</p>
        <div className="space-y-3">
          {AI_COMMANDS.map((command) => (
            <button key={command.id} onClick={() => onRunCommand(command.id)} disabled={isProcessing} className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-slate-950">{command.slash}</span>
                <Sparkles size={16} className="text-cyan-500" />
              </div>
              <p className="mt-1 text-sm text-slate-500">{command.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 p-5">
        <p className="mb-3 text-sm text-slate-500">{status}</p>
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask AI to improve this..."
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          />
          <button disabled={isProcessing} className="rounded-2xl bg-cyan-400 px-4 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60" aria-label="Send message">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
