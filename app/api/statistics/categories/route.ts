import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/statistics/categories
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

    const questions = await prisma.question.findMany({
      where,
      select: {
        primaryCategory: true,
        masteryStatus: true,
        wrongCount: true,
        isFavorite: true,
      },
    });

    const categoryMap = new Map<string, any>();

    for (const q of questions) {
      const cat = q.primaryCategory || "未分类";
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          primaryCategory: cat,
          totalCount: 0,
          masteredCount: 0,
          uncertainCount: 0,
          notMasteredCount: 0,
          notLearnedCount: 0,
          wrongCount: 0,
          favoriteCount: 0,
        });
      }

      const item = categoryMap.get(cat);
      item.totalCount++;

      if (q.masteryStatus === "已掌握") {
        item.masteredCount++;
      } else if (q.masteryStatus === "模糊") {
        item.uncertainCount++;
      } else if (q.masteryStatus === "未掌握") {
        item.notMasteredCount++;
      } else {
        item.notLearnedCount++;
      }

      if (q.wrongCount > 0) {
        item.wrongCount++;
      }
      if (q.isFavorite) {
        item.favoriteCount++;
      }
    }

    const list = Array.from(categoryMap.values()).map((item) => {
      item.masteryRate = item.totalCount > 0 ? parseFloat(((item.masteredCount / item.totalCount) * 100).toFixed(1)) : 0;
      return item;
    });

    // Sort categories by totalCount descending to list major subjects first
    list.sort((a, b) => b.totalCount - a.totalCount);

    return successResponse(list);
  } catch (err: any) {
    return errorResponse(err.message || "获取一级分类统计失败");
  }
}
