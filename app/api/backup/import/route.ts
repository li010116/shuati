import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import { errorResponse, successResponse } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// Helper to get row value using Chinese/English keys (robust parsing)
function getRowValue(row: any, cnKey: string, enKey: string): any {
  if (row[cnKey] !== undefined && row[cnKey] !== null) return row[cnKey];
  if (row[enKey] !== undefined && row[enKey] !== null) return row[enKey];
  const keys = Object.keys(row);
  for (const k of keys) {
    if (k.trim().toLowerCase() === cnKey.toLowerCase() || k.trim().toLowerCase() === enKey.toLowerCase()) {
      return row[k];
    }
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "append"; // "append" or "overwrite"

    if (!file) {
      return errorResponse("请选择要导入的备份文件");
    }

    const fileName = file.name;
    const isJson = fileName.endsWith(".json");
    
    // Status metrics
    let banksRestoredCount = 0;
    let questionsRestoredCount = 0;
    const bankSummary: { name: string; count: number }[] = [];

    // 1. If Overwrite Mode, wipe all existing tables in sequential transaction order
    if (mode === "overwrite") {
      await prisma.$transaction([
        prisma.reviewRecord.deleteMany({}),
        prisma.importBatch.deleteMany({}),
        prisma.question.deleteMany({}),
        prisma.questionBank.deleteMany({}),
      ]);
    }

    // 2. Parse and Import
    if (isJson) {
      const fileText = await file.text();
      let backupObj: any;
      try {
        backupObj = JSON.parse(fileText);
      } catch (jsonErr) {
        return errorResponse("备份文件解析失败，请确保上传有效的JSON格式");
      }

      if (!backupObj || backupObj.version !== "1.0") {
        return errorResponse("不受支持的JSON备份文件格式");
      }

      const rawBanks = backupObj.exportType === "all" ? backupObj.banks : [backupObj.bank];
      
      for (const b of rawBanks) {
        if (!b || !b.name) continue;
        
        // Find or create question bank
        let targetBank = await prisma.questionBank.findFirst({
          where: { name: b.name }
        });

        if (!targetBank) {
          targetBank = await prisma.questionBank.create({
            data: {
              name: b.name,
              description: b.description || null,
              totalCount: 0,
            }
          });
          banksRestoredCount++;
        }

        let qCount = 0;
        
        // Loop through questions in JSON
        if (b.questions && Array.isArray(b.questions)) {
          for (const q of b.questions) {
            const rawQuestionId = q.questionId;
            if (!q.title || !rawQuestionId) continue;

            const existingQ = await prisma.question.findUnique({
              where: {
                questionBankId_questionId: {
                  questionBankId: targetBank.id,
                  questionId: rawQuestionId
                }
              }
            });

            const qData = {
              questionId: rawQuestionId,
              primaryCategory: q.primaryCategory || "未分类",
              secondaryCategory: q.secondaryCategory || null,
              title: q.title,
              answer: q.answer || null,
              questionType: q.questionType || "问答题",
              importance: q.importance || "普通",
              difficulty: q.difficulty || "普通",
              tags: q.tags || null,
              sourcePage: q.sourcePage || null,
              masteryStatus: q.masteryStatus || "未学习",
              isFavorite: typeof q.isFavorite === "boolean" ? q.isFavorite : false,
              wrongCount: Number(q.wrongCount) || 0,
              reviewCount: Number(q.reviewCount) || 0,
              lastReviewTime: q.lastReviewTime ? new Date(q.lastReviewTime) : null,
              note: q.note || null,
              isAnswerMissing: !q.answer,
            };

            let savedQ;
            if (existingQ) {
              savedQ = await prisma.question.update({
                where: { id: existingQ.id },
                data: qData
              });
            } else {
              savedQ = await prisma.question.create({
                data: {
                  ...qData,
                  questionBankId: targetBank.id
                }
              });
            }
            qCount++;
            questionsRestoredCount++;

            // Optionally restore review records
            if (q.reviewRecords && Array.isArray(q.reviewRecords)) {
              // Wipe old review records first to avoid duplication
              await prisma.reviewRecord.deleteMany({
                where: { questionId: savedQ.id }
              });

              if (q.reviewRecords.length > 0) {
                await prisma.reviewRecord.createMany({
                  data: q.reviewRecords.map((r: any) => ({
                    questionId: savedQ.id,
                    actionType: r.actionType || "刷题记录",
                    masteryStatus: r.masteryStatus || null,
                    createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
                  }))
                });
              }
            }
          }
        }

        bankSummary.push({ name: b.name, count: qCount });
      }

    } else {
      // Excel File Import
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let workbook: xlsx.WorkBook;
      
      try {
        workbook = xlsx.read(buffer, { type: "buffer" });
      } catch (err) {
        return errorResponse("Excel 备份协议解包失败，请检查是否是合规的 Excel 文件");
      }

      const defaultBankName = fileName.replace(/\.[^/.]+$/, ""); // strip extension

      for (const sheetName of workbook.SheetNames) {
        if (sheetName === "空系统") continue;

        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const rows = xlsx.utils.sheet_to_json(sheet) as any[];
        if (rows.length === 0) continue;

        // Establish the question bank name
        // If sheet name is "题库" or "Sheet1", use default file name to be friendly
        const bankName = (sheetName === "题库" || sheetName === "Sheet1") ? defaultBankName : sheetName;

        let targetBank = await prisma.questionBank.findFirst({
          where: { name: bankName }
        });

        if (!targetBank) {
          targetBank = await prisma.questionBank.create({
            data: {
              name: bankName,
              description: "导入还原生成的题库",
              totalCount: 0,
            }
          });
          banksRestoredCount++;
        }

        let qCount = 0;
        let autoIdCounter = 1;

        // Prepare existing ones to generate questionId fallback
        const existingQIds = await prisma.question.findMany({
          where: { questionBankId: targetBank.id },
          select: { questionId: true }
        });
        const questionIdSet = new Set(existingQIds.map(q => q.questionId));

        for (const row of rows) {
          const rawTitle = getRowValue(row, "题目", "title");
          const title = rawTitle ? String(rawTitle).trim() : "";
          if (!title) continue;

          const rawPrimaryCategory = getRowValue(row, "一级分类", "primaryCategory");
          const primaryCategory = rawPrimaryCategory ? String(rawPrimaryCategory).trim() : "常规题目";

          const rawQuestionId = getRowValue(row, "题目ID", "questionId");
          let qId = rawQuestionId ? String(rawQuestionId).trim() : "";

          if (!qId) {
            do {
              qId = `Q${String(autoIdCounter++).padStart(6, "0")}`;
            } while (questionIdSet.has(qId));
          }

          const secondaryCategoryRaw = getRowValue(row, "二级分类", "secondaryCategory");
          const secondaryCategory = secondaryCategoryRaw ? String(secondaryCategoryRaw).trim() : null;

          const answerRaw = getRowValue(row, "参考答案", "answer");
          const answer = answerRaw !== undefined && answerRaw !== null ? String(answerRaw).trim() : null;

          const questionTypeRaw = getRowValue(row, "题型", "questionType");
          const questionType = questionTypeRaw ? String(questionTypeRaw).trim() : "问答题";

          const importanceRaw = getRowValue(row, "重要程度", "importance");
          const importance = importanceRaw ? String(importanceRaw).trim() : "普通";

          const difficultyRaw = getRowValue(row, "难度", "difficulty");
          const difficulty = difficultyRaw ? String(difficultyRaw).trim() : "普通";

          const tagsRaw = getRowValue(row, "标签", "tags");
          const tags = tagsRaw ? String(tagsRaw).trim() : null;

          const sourcePageRaw = getRowValue(row, "来源页码", "sourcePage") || getRowValue(row, "说明页码", "sourcePage");
          const sourcePage = sourcePageRaw ? String(sourcePageRaw).trim() : null;

          const masteryStatusRaw = getRowValue(row, "掌握状态", "masteryStatus");
          const masteryStatus = masteryStatusRaw ? String(masteryStatusRaw).trim() : "未学习";

          // Parse boolean favorite options
          const isFavoriteRaw = getRowValue(row, "是否收藏", "isFavorite");
          let isFavorite = false;
          if (isFavoriteRaw !== undefined && isFavoriteRaw !== null) {
            const favStr = String(isFavoriteRaw).trim().toLowerCase();
            isFavorite = favStr === "true" || favStr === "1" || favStr === "是" || favStr === "yes";
          }

          const wrongCountRaw = getRowValue(row, "错题次数", "wrongCount");
          const wrongCount = wrongCountRaw !== undefined && wrongCountRaw !== null ? Number(wrongCountRaw) || 0 : 0;

          const reviewCountRaw = getRowValue(row, "复习次数", "reviewCount");
          const reviewCount = reviewCountRaw !== undefined && reviewCountRaw !== null ? Number(reviewCountRaw) || 0 : 0;

          const lastReviewTimeRaw = getRowValue(row, "最近复习时间", "lastReviewTime");
          let lastReviewTime: Date | null = null;
          if (lastReviewTimeRaw) {
            const parsedDate = new Date(lastReviewTimeRaw);
            if (!isNaN(parsedDate.getTime())) {
              lastReviewTime = parsedDate;
            }
          }

          const noteRaw = getRowValue(row, "备注", "note");
          const note = noteRaw ? String(noteRaw).trim() : null;

          const existingQ = await prisma.question.findUnique({
            where: {
              questionBankId_questionId: {
                questionBankId: targetBank.id,
                questionId: qId
              }
            }
          });

          const qData = {
            primaryCategory,
            secondaryCategory,
            title,
            answer,
            questionType,
            importance,
            difficulty,
            tags,
            sourcePage,
            masteryStatus,
            isFavorite,
            wrongCount,
            reviewCount,
            lastReviewTime,
            note,
            isAnswerMissing: !answer,
          };

          if (existingQ) {
            await prisma.question.update({
              where: { id: existingQ.id },
              data: qData
            });
          } else {
            await prisma.question.create({
              data: {
                ...qData,
                questionId: qId,
                questionBankId: targetBank.id
              }
            });
          }

          qCount++;
          questionsRestoredCount++;
        }

        bankSummary.push({ name: bankName, count: qCount });
      }
    }

    // 3. Keep total statistics updated
    const allBanks = await prisma.questionBank.findMany({});
    for (const b of allBanks) {
      const c = await prisma.question.count({
        where: { questionBankId: b.id }
      });
      await prisma.questionBank.update({
        where: { id: b.id },
        data: { totalCount: c }
      });
    }

    return successResponse({
      banksRestoredCount,
      questionsRestoredCount,
      bankSummary,
    }, "备份导入恢复成功");

  } catch (err: any) {
    return errorResponse(err.message || "备份导入数据处理失败");
  }
}
