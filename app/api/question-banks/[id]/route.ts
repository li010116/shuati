import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/question-banks/:id
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bankId = parseInt(id, 10);
    if (isNaN(bankId)) {
      return errorResponse("无效的题库ID");
    }

    const bank = await prisma.questionBank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      return errorResponse("找不到指定的题库", 404);
    }

    return successResponse(bank);
  } catch (err: any) {
    return errorResponse(err.message || "获取题库详情失败");
  }
}

// PUT /api/question-banks/:id
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bankId = parseInt(id, 10);
    if (isNaN(bankId)) {
      return errorResponse("无效的题库ID");
    }

    const { name, description } = await req.json();
    if (!name) {
      return errorResponse("题库名称为必填项");
    }

    const updatedBank = await prisma.questionBank.update({
      where: { id: bankId },
      data: {
        name,
        description: description ?? null,
      },
    });

    return successResponse(updatedBank);
  } catch (err: any) {
    return errorResponse(err.message || "更新题库失败");
  }
}

// DELETE /api/question-banks/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bankId = parseInt(id, 10);
    if (isNaN(bankId)) {
      return errorResponse("无效的题库ID");
    }

    // Cascade is handled via schema relation annotations (onDelete: Cascade)
    const deletedBank = await prisma.questionBank.delete({
      where: { id: bankId },
    });

    return successResponse(deletedBank, "题库删除成功");
  } catch (err: any) {
    return errorResponse(err.message || "删除题库失败");
  }
}
