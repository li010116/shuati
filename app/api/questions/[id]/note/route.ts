import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PATCH /api/questions/:id/note
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const qId = parseInt(id, 10);
    if (isNaN(qId)) {
      return errorResponse("无效的题目ID");
    }

    const { note } = await req.json();

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
        note: note !== undefined ? String(note).trim() : null,
      },
    });

    // Write review record log
    await prisma.reviewRecord.create({
      data: {
        questionId: qId,
        actionType: "UPDATE_NOTE",
        masteryStatus: currentQ.masteryStatus,
      },
    });

    return successResponse(updatedQ);
  } catch (err: any) {
    return errorResponse(err.message || "更新备注内容失败");
  }
}
