// src/api/questionBankApi.ts

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
    const res = await fetch("/api/question-banks");
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // GET /api/question-banks/:id
  async getById(id: number): Promise<QuestionBank> {
    const res = await fetch(`/api/question-banks/${id}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // POST /api/question-banks
  async create(name: string, description?: string): Promise<QuestionBank> {
    const res = await fetch("/api/question-banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // PUT /api/question-banks/:id
  async update(id: number, name: string, description?: string): Promise<QuestionBank> {
    const res = await fetch(`/api/question-banks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // DELETE /api/question-banks/:id
  async delete(id: number): Promise<void> {
    const res = await fetch(`/api/question-banks/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
  },
};
