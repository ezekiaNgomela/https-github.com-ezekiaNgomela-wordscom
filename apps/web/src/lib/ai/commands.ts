export type AiCommandId = 'rewrite' | 'formal' | 'summarize' | 'expand' | 'table' | 'proposal';

export type AiCommand = {
  id: AiCommandId;
  label: string;
  slash: `/${AiCommandId}`;
  description: string;
  prompt: string;
};

export const AI_COMMANDS: AiCommand[] = [
  {
    id: 'rewrite',
    label: 'Rewrite',
    slash: '/rewrite',
    description: 'Improve clarity while preserving meaning.',
    prompt: 'Rewrite this document so it is clearer, tighter, and easier to read.',
  },
  {
    id: 'formal',
    label: 'Formal tone',
    slash: '/formal',
    description: 'Convert the draft into a polished professional tone.',
    prompt: 'Rewrite this document in a formal, professional tone with strong business writing.',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    slash: '/summarize',
    description: 'Create a concise executive summary.',
    prompt: 'Summarize this document into a concise executive summary with clear takeaways.',
  },
  {
    id: 'expand',
    label: 'Expand',
    slash: '/expand',
    description: 'Add detail, examples, and stronger transitions.',
    prompt: 'Expand this draft with useful details, examples, and smooth transitions.',
  },
  {
    id: 'table',
    label: 'Create table',
    slash: '/table',
    description: 'Structure the content as a useful table.',
    prompt: 'Turn the relevant content into a clean, useful table and keep supporting context.',
  },
  {
    id: 'proposal',
    label: 'Startup proposal',
    slash: '/proposal',
    description: 'Generate a professional startup proposal structure.',
    prompt: 'Create a polished startup proposal with sections, headings, bullet points, timeline, and next steps.',
  },
];

export const getCommandById = (id: AiCommandId) => AI_COMMANDS.find((command) => command.id === id);
