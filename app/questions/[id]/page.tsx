"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { questionApi, Question, ReviewRecord } from "@/src/api/questionApi";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  Star,
  Tag,
  BookOpen,
  CheckCircle,
  HelpCircle,
  XCircle,
  Activity,
  ChevronRight,
  AlertOctagon,
  FileText
} from "lucide-react";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id ? String(params.id) : "";

  const [question, setQuestion] = useState<Question | null>(null);
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      
      const parsedId = parseInt(id, 10);
      const qData = await questionApi.getById(parsedId);
      setQuestion(qData);

      const logList = await questionApi.getReviewRecords(parsedId);
      setRecords(logList);
    } catch (err: any) {
      setError(err.message || "无法拉取本题详情记录数据");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateMastery = async (status: string) => {
    if (!question) return;
    try {
      await questionApi.updateMastery(question.id, status);
      await loadData(); // Reload stats and chronological logs
    } catch (e: any) {
      alert(`变更学习状态失败: ${e.message}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!question) return;
    try {
      const targetState = !question.isFavorite;
      await questionApi.updateFavorite(question.id, targetState);
      await loadData();
    } catch (e: any) {
      alert(`修改收藏异常: ${e.message}`);
    }
  };

  const handleAddToWrong = async () => {
    if (!question) return;
    try {
      await questionApi.addWrong(question.id);
      setMessage("已强制计错一次，错题集次数已递增。");
      setTimeout(() => setMessage(""), 2200);
      await loadData();
    } catch (e: any) {
      alert(`加入错题集异常: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500 font-mono">LOADING QUESTION TRACKER ARCHIVE...</p>
        </div>
      </Layout>
    );
  }

  if (error || !question) {
    return (
      <Layout>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-xl max-w-xl mx-auto text-xs space-y-3">
          <p className="font-bold">加载详情失败</p>
          <p>{error || "该考点编码不存在或已被物理擦除。"}</p>
          <button
            onClick={() => router.push("/questions")}
            className="text-xs text-blue-600 font-semibold underline"
          >
            返回题目大列表页 🔍
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 font-semibold bg-white p-2 border rounded-lg shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回追踪上一层</span>
          </button>

          <Link
            href="/questions"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            返回全局检索大列表
          </Link>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs animate-fadeIn text-slate-805">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Core item breakdown */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-5">
              {/* Categorizations indicator bars */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="font-mono text-[10.5px] font-bold bg-neutral-100 border text-neutral-600 px-2 py-0.5 rounded">
                    题号: {question.questionId}
                  </span>
                  <span className="font-semibold text-neutral-700 bg-stone-100 border px-2 py-0.5 rounded">
                    {question.primaryCategory}
                  </span>
                  {question.secondaryCategory && (
                    <span className="text-neutral-400">/ {question.secondaryCategory}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className={`px-1.5 rounded font-bold ${
                    question.difficulty === "困难" ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                  }`}>
                    {question.difficulty}
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-neutral-500">重要度: {question.importance}</span>
                </div>
              </div>

              {/* Title & tags */}
              <div className="space-y-3 font-sans">
                <span className="text-[10px] bg-blue-50 border border-blue-150 text-blue-600 font-mono font-bold tracking-widest uppercase rounded px-2.5 py-0.5 inline-block">
                  完整记忆题干
                </span>
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 leading-relaxed font-sans select-text">
                  {question.title}
                </h3>

                {question.tags && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    {question.tags.split(/[,，]/).map((t, idx) => (
                      <span key={idx} className="bg-neutral-100 hover:bg-neutral-200/50 text-neutral-600 border px-2 py-0.5 text-[10px] rounded font-medium transition-all">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reference answers */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] bg-emerald-50 border border-emerald-150 text-emerald-600 font-mono font-bold tracking-widest uppercase rounded px-2.5 py-0.5 inline-block">
                  参考技术标准解答
                </span>
                
                {question.answer ? (
                  <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/60 text-xs text-neutral-800 leading-relaxed font-mono whitespace-pre-wrap select-text">
                    {question.answer}
                  </div>
                ) : (
                  <div className="p-8 bg-stone-50 border border-dashed rounded-xl text-center text-xs text-neutral-400">
                    目前参考解答为空。欢迎前去修改完善！
                  </div>
                )}
              </div>

              {/* Source page notes option */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t pt-4">
                <div>
                  <span className="text-neutral-400 block text-[10px]">物理解读参考出处：</span>
                  <span className="text-neutral-700 font-sans mt-0.5 block">{question.sourcePage || "未做书籍坐标备注"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">创建记录时刻：</span>
                  <span className="text-neutral-700 mt-0.5 block">{new Date(question.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* In-place study controllers */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">标记并微调我当前的掌握系数</span>
                <p className="text-xs text-neutral-500 font-medium">当前系数状态: <span className="font-bold underline text-blue-600">{question.masteryStatus}</span></p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateMastery("已掌握")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    question.masteryStatus === "已掌握" ? "bg-emerald-600 text-white" : "bg-neutral-100 hover:bg-emerald-50 text-emerald-600 border"
                  }`}
                >
                  已掌握
                </button>
                <button
                  onClick={() => handleUpdateMastery("模糊")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    question.masteryStatus === "模糊" ? "bg-amber-500 text-white" : "bg-neutral-100 hover:bg-amber-50 text-amber-600 border"
                  }`}
                >
                  模糊
                </button>
                <button
                  onClick={() => handleUpdateMastery("未掌握")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    question.masteryStatus === "未掌握" ? "bg-rose-600 text-white" : "bg-neutral-100 hover:bg-rose-50 text-rose-600 border"
                  }`}
                >
                  未掌握
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Historical logs chase details list */}
          <div className="space-y-4">
            {/* Quick operations panel block */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-widest block pb-1 border-b">
                快捷标记栏
              </h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`px-3 py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs ${
                    question.isFavorite
                      ? "bg-amber-50 text-amber-500 border-amber-200 fill-current"
                      : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${question.isFavorite ? "fill-amber-500" : ""}`} />
                  <span>{question.isFavorite ? "长驻收藏夹中" : "收藏该核心考题"}</span>
                </button>

                <button
                  onClick={handleAddToWrong}
                  className="px-3 py-2 bg-white hover:bg-neutral-50 border text-neutral-600 hover:text-rose-600 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                  <span>自主计错一次</span>
                </button>
              </div>

              {question.note && (
                <div className="bg-neutral-50 p-3 rounded-lg border text-xs text-neutral-600">
                  <p className="font-bold text-neutral-400 text-[10px] uppercase mb-1">私人记事备注</p>
                  <p className="italic font-sans">“ {question.note} ”</p>
                </div>
              )}
            </div>

            {/* Time sequence tracking logs */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                  复习追踪追溯链 ({records.length})
                </h3>
              </div>

              <div className="space-y-1 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>累积查看答案：</span>
                  <span className="font-mono font-bold text-neutral-800">{question.reviewCount}次</span>
                </div>
                <div className="flex justify-between">
                  <span>累积触发错误：</span>
                  <span className="font-mono font-bold text-rose-600">{question.wrongCount}次</span>
                </div>
              </div>

              {records.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center text-sans">本题尚无相关的复习及状态历史回溯踪迹。</p>
              ) : (
                <div className="relative border-l border-neutral-200 pl-4 ml-2.5 space-y-4 max-h-96 overflow-y-auto pr-1">
                  {records.map((r) => (
                    <div key={r.id} className="relative group text-xs text-sans">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-white ring-2 ring-neutral-200 bg-neutral-400 group-hover:bg-blue-600" />
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="font-semibold text-neutral-800">
                          执行动作：{r.actionType}
                        </div>
                        {r.masteryStatus && (
                          <div className="text-[11px] text-neutral-500 italic mt-0.5 pl-2 border-l border-neutral-200/50">
                            变更掌握系数：<span className="font-bold underline text-blue-600">{r.masteryStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
