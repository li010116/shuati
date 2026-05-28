import { safeFetchJson } from "./apiClient";

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
    return safeFetchJson<StatOverview>(`/api/statistics/overview${q}`);
  },

  // GET /api/statistics/categories
  async getCategories(questionBankId?: number): Promise<StatCategory[]> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    return safeFetchJson<StatCategory[]>(`/api/statistics/categories${q}`);
  },

  // GET /api/statistics/difficulties
  async getDifficulties(questionBankId?: number): Promise<StatDifficulty[]> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    return safeFetchJson<StatDifficulty[]>(`/api/statistics/difficulties${q}`);
  },

  // GET /api/statistics/import-batches
  async getImportBatches(questionBankId?: number): Promise<ImportBatch[]> {
    const q = questionBankId ? `?questionBankId=${questionBankId}` : "";
    return safeFetchJson<ImportBatch[]>(`/api/statistics/import-batches${q}`);
  },
};
