import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PATCH /api/questions/:id/favorite
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const qId = parseInt(id, 10);
    if (isNaN(qId)) {
      return errorResponse("无效的题目ID");
    }

    const { isFavorite } = await req.json();
    if (isFavorite === undefined) {
      return errorResponse("收藏状态必填");
    }

    // Toggle and find current question status
    const targetQ = await prisma.question.findUnique({
      where: { id: qId },
      select: { masteryStatus: true },
    });

    if (!targetQ) {
      return errorResponse("题目未找到", 404);
    }

    const updatedQ = await prisma.question.update({
      where: { id: qId },
      data: {
        isFavorite: !!isFavorite,
      },
    });

    // Write ReviewRecord
    await prisma.reviewRecord.create({
      data: {
        questionId: qId,
        actionType: isFavorite ? "FAVORITE" : "UNFAVORITE",
        masteryStatus: targetQ.masteryStatus,
      },
    });

    return successResponse(updatedQ);
  } catch (err: any) {
    return errorResponse(err.message || "切换收藏状态失败");
  }
}
