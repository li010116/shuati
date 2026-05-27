// src/api/statisticsApi.ts

export interface StatOverview {
  totalQuestions: number;
  masteredCount: number;
  uncertainCount: number;
  notMasteredCount: number;
  notLearnedCount: number;
  favoriteCount: number;
  wrongCount: number;
  missingAnswerCount: number;
  todayReviewCount: number;
  totalReviewCount: number;
  masteryRate: number;
}

export interface StatCategory {
  primaryCategory: string;
  totalCount: number;
  masteredCount: number;
  uncertainCount: number;
  notMasteredCount: number;
  notLearnedCount: number;
  wrongCount: number;
  favoriteCount: number;
  masteryRate: number;
}

export interface StatDifficulty {
  difficulty: string;
  totalCount: number;
  masteredCount: number;
  uncertainCount: number;
  notMasteredCount: number;
  notLearnedCount: number;
  masteryRate: number;
}

export interface ImportBatch {
  id: number;
  questionBankId: number;
  fileName: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  errorMessage: string | null;
  createdAt: string;
  questionBank?: {
    name: string;
  };
}

export const statisticsApi = {
  // GET /api/statistics/overview
  async getOverview(questionBankId?: number): Promise<StatOverview> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    const res = await fetch(`/api/statistics/overview${q}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // GET /api/statistics/categories
  async getCategories(questionBankId?: number): Promise<StatCategory[]> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    const res = await fetch(`/api/statistics/categories${q}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // GET /api/statistics/difficulties
  async getDifficulties(questionBankId?: number): Promise<StatDifficulty[]> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    const res = await fetch(`/api/statistics/difficulties${q}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // GET /api/statistics/import-batches
  async getImportBatches(questionBankId?: number): Promise<ImportBatch[]> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    const res = await fetch(`/api/statistics/import-batches${q}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },
};
