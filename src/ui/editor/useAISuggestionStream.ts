import { useEffect, useState } from 'react';

export function useAISuggestionStream(eventBus: any) {
  const [stream, setStream] = useState<any[]>([]);

  useEffect(() => {
    const handler = (payload: any) => {
      setStream(prev => [...prev, payload]);
    };

    eventBus.on('ai.suggestion', handler);

    return () => {
      eventBus.off('ai.suggestion', handler);
    };
  }, [eventBus]);

  return stream;
}
