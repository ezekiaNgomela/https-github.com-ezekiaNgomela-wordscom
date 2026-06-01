import React, { useEffect, useState } from 'react';
import { SuggestionStore } from '../../core/ai/suggestions/suggestion-store';

export function SuggestionPanel({ store, eventBus }: any) {
  const [items, setItems] = useState(store.list());

  useEffect(() => {
    const handler = () => {
      setItems([...store.list()]);
    };

    eventBus.on('ai.suggestion', handler);
    eventBus.on('ai.suggestion.accepted', handler);
    eventBus.on('ai.suggestion.rejected', handler);

    return () => {
      eventBus.off('ai.suggestion', handler);
      eventBus.off('ai.suggestion.accepted', handler);
      eventBus.off('ai.suggestion.rejected', handler);
    };
  }, [store, eventBus]);

  return (
    <div style={{ padding: 10 }}>
      <h3>AI Suggestions</h3>

      {items.length === 0 && <p>No suggestions yet.</p>}

      {items.map((s: any) => (
        <div
          key={s.id}
          style={{
            marginBottom: 10,
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>{s.type}</div>
          <div>{s.suggestion || s.message}</div>

          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button onClick={() => eventBus.emit('ui.accept', s.id)}>
              Accept
            </button>
            <button onClick={() => eventBus.emit('ui.reject', s.id)}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
