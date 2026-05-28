import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/question-banks/:id
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bankId = parseInt(id, 10);
    if (isNaN(bankId)) {
      return errorResponse("无效的题库ID");
    }

    const bank = await prisma.questionBank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      return errorResponse("找不到指定的题库", 404);
    }

    return successResponse(bank);
  } catch (err: any) {
    return errorResponse(err.message || "获取题库详情失败");
  }
}

// PUT /api/question-banks/:id
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bankId = parseInt(id, 10);
    if (isNaN(bankId)) {
      return errorResponse("无效的题库ID");
    }

    const { name, description } = await req.json();
    if (!name) {
      return errorResponse("题库名称为必填项");
    }

    const updatedBank = await prisma.questionBank.update({
      where: { id: bankId },
      data: {
        name,
        description: description ?? null,
      },
    });

    return successResponse(updatedBank);
  } catch (err: any) {
    return errorResponse(err.message || "更新题库失败");
  }
}

// DELETE /api/question-banks/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
      return errorResponse("该题库不存在或已被删除", 404);
    }

    // Secure database update using a unified Transaction to manually delete cascade children.
    // This circumvents physical DB level constraint problems and foreign-key inconsistencies.
    await prisma.$transaction(async (tx) => {
      // 1. Clear association history: ReviewRecords linked to questions of this bank
      await tx.reviewRecord.deleteMany({
        where: {
          question: {
            questionBankId: bankId,
          },
        },
      });

      // 2. Clear all questions belonging to this bank
      await tx.question.deleteMany({
        where: {
          questionBankId: bankId,
        },
      });

      // 3. Clear all excel batches history data of this bank
      await tx.importBatch.deleteMany({
        where: {
          questionBankId: bankId,
        },
      });

      // 4. Delete the target parent question bank itself
      await tx.questionBank.delete({
        where: { id: bankId },
      });
    });

    return successResponse(bank, "题库及相关联的数据已一键彻底级联删除成功");
  } catch (err: any) {
    return errorResponse(err.message || "删除题库失败");
  }
}
