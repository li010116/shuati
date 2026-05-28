export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 200) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function safeFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new ApiError(
      `服务器内部状态异常 (HTTP ${res.status}): 请确认 Vercel 控制台中的 DATABASE_URL 与 DIRECT_URL 环境变量是否已正确配置。通常这是因为未在 Vercel 中关联 Supabase 的 PostgreSQL 数据库连接串导致的。`,
      res.status
    );
  }

  const json = await res.json();
  if (json.code !== 0) {
    throw new ApiError(json.message || "请求服务器响应失败", res.status);
  }

  return json.data as T;
}
