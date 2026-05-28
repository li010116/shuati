import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ code: 1, message: "缺少 jobId 参数" }, { status: 400 });
    }

    const progresses = (globalThis as any).importProgresses;
    if (!progresses) {
      return NextResponse.json({ code: 0, data: { status: "not_found", statusText: "未找到指定的导入记录" } });
    }

    const prog = progresses.get(jobId);
    if (!prog) {
      return NextResponse.json({ code: 0, data: { status: "not_found", statusText: "未找到指定的导入记录" } });
    }

    return NextResponse.json({ code: 0, data: prog }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ code: 1, message: err.message || "获取进度发生异常" }, { status: 500 });
  }
}
