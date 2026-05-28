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

export interface ProgressData {
  jobId: string;
  fileName: string;
  questionBankId: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  createdCount: number;
  updatedCount: number;
  failCount: number;
  status: "pending" | "processing" | "saving" | "completed" | "failed";
  statusText: string;
  errors: string[];
  errorMsg?: string;
  result?: ImportResponseData;
}

export const importApi = {
  // POST /api/question-banks/import
  async importNewBank(name: string, description: string, file: File, jobId?: string): Promise<ImportResponseData> {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("file", file);
    if (jobId) {
      formData.append("jobId", jobId);
    }

    const res = await fetch("/api/question-banks/import", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // POST /api/question-banks/:id/import
  async importExistingBank(questionBankId: number, file: File, jobId?: string): Promise<ImportResponseData> {
    const formData = new FormData();
    formData.append("file", file);
    if (jobId) {
      formData.append("jobId", jobId);
    }

    const res = await fetch(`/api/question-banks/${questionBankId}/import`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message);
    return json.data;
  },

  // GET /api/question-banks/import/progress
  async getProgress(jobId: string): Promise<ProgressData> {
    const res = await fetch(`/api/question-banks/import/progress?jobId=${encodeURIComponent(jobId)}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message || "获取导入进度失败");
    return json.data;
  },
};
