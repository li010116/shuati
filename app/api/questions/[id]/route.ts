import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/questions/:id
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      return errorResponse("无效的题目ID");
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        questionBank: {
          select: { name: true },
        },
      },
    });

    if (!question) {
      return errorResponse("无法找到指定题目", 404);
    }

    return successResponse(question);
  } catch (err: any) {
    return errorResponse(err.message || "获取题目详情失败");
  }
}

// PUT /api/questions/:id
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      return errorResponse("无效的题目ID");
    }

    const body = await req.json();
    const {
      primaryCategory,
      secondaryCategory,
      title,
      answer,
      questionType,
      importance,
      difficulty,
      tags,
      sourcePage,
      note,
      masteryStatus,
    } = body;

    if (!title) {
      return errorResponse("题目名称为必填项");
    }
    if (!primaryCategory) {
      return errorResponse("一级分类为必填项");
    }

    const isAnswerMissing = !answer;

    const updatedQ = await prisma.question.update({
      where: { id: questionId },
      data: {
        primaryCategory,
        secondaryCategory: secondaryCategory ?? null,
        title,
        answer: answer ?? null,
        questionType: questionType ?? "问答题",
        importance: importance ?? "普通",
        difficulty: difficulty ?? "普通",
        tags: tags ?? null,
        sourcePage: sourcePage ?? null,
        note: note ?? null,
        masteryStatus: masteryStatus ?? "未学习",
        isAnswerMissing,
      },
    });

    return successResponse(updatedQ);
  } catch (err: any) {
    return errorResponse(err.message || "更新题目内容失败");
  }
}

// DELETE /api/questions/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const qId = parseInt(id, 10);
    if (isNaN(qId)) {
      return errorResponse("无效的题目ID");
    }

    // Find first to retrieve parent question bank id
    const candidate = await prisma.question.findUnique({
      where: { id: qId },
      select: { questionBankId: true },
    });

    if (!candidate) {
      return errorResponse("题目不存在或已删去", 404);
    }

    // Delete question
    const deletedQ = await prisma.question.delete({
      where: { id: qId },
    });

    // Update parent totalCount
    const newCount = await prisma.question.count({
      where: { questionBankId: candidate.questionBankId },
    });

    await prisma.questionBank.update({
      where: { id: candidate.questionBankId },
      data: { totalCount: newCount },
    });

    return successResponse(deletedQ, "题目删除成功");
  } catch (err: any) {
    return errorResponse(err.message || "删除题目失败");
  }
}
