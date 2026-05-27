"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionApi, Question, QuestionQueryParams } from "@/src/api/questionApi";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import {
  Star,
  Search,
  Eye,
  CheckCircle,
  HelpCircle,
  XCircle,
  AlertOctagon,
  GraduationCap,
  Play,
  Check
} from "lucide-react";

export default function FavoritesPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filter state
  const [selectedBankId, setSelectedBankId] = useState("");

  // Revealed map state
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

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

      const params: QuestionQueryParams = {
        page: 1,
        pageSize: 150, // Grab bookmarked records safely
        questionBankId: selectedBankId || undefined,
        isFavorite: "true", // Filter solely favors
      };

      const res = await questionApi.query(params);
      setQuestions(res.list);
    } catch (err: any) {
      setError(err.message || "获取收藏列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedBankId]);

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
      alert(`更新更错掌握度失败: ${e.message}`);
    }
  };

  const handleRemoveFavorite = async (id: number, title: string) => {
    try {
      setError("");
      setMessage("");
      await questionApi.updateFavorite(id, false);
      setMessage("已成功取消收藏。");
      setTimeout(() => setMessage(""), 2000);
      loadQuestions();
    } catch (err: any) {
      setError(err.message || "取消收藏失败");
    }
  };

  const handleAddToWrong = async (id: number) => {
    try {
      await questionApi.addWrong(id);
      setQuestions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, wrongCount: item.wrongCount + 1 } : item))
      );
      setMessage("已记错并留存日志！");
      setTimeout(() => setMessage(""), 2200);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner header controls */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              收藏夹考点专线 (FAVORITES RADAR)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              这里收罗了您在刷题或背题过程中点击标星的精品高频考点。您可以选择题库，或点击右侧一键直达进行专项自测。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white outline-hidden text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-neutral-700 min-w-[150px]"
            >
              <option value="">全部题库收藏过滤</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.name} 专区</option>
              ))}
            </select>

            <Link
              href={selectedBankId ? `/practice?questionBankId=${selectedBankId}&isFavorite=true` : `/practice?isFavorite=true`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all text-center flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>进入收藏专项测试</span>
            </Link>
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

        {/* Content scrolling grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-2 text-xs text-neutral-400">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>调出收藏记录档案里...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl p-16 border border-dashed text-neutral-400 text-center flex flex-col items-center">
            <Star className="w-12 h-12 text-neutral-300 mb-3" />
            <p className="text-sm font-semibold text-neutral-700 font-sans">收藏夹暂时为空 ✨</p>
            <p className="text-xs">在刷题、背题或题库列表页中点击“标星”即可归录至此。</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto anim-easeIn">
            {questions.map((q) => {
              const showAns = !!revealedIds[q.id];

              return (
                <div key={q.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4 relative hover:border-amber-200 transition-all border-l-amber-500 border-l-4">
                  {/* Item top classification labels */}
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

                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <span>{q.questionBank?.name}</span>
                      <span className="text-stone-300">|</span>
                      <span className={`px-1.5 rounded-sm font-semibold ${
                        q.difficulty === "困难" ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body texts elements */}
                  <div className="space-y-3 font-sans">
                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-relaxed select-text">
                      {q.title}
                    </h3>

                    {showAns && (
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-800 font-mono whitespace-pre-wrap leading-relaxed select-text">
                        {q.answer || "（参考解析缺失，欢迎在列表页进行修改填充）"}
                      </div>
                    )}

                    {q.note && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 border px-3 py-1.5 rounded-lg">
                        备忘笔记: {q.note}
                      </p>
                    )}
                  </div>

                  {/* Operational actions tools footers */}
                  <div className="bg-neutral-50/50 p-2.5 border rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400 font-medium font-sans">标记掌握度：</span>
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
                        <span>{showAns ? "隐藏隐藏" : "查阅答案"}</span>
                      </button>

                      <button
                        onClick={() => handleAddToWrong(q.id)}
                        className="p-1 px-2.5 bg-white text-neutral-400 hover:text-rose-650 border rounded-md flex items-center gap-1 font-semibold text-[10.5px]"
                        title="强制计错记录错误本"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                        <span>归错</span>
                      </button>

                      <button
                        onClick={() => handleRemoveFavorite(q.id, q.title)}
                        className="p-1 px-2.5 bg-amber-500 text-white hover:bg-amber-600 rounded-md flex items-center gap-1 font-semibold text-[10.5px] shadow-xs"
                        title="取消收藏并移出"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>取消标星</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
