import { AiCommandId, getCommandById } from '../../lib/ai/commands';

export const buildDocumentPrompt = (command: AiCommandId | 'chat', content: string, message = '') => {
  if (command === 'chat') {
    return `User request: ${message}\n\nDocument HTML:\n${content}\n\nReturn only the improved document HTML.`;
  }

  const aiCommand = getCommandById(command);
  const instruction = aiCommand?.prompt ?? message;
  return `${instruction}\n\nDocument HTML:\n${content}\n\nReturn only semantic HTML with headings, paragraphs, lists, and tables when useful.`;
};
