import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/questions/:id/review-records
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const qId = parseInt(id, 10);
    if (isNaN(qId)) {
      return errorResponse("无效的题目ID");
    }

    const records = await prisma.reviewRecord.findMany({
      where: { questionId: qId },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(records);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch review records");
  }
}
