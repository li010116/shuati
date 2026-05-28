import { safeFetchJson } from "./apiClient";

export interface QuestionBank {
  id: number;
  name: string;
  description: string | null;
  sourceFile: string | null;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
}

export const questionBankApi = {
  // GET /api/question-banks
  async getAll(): Promise<QuestionBank[]> {
    return safeFetchJson<QuestionBank[]>("/api/question-banks");
  },

  // GET /api/question-banks/:id
  async getById(id: number): Promise<QuestionBank> {
    return safeFetchJson<QuestionBank>(`/api/question-banks/${id}`);
  },

  // POST /api/question-banks
  async create(name: string, description?: string): Promise<QuestionBank> {
    return safeFetchJson<QuestionBank>("/api/question-banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
  },

  // PUT /api/question-banks/:id
  async update(id: number, name: string, description?: string): Promise<QuestionBank> {
    return safeFetchJson<QuestionBank>(`/api/question-banks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
  },

  // DELETE /api/question-banks/:id
  async delete(id: number): Promise<void> {
    await safeFetchJson<void>(`/api/question-banks/${id}`, {
      method: "DELETE",
    });
  },
};
