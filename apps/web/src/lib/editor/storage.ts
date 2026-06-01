const STORAGE_KEY = 'wordcom_ai_workspace_document';

export const loadDocument = (fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(STORAGE_KEY) ?? fallback;
};

export const saveDocument = (html: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, html);
};
