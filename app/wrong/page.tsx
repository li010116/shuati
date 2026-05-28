"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionApi, Question, QuestionQueryParams } from "@/src/api/questionApi";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import {
  AlertOctagon,
  Search,
  Eye,
  CheckCircle,
  HelpCircle,
  XCircle,
  Star,
  Trash2,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function WrongBookPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filters State
  const [selectedBankId, setSelectedBankId] = useState("");

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Revealed answer state map
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  // Clearing state variables
  const [clearTarget, setClearTarget] = useState<{ id: number; title: string } | null>(null);

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
        questionBankId: selectedBankId || undefined,
        hasWrong: "true", // Strictly wrongCount > 0
      };

      const res = await questionApi.query(params);
      
      // Sort in memory by wrongCount descending as requested in specification
      const sorted = [...res.list].sort((a, b) => b.wrongCount - a.wrongCount);
      setQuestions(sorted);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || "加载错题本故障");
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
        questionBankId: selectedBankId || undefined,
        hasWrong: "true",
      };

      const res = await questionApi.query(params);
      setQuestions((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        const uniqueNew = res.list.filter((q) => !existingIds.has(q.id));
        // Sort combined list by wrongCount descending as requested
        return [...prev, ...uniqueNew].sort((a, b) => b.wrongCount - a.wrongCount);
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
  }, [selectedBankId]);

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
  }, [loading, loadingMore, questions.length, total, currentPage, selectedBankId]);

  const toggleRevealAnswer = async (id: number) => {
    const isRevealed = !!revealedIds[id];
    setRevealedIds((prev) => ({ ...prev, [id]: !isRevealed }));
    if (!isRevealed) {
      try {
        await questionApi.viewAnswer(id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateMastery = async (id: number, status: string) => {
    try {
      await questionApi.updateMastery(id, status);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, masteryStatus: status } : q))
      );
    } catch (e: any) {
      setError(`更新错题掌握度失败: ${e.message}`);
    }
  };

  const handleClearWrongClick = (id: number, title: string) => {
    setClearTarget({ id, title });
  };

  const handleConfirmClearWrong = async () => {
    if (!clearTarget) return;
    const { id } = clearTarget;

    try {
      setError("");
      setMessage("");
      setClearTarget(null);
      await questionApi.clearWrong(id);
      setMessage("已从错题集中成功移出！");
      setTimeout(() => setMessage(""), 2200);
      loadQuestions();
    } catch (err: any) {
      setError(err.message || "清除错题计入发生异常");
    }
  };

  const handleToggleFavorite = async (q: Question) => {
    try {
      const nextFav = !q.isFavorite;
      await questionApi.updateFavorite(q.id, nextFav);
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, isFavorite: nextFav } : item))
      );
    } catch (err: any) {
      alert(err.message || "修改收藏状态故障");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner with summaries info */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
              温故错题集 (ERRATA CENTER)
            </h2>
             <p className="text-xs text-neutral-400 mt-1">
              本错题本自动将所有错题次数 `wrongCount &gt; 0` 的考点归拢。列表按错频倒序展示。当前已载入 <span className="font-semibold text-neutral-800 font-mono">{questions.length}</span> 道 (共计 <span className="font-semibold text-neutral-800 font-mono">{total}</span> 道)。
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white outline-hidden text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-neutral-700"
            >
              <option value="">全部题库错题筛选</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.name} 错题专区</option>
              ))}
            </select>
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

        {/* Total stats highlights for incorrects */}
        <div className="bg-rose-50/40 p-4 border border-rose-200/60 rounded-xl text-xs text-rose-800 flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            对错频排查：当前共收录了 <span className="font-bold font-mono text-sm">{questions.length}</span> 道薄弱错题。您可进行专项自测，并将已经熟记或攻克的试题“清除记录”移出该集。
          </div>
        </div>

        {/* Content list scrolling view */}
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-2 text-xs text-neutral-400">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>分析错题概率数据库中...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl p-16 border border-dashed text-neutral-400 text-center flex flex-col items-center">
            <Check className="w-12 h-12 text-emerald-500 bg-emerald-50 p-2.5 rounded-full mb-3" />
            <p className="text-sm font-semibold text-neutral-700">真棒！您的错题本里空空如也 🎯</p>
            <p className="text-xs">说明在所有题库练习中您都通过了考验，继续保持！</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn">
            {questions.map((q) => {
              const showAns = !!revealedIds[q.id];

              return (
                <div key={q.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4 relative hover:border-rose-200 hover:shadow-xs transition-all border-l-rose-500 border-l-4">
                  {/* Item top labels header */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 text-[10.5px] border-b pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-neutral-100 border text-neutral-500 font-bold px-1.5 rounded">
                        {q.questionId}
                      </span>
                      <span className="font-semibold text-neutral-700 bg-stone-50 px-1.5 py-0.5 rounded border">
                        {q.primaryCategory}
                      </span>
                      {q.secondaryCategory && (
                        <span className="text-neutral-400">/ {q.secondaryCategory}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-150">
                        累积错误数：{q.wrongCount}次
                      </span>
                      <span className="text-neutral-400">|</span>
                      <span className="text-neutral-400">{q.questionBank?.name}</span>
                    </div>
                  </div>

                  {/* Main Question query section */}
                  <div className="space-y-3 font-sans">
                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-relaxed select-text">
                      {q.title}
                    </h3>

                    {showAns && (
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-800 font-mono whitespace-pre-wrap leading-relaxed select-text">
                        {q.answer || "（当前核心参考解答待补足，欢迎至列表内进行编辑填充）"}
                      </div>
                    )}

                    {q.note && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 border px-3 py-1.5 rounded-lg">
                        纠错笔记: {q.note}
                      </p>
                    )}
                  </div>

                  {/* Operational actions footer tools */}
                  <div className="bg-neutral-50/50 p-2.5 border rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400 font-medium">重标当前掌握：</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateMastery(q.id, "已掌握")}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            q.masteryStatus === "已掌握" ? "bg-emerald-600 text-white" : "bg-white hover:bg-emerald-50 text-emerald-600 border"
                          }`}
                        >
                          已掌握
                        </button>
                        <button
                          onClick={() => handleUpdateMastery(q.id, "模糊")}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            q.masteryStatus === "模糊" ? "bg-amber-500 text-white" : "bg-white hover:bg-amber-50 text-amber-600 border"
                          }`}
                        >
                          模糊
                        </button>
                        <button
                          onClick={() => handleUpdateMastery(q.id, "未掌握")}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            q.masteryStatus === "未掌握" ? "bg-rose-600 text-white" : "bg-white hover:bg-rose-50 text-rose-600 border"
                          }`}
                        >
                          未掌握
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleRevealAnswer(q.id)}
                        className="p-1 px-2.5 bg-white text-neutral-600 hover:text-blue-600 border rounded-md flex items-center gap-1 font-semibold text-[10.5px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{showAns ? "隐藏答案" : "查明答案"}</span>
                      </button>

                      <button
                        onClick={() => handleToggleFavorite(q)}
                        className={`p-1 px-2 text-neutral-400 hover:text-amber-500 border rounded-md flex items-center gap-0.5 ${
                          q.isFavorite ? "bg-amber-50 text-amber-500 border-amber-200" : "bg-white"
                        }`}
                        title="收藏星标"
                      >
                        <Star className={`w-3.5 h-3.5 ${q.isFavorite ? "fill-current text-amber-500" : ""}`} />
                      </button>

                      <button
                        onClick={() => handleClearWrongClick(q.id, q.title)}
                        className="p-1 px-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-md flex items-center gap-1 font-semibold text-[10.5px] transition-all"
                        title="攻克并消除错误指标"
                      >
                        <span>移出此集</span>
                      </button>
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
                  <span>正在动态加载更多错题记录...</span>
                </div>
              ) : questions.length < total ? (
                <button
                  onClick={loadMoreQuestions}
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white border text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>加载更多错题</span>
                  <span className="text-[10px] text-neutral-300 font-mono">({questions.length} / {total} 道)</span>
                </button>
              ) : (
                <p className="text-xs text-neutral-300 select-none pb-4 font-medium tracking-wide">
                  — 已展示全部 {total} 道错题记录 —
                </p>
              )}
            </div>
          </div>
        )}
        {/* Clear Wrong Record Confirmation Modal Popup */}
        {clearTarget && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-neutral-200 max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-neutral-800">
                <AlertOctagon className="w-8 h-8 flex-shrink-0 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">
                    确定移出这道错题记录吗？
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    这代表您已攻克此高频考察考点！
                  </p>
                </div>
              </div>

              <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border leading-relaxed">
                题目名称：<strong className="text-neutral-800 font-semibold">{clearTarget.title}</strong>
                <p className="mt-2 text-neutral-600">
                  移出本题将：
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-neutral-600">
                  <li>将这道题目的<strong>累计错题次数清零归位</strong></li>
                  <li>本题将不再进入“高频错题集”中进行重温</li>
                  <li>这 <strong>绝不会</strong> 物理删除题库中的面试题，您可以正常在练习仓中复习它</li>
                </ul>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setClearTarget(null)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-600 font-semibold text-xs rounded-lg hover:bg-neutral-200"
                >
                  取消放弃
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearWrong}
                  className="px-4 py-2 bg-neutral-900 text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 shadow-sm"
                >
                  确定一键移出归零
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
