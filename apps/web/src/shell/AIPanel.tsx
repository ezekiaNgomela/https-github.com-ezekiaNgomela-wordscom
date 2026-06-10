import { useState } from 'react';

export function AIPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  return (
    <div className="w-80 border-l border-white/10 bg-[#0d0d0d] flex flex-col">
      <div className="p-3 border-b border-white/10 font-semibold">
        AI Assistant
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm bg-white/5 p-2 rounded">
            {msg}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white/5 p-2 text-sm rounded outline-none"
          placeholder="Ask AI..."
        />

        <button
          onClick={send}
          className="px-3 py-2 bg-blue-600 text-sm rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
