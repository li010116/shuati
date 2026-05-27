import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import { errorResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bankIdStr = searchParams.get("bankId");
    const format = searchParams.get("format") || "json"; // "json" or "xlsx"
    
    if (bankIdStr) {
      // Export single bank
      const bankId = parseInt(bankIdStr);
      if (isNaN(bankId)) {
        return errorResponse("无效的题库ID");
      }
      
      const bank = await prisma.questionBank.findUnique({
        where: { id: bankId },
        include: {
          questions: {
            include: {
              reviewRecords: true
            }
          }
        }
      });
      
      if (!bank) {
        return errorResponse("没有找到对应的题库");
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const baseFileName = `${bank.name}_备份_${timestamp}`;
      
      if (format === "xlsx") {
        const rows = bank.questions.map(q => ({
          "题目ID": q.questionId,
          "一级分类": q.primaryCategory,
          "二级分类": q.secondaryCategory || "",
          "题目": q.title,
          "参考答案": q.answer || "",
          "题型": q.questionType,
          "重要程度": q.importance,
          "难度": q.difficulty,
          "标签": q.tags || "",
          "来源页码": q.sourcePage || "",
          "掌握状态": q.masteryStatus,
          "是否收藏": q.isFavorite ? "是" : "否",
          "错题次数": q.wrongCount,
          "复习次数": q.reviewCount,
          "最近复习时间": q.lastReviewTime ? q.lastReviewTime.toISOString() : "",
          "备注": q.note || "",
        }));
        
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(rows);
        xlsx.utils.book_append_sheet(wb, ws, "题库");
        
        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename="${encodeURIComponent(baseFileName)}.xlsx"`,
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        });
      } else {
        // format === "json"
        const backupData = {
          version: "1.0",
          exportType: "single",
          exportedAt: new Date().toISOString(),
          bank: {
            name: bank.name,
            description: bank.description,
            questions: bank.questions.map(q => ({
              questionId: q.questionId,
              primaryCategory: q.primaryCategory,
              secondaryCategory: q.secondaryCategory,
              title: q.title,
              answer: q.answer,
              questionType: q.questionType,
              importance: q.importance,
              difficulty: q.difficulty,
              tags: q.tags,
              sourcePage: q.sourcePage,
              masteryStatus: q.masteryStatus,
              isFavorite: q.isFavorite,
              wrongCount: q.wrongCount,
              reviewCount: q.reviewCount,
              lastReviewTime: q.lastReviewTime,
              note: q.note,
              reviewRecords: q.reviewRecords.map(r => ({
                actionType: r.actionType,
                masteryStatus: r.masteryStatus,
                createdAt: r.createdAt
              }))
            }))
          }
        };
        
        return new NextResponse(JSON.stringify(backupData, null, 2), {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename="${encodeURIComponent(baseFileName)}.json"`,
            "Content-Type": "application/json; charset=utf-8",
          }
        });
      }
    } else {
      // Export all banks
      const banks = await prisma.questionBank.findMany({
        include: {
          questions: {
            include: {
              reviewRecords: true
            }
          }
        }
      });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const baseFileName = `系统全量题库备份_${timestamp}`;
      
      if (format === "xlsx") {
        const wb = xlsx.utils.book_new();
        
        if (banks.length === 0) {
          const ws = xlsx.utils.json_to_sheet([]);
          xlsx.utils.book_append_sheet(wb, ws, "空系统");
        } else {
          for (const bank of banks) {
            const rows = bank.questions.map(q => ({
              "题目ID": q.questionId,
              "一级分类": q.primaryCategory,
              "二级分类": q.secondaryCategory || "",
              "题目": q.title,
              "参考答案": q.answer || "",
              "题型": q.questionType,
              "重要程度": q.importance,
              "难度": q.difficulty,
              "标签": q.tags || "",
              "来源页码": q.sourcePage || "",
              "掌握状态": q.masteryStatus,
              "是否收藏": q.isFavorite ? "是" : "否",
              "错题次数": q.wrongCount,
              "复习次数": q.reviewCount,
              "最近复习时间": q.lastReviewTime ? q.lastReviewTime.toISOString() : "",
              "备注": q.note || "",
            }));
            
            const ws = xlsx.utils.json_to_sheet(rows);
            const safeSheetName = bank.name.replace(/[\\\/?*\[\]]/g, "").slice(0, 30) || `题库-${bank.id}`;
            xlsx.utils.book_append_sheet(wb, ws, safeSheetName);
          }
        }
        
        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename="${encodeURIComponent(baseFileName)}.xlsx"`,
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        });
      } else {
        // format === "json"
        const backupData = {
          version: "1.0",
          exportType: "all",
          exportedAt: new Date().toISOString(),
          banks: banks.map(bank => ({
            name: bank.name,
            description: bank.description,
            questions: bank.questions.map(q => ({
              questionId: q.questionId,
              primaryCategory: q.primaryCategory,
              secondaryCategory: q.secondaryCategory,
              title: q.title,
              answer: q.answer,
              questionType: q.questionType,
              importance: q.importance,
              difficulty: q.difficulty,
              tags: q.tags,
              sourcePage: q.sourcePage,
              masteryStatus: q.masteryStatus,
              isFavorite: q.isFavorite,
              wrongCount: q.wrongCount,
              reviewCount: q.reviewCount,
              lastReviewTime: q.lastReviewTime,
              note: q.note,
              reviewRecords: q.reviewRecords.map(r => ({
                actionType: r.actionType,
                masteryStatus: r.masteryStatus,
                createdAt: r.createdAt
              }))
            }))
          }))
        };
        
        return new NextResponse(JSON.stringify(backupData, null, 2), {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename="${encodeURIComponent(baseFileName)}.json"`,
            "Content-Type": "application/json; charset=utf-8",
          }
        });
      }
    }
  } catch (err: any) {
    return errorResponse(err.message || "备份导出失败");
  }
}
