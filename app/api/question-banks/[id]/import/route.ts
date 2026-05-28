import { NextRequest } from "next/server";
import * as path from "path";
import * as fs from "fs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { processExcelImport, ensureUploadsDir } from "@/lib/importHelper";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/question-banks/:id/import
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bankId = parseInt(id, 10);
    if (isNaN(bankId)) {
      return errorResponse("无效的题库ID");
    }

    // Check if the bank exists
    const bank = await prisma.questionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank) {
      return errorResponse("指定的题库不存在", 404);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobId = (formData.get("jobId") as string) || undefined;
    if (!file) {
      return errorResponse("请通过file字段上传Excel文件");
    }

    // Read to buffer & save on disk (optional local backup)
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const uploadsDir = ensureUploadsDir();
      const diskFileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadsDir, diskFileName);
      fs.writeFileSync(filePath, buffer);
    } catch (writeErr) {
      console.warn("Unable to write physical backup file to disk (this is expected and harmless on serverless platforms):", writeErr);
    }

    // Update bank's source file to the most recent one
    await prisma.questionBank.update({
      where: { id: bankId },
      data: { sourceFile: file.name },
    });

    // Run import
    const importResult = await processExcelImport(buffer, file.name, bankId, jobId);

    return successResponse(importResult, "导入完成");
  } catch (err: any) {
    return errorResponse(err.message || "追加数据到指定题库失败");
  }
}
