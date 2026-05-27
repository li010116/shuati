"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import { importApi, ImportResponseData } from "@/src/api/importApi";
import { statisticsApi, StatOverview } from "@/src/api/statisticsApi";
import { backupApi } from "@/src/api/backupApi";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Upload,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  X,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertOctagon,
  Download,
  FileJson
} from "lucide-react";

export default function QuestionBanksPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Create state variables
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  // Edit state variables
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Upload state variables
  const [uploadBankId, setUploadBankId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponseData | null>(null);

  // Stats drawer or item
  const [detailsBank, setDetailsBank] = useState<QuestionBank | null>(null);
  const [detailsStats, setDetailsStats] = useState<StatOverview | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const bList = await questionBankApi.getAll();
      setBanks(bList);
    } catch (err: any) {
      setError(err.message || "加载题库列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      setError("");
      setMessage("");
      await questionBankApi.create(createName, createDesc);
      setMessage("题库创建成功！");
      setCreateName("");
      setCreateDesc("");
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "创建题库失败");
    }
  };

  const startEdit = (b: QuestionBank) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditDesc(b.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;

    try {
      setError("");
      setMessage("");
      await questionBankApi.update(editingId, editName, editDesc);
      setMessage("题库更新成功！");
      setEditingId(null);
      loadData();
    } catch (err: any) {
      setError(err.message || "更新题库失败");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const doubleCheck = confirm(`确定删除题库「${name}」及其下的所有面试题与错题、收藏记录吗？此操作不可撤销！`);
    if (!doubleCheck) return;

    try {
      setError("");
      setMessage("");
      await questionBankApi.delete(id);
      setMessage(`题库 ${name} 已彻底删除！`);
      if (detailsBank?.id === id) {
        setDetailsBank(null);
        setDetailsStats(null);
      }
      loadData();
    } catch (err: any) {
      setError(err.message || "删除题库失败");
    }
  };

  const handleUploadClick = (bankId: number) => {
    setUploadBankId(bankId);
    setSelectedFile(null);
    setImportResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadBankId || !selectedFile) return;

    try {
      setUploading(true);
      setError("");
      setImportResult(null);

      const res = await importApi.importExistingBank(uploadBankId, selectedFile);
      setImportResult(res);
      setMessage(`追加Excel到题库完成！成功导入 ${res.successCount} 道。`);
      loadData();
    } catch (err: any) {
      setError(err.message || "导入题库失败");
    } finally {
      setUploading(false);
    }
  };

  const viewDetails = async (bank: QuestionBank) => {
    try {
      setDetailsBank(bank);
      setDetailsStats(null);
      const res = await statisticsApi.getOverview(bank.id);
      setDetailsStats(res);
    } catch (err: any) {
      setError(`加载题库统计详情失败: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500 font-mono">LOADING BANK MANAGEMENT CONTROL PANEL...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 p-r-8 shadow-xs flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-neutral-500" />
              题库配置中心
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              在这里可以手动增加题库卡片、配置专属资料文档、添加 Excel 并且批量进行级联擦除。
            </p>
          </div>
          <button
            onClick={() => {
              setCreateName("");
              setCreateDesc("");
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>新建空工作仓</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs" id="banks-error-toast">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs" id="banks-success-toast">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center - Banks List */}
          <div className="lg:col-span-2 space-y-4">
            {banks.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-dashed border-neutral-300 text-center flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 text-neutral-300 mb-2" />
                <p className="text-sm font-semibold text-neutral-700">没有托管任何面试题库</p>
                <p className="text-xs text-neutral-400 mt-1">赶快点击右上角“新建空工作仓”或导入 Excel 资源开始吧！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                      editingId === bank.id ? "border-amber-400 ring-2 ring-amber-100" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {editingId === bank.id ? (
                      /* Editing Form Row inline or popup */
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">题库名称</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-xs focus:ring-1 focus:ring-blue-500"
                            placeholder="如：PostgreSQL 精通题库"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">题库说明</label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-xs focus:ring-1 focus:ring-blue-500"
                            placeholder="描述此题库主要涉及哪些高频考查点"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-amber-600 text-white px-3 py-1.5 rounded text-[11px] font-semibold"
                          >
                            保存修改
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded text-[11px] font-semibold"
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Standard Row View */
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                              {bank.name}
                              <span className="text-[10px] font-medium bg-neutral-100 border text-neutral-500 px-1.5 py-0.5 rounded">
                                #{bank.id}
                              </span>
                            </h4>
                            <p className="text-xs text-neutral-400 mt-1 lines-clamp-2">{bank.description || "暂无描述"}</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(bank)}
                              className="p-1.5 text-neutral-500 hover:text-amber-600 rounded bg-neutral-50 border border-neutral-100"
                              title="编辑信息"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(bank.id, bank.name)}
                              className="p-1.5 text-neutral-500 hover:text-rose-600 rounded bg-neutral-50 border border-neutral-100"
                              title="彻底删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-400 font-mono">
                          <div>
                            题目总数: <span className="text-neutral-900 font-bold font-sans">{bank.totalCount} 题</span>
                          </div>
                          <div className="truncate" title={bank.sourceFile || "未知"}>
                            物理媒介: <span className="text-neutral-700 font-sans">{bank.sourceFile ? "Excel归入" : "手动录入"}</span>
                          </div>
                          <div className="sm:col-span-2 text-right">
                            创建时间: <span className="text-neutral-600">{new Date(bank.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-50/50 p-2 rounded-lg border border-neutral-100 mt-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => viewDetails(bank)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded"
                            >
                              统计与数据概览
                            </button>
                            <button
                              onClick={() => handleUploadClick(bank.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>追加 Excel</span>
                            </button>
                            
                            <button
                              onClick={async () => {
                                try {
                                  await backupApi.downloadBackupFile(bank.id, "xlsx");
                                  setMessage(`题库「${bank.name}」已成功导出为 Excel 表格并开始下载！`);
                                  setError("");
                                } catch (err: any) {
                                  setError(err.message || "导出 Excel 失败");
                                  setMessage("");
                                }
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-600 bg-teal-50/50 hover:bg-teal-50 border border-teal-100 rounded flex items-center gap-1"
                              title="将该题库导出为标准 Excel 表格"
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                              <span>导出 Excel</span>
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await backupApi.downloadBackupFile(bank.id, "json");
                                  setMessage(`题库「${bank.name}」已成功导出高保真 JSON 备份并开始下载！`);
                                  setError("");
                                } catch (err: any) {
                                  setError(err.message || "备份 JSON 失败");
                                  setMessage("");
                                }
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded flex items-center gap-1"
                              title="获取该题库高保真 JSON 全状态备份"
                            >
                              <Download className="w-3 h-3" />
                              <span>备份 JSON</span>
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/questions?questionBankId=${bank.id}`}
                              className="text-[11px] text-neutral-500 hover:text-neutral-800 font-semibold px-2.5 py-1 border border-neutral-200 rounded"
                            >
                              列表
                            </Link>
                            <Link
                              href={`/practice?questionBankId=${bank.id}`}
                              className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1 rounded shadow-xs"
                            >
                              进仓练习
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Layout Sidebar - Details Drawer / File Append Area */}
          <div className="space-y-4">
            {/* Modal-like File Upload for specific bank block */}
            {uploadBankId && (
              <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    追加导入 Excel
                  </h3>
                  <button
                    onClick={() => {
                      setUploadBankId(null);
                      setSelectedFile(null);
                      setImportResult(null);
                    }}
                    className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-neutral-500">
                  目标题库：<span className="font-bold text-neutral-800">「{banks.find((b) => b.id === uploadBankId)?.name}」</span>
                </div>

                <form onSubmit={handleImportSubmit} className="space-y-3">
                  <div className="border-2 border-dashed border-indigo-100 rounded-lg p-4 text-center hover:bg-indigo-50/30 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-indigo-700">
                      {selectedFile ? selectedFile.name : "点击或拖拽上传 Excel"}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1">仅支持 .xlsx, .xls</p>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    {uploading ? "正在极速导入解析..." : "立即追加合并题目"}
                  </button>
                </form>

                {importResult && (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg text-xs space-y-1">
                    <p className="font-bold">导入成功汇总：</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      <li>总读取行数：{importResult.totalCount}</li>
                      <li>成功合并数：{importResult.successCount} (追加：{importResult.createdCount} / 覆写：{importResult.updatedCount})</li>
                      <li>失败错误行：{importResult.failCount}</li>
                    </ul>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2 border-t border-emerald-200 pt-2 text-rose-700">
                        <p className="font-bold text-[10px]">错误提示 (最前10条)：</p>
                        <p className="text-[10px] break-words line-clamp-3">{importResult.errors.join("; ")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Questions Bank Detailed Stats card showing on clicking a card */}
            {detailsBank && (
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-neutral-400" />
                    题库宏观分析
                  </h3>
                  <button
                    onClick={() => {
                      setDetailsBank(null);
                      setDetailsStats(null);
                    }}
                    className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-neutral-900">{detailsBank.name}</div>
                  <div className="text-[10px] text-neutral-400">ID编号: #{detailsBank.id}</div>
                </div>

                {detailsStats ? (
                  <div className="space-y-3">
                    <div className="bg-neutral-50 px-3 py-2.5 rounded-lg border border-neutral-200/50 flex items-center justify-between">
                      <span className="text-xs text-neutral-500 font-medium">综合掌握率</span>
                      <span className="text-sm font-bold text-emerald-600">{detailsStats.masteryRate}%</span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span>题库总共</span>
                        <span className="font-bold font-mono">{detailsStats.totalQuestions} 道</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600">
                        <span className="font-medium">已掌握</span>
                        <span className="font-bold font-mono">{detailsStats.masteredCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-600">
                        <span className="font-medium font-sans">模糊（需要重温）</span>
                        <span className="font-bold font-mono">{detailsStats.uncertainCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-600">
                        <span className="font-medium">未掌握（继续加强）</span>
                        <span className="font-bold font-mono">{detailsStats.notMasteredCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-600">
                        <span className="font-medium">错题集收纳</span>
                        <span className="font-bold font-mono">{detailsStats.wrongCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-orange-600">
                        <span className="font-medium">待补齐参考答案</span>
                        <span className="font-bold font-mono">{detailsStats.missingAnswerCount}</span>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${detailsStats.masteryRate}%` }}></div>
                    </div>

                    <Link
                      href={`/practice?questionBankId=${detailsBank.id}`}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      <span>开启专属强化刷题</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 justify-center py-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在进行数据聚类宏观分析...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Bank Modal Drawer Popup */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-neutral-200 max-w-md w-full p-6 space-y-4 animate-scaleUp">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  新建独立面试题库仓
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded text-neutral-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 block">题库名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="例如：MySQL 核心高频考点"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 block text-sans">题库详细介绍说明</label>
                  <textarea
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="请输入针对该题库范围、适宜人群、掌握标准等详细引导备注"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-neutral-100 text-neutral-600 font-semibold text-xs rounded-lg hover:bg-neutral-200"
                  >
                    放弃取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-100"
                  >
                    立即建仓
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
