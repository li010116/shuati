import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/statistics/difficulties
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
        difficulty: true,
        masteryStatus: true,
      },
    });

    const diffMap = new Map<string, any>();

    // Initializing common difficulty slots to guarantee clean keys even if empty
    const commonLevels = ["简单", "普通", "困难"];
    for (const lvl of commonLevels) {
      diffMap.set(lvl, {
        difficulty: lvl,
        totalCount: 0,
        masteredCount: 0,
        uncertainCount: 0,
        notMasteredCount: 0,
        notLearnedCount: 0,
      });
    }

    for (const q of questions) {
      const diff = q.difficulty || "普通";
      if (!diffMap.has(diff)) {
        diffMap.set(diff, {
          difficulty: diff,
          totalCount: 0,
          masteredCount: 0,
          uncertainCount: 0,
          notMasteredCount: 0,
          notLearnedCount: 0,
        });
      }

      const item = diffMap.get(diff);
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
    }

    const list = Array.from(diffMap.values()).map((item) => {
      item.masteryRate = item.totalCount > 0 ? parseFloat(((item.masteredCount / item.totalCount) * 100).toFixed(1)) : 0;
      return item;
    });

    return successResponse(list);
  } catch (err: any) {
    return errorResponse(err.message || "获取难度级别统计失败");
  }
}
