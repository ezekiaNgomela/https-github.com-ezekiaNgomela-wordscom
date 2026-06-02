import { LLMService } from '../ai/llm';

export class ExcelAIEngine {
  constructor(private llm: LLMService) {}

  async generateFormula(userIntent: string) {
    return this.llm.chat([
      {
        role: 'system',
        content: 'You are an Excel formula expert. Return the best formula.',
      },
      {
        role: 'user',
        content: userIntent,
      },
    ]);
  }

  async explainFormula(formula: string) {
    return this.llm.chat([
      {
        role: 'system',
        content: 'Explain spreadsheet formulas clearly.',
      },
      {
        role: 'user',
        content: formula,
      },
    ]);
  }

  async generateTable(schemaDescription: string) {
    return this.llm.chat([
      {
        role: 'system',
        content: 'Generate spreadsheet table structure from requirements.',
      },
      {
        role: 'user',
        content: schemaDescription,
      },
    ]);
  }

  async generateChartRecommendation(dataDescription: string) {
    return this.llm.chat([
      {
        role: 'system',
        content: 'Recommend spreadsheet charts and analytics.',
      },
      {
        role: 'user',
        content: dataDescription,
      },
    ]);
  }
}
