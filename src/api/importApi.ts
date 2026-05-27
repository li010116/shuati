// src/api/importApi.ts

export interface ImportResponseData {
  questionBankId: number;
  totalCount: number;
  successCount: number;
  createdCount: number;
  updatedCount: number;
  failCount: number;
  errors: string[];
}

export const importApi = {
  // POST /api/question-banks/import
  async importNewBank(name: string, description: string, file: File): Promise<ImportResponseData> {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("file", file);

    const res = await fetch("/api/question-banks/import", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // POST /api/question-banks/:id/import
  async importExistingBank(questionBankId: number, file: File): Promise<ImportResponseData> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/question-banks/${questionBankId}/import`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },
};
