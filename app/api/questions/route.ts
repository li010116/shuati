import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/questions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const keyword = searchParams.get("keyword") || "";
    const questionBankId = searchParams.get("questionBankId");
    const primaryCategory = searchParams.get("primaryCategory");
    const secondaryCategory = searchParams.get("secondaryCategory");
    const difficulty = searchParams.get("difficulty");
    const importance = searchParams.get("importance");
    const masteryStatus = searchParams.get("masteryStatus");
    const isFavorite = searchParams.get("isFavorite");
    const isAnswerMissing = searchParams.get("isAnswerMissing");
    const hasWrong = searchParams.get("hasWrong");

    const skip = (page - 1) * pageSize;

    // Building SQLite Prisma filtration
    const where: any = {};

    if (questionBankId) {
      const parsedBankId = parseInt(questionBankId, 10);
      if (!isNaN(parsedBankId)) {
        where.questionBankId = parsedBankId;
      }
    }

    if (primaryCategory) {
      where.primaryCategory = primaryCategory;
    }

    if (secondaryCategory) {
      where.secondaryCategory = secondaryCategory;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (importance) {
      where.importance = importance;
    }

    if (masteryStatus) {
      where.masteryStatus = masteryStatus;
    }

    if (isFavorite !== null && isFavorite !== "") {
      where.isFavorite = isFavorite === "true";
    }

    if (isAnswerMissing !== null && isAnswerMissing !== "") {
      where.isAnswerMissing = isAnswerMissing === "true";
    }

    if (hasWrong === "true") {
      where.wrongCount = { gt: 0 };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { answer: { contains: keyword } },
        { tags: { contains: keyword } },
      ];
    }

    // Retrieve active counts & list items
    const [total, list] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        orderBy: [{ id: "asc" }],
        skip,
        take: pageSize,
        include: {
          questionBank: {
            select: { name: true },
          },
        },
      }),
    ]);

    return successResponse({
      list,
      total,
      page,
      pageSize,
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to query questions list");
  }
}

// POST /api/questions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionBankId,
      questionId: inputQuestionId,
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

    if (!questionBankId) {
      return errorResponse("必须要指定所属题库");
    }
    if (!title) {
      return errorResponse("题目名称为必选项");
    }
    if (!primaryCategory) {
      return errorResponse("一级分类为必选项");
    }

    const qBankId = parseInt(questionBankId, 10);
    const bankExists = await prisma.questionBank.findUnique({
      where: { id: qBankId },
    });
    if (!bankExists) {
      return errorResponse("指定的题库不存在");
    }

    // Auto-generate unique sequential Question ID if empty
    let finalQuestionId = inputQuestionId ? String(inputQuestionId).trim() : "";
    if (!finalQuestionId) {
      const qCount = await prisma.question.count({
        where: { questionBankId: qBankId },
      });
      let index = qCount + 1;
      let uniqueFound = false;
      while (!uniqueFound) {
        finalQuestionId = `Q${String(index).padStart(6, "0")}`;
        const conflict = await prisma.question.findUnique({
          where: {
            questionBankId_questionId: {
              questionBankId: qBankId,
              questionId: finalQuestionId,
            },
          },
        });
        if (!conflict) {
          uniqueFound = true;
        } else {
          index++;
        }
      }
    } else {
      // Validate unique constraint manually to avoid generic SQLite error
      const conflict = await prisma.question.findUnique({
        where: {
          questionBankId_questionId: {
            questionBankId: qBankId,
            questionId: finalQuestionId,
          },
        },
      });
      if (conflict) {
        return errorResponse(`该题库中已存在编号为 '${finalQuestionId}' 的题目，请勿重复定义`);
      }
    }

    const isAnswerMissing = !answer;

    const newQuestion = await prisma.question.create({
      data: {
        questionBankId: qBankId,
        questionId: finalQuestionId,
        primaryCategory,
        secondaryCategory: secondaryCategory || null,
        title,
        answer: answer || null,
        questionType: questionType || "问答题",
        importance: importance || "普通",
        difficulty: difficulty || "普通",
        tags: tags || null,
        sourcePage: sourcePage || null,
        note: note || null,
        masteryStatus: masteryStatus || "未学习",
        isAnswerMissing,
        wrongCount: 0,
        reviewCount: 0,
        isFavorite: false,
      },
    });

    // Update total countable questions in parent bank
    const totalCountInBank = await prisma.question.count({
      where: { questionBankId: qBankId },
    });
    await prisma.questionBank.update({
      where: { id: qBankId },
      data: { totalCount: totalCountInBank },
    });

    return successResponse(newQuestion);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to create manual question");
  }
}
