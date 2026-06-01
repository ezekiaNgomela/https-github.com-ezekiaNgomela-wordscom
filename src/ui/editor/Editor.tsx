import React, { useEffect, useState } from 'react';

// NOTE: Minimal UI editor scaffold (framework-agnostic React layer)

export function Editor({ document, eventBus }: any) {
  const [content, setContent] = useState(document);

  useEffect(() => {
    const handler = (payload: any) => {
      console.log('AI Event:', payload);
    };

    eventBus.on('ai.suggestion', handler);

    return () => {
      eventBus.off('ai.suggestion', handler);
    };
  }, [eventBus]);

  const updateBlock = (index: number, value: string) => {
    const updated = { ...content };
    updated.blocks[index].content = value;

    setContent(updated);

    eventBus.emit('block.update', {
      document: updated,
      blockId: updated.blocks[index].id,
    });
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 2 }}>
        {content.blocks.map((b: any, i: number) => (
          <div key={b.id} style={{ marginBottom: 10 }}>
            <textarea
              value={b.content}
              onChange={(e) => updateBlock(i, e.target.value)}
              style={{ width: '100%', minHeight: 60 }}
            />
          </div>
        ))}
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: 10 }}>
        <h3>AI Suggestions</h3>
        <p>Live suggestions will appear here via EventBus.</p>
      </div>
    </div>
  );
}
