import { AiCommandId } from '../../lib/ai/commands';

export type AiDocumentRequest = {
  command: AiCommandId | 'chat';
  content: string;
  message?: string;
};

export type AiDocumentResponse = {
  result: string;
};

export const processDocument = async (payload: AiDocumentRequest): Promise<AiDocumentResponse> => {
  const response = await fetch('/api/ai/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unable to process document.' }));
    throw new Error(error.error ?? 'Unable to process document.');
  }

  return response.json();
};
