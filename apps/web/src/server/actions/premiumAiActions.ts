import { auth } from '../../firebase';

export type PremiumDocumentTask = 'refineGrammar' | 'conceptNotes' | 'dialogNotes';
export type PremiumMediaTask = 'scanText' | 'transcribeAudio';

export type PremiumAiResponse = {
  result: string;
};

const authHeaders = async () => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const assertOk = async (response: Response) => {
  if (response.ok) return;
  const error = await response.json().catch(() => ({ error: 'Premium AI request failed.' }));
  throw new Error(error.error ?? 'Premium AI request failed.');
};

export const runPremiumDocumentTask = async (payload: {
  task: PremiumDocumentTask;
  content: string;
  concept?: string;
}): Promise<PremiumAiResponse> => {
  const response = await fetch('/api/ai/premium/document', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  await assertOk(response);
  return response.json();
};

export const runPremiumMediaTask = async (payload: {
  task: PremiumMediaTask;
  content: string;
  media: { mimeType: string; data: string };
}): Promise<PremiumAiResponse> => {
  const response = await fetch('/api/ai/premium/media', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  await assertOk(response);
  return response.json();
};
