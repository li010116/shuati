"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import { importApi, ImportResponseData } from "@/src/api/importApi";
import { statisticsApi, ImportBatch } from "@/src/api/statisticsApi";
import {
  UploadCloud,
  FileSpreadsheet,
  Layers,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  Info,
  Calendar,
  Clock,
  ChevronRight
} from "lucide-react";

export default function ImportPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Tab state: "new" (Mode 1) or "existing" (Mode 2)
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");

  // Mode 1 Form values
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  // Mode 2 Form values
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [existingFile, setExistingFile] = useState<File | null>(null);

  // Results output panel state
  const [result, setResult] = useState<ImportResponseData | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [bList, logList] = await Promise.all([
        questionBankApi.getAll(),
        statisticsApi.getImportBatches(),
      ]);
      setBanks(bList);
      setBatches(logList);

      // Default select the first bank if available
      if (bList.length > 0) {
        setSelectedBankId(String(bList[0].id));
      }
    } catch (err: any) {
      setError(err.message || "初始化导入面板失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadData();
    };
    run();
  }, []);

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleExistingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExistingFile(e.target.files[0]);
    }
  };

  const handleNewBankImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newFile) return;

    try {
      setImporting(true);
      setError("");
      setMessage("");
      setResult(null);

      const res = await importApi.importNewBank(newName, newDesc, newFile);
      setResult(res);
      setMessage(`恭喜！全新题库建仓及数据导入圆满成功。成功加载了 ${res.successCount} 道题目！`);
      
      // Clear forms
      setNewName("");
      setNewDesc("");
      setNewFile(null);
      
      // Reload lists
      loadData();
    } catch (err: any) {
      setError(err.message || "新建并导入Excel失败");
    } finally {
      setImporting(false);
    }
  };

  const handleExistingBankImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId || !existingFile) return;

    try {
      setImporting(true);
      setError("");
      setMessage("");
      setResult(null);

      const parsedId = parseInt(selectedBankId, 10);
      const res = await importApi.importExistingBank(parsedId, existingFile);
      setResult(res);
      setMessage(`合并动作已执行完毕。往已有题库中成功归入 ${res.successCount} 道记录。`);
      
      // Clear files
      setExistingFile(null);
      
      // Reload lists
      loadData();
    } catch (err: any) {
      setError(err.message || "合入已有题库失败，请校验数据列");
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500 font-mono">LOADING FILE PARSERS...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner with info guide */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-neutral-500" />
            Excel 数据导入中心
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            本系统支持根据标准面试题库 Excel 极速生成结构化练习目录。同一个题库内如果存在重复的 `题目ID`，系统会自动覆盖更新，不同题库之间则不互相干扰。
          </p>

          <div className="bg-amber-50 rounded-lg p-3.5 border border-amber-100 flex gap-2.5 mt-4 text-[11px] leading-relaxed text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" /> Excel 列名规范说明：
              </p>
              <p className="mt-1">
                支持读取首个工作表或名为 <span className="font-bold">「题库」</span> 的标签页。表格表头必填包含
                <span className="font-semibold text-neutral-900 mx-0.5">「一级分类」</span>和
                <span className="font-semibold text-neutral-900 mx-0.5">「题目」</span>，可选映射有
                题目ID、二级分类、参考答案、题型、重要程度、难度、标签、说明页码等列。
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Import settings */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-5">
            {/* Mode selection button tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveTab("new");
                  setResult(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "new" ? "bg-white text-blue-600 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                模式一：创建新题库并导入
              </button>
              <button
                onClick={() => {
                  setActiveTab("existing");
                  setResult(null);
                }}
                disabled={banks.length === 0}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all disabled:opacity-40 ${
                  activeTab === "existing" ? "bg-white text-blue-600 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                模式二：导入追加到已有题库
              </button>
            </div>

            {activeTab === "new" ? (
              /* Mode 1 - Create and load form */
              <form onSubmit={handleNewBankImportSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">新题库名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：Java 面试突击宝典"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">新题库详细说明</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="描述该题库涉及的领域与高阶突破技巧"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">上传 Excel 文件 <span className="text-rose-500">*</span></label>
                  <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:bg-neutral-50/50 transition-all relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleNewFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <FileSpreadsheet className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-neutral-700 block">
                      {newFile ? newFile.name : "点击此处或拖拽 Excel 文件到这里进行上传"}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono mt-1 block">支持标准 .xlsx 格式文件</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={importing || !newFile || !newName.trim()}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {importing ? "正在深度解析并创建题库仓..." : "立即创建题库并导入开发数据"}
                </button>
              </form>
            ) : (
              /* Mode 2 - Select and append load form */
              <form onSubmit={handleExistingBankImportSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">选择宿主题库 <span className="text-rose-500">*</span></label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                    required
                  >
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (已有 {b.totalCount} 题)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">上传追加的 Excel <span className="text-rose-500">*</span></label>
                  <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:bg-neutral-50/50 transition-all relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExistingFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <FileSpreadsheet className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-neutral-700 block">
                      {existingFile ? existingFile.name : "点击选择或拖拽上传追加的 Excel 表格"}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono mt-1 block">同 ID 题目将会执行内容覆盖，其余追加</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={importing || !existingFile || !selectedBankId}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {importing ? "正在合算覆盖中..." : "开始合并覆盖导入数据"}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Importing feedback details or Batch log grids */}
          <div className="lg:col-span-5 space-y-4">
            {/* Realtime results feedback panels */}
            {result && (
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4 animate-fadeIn">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 pb-2 border-b">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  导入结果分析反馈
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3 rounded-lg text-center border">
                    <span className="text-[10px] text-neutral-400 block font-medium">总读取行数</span>
                    <span className="text-lg font-bold text-neutral-800 block mt-1">{result.totalCount}</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 block font-medium">成功合入</span>
                    <span className="text-lg font-bold text-emerald-800 block mt-1">{result.successCount}</span>
                  </div>
                  <div className="bg-blue-50/50 p-2.5 rounded-lg text-center border">
                    <span className="text-[9px] text-blue-600 block font-medium">新增录入</span>
                    <span className="text-sm font-bold text-neutral-800 block mt-1">{result.createdCount}</span>
                  </div>
                  <div className="bg-amber-50/50 p-2.5 rounded-lg text-center border">
                    <span className="text-[9px] text-amber-600 block font-medium">旧题覆盖</span>
                    <span className="text-sm font-bold text-neutral-800 block mt-1">{result.updatedCount}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-100">
                  <span className="font-semibold">失败故障行：</span>
                  <span className="font-mono font-bold text-sm">{result.failCount} 行</span>
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">故障原因汇总</span>
                    <div className="max-h-40 overflow-y-auto bg-stone-50 border p-2.5 rounded-lg text-[10px] font-mono text-neutral-600 space-y-1">
                      {result.errors.map((err, idx) => (
                        <p key={idx} className="border-b last:border-0 pb-1 text-rose-600">{err}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Link
                    href={`/questions?questionBankId=${result.questionBankId}`}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold rounded-lg border"
                  >
                    <span>去刚才导入的题库看看 🔍</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Importing batches chronologies logs */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                导入历史轨迹 ({batches.length})
              </h3>

              {batches.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">暂无记录，所有的 Excel 上传都将保留记录于此。</p>
              ) : (
                <div className="space-y-2 max-h-[20rem] overflow-y-auto pr-1">
                  {batches.map((b) => (
                    <div key={b.id} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/55 flex justify-between items-start gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-neutral-800 truncate max-w-[150px]" title={b.fileName}>
                          {b.fileName}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          题库: {b.questionBank?.name || "未知仓或大库"}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5 text-[9px] text-neutral-400 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>{new Date(b.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[10px] shrink-0">
                        <div className="font-sans font-semibold text-neutral-700">总：{b.totalCount} 行</div>
                        <div className="text-emerald-600 font-semibold">成：{b.successCount}</div>
                        {b.failCount > 0 && <div className="text-rose-600 font-semibold">败：{b.failCount}</div>}
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
