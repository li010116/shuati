"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionApi, Question, QuestionQueryParams } from "@/src/api/questionApi";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertOctagon,
  Eye,
  CheckCircle2,
  HelpCircle,
  XCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  ChevronDown
} from "lucide-react";

export default function QuestionsPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filters State
  const [keyword, setKeyword] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [importance, setImportance] = useState("");
  const [masteryStatus, setMasteryStatus] = useState("");
  const [isFavorite, setIsFavorite] = useState("");
  const [isAnswerMissing, setIsAnswerMissing] = useState("");
  const [hasWrong, setHasWrong] = useState("");

  // Create & Edit form modals
  const [showModal, setShowModal] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);

  // Form attributes
  const [formBankId, setFormBankId] = useState("");
  const [formQuestionId, setFormQuestionId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formPrimaryCategory, setFormPrimaryCategory] = useState("");
  const [formSecondaryCategory, setFormSecondaryCategory] = useState("");
  const [formQuestionType, setFormQuestionType] = useState("问答题");
  const [formImportance, setFormImportance] = useState("普通");
  const [formDifficulty, setFormDifficulty] = useState("普通");
  const [formTags, setFormTags] = useState("");
  const [formSourcePage, setFormSourcePage] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formMasteryStatus, setFormMasteryStatus] = useState("未学习");

  // Advance filter toggle on mobile
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const initData = async () => {
    try {
      const bList = await questionBankApi.getAll();
      setBanks(bList);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuestions = async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");
      
      const params: QuestionQueryParams = {
        page: targetPage,
        pageSize,
        keyword: keyword.trim(),
        questionBankId: selectedBankId,
        primaryCategory,
        secondaryCategory,
        difficulty,
        importance,
        masteryStatus,
        isFavorite,
        isAnswerMissing,
        hasWrong,
      };

      const res = await questionApi.query(params);
      setQuestions(res.list);
      setTotal(res.total);
      setPage(res.page);
    } catch (err: any) {
      setError(err.message || "获取题目列表失败");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    const run = async () => {
      await initData();
    };
    run();
  }, []);

  // Run whenever search parameters shift
  useEffect(() => {
    const run = async () => {
      await loadQuestions(page);
    };
    run();
  }, [
    selectedBankId,
    primaryCategory,
    secondaryCategory,
    difficulty,
    importance,
    masteryStatus,
    isFavorite,
    isAnswerMissing,
    hasWrong,
    page
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      loadQuestions(1);
    } else {
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedBankId("");
    setPrimaryCategory("");
    setSecondaryCategory("");
    setDifficulty("");
    setImportance("");
    setMasteryStatus("");
    setIsFavorite("");
    setIsAnswerMissing("");
    setHasWrong("");
    setPage(1);
  };

  const handleDelete = async (id: number, title: string) => {
    const check = confirm(`确定删除题目「${title}」吗？相关学习复习记录会级联删除！`);
    if (!check) return;

    try {
      setError("");
      setMessage("");
      await questionApi.delete(id);
      setMessage("题目删除成功！");
      loadQuestions();
    } catch (err: any) {
      setError(err.message || "删除题目失败");
    }
  };

  const handleToggleFavorite = async (q: Question) => {
    try {
      const nextFav = !q.isFavorite;
      await questionApi.updateFavorite(q.id, nextFav);
      // Synchronously patch local list
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, isFavorite: nextFav } : item))
      );
    } catch (err: any) {
      setError(err.message || "修改收藏状态失败");
    }
  };

  const handleAddToWrong = async (q: Question) => {
    try {
      await questionApi.addWrong(q.id);
      setMessage(`成功将《${q.title}》加入错题集！`);
      setTimeout(() => setMessage(""), 2500);
      loadQuestions();
    } catch (err: any) {
      setError(err.message || "加入错题集失败");
    }
  };

  const openCreateModal = () => {
    setEditTargetId(null);
    setFormBankId(banks.length > 0 ? String(banks[0].id) : "");
    setFormQuestionId("");
    setFormTitle("");
    setFormAnswer("");
    setFormPrimaryCategory("");
    setFormSecondaryCategory("");
    setFormQuestionType("问答题");
    setFormImportance("普通");
    setFormDifficulty("普通");
    setFormTags("");
    setFormSourcePage("");
    setFormNote("");
    setFormMasteryStatus("未学习");
    setShowModal(true);
  };

  const openEditModal = (q: Question) => {
    setEditTargetId(q.id);
    setFormBankId(String(q.questionBankId));
    setFormQuestionId(q.questionId);
    setFormTitle(q.title);
    setFormAnswer(q.answer || "");
    setFormPrimaryCategory(q.primaryCategory);
    setFormSecondaryCategory(q.secondaryCategory || "");
    setFormQuestionType(q.questionType);
    setFormImportance(q.importance);
    setFormDifficulty(q.difficulty);
    setFormTags(q.tags || "");
    setFormSourcePage(q.sourcePage || "");
    setFormNote(q.note || "");
    setFormMasteryStatus(q.masteryStatus);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBankId || !formTitle.trim() || !formPrimaryCategory.trim()) {
      alert("请填写所属题库、题目和一级分类！");
      return;
    }

    const payload = {
      questionBankId: parseInt(formBankId, 10),
      questionId: formQuestionId.trim() || undefined,
      title: formTitle.trim(),
      answer: formAnswer.trim() || undefined,
      primaryCategory: formPrimaryCategory.trim(),
      secondaryCategory: formSecondaryCategory.trim() || undefined,
      questionType: formQuestionType,
      importance: formImportance,
      difficulty: formDifficulty,
      tags: formTags.trim() || undefined,
      sourcePage: formSourcePage.trim() || undefined,
      note: formNote.trim() || undefined,
      masteryStatus: formMasteryStatus,
    };

    try {
      setError("");
      setMessage("");
      if (editTargetId) {
        // Edit update
        await questionApi.update(editTargetId, payload);
        setMessage("题目更新成功！");
      } else {
        // Add create
        await questionApi.create(payload);
        setMessage("手动录入题目成功！");
      }
      setShowModal(false);
      loadQuestions();
    } catch (err: any) {
      alert(err.message || "保存题目失败");
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Upper search input row bar details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 md:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-3.5">
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                题目检索控制台
                <span className="font-mono text-xs font-medium bg-neutral-100 border text-neutral-500 px-2 py-0.5 rounded-full">
                  Total: {total} 条
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                可多维度联合筛选并针对某考题进行属性重构、掌握标记或删除擦除。
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>手动录入考题</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="键入题干、答案或标签模糊检索..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            
            <button
              type="submit"
              className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold px-4 rounded-lg flex items-center gap-1"
            >
              搜索
            </button>

            <button
              type="button"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className="px-3 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-medium text-neutral-700 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">高级筛选</span>
            </button>
            
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-500"
              title="重置全部筛选条件"
            >
              重置
            </button>
          </form>

          {/* Advanced Search Filter Grid Drawer Option on Drawer state */}
          {(showFiltersDrawer || selectedBankId || primaryCategory || difficulty || importance || masteryStatus || isFavorite || isAnswerMissing || hasWrong) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-neutral-100 bg-neutral-50/50 p-3.5 rounded-lg border border-neutral-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">题库</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => {
                    setSelectedBankId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部题库</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">一级分类</label>
                <input
                  type="text"
                  placeholder="可筛如：Java基础"
                  value={primaryCategory}
                  onChange={(e) => {
                    setPrimaryCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">难度</label>
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部难度</option>
                  <option value="简单">简单</option>
                  <option value="普通">普通</option>
                  <option value="困难">困难</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">掌握程度</label>
                <select
                  value={masteryStatus}
                  onChange={(e) => {
                    setMasteryStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部掌握状态</option>
                  <option value="未学习">未学习</option>
                  <option value="未掌握">未掌握</option>
                  <option value="模糊">模糊</option>
                  <option value="已掌握">已掌握</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">收藏状态</label>
                <select
                  value={isFavorite}
                  onChange={(e) => {
                    setIsFavorite(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部</option>
                  <option value="true">唯独收藏题</option>
                  <option value="false">仅未收藏题</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">答案缺失状态</label>
                <select
                  value={isAnswerMissing}
                  onChange={(e) => {
                    setIsAnswerMissing(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部答案</option>
                  <option value="true">待补全答案的题目</option>
                  <option value="false">参考答案健全</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">错题筛选</label>
                <select
                  value={hasWrong}
                  onChange={(e) => {
                    setHasWrong(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部题目</option>
                  <option value="true">有错题记录(错题本)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase">重要程度</label>
                <select
                  value={importance}
                  onChange={(e) => {
                    setImportance(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-hidden"
                >
                  <option value="">全部星级</option>
                  <option value="普通">普通</option>
                  <option value="重要">重要</option>
                  <option value="极为重要">极为重要</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs">
            {message}
          </div>
        )}

        {/* Questions list table dashboard */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-xs text-neutral-400">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>从数据库加载考卷数据...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-16 text-center space-y-2 flex flex-col items-center">
              <HelpCircle className="w-12 h-12 text-neutral-300" />
              <p className="text-sm font-semibold text-neutral-700">没有查找到符合条件的面试题目</p>
              <p className="text-xs text-neutral-400">您可以重新检索关键词或添加新题！</p>
              <button onClick={handleResetFilters} className="text-xs text-blue-600 font-semibold underline mt-2">
                清除所有过滤条件
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600 border-collapse">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 uppercase font-bold tracking-wider text-[10px]">
                    <th className="px-4 py-3.5">编号 / 题干</th>
                    <th className="px-4 py-3.5 hidden sm:table-cell">细分层级</th>
                    <th className="px-4 py-3.5 hidden md:table-cell">基础难度</th>
                    <th className="px-4 py-3.5 text-center">掌握度</th>
                    <th className="px-4 py-3.5 text-center">错频</th>
                    <th className="px-4 py-3.5 text-right font-sans">操控动作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {questions.map((q) => {
                    let mastColor = "bg-neutral-100 text-neutral-600";
                    if (q.masteryStatus === "已掌握") mastColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                    else if (q.masteryStatus === "模糊") mastColor = "bg-amber-50 text-amber-700 border border-amber-100";
                    else if (q.masteryStatus === "未掌握") mastColor = "bg-rose-50 text-rose-700 border border-rose-100";

                    return (
                      <tr key={q.id} className="hover:bg-neutral-50/50">
                        {/* Title & unique codes */}
                        <td className="px-4 py-3.5 max-w-sm">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] bg-neutral-100 border text-neutral-500 font-bold px-1.5 rounded">
                              {q.questionId}
                            </span>
                            <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-semibold truncate max-w-[120px]" title={q.questionBank?.name}>
                              {q.questionBank?.name || "综合库"}
                            </span>
                            {q.isAnswerMissing && (
                              <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-0.5 border">
                                <AlertCircle className="w-2.5 h-2.5 text-orange-500" /> 待补答案
                              </span>
                            )}
                          </div>
                          
                          <div className="font-semibold text-neutral-800 tracking-tight mt-1.5 text-xs">
                            {q.title}
                          </div>
                        </td>

                        {/* Categories details */}
                        <td className="px-4 py-3.5 hidden sm:table-cell font-sans">
                          <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border text-[10px]">
                            {q.primaryCategory}
                          </span>
                          {q.secondaryCategory && (
                            <span className="text-neutral-400 ml-1">/ {q.secondaryCategory}</span>
                          )}
                        </td>

                        {/* Core Difficulty metadata details */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <div className="space-y-0.5 font-sans">
                            <span className={`text-[10px] font-semibold px-1 rounded ${
                              q.difficulty === "困难" ? "text-rose-600" : q.difficulty === "简单" ? "text-emerald-600" : "text-neutral-600"
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-neutral-400 block text-[9px] font-medium font-mono">重要: {q.importance}</span>
                          </div>
                        </td>

                        {/* Mastery level bubble */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mastColor}`}>
                            {q.masteryStatus || "未学习"}
                          </span>
                        </td>

                        {/* Record stats count */}
                        <td className="px-4 py-3.5 text-center font-mono text-[10px]">
                          <span className={`${q.wrongCount > 0 ? "text-rose-600 font-bold" : "text-neutral-400"}`}>
                            {q.wrongCount}次
                          </span>
                          <span className="text-neutral-400 block text-[9px]">复习: {q.reviewCount}</span>
                        </td>

                        {/* Row operation modifiers */}
                        <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                          {/* Toggle bookmark */}
                          <button
                            onClick={() => handleToggleFavorite(q)}
                            className={`p-1 rounded border hover:scale-105 transition-all inline-block ${
                              q.isFavorite
                                ? "bg-amber-50 text-amber-500 border-amber-200"
                                : "text-neutral-400 border-neutral-200"
                            }`}
                            title="标记收藏"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Trigger Err */}
                          <button
                            onClick={() => handleAddToWrong(q)}
                            className="p-1 rounded border border-neutral-200 text-neutral-400 hover:text-rose-600"
                            title="计入错题"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/questions/${q.id}`}
                            className="p-1 rounded border border-neutral-200 text-neutral-400 hover:text-blue-600 hover:border-blue-200 inline-block align-middle"
                            title="查看详情与研究记录"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => openEditModal(q)}
                            className="p-1 rounded border border-neutral-200 text-neutral-400 hover:text-amber-500 hover:border-amber-200 align-middle"
                            title="编辑修改"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(q.id, q.title)}
                            className="p-1 rounded border border-neutral-200 text-neutral-400 hover:text-rose-600 select-none align-middle"
                            title="物理删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Simple Pagination bar controllers */}
          {!loading && questions.length > 0 && (
            <div className="bg-neutral-50 px-4 py-3 flex items-center justify-between border-t border-neutral-200 text-neutral-500">
              <span className="text-[10.5px]">
                显示第 <span className="font-semibold text-neutral-800">{(page - 1) * pageSize + 1}</span> 至{" "}
                <span className="font-semibold text-neutral-800">{Math.min(page * pageSize, total)}</span> 条结果，共{" "}
                <span className="font-semibold text-neutral-800">{total}</span> 条
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 text-xs border rounded-lg bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono">
                  {page} / {totalPages} 页
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 text-xs border rounded-lg bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create or Edit question manual Pop-up drawer container */}
        {showModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-neutral-200 max-w-2xl w-full p-6 space-y-4 shadow-xl animate-scaleUp my-8">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                  {editTargetId ? "编辑面试考题信息" : "手动归录高频面试考题"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded text-neutral-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Core relation select options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">所属题库仓 <span className="text-rose-500">*</span></label>
                    <select
                      value={formBankId}
                      onChange={(e) => setFormBankId(e.target.value)}
                      disabled={!!editTargetId}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden bg-white"
                      required
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">自定义题目编号 (留白则自动生成)</label>
                    <input
                      type="text"
                      placeholder="如：Q000101"
                      value={formQuestionId}
                      onChange={(e) => setFormQuestionId(e.target.value)}
                      disabled={!!editTargetId}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">试题题型</label>
                    <select
                      value={formQuestionType}
                      onChange={(e) => setFormQuestionType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="问答题">问答题</option>
                      <option value="单选题">单选题</option>
                      <option value="多选题">多选题</option>
                      <option value="判断题">判断题</option>
                    </select>
                  </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">一级分类目录 <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="如：Java基础、高并发"
                      value={formPrimaryCategory}
                      onChange={(e) => setFormPrimaryCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">二级分类目录 (选填)</label>
                    <input
                      type="text"
                      placeholder="如：JVM原理、多线程"
                      value={formSecondaryCategory}
                      onChange={(e) => setFormSecondaryCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Difficulty Importance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">难度级别</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="简单">简单</option>
                      <option value="普通">普通</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">重要程度</label>
                    <select
                      value={formImportance}
                      onChange={(e) => setFormImportance(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="普通">普通</option>
                      <option value="重要">重要</option>
                      <option value="极为重要">极为重要</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">掌握状态</label>
                    <select
                      value={formMasteryStatus}
                      onChange={(e) => setFormMasteryStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="未学习">未学习</option>
                      <option value="未掌握">未掌握</option>
                      <option value="模糊">模糊</option>
                      <option value="已掌握">已掌握</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-600 block">题干内容 <span className="text-rose-500">*</span></label>
                  <textarea
                    placeholder="请输入完整的面试题题干，简洁有力"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                    rows={2}
                    required
                  />
                </div>

                {/* Answer */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-600 block">参考答案 (留空将被归类为 待补充答案)</label>
                  <textarea
                    placeholder="请输入核心的技术解答、框架用法、源码解析、手写底层等，支持详实解析"
                    value={formAnswer}
                    onChange={(e) => setFormAnswer(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-mono"
                    rows={4}
                  />
                </div>

                {/* Extension detail info options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">标签逗号隔开 (如: 锁, Java8)</label>
                    <input
                      type="text"
                      placeholder="标签1, 标签2"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">来源页码或书籍备注</label>
                    <input
                      type="text"
                      placeholder="如：凤凰架构-183页"
                      value={formSourcePage}
                      onChange={(e) => setFormSourcePage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-600 block font-semibold">私密备忘备注 (仅限自己查看)</label>
                  <input
                    type="text"
                    placeholder="如：字节跳动三面考查过此题"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-neutral-100 text-neutral-600 font-bold rounded-lg hover:bg-neutral-200"
                  >
                    取消放弃
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                  >
                    保存记录
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
