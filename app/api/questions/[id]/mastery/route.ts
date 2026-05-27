import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PATCH /api/questions/:id/mastery
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const qId = parseInt(id, 10);
    if (isNaN(qId)) {
      return errorResponse("无效的题目ID");
    }

    const { masteryStatus } = await req.json();
    if (!masteryStatus) {
      return errorResponse("掌握状态不能为空");
    }

    // Determine the corresponding actionType
    let actionType = "MASTERED";
    if (masteryStatus === "已掌握") actionType = "MASTERED";
    else if (masteryStatus === "模糊") actionType = "UNCERTAIN";
    else if (masteryStatus === "未掌握") actionType = "NOT_MASTERED";
    else actionType = "UNSTUDIED";

    // Update the question
    const updatedQ = await prisma.question.update({
      where: { id: qId },
      data: {
        masteryStatus,
        reviewCount: { increment: 1 },
        lastReviewTime: new Date(),
      },
    });

    // Write ReviewRecord
    await prisma.reviewRecord.create({
      data: {
        questionId: qId,
        actionType,
        masteryStatus,
      },
    });

    return successResponse(updatedQ);
  } catch (err: any) {
    return errorResponse(err.message || "更新掌握状态失败");
  }
}
