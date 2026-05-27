import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { prisma } from "./prisma";

// Define interface for import result
export interface ImportResult {
  questionBankId: number;
  totalCount: number;
  successCount: number;
  createdCount: number;
  updatedCount: number;
  failCount: number;
  errors: string[];
}

export function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Robust helper to get value from either Chinese key or English key
function getValue(row: any, cnKey: string, enKey: string): any {
  if (row[cnKey] !== undefined && row[cnKey] !== null) return row[cnKey];
  if (row[enKey] !== undefined && row[enKey] !== null) return row[enKey];
  // Check lowercase/uppercase keys
  const keys = Object.keys(row);
  for (const k of keys) {
    if (k.trim().toLowerCase() === cnKey.toLowerCase() || k.trim().toLowerCase() === enKey.toLowerCase()) {
      return row[k];
    }
  }
  return undefined;
}

export async function processExcelImport(
  buffer: Buffer,
  fileName: string,
  questionBankId: number
): Promise<ImportResult> {
  // Convert buffer to sheets
  const workbook = xlsx.read(buffer, { type: "buffer" });
  
  // 1. Get sheet named '题库' or fallback to first sheet
  let sheetName = "题库";
  if (!workbook.SheetNames.includes(sheetName)) {
    sheetName = workbook.SheetNames[0];
  }
  
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("Excel文件不包含任何工作表");
  }

  // Convert to JSON row array
  const rows = xlsx.utils.sheet_to_json(sheet) as any[];
  
  const result: ImportResult = {
    questionBankId,
    totalCount: rows.length,
    successCount: 0,
    createdCount: 0,
    updatedCount: 0,
    failCount: 0,
    errors: [],
  };

  if (rows.length === 0) {
    return result;
  }

  // Get current max auto-gen ID helper
  const existingQuestions = await prisma.question.findMany({
    where: { questionBankId },
    select: { questionId: true },
  });

  const questionIdSet = new Set(existingQuestions.map(q => q.questionId));
  let autoIdCounter = existingQuestions.length + 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // Row number in Excel (header is row 1)

    try {
      // 1. Core fields validation
      const rawTitle = getValue(row, "题目", "title");
      const title = rawTitle ? String(rawTitle).trim() : "";
      
      const rawPrimaryCategory = getValue(row, "一级分类", "primaryCategory");
      const primaryCategory = rawPrimaryCategory ? String(rawPrimaryCategory).trim() : "";

      if (!title) {
        throw new Error(`第 ${rowNum} 行: 题目 不能为空`);
      }
      if (!primaryCategory) {
        throw new Error(`第 ${rowNum} 行: 一级分类 不能为空`);
      }

      // 2. Map optional columns with defaults
      const rawQuestionId = getValue(row, "题目ID", "questionId");
      let questionId = rawQuestionId ? String(rawQuestionId).trim() : "";
      
      if (!questionId) {
        // Auto-generate questionId: Q000001
        do {
          questionId = `Q${String(autoIdCounter++).padStart(6, "0")}`;
        } while (questionIdSet.has(questionId));
      }

      const secondaryCategoryRaw = getValue(row, "二级分类", "secondaryCategory");
      const secondaryCategory = secondaryCategoryRaw ? String(secondaryCategoryRaw).trim() : null;

      const answerRaw = getValue(row, "参考答案", "answer");
      const answer = answerRaw !== undefined && answerRaw !== null ? String(answerRaw).trim() : null;
      const isAnswerMissing = !answer;

      const questionTypeRaw = getValue(row, "题型", "questionType");
      const questionType = questionTypeRaw ? String(questionTypeRaw).trim() : "问答题";

      const importanceRaw = getValue(row, "重要程度", "importance");
      const importance = importanceRaw ? String(importanceRaw).trim() : "普通";

      const difficultyRaw = getValue(row, "难度", "difficulty");
      const difficulty = difficultyRaw ? String(difficultyRaw).trim() : "普通";

      const tagsRaw = getValue(row, "标签", "tags");
      const tags = tagsRaw ? String(tagsRaw).trim() : null;

      const sourcePageRaw = getValue(row, "来源页码", "sourcePage");
      const sourcePage = sourcePageRaw ? String(sourcePageRaw).trim() : null;

      const masteryStatusRaw = getValue(row, "掌握状态", "masteryStatus");
      const masteryStatus = masteryStatusRaw ? String(masteryStatusRaw).trim() : "未学习";

      const isFavoriteRaw = getValue(row, "是否收藏", "isFavorite");
      let isFavorite = false;
      if (isFavoriteRaw !== undefined && isFavoriteRaw !== null) {
        const favStr = String(isFavoriteRaw).trim().toLowerCase();
        isFavorite = favStr === "true" || favStr === "1" || favStr === "是" || favStr === "yes";
      }

      const wrongCountRaw = getValue(row, "错题次数", "wrongCount");
      const wrongCount = wrongCountRaw !== undefined && wrongCountRaw !== null ? Number(wrongCountRaw) || 0 : 0;

      const reviewCountRaw = getValue(row, "复习次数", "reviewCount");
      const reviewCount = reviewCountRaw !== undefined && reviewCountRaw !== null ? Number(reviewCountRaw) || 0 : 0;

      const lastReviewTimeRaw = getValue(row, "最近复习时间", "lastReviewTime");
      let lastReviewTime: Date | null = null;
      if (lastReviewTimeRaw) {
        const parsedDate = new Date(lastReviewTimeRaw);
        if (!isNaN(parsedDate.getTime())) {
          lastReviewTime = parsedDate;
        }
      }

      const noteRaw = getValue(row, "备注", "note");
      const note = noteRaw ? String(noteRaw).trim() : null;

      // 3. Database Sync: Upsert based on questionBankId + questionId
      const existingQ = await prisma.question.findUnique({
        where: {
          questionBankId_questionId: {
            questionBankId,
            questionId,
          },
        },
      });

      if (existingQ) {
        // Update existing question
        await prisma.question.update({
          where: { id: existingQ.id },
          data: {
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
            isAnswerMissing,
          },
        });
        result.updatedCount++;
        result.successCount++;
      } else {
        // Create new question
        await prisma.question.create({
          data: {
            questionBankId,
            questionId,
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
            isAnswerMissing,
          },
        });
        questionIdSet.add(questionId);
        result.createdCount++;
        result.successCount++;
      }
    } catch (err: any) {
      result.failCount++;
      result.errors.push(`[行 ${rowNum}] ${err.message || err}`);
    }
  }

  // 4. Update the totalCount in QuestionBank
  const count = await prisma.question.count({
    where: { questionBankId },
  });

  await prisma.questionBank.update({
    where: { id: questionBankId },
    data: { totalCount: count },
  });

  // 5. Create the ImportBatch record
  await prisma.importBatch.create({
    data: {
      questionBankId,
      fileName,
      totalCount: result.totalCount,
      successCount: result.successCount,
      failCount: result.failCount,
      errorMessage: result.errors.length > 0 ? result.errors.slice(0, 10).join("; ") : null,
    },
  });

  return result;
}
