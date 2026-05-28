import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
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

// Global map for tracking active import jobs
if (!(globalThis as any).importProgresses) {
  (globalThis as any).importProgresses = new Map();
}
const importProgresses = (globalThis as any).importProgresses;

export interface ImportProgress {
  jobId: string;
  fileName: string;
  questionBankId: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  createdCount: number;
  updatedCount: number;
  failCount: number;
  status: "pending" | "processing" | "saving" | "completed" | "failed";
  statusText: string;
  errors: string[];
  errorMsg?: string;
  result?: ImportResult;
}

export function ensureUploadsDir() {
  let uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Unable to create uploads directory in workspace root, falling back to OS temp directory:", err);
    uploadsDir = path.join(os.tmpdir(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
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
  questionBankId: number,
  jobId?: string
): Promise<ImportResult> {
  if (jobId) {
    importProgresses.set(jobId, {
      jobId,
      fileName,
      questionBankId,
      totalRows: 0,
      processedRows: 0,
      successCount: 0,
      createdCount: 0,
      updatedCount: 0,
      failCount: 0,
      status: "pending",
      statusText: "准备深度读取并解析工作表...",
      errors: [],
    });
  }

  try {
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

    if (jobId) {
      const prog = importProgresses.get(jobId);
      if (prog) {
        prog.totalRows = rows.length;
        prog.status = "processing";
        prog.statusText = `已成功检测并读取 ${rows.length} 条原始记录...`;
      }
    }

    if (rows.length === 0) {
      if (jobId) {
        const prog = importProgresses.get(jobId);
        if (prog) {
          prog.status = "completed";
          prog.statusText = "Excel不含任何题库行，完成空白解析。";
          prog.result = result;
        }
      }
      return result;
    }

    // 1. Get all existing questions for this bank in a single batch query
    const existingQuestions = await prisma.question.findMany({
      where: { questionBankId },
      select: { id: true, questionId: true },
    });

    const existingMap = new Map<string, number>(); // questionId -> db internal id
    existingQuestions.forEach(q => {
      existingMap.set(q.questionId, q.id);
    });

    const questionIdSet = new Set(existingQuestions.map(q => q.questionId));
    let autoIdCounter = existingQuestions.length + 1;

    // Arrays to hold prepared records for database writes
    const toCreate: any[] = [];
    const toUpdateMap = new Map<number, any>();
    
    // Track created indices to handle duplicates within the same upload file
    const tempCreateMap = new Map<string, number>(); // questionId -> index in toCreate
    const countedUpdates = new Set<number>();

    // 2. Process rows sequentially in-memory
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Row number in Excel (header is row 1)

      try {
        // 2.1. Core fields validation
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

        // 2.2. Map optional columns with defaults
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
        const importanceVal = importanceRaw ? String(importanceRaw).trim() : "普通";
        let importance = "普通";
        if (importanceVal === "了解" || importanceVal === "低" || importanceVal === "普通") {
          importance = "普通";
        } else if (importanceVal === "较重要" || importanceVal === "重点" || importanceVal === "重要") {
          importance = "重要";
        } else if (importanceVal === "必会" || importanceVal === "核心" || importanceVal === "极高" || importanceVal === "极为重要") {
          importance = "极为重要";
        } else {
          importance = importanceVal;
        }

        const difficultyRaw = getValue(row, "难度", "difficulty");
        const difficultyVal = difficultyRaw ? String(difficultyRaw).trim() : "普通";
        let difficulty = "普通";
        if (difficultyVal === "低" || difficultyVal === "低难度" || difficultyVal === "简单") {
          difficulty = "简单";
        } else if (difficultyVal === "中" || difficultyVal === "中等" || difficultyVal === "中等难度" || difficultyVal === "中难度" || difficultyVal === "普通") {
          difficulty = "普通";
        } else if (difficultyVal === "高" || difficultyVal === "高难度" || difficultyVal === "困难") {
          difficulty = "困难";
        } else {
          difficulty = difficultyVal;
        }

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

        const dataToSave = {
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
        };

        const existingDbId = existingMap.get(questionId);
        if (existingDbId !== undefined) {
          // Prepare for update
          toUpdateMap.set(existingDbId, {
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
          });
          if (!countedUpdates.has(existingDbId)) {
            countedUpdates.add(existingDbId);
            result.updatedCount++;
            result.successCount++;
          }
        } else {
          // Prepare for create
          const existingIndex = tempCreateMap.get(questionId);
          if (existingIndex !== undefined) {
            toCreate[existingIndex] = dataToSave;
          } else {
            toCreate.push(dataToSave);
            tempCreateMap.set(questionId, toCreate.length - 1);
            questionIdSet.add(questionId);
            result.createdCount++;
            result.successCount++;
          }
        }
      } catch (err: any) {
        result.failCount++;
        result.errors.push(`[行 ${rowNum}] ${err.message || err}`);
      }

      if (jobId) {
        const prog = importProgresses.get(jobId);
        if (prog) {
          prog.processedRows = i + 1;
          prog.successCount = result.successCount;
          prog.createdCount = result.createdCount;
          prog.updatedCount = result.updatedCount;
          prog.failCount = result.failCount;
          prog.errors = [...result.errors];
          prog.statusText = `正在检查结构规范: 已处理 ${i + 1} / ${rows.length} 题`;
        }
      }
    }

    // 3. Batch DB Write: chunked createMany for creations
    if (toCreate.length > 0) {
      if (jobId) {
        const prog = importProgresses.get(jobId);
        if (prog) {
          prog.status = "saving";
          prog.statusText = `已校验完毕，正在极速落库。正在写入 ${toCreate.length} 道新录入题目...`;
        }
      }
      const CREATE_BATCH_SIZE = 1000;
      for (let idx = 0; idx < toCreate.length; idx += CREATE_BATCH_SIZE) {
        const chunk = toCreate.slice(idx, idx + CREATE_BATCH_SIZE);
        await prisma.question.createMany({
          data: chunk,
        });
      }
    }

    // 4. Batch DB Write: parallelized chunked updates for updates
    if (toUpdateMap.size > 0) {
      if (jobId) {
        const prog = importProgresses.get(jobId);
        if (prog) {
          prog.status = "saving";
          prog.statusText = `正在同步覆写 ${toUpdateMap.size} 道系统已有重名题目关联内容...`;
        }
      }
      const UPDATE_BATCH_SIZE = 50;
      const updateEntries = Array.from(toUpdateMap.entries()); // [id, data][]
      for (let idx = 0; idx < updateEntries.length; idx += UPDATE_BATCH_SIZE) {
        const chunk = updateEntries.slice(idx, idx + UPDATE_BATCH_SIZE);
        await Promise.all(
          chunk.map(([id, data]) =>
            prisma.question.update({
              where: { id },
              data,
            })
          )
        );
      }
    }

    // 5. Update the totalCount in QuestionBank
    if (jobId) {
      const prog = importProgresses.get(jobId);
      if (prog) {
        prog.statusText = "正在刷新题库总目数量缓存...";
      }
    }
    const count = await prisma.question.count({
      where: { questionBankId },
    });

    await prisma.questionBank.update({
      where: { id: questionBankId },
      data: { totalCount: count },
    });

    // 6. Create the ImportBatch record
    if (jobId) {
      const prog = importProgresses.get(jobId);
      if (prog) {
        prog.statusText = "正在生成并导出归属批次导入日志...";
      }
    }
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

    if (jobId) {
      const prog = importProgresses.get(jobId);
      if (prog) {
        prog.status = "completed";
        prog.statusText = `完美收官！已完成 ${result.successCount} 道题目的载入归纳。`;
        prog.result = result;
      }
    }

    return result;
  } catch (err: any) {
    if (jobId) {
      const prog = importProgresses.get(jobId);
      if (prog) {
        prog.status = "failed";
        prog.statusText = "导入进程发生严重中断";
        prog.errorMsg = err.message || String(err);
      }
    }
    throw err;
  }
}
