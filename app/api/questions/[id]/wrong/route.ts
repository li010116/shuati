import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PATCH /api/questions/:id/wrong
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const qId = parseInt(id, 10);
    if (isNaN(qId)) {
      return errorResponse("无效的题目ID");
    }

    const currentQ = await prisma.question.findUnique({
      where: { id: qId },
      select: { masteryStatus: true },
    });

    if (!currentQ) {
      return errorResponse("找不到指定的题目", 404);
    }

    // Increments and updates
    const updatedQ = await prisma.question.update({
      where: { id: qId },
      data: {
        wrongCount: { increment: 1 },
        reviewCount: { increment: 1 },
        lastReviewTime: new Date(),
      },
    });

    // Write review record log
    await prisma.reviewRecord.create({
      data: {
        questionId: qId,
        actionType: "ADD_WRONG",
        masteryStatus: currentQ.masteryStatus,
      },
    });

    return successResponse(updatedQ);
  } catch (err: any) {
    return errorResponse(err.message || "加入错题本失败");
  }
}
