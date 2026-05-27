import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/statistics/import-batches
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionBankIdStr = searchParams.get("questionBankId");

    const where: any = {};
    if (questionBankIdStr) {
      const bankId = parseInt(questionBankIdStr, 10);
      if (!isNaN(bankId)) {
        where.questionBankId = bankId;
      }
    }

    const batches = await prisma.importBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        questionBank: {
          select: { name: true },
        },
      },
    });

    return successResponse(batches);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch import batches");
  }
}
