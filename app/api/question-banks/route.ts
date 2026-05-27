import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/question-banks
export async function GET() {
  try {
    const banks = await prisma.questionBank.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(banks);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch question banks");
  }
}

// POST /api/question-banks
export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name) {
      return errorResponse("题库名称为必填项");
    }

    const newBank = await prisma.questionBank.create({
      data: {
        name,
        description: description || null,
        totalCount: 0,
      },
    });

    return successResponse(newBank);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to create question bank");
  }
}
