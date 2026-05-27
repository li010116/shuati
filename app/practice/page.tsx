"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import { questionApi, Question, QuestionQueryParams } from "@/src/api/questionApi";
import {
  GraduationCap,
  Play,
  RotateCcw,
  BookOpen,
  Eye,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Star,
  AlertOctagon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Check,
  Edit2
} from "lucide-react";

export default function PracticePage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  
  // Custom states
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  // Filters setup states
  const [filterBankId, setFilterBankId] = useState("");
  const [filterPrimaryCategory, setFilterPrimaryCategory] = useState("");
  const [filterSecondaryCategory, setFilterSecondaryCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterImportance, setFilterImportance] = useState("");
  const [filterMastery, setFilterMastery] = useState("");
  const [filterOnlyFavorite, setFilterOnlyFavorite] = useState(false);
  const [filterOnlyWrong, setFilterOnlyWrong] = useState(false);
  const [filterOnlyMissingAnswer, setFilterOnlyMissingAnswer] = useState(false);
  const [sortOrder, setSortOrder] = useState<"order" | "random">("order");

  // Live Note modification state during practice
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoadingBanks(true);
        const res = await questionBankApi.getAll();
        setBanks(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  const handleStartPractice = async () => {
    try {
      setLoadingSession(true);
      
      const queryParams: QuestionQueryParams = {
        page: 1,
        pageSize: 500, // retrieve up to 500 items to fit practicing sessions
        questionBankId: filterBankId || undefined,
        primaryCategory: filterPrimaryCategory.trim() || undefined,
        secondaryCategory: filterSecondaryCategory.trim() || undefined,
        difficulty: filterDifficulty || undefined,
        importance: filterImportance || undefined,
        masteryStatus: filterMastery || undefined,
        isFavorite: filterOnlyFavorite ? "true" : undefined,
        hasWrong: filterOnlyWrong ? "true" : undefined,
        isAnswerMissing: filterOnlyMissingAnswer ? "true" : undefined,
      };

      const res = await questionApi.query(queryParams);
      
      let items = res.list;

      if (items.length === 0) {
        alert("找不到符合筛选条件的题目，请调整范围后重试！");
        return;
      }

      // Handle Random shuffling if selected
      if (sortOrder === "random") {
        items = [...items].sort(() => Math.random() - 0.5);
      }

      setQuestions(items);
      setCurrentIndex(0);
      setRevealed(false);
      setNoteText(items[0]?.note || "");
      setStarted(true);
    } catch (e: any) {
      alert(`启动刷题任务失败: ${e.message}`);
    } finally {
      setLoadingSession(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleRevealAnswer = async () => {
    if (revealed || !currentQ) return;
    setRevealed(true);
    try {
      // Record viewing answer backend chronicle
      await questionApi.viewAnswer(currentQ.id);
    } catch (e) {
      console.error("View answer log fail", e);
    }
  };

  const handleUpdateMastery = async (status: string) => {
    if (!currentQ) return;
    try {
      const patchedQ = await questionApi.updateMastery(currentQ.id, status);
      
      // Update our local state array
      setQuestions((prev) =>
        prev.map((item, idx) => (idx === currentIndex ? { ...item, masteryStatus: status } : item))
      );

      // Auto scroll to next question after 350ms to yield clean UX
      setTimeout(() => {
        handleNextQuestion();
      }, 300);
    } catch (e: any) {
      alert(`更新状态失败: ${e.message}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentQ) return;
    try {
      const targetState = !currentQ.isFavorite;
      await questionApi.updateFavorite(currentQ.id, targetState);
      setQuestions((prev) =>
        prev.map((item, idx) => (idx === currentIndex ? { ...item, isFavorite: targetState } : item))
      );
    } catch (e: any) {
      alert(`收藏失败: ${e.message}`);
    }
  };

  const handleAddToWrong = async () => {
    if (!currentQ) return;
    try {
      await questionApi.addWrong(currentQ.id);
      setQuestions((prev) =>
        prev.map((item, idx) =>
          idx === currentIndex ? { ...item, wrongCount: item.wrongCount + 1 } : item
        )
      );
      alert("成功计错！错题次数已递增且记录日志。");
    } catch (e: any) {
      alert(`加入错题集故障: ${e.message}`);
    }
  };

  const handleNoteSave = async () => {
    if (!currentQ) return;
    try {
      setSavingNote(true);
      await questionApi.updateNote(currentQ.id, noteText);
      setQuestions((prev) =>
        prev.map((item, idx) => (idx === currentIndex ? { ...item, note: noteText } : item))
      );
      alert("备注保存成功！已记入记录轴。");
    } catch (e: any) {
      alert(`保存备注异常: ${e.message}`);
    } finally {
      setSavingNote(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setRevealed(false);
      setNoteText(questions[nextIdx]?.note || "");
    } else {
      alert("已经是最后一题了！您已通关本此全部刷题任务 🎉");
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setRevealed(false);
      setNoteText(questions[prevIdx]?.note || "");
    }
  };

  if (loadingBanks) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500 font-mono">LOADING BANK PRESETS...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {!started ? (
          /* PRE-PRACTICE RANGE SELECTOR */
          <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 max-w-2xl mx-auto shadow-xs space-y-6">
            <div className="text-center space-y-2 pb-4 border-b">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full inline-block">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                面试刷题范围筛选
              </h2>
              <p className="text-xs text-neutral-400">
                可定制化设定专项考核范围，每次刷一道，即时标记，高效巩固。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">题目来源仓库</label>
                <select
                  value={filterBankId}
                  onChange={(e) => setFilterBankId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">全部题库混合考核</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">专项一级分类 (模糊名)</label>
                <input
                  type="text"
                  placeholder="留空即为不限，如: Java基础"
                  value={filterPrimaryCategory}
                  onChange={(e) => setFilterPrimaryCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">专项二级分类 (模糊名)</label>
                <input
                  type="text"
                  placeholder="留空即为不限，如: JVM原理"
                  value={filterSecondaryCategory}
                  onChange={(e) => setFilterSecondaryCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">题目难度筛选</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">全部难度</option>
                  <option value="简单">简单</option>
                  <option value="普通">普通</option>
                  <option value="困难">困难</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">核心重要程度</label>
                <select
                  value={filterImportance}
                  onChange={(e) => setFilterImportance(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">不限重要性</option>
                  <option value="普通">普通</option>
                  <option value="重要">重要</option>
                  <option value="极为重要">极为重要</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">学习掌握状态</label>
                <select
                  value={filterMastery}
                  onChange={(e) => setFilterMastery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">全部掌握状态</option>
                  <option value="未学习">未学习</option>
                  <option value="未掌握">未掌握</option>
                  <option value="模糊">模糊</option>
                  <option value="已掌握">已掌握</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 block">刷题呈现顺序</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="order">顺序推进模式</option>
                  <option value="random">随机乱序历练 (洗牌)</option>
                </select>
              </div>
            </div>

            {/* Quick checkbox markers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t pt-4 text-xs text-neutral-600 font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterOnlyFavorite}
                  onChange={(e) => setFilterOnlyFavorite(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-0.5 text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-current" /> 只刷收藏星题
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterOnlyWrong}
                  onChange={(e) => setFilterOnlyWrong(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-0.5 text-rose-600">
                  <AlertOctagon className="w-3.5 h-3.5" /> 只刷错题集题目
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterOnlyMissingAnswer}
                  onChange={(e) => setFilterOnlyMissingAnswer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-0.5 text-orange-600">
                  <FileText className="w-3.5 h-3.5" /> 只刷未作答考卷
                </span>
              </label>
            </div>

            <button
              onClick={handleStartPractice}
              disabled={loadingSession}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{loadingSession ? "正在匹配考查中..." : "开启专项刷题历练"}</span>
            </button>
          </div>
        ) : (
          /* ACTIVE PRACTICE DECK CONTROL VIEW */
          <div className="space-y-5 max-w-2xl mx-auto">
            {/* Session tracking header */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-neutral-200/80 p-3.5 px-4 shadow-xs">
              <button
                onClick={() => setStarted(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold flex items-center gap-1 bg-neutral-100/50 hover:bg-neutral-100 p-1 px-2.5 border rounded-lg"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>退出练习</span>
              </button>

              <div className="font-mono text-xs text-neutral-500">
                进度:{" "}
                <span className="text-neutral-900 font-bold">
                  {currentIndex + 1}
                </span>{" "}
                / {questions.length} 题
              </div>

              <div className="w-24 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-[100%] rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Main Interactive Question Item Canvas card */}
            {currentQ && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-[16rem]">
                {/* Micro meta details rows */}
                <div className="bg-neutral-50 border-b border-neutral-100 p-4 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="font-mono text-[10px] bg-neutral-200 border text-neutral-600 font-bold px-1.5 rounded">
                      {currentQ.questionId}
                    </span>
                    <span className="font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded border">
                      {currentQ.primaryCategory}
                    </span>
                    {currentQ.secondaryCategory && (
                      <span className="text-neutral-400">/ {currentQ.secondaryCategory}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={`px-1 rounded font-bold ${
                      currentQ.difficulty === "困难" ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                    }`}>
                      {currentQ.difficulty}
                    </span>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-500 font-medium">重要程度：{currentQ.importance}</span>
                  </div>
                </div>

                {/* Substantive text body */}
                <div className="flex-1 p-6 md:p-8 space-y-4">
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-mono text-[9px] font-bold tracking-widest uppercase rounded px-2.5 py-0.5 border border-blue-100 inline-block">
                    面试题干内容 (QUESTION)
                  </span>
                  
                  <h3 className="text-sm font-bold text-neutral-900 leading-relaxed font-sans">
                    {currentQ.title}
                  </h3>

                  {currentQ.tags && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {currentQ.tags.split(/[,，]/).map((t, idx) => (
                        <span key={idx} className="bg-stone-50 text-neutral-500 border border-neutral-200/50 px-2 py-0.5 text-[9px] rounded font-medium">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {currentQ.note && !revealed && (
                    <div className="bg-stone-50 border border-dotted border-stone-300 rounded-lg p-3 text-[11px] text-stone-600 italic">
                      备注脑图: {currentQ.note}
                    </div>
                  )}
                </div>

                {/* Toggle Action to expand visual answer box if collapsed */}
                {!revealed ? (
                  <button
                    onClick={handleRevealAnswer}
                    className="w-full py-4 text-center cursor-pointer border-t bg-blue-50/50 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>点击显示隐藏答案及解析</span>
                  </button>
                ) : (
                  /* Expanded slide-over answers deck */
                  <div className="border-t border-neutral-100 bg-emerald-50/15 p-6 md:p-8 space-y-4 animate-slideDown">
                    <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-mono font-bold tracking-widest uppercase rounded px-2.5 py-0.5 inline-block">
                      核心参考解答 (REFERENCE ANSWER)
                    </span>

                    {currentQ.answer ? (
                      <div className="text-xs text-neutral-800 leading-relaxed max-h-96 overflow-y-auto pr-1 select-text bg-white p-4 rounded-xl border border-neutral-200/60 font-mono whitespace-pre-wrap">
                        {currentQ.answer}
                      </div>
                    ) : (
                      <div className="p-6 bg-stone-50 border border-dashed text-center rounded-xl text-xs text-neutral-400">
                        目前参考答案缺失，欢迎在下方记入个人答案脑图或通过“列表”补齐。
                      </div>
                    )}

                    {currentQ.sourcePage && (
                      <div className="text-[10px] text-neutral-400 font-mono italic">
                        出处页码及媒介: {currentQ.sourcePage}
                      </div>
                    )}

                    {/* Interactive note editing box during review */}
                    <div className="space-y-2 pt-3 border-t">
                      <label className="text-[10px] font-bold text-neutral-400 block uppercase">添加修改私人笔记备忘录 (如: 错因, 背诵口诀)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="为此考点追加记忆注解..."
                          className="flex-1 bg-white px-3 py-2 border rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleNoteSave}
                          disabled={savingNote}
                          className="bg-neutral-800 text-white font-semibold text-xs px-3 rounded-lg border hover:bg-neutral-700 disabled:opacity-50"
                        >
                          {savingNote ? "记" : "保存"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick-clicking status controllers buttons */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs flex justify-between gap-3 items-center">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg disabled:opacity-40 flex items-center gap-1.5 border"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>上一题</span>
              </button>

              {/* Central mastery tagging keys */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateMastery("已掌握")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-0.5"
                  title="完全吃透了，综合掌握"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已掌握</span>
                </button>
                <button
                  onClick={() => handleUpdateMastery("模糊")}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-0.5"
                  title="模棱两可，可能需要重刷"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>糊涂模糊</span>
                </button>
                <button
                  onClick={() => handleUpdateMastery("未掌握")}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-0.5"
                  title="错题！进入重背"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>未掌握</span>
                </button>
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg disabled:opacity-40 flex items-center gap-1.5 border"
              >
                <span>下一题</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick metadata toggles card (wrong, star bookmarks) */}
            {currentQ && (
              <div className="flex gap-2.5 justify-center text-xs">
                <button
                  onClick={handleToggleFavorite}
                  className={`px-4 py-2 border rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold shadow-xs ${
                    currentQ.isFavorite
                      ? "bg-amber-50 text-amber-500 border-amber-200 fill-current"
                      : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <Star className={`w-4 h-4 ${currentQ.isFavorite ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{currentQ.isFavorite ? "已收藏星标" : "标记为收藏"}</span>
                </button>

                <button
                  onClick={handleAddToWrong}
                  className="px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-rose-600 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  <span>强制加入错题 (已错: {currentQ.wrongCount}次)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
