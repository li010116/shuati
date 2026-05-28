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

    const importanceVal = importance ?? "普通";
    let qImportance = "普通";
    if (importanceVal === "了解" || importanceVal === "低" || importanceVal === "普通") {
      qImportance = "普通";
    } else if (importanceVal === "较重要" || importanceVal === "重点" || importanceVal === "重要") {
      qImportance = "重要";
    } else if (importanceVal === "必会" || importanceVal === "核心" || importanceVal === "极高" || importanceVal === "极为重要") {
      qImportance = "极为重要";
    } else {
      qImportance = importanceVal;
    }

    const difficultyVal = difficulty ?? "普通";
    let qDifficulty = "普通";
    if (difficultyVal === "低" || difficultyVal === "低难度" || difficultyVal === "简单") {
      qDifficulty = "简单";
    } else if (difficultyVal === "中" || difficultyVal === "中等" || difficultyVal === "中等难度" || difficultyVal === "中难度" || difficultyVal === "普通") {
      qDifficulty = "普通";
    } else if (difficultyVal === "高" || difficultyVal === "高难度" || difficultyVal === "困难") {
      qDifficulty = "困难";
    } else {
      qDifficulty = difficultyVal;
    }

    const updatedQ = await prisma.question.update({
      where: { id: questionId },
      data: {
        primaryCategory,
        secondaryCategory: secondaryCategory ?? null,
        title,
        answer: answer ?? null,
        questionType: questionType ?? "问答题",
        importance: qImportance,
        difficulty: qDifficulty,
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

    // Delete associated ReviewRecord rows and the question in a safe Prisma Transaction
    const deletedQ = await prisma.$transaction(async (tx) => {
      // 1. Delete associated ReviewRecords
      await tx.reviewRecord.deleteMany({
        where: { questionId: qId },
      });

      // 2. Delete the question itself
      return await tx.question.delete({
        where: { id: qId },
      });
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
