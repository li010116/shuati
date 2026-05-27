import { NextRequest } from "next/server";
import * as path from "path";
import * as fs from "fs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { processExcelImport, ensureUploadsDir } from "@/lib/importHelper";

export const config = {
  api: {
    bodyParser: false, // Disabling default body parser to allow manual multipart streaming
  },
};

// POST /api/question-banks/import
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!name) {
      return errorResponse("新建导入时，题库名称不能为空");
    }
    if (!file) {
      return errorResponse("请上传Excel文件");
    }

    // 1. Create the new question bank
    const newBank = await prisma.questionBank.create({
      data: {
        name,
        description: description || null,
        totalCount: 0,
      },
    });

    // 2. Read file to buffer & save to uploads directory
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = ensureUploadsDir();
    const diskFileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadsDir, diskFileName);
    fs.writeFileSync(filePath, buffer);

    // Save the design source file name
    await prisma.questionBank.update({
      where: { id: newBank.id },
      data: { sourceFile: file.name },
    });

    // 3. Process the file contents using Excel importer
    const importResult = await processExcelImport(buffer, file.name, newBank.id);

    return successResponse(importResult, "导入完成");
  } catch (err: any) {
    return errorResponse(err.message || "上传和导入题库失败");
  }
}
