import React, { useEffect, useState } from 'react';
import { SuggestionPanel } from './SuggestionPanel';

export function InlineEditor({ document, eventBus, suggestionStore }: any) {
  const [doc, setDoc] = useState(document);
  const [inlineMap, setInlineMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const handler = (payload: any) => {
      if (payload?.blockId) {
        setInlineMap(prev => ({
          ...prev,
          [payload.blockId]: payload,
        }));
      }
    };

    eventBus.on('ai.inline.suggestion', handler);

    return () => {
      eventBus.off('ai.inline.suggestion', handler);
    };
  }, [eventBus]);

  const updateBlock = (index: number, value: string) => {
    const updated = { ...doc };
    updated.blocks[index].content = value;

    setDoc(updated);

    eventBus.emit('block.update', {
      document: updated,
      blockId: updated.blocks[index].id,
    });
  };

  const applySuggestion = (blockId: string) => {
    const suggestion = inlineMap[blockId];
    if (!suggestion) return;

    const updated = { ...doc };
    const block = updated.blocks.find((b: any) => b.id === blockId);

    if (block) {
      block.content = suggestion.suggestion;
      setDoc(updated);

      eventBus.emit('block.update', {
        document: updated,
        blockId,
      });

      setInlineMap(prev => {
        const copy = { ...prev };
        delete copy[blockId];
        return copy;
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 2 }}>
        {doc.blocks.map((b: any, i: number) => (
          <div key={b.id} style={{ marginBottom: 20 }}>
            <textarea
              value={b.content}
              onChange={(e) => updateBlock(i, e.target.value)}
              style={{ width: '100%', minHeight: 70 }}
            />

            {inlineMap[b.id] && (
              <div
                style={{
                  marginTop: 6,
                  padding: 8,
                  background: '#f5f5f5',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  AI Suggestion
                </div>
                <div>{inlineMap[b.id].suggestion}</div>

                <button
                  style={{ marginTop: 6 }}
                  onClick={() => applySuggestion(b.id)}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: 10 }}>
        <SuggestionPanel store={suggestionStore} eventBus={eventBus} />
      </div>
    </div>
  );
}
