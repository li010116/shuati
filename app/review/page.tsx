"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionApi, Question, QuestionQueryParams } from "@/src/api/questionApi";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import {
  BookMarked,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  XCircle,
  Star,
  AlertOctagon,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown
} from "lucide-react";

export default function ReviewPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filters State
  const [keyword, setKeyword] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [masteryStatus, setMasteryStatus] = useState("");

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const initData = async () => {
    try {
      const bList = await questionBankApi.getAll();
      setBanks(bList);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setCurrentPage(1);

      const params: QuestionQueryParams = {
        page: 1,
        pageSize: 40,
        keyword: keyword.trim(),
        questionBankId: selectedBankId || undefined,
        primaryCategory: primaryCategory.trim() || undefined,
        difficulty: difficulty || undefined,
        masteryStatus: masteryStatus || undefined,
      };

      const res = await questionApi.query(params);
      setQuestions(res.list);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || "获取背题列表异常");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreQuestions = async () => {
    if (loading || loadingMore || questions.length >= total) return;
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const params: QuestionQueryParams = {
        page: nextPage,
        pageSize: 40,
        keyword: keyword.trim(),
        questionBankId: selectedBankId || undefined,
        primaryCategory: primaryCategory.trim() || undefined,
        difficulty: difficulty || undefined,
        masteryStatus: masteryStatus || undefined,
      };

      const res = await questionApi.query(params);
      setQuestions((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        const uniqueNew = res.list.filter((q) => !existingIds.has(q.id));
        return [...prev, ...uniqueNew];
      });
      setTotal(res.total);
      setCurrentPage(nextPage);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await initData();
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      await loadQuestions();
    };
    run();
  }, [selectedBankId, primaryCategory, difficulty, masteryStatus]);

  useEffect(() => {
    if (loading || loadingMore || questions.length >= total) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreQuestions();
        }
      },
      { rootMargin: "300px" }
    );

    const currentTarget = loadMoreRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, loadingMore, questions.length, total, currentPage, keyword, selectedBankId, primaryCategory, difficulty, masteryStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  const handleUpdateMastery = async (id: number, status: string) => {
    try {
      await questionApi.updateMastery(id, status);
      // Synchronously edit local list status
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, masteryStatus: status, reviewCount: q.reviewCount + 1 } : q))
      );
    } catch (e: any) {
      alert(`变更状态出错: ${e.message}`);
    }
  };

  const handleToggleFavorite = async (q: Question) => {
    try {
      const nextFav = !q.isFavorite;
      await questionApi.updateFavorite(q.id, nextFav);
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isFavorite: nextFav } : item)));
    } catch (err: any) {
      alert(err.message || "修改收藏状态故障");
    }
  };

  const handleAddToWrong = async (id: number) => {
    try {
      await questionApi.addWrong(id);
      setQuestions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, wrongCount: item.wrongCount + 1 } : item))
      );
      setMessage("已成功加入错题集！");
      setTimeout(() => setMessage(""), 2200);
    } catch (e: any) {
      alert(`加入错题集异常: ${e.message}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner with header context */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-neutral-500" />
              快速速背模式 (DECK INDEX)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              本页面同时将题目和参考答案全盘铺平展示，支持按题库、专项、难度检索。当前已载入 <span className="font-semibold text-neutral-800 font-mono">{questions.length}</span> 道 (共计 <span className="font-semibold text-neutral-800 font-mono">{total}</span> 道)。
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs">
            {message}
          </div>
        )}

        {/* Filters control form */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="键入关键字快速筛查内容进行速背..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg shrink-0"
            >
              检索
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-neutral-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">源题库仓</label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-md bg-white focus:outline-hidden text-xs"
              >
                <option value="">全部题库</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">一级分类</label>
              <input
                type="text"
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                placeholder="模糊定位分类..."
                className="w-full p-2 border border-neutral-200 rounded-md bg-white focus:outline-hidden text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">基础难度</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-md bg-white focus:outline-hidden text-xs"
              >
                <option value="">全部难度</option>
                <option value="简单">简单</option>
                <option value="普通">普通</option>
                <option value="困难">困难</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">掌握程度</label>
              <select
                value={masteryStatus}
                onChange={(e) => setMasteryStatus(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-md bg-white focus:outline-hidden text-xs"
              >
                <option value="">全部状态</option>
                <option value="未学习">未学习</option>
                <option value="未掌握">未掌握</option>
                <option value="模糊">模糊</option>
                <option value="已掌握">已掌握</option>
              </select>
            </div>
          </div>
        </div>

        {/* Review Cards scroll layout list */}
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-2 text-xs text-neutral-400">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>正在飞速拉取速记文档...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center text-neutral-400 border border-dashed flex flex-col items-center">
            <BookMarked className="w-12 h-12 text-neutral-300 mb-2" />
            <p className="text-sm font-semibold text-neutral-700">未检索到对应的速背题目</p>
            <p className="text-xs">您可以选择其他过滤标签或录入新题后查阅。</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {questions.map((q) => {
              let tagColor = "text-neutral-500 bg-neutral-100 border-neutral-200";
              if (q.masteryStatus === "已掌握") tagColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
              else if (q.masteryStatus === "模糊") tagColor = "text-amber-700 bg-amber-50 border-amber-100";
              else if (q.masteryStatus === "未掌握") tagColor = "text-rose-700 bg-rose-50 border-rose-100";

              return (
                <div key={q.id} className="bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all p-5 shadow-xs space-y-4 relative">
                  {/* Top categorization */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-100">
                    <div className="flex items-center gap-1.5 text-[10.5px]">
                      <span className="font-mono text-[10px] bg-neutral-100 border font-bold text-neutral-500 px-1.5 rounded-sm">
                        {q.questionId}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-700 bg-stone-50 px-1.5 py-0.5 rounded border">
                        {q.primaryCategory}
                      </span>
                      {q.secondaryCategory && (
                        <span className="text-neutral-400">/ {q.secondaryCategory}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10.5px]">
                      <span className="text-neutral-400">库门: {q.questionBank?.name || "综合库"}</span>
                      <span className="text-neutral-300">|</span>
                      <span className={`px-1.5 py-0.5 rounded border font-bold ${
                        q.difficulty === "困难" ? "text-rose-700 bg-rose-50 border-rose-150" : q.difficulty === "简单" ? "text-emerald-700 bg-emerald-50 border-emerald-150" : "text-blue-700 bg-blue-50 border-blue-150"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Core display layouts */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-neutral-900 leading-relaxed font-sans select-text">
                      {q.title}
                    </h3>

                    {q.answer ? (
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/50 text-xs text-neutral-800 leading-relaxed font-mono whitespace-pre-wrap select-text">
                        {q.answer}
                      </div>
                    ) : (
                      <div className="bg-stone-50 border border-dashed text-neutral-400 p-4 rounded-xl text-center text-[11px] select-text">
                        （参考答案缺失，欢迎通过列表前往编辑补上）
                      </div>
                    )}

                    {q.note && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 border px-3 py-2 rounded-lg">
                        备忘笔记: {q.note}
                      </p>
                    )}
                  </div>

                  {/* Footer inline modifiers & indicators action */}
                  <div className="bg-neutral-50/50 p-2.5 border rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400 font-medium">标记当前：</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleUpdateMastery(q.id, "已掌握")}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.masteryStatus === "已掌握" ? "bg-emerald-600 text-white shadow-xs" : "bg-white hover:bg-emerald-50 text-emerald-600 border"
                          }`}
                        >
                          已掌握
                        </button>
                        <button
                          onClick={() => handleUpdateMastery(q.id, "模糊")}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.masteryStatus === "模糊" ? "bg-amber-500 text-white shadow-xs" : "bg-white hover:bg-amber-50 text-amber-600 border"
                          }`}
                        >
                          模糊
                        </button>
                        <button
                          onClick={() => handleUpdateMastery(q.id, "未掌握")}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.masteryStatus === "未掌握" ? "bg-rose-600 text-white shadow-xs" : "bg-white hover:bg-rose-50 text-rose-600 border"
                          }`}
                        >
                          未掌握
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(q)}
                        className={`p-1.5 rounded-md border flex items-center gap-1 ${
                          q.isFavorite
                            ? "bg-amber-50 text-amber-500 border-amber-200"
                            : "bg-white text-neutral-400 hover:text-amber-500 border-neutral-200"
                        }`}
                        title="收藏题目"
                      >
                        <Star className={`w-3.5 h-3.5 ${q.isFavorite ? "fill-amber-500" : ""}`} />
                        <span className="text-[10px] font-semibold">收藏</span>
                      </button>

                      <button
                        onClick={() => handleAddToWrong(q.id)}
                        className="p-1.5 bg-white text-neutral-400 hover:text-rose-600 border border-neutral-200 rounded-md flex items-center gap-1"
                        title="记入错题集"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-semibold">记错 ({q.wrongCount}次)</span>
                      </button>

                      <Link
                        href={`/questions/${q.id}`}
                        className="p-1.5 bg-white text-neutral-400 hover:text-blue-600 hover:border-blue-100 border rounded-md inline-block text-[10px] font-semibold"
                        title="查阅详细和追溯轴"
                      >
                        追溯
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More trigger element */}
            <div ref={loadMoreRef} className="pt-4 pb-8 flex flex-col items-center justify-center">
              {loadingMore ? (
                <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                  <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>正在动态加载更多精品题目...</span>
                </div>
              ) : questions.length < total ? (
                <button
                  onClick={loadMoreQuestions}
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white border text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>加载更多题目</span>
                  <span className="text-[10px] text-neutral-300 font-mono">({questions.length} / {total} 道)</span>
                </button>
              ) : (
                <p className="text-xs text-neutral-300 select-none pb-4 font-medium tracking-wide">
                  — 已全盘展示全部 {total} 道速记题目 —
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
