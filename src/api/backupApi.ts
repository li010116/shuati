// src/api/backupApi.ts

export interface ImportBackupResponse {
  banksRestoredCount: number;
  questionsRestoredCount: number;
  bankSummary: Array<{
    name: string;
    count: number;
  }>;
}

export const backupApi = {
  /**
   * Generates a request to export questions and handles downloading the results as a blob.
   * This is fully safe and captures raw files directly from the browser.
   */
  async downloadBackupFile(bankId?: number, format: "json" | "xlsx" = "json"): Promise<void> {
    const query = new URLSearchParams();
    if (bankId) query.set("bankId", String(bankId));
    query.set("format", format);

    const res = await fetch(`/api/backup/export?${query.toString()}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "服务器导出文件失败");
    }

    // Try to extract the file name from headers
    const contentDisposition = res.headers.get("content-disposition");
    let fileName = bankId
      ? `题库备份_${bankId}_${Date.now()}.${format}`
      : `系统全量题库备份_${Date.now()}.${format}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const element = document.createElement("a");
    element.href = downloadUrl;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    
    // Clean up
    document.body.removeChild(element);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Sends the backup file to the restore endpoint.
   */
  async importBackupFile(file: File, mode: "append" | "overwrite"): Promise<ImportBackupResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    const res = await fetch("/api/backup/import", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (json.code !== 0) {
      throw new Error(json.message || "恢复备份导入失败");
    }

    return json.data;
  },
};
