import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/statistics/overview
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionBankIdStr = searchParams.get("questionBankId");

    const where: any = {};
    const reviewWhere: any = {};

    if (questionBankIdStr) {
      const bankId = parseInt(questionBankIdStr, 10);
      if (!isNaN(bankId)) {
        where.questionBankId = bankId;
        reviewWhere.question = { questionBankId: bankId };
      }
    }

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [
      totalQuestions,
      masteredCount,
      uncertainCount,
      notMasteredCount,
      notLearnedCount,
      favoriteCount,
      wrongCount,
      missingAnswerCount,
      todayReviewCount,
      reviewSumAggregate,
    ] = await Promise.all([
      // Total questions
      prisma.question.count({ where }),
      // Mastered Count
      prisma.question.count({ where: { ...where, masteryStatus: "已掌握" } }),
      // Uncertain Count
      prisma.question.count({ where: { ...where, masteryStatus: "模糊" } }),
      // Not Mastered Count
      prisma.question.count({ where: { ...where, masteryStatus: "未掌握" } }),
      // Not Learned Count
      prisma.question.count({ where: { ...where, masteryStatus: "未学习" } }),
      // Favorite Count
      prisma.question.count({ where: { ...where, isFavorite: true } }),
      // Wrong Count (questions with wrong answers cataloged)
      prisma.question.count({ where: { ...where, wrongCount: { gt: 0 } } }),
      // Missing Answer Count
      prisma.question.count({ where: { ...where, isAnswerMissing: true } }),
      // Today Review Count from logs
      prisma.reviewRecord.count({
        where: {
          ...reviewWhere,
          createdAt: { gte: startOfToday },
        },
      }),
      // Sum of all question reviewCounts
      prisma.question.aggregate({
        where,
        _sum: {
          reviewCount: true,
        },
      }),
    ]);

    const totalReviewCount = reviewSumAggregate._sum.reviewCount || 0;
    const masteryRate = totalQuestions > 0 ? parseFloat(((masteredCount / totalQuestions) * 100).toFixed(1)) : 0;

    return successResponse({
      totalQuestions,
      masteredCount,
      uncertainCount,
      notMasteredCount,
      notLearnedCount,
      favoriteCount,
      wrongCount,
      missingAnswerCount,
      todayReviewCount,
      totalReviewCount,
      masteryRate,
    });
  } catch (err: any) {
    return errorResponse(err.message || "获取统计概览数据失败");
  }
}
