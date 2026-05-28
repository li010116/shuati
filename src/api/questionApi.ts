import { safeFetchJson } from "./apiClient";

export interface Question {
  id: number;
  questionBankId: number;
  questionId: string;
  primaryCategory: string;
  secondaryCategory: string | null;
  title: string;
  answer: string | null;
  questionType: string;
  importance: string;
  difficulty: string;
  tags: string | null;
  sourcePage: string | null;
  masteryStatus: string;
  isFavorite: boolean;
  wrongCount: number;
  reviewCount: number;
  lastReviewTime: string | null;
  note: string | null;
  isAnswerMissing: boolean;
  createdAt: string;
  updatedAt: string;
  questionBank?: {
    name: string;
  };
}

export interface QuestionQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  questionBankId?: string;
  primaryCategory?: string;
  secondaryCategory?: string;
  difficulty?: string;
  importance?: string;
  masteryStatus?: string;
  isFavorite?: string;
  isAnswerMissing?: string;
  hasWrong?: string;
}

export interface QuestionListResponse {
  list: Question[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewRecord {
  id: number;
  questionId: number;
  actionType: string;
  masteryStatus: string | null;
  createdAt: string;
}

export const questionApi = {
  // GET /api/questions
  async query(params: QuestionQueryParams): Promise<QuestionListResponse> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        q.append(key, String(val));
      }
    });

    return safeFetchJson<QuestionListResponse>(`/api/questions?${q.toString()}`);
  },

  // GET /api/questions/:id
  async getById(id: number): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}`);
  },

  // POST /api/questions
  async create(data: Partial<Question>): Promise<Question> {
    return safeFetchJson<Question>("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // PUT /api/questions/:id
  async update(id: number, data: Partial<Question>): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/questions/:id
  async delete(id: number): Promise<void> {
    await safeFetchJson<void>(`/api/questions/${id}`, {
      method: "DELETE",
    });
  },

  // PATCH /api/questions/:id/mastery
  async updateMastery(id: number, masteryStatus: string): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}/mastery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masteryStatus }),
    });
  },

  // PATCH /api/questions/:id/favorite
  async updateFavorite(id: number, isFavorite: boolean): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}/favorite`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite }),
    });
  },

  // PATCH /api/questions/:id/wrong
  async addWrong(id: number): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}/wrong`, {
      method: "PATCH",
    });
  },

  // PATCH /api/questions/:id/clear-wrong
  async clearWrong(id: number): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}/clear-wrong`, {
      method: "PATCH",
    });
  },

  // PATCH /api/questions/:id/note
  async updateNote(id: number, note: string): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}/note`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
  },

  // PATCH /api/questions/:id/view-answer
  async viewAnswer(id: number): Promise<Question> {
    return safeFetchJson<Question>(`/api/questions/${id}/view-answer`, {
      method: "PATCH",
    });
  },

  // GET /api/questions/:id/review-records
  async getReviewRecords(id: number): Promise<ReviewRecord[]> {
    return safeFetchJson<ReviewRecord[]>(`/api/questions/${id}/review-records`);
  },
};

