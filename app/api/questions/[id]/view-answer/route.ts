import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PATCH /api/questions/:id/view-answer
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

    const updatedQ = await prisma.question.update({
      where: { id: qId },
      data: {
        reviewCount: { increment: 1 },
        lastReviewTime: new Date(),
      },
    });

    // Write review record log
    await prisma.reviewRecord.create({
      data: {
        questionId: qId,
        actionType: "VIEW_ANSWER",
        masteryStatus: currentQ.masteryStatus,
      },
    });

    return successResponse(updatedQ);
  } catch (err: any) {
    return errorResponse(err.message || "记录查看答案动作失败");
  }
}
