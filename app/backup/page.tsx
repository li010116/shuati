"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import { backupApi, ImportBackupResponse } from "@/src/api/backupApi";
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  RefreshCw,
  Info,
  Trash2,
  FolderArchive,
  ChevronRight,
  ArrowRight,
  HelpCircle
} from "lucide-react";

export default function BackupPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  
  // Export selections
  const [exportBankId, setExportBankId] = useState<string>("all"); // "all" or specific numeric string
  const [exportFormat, setExportFormat] = useState<"json" | "xlsx">("json");
  const [exporting, setExporting] = useState(false);

  // Import selections
  const [importMode, setImportMode] = useState<"append" | "overwrite">("append");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportBackupResponse | null>(null);

  // Error/Success status
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      setLoadingBanks(true);
      const data = await questionBankApi.getAll();
      setBanks(data);
    } catch (err: any) {
      setErrorMsg(err.message || "加载题库源列表失败");
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      setErrorMsg("");
      setSuccessMsg("");
      const bId = exportBankId === "all" ? undefined : parseInt(exportBankId);
      await backupApi.downloadBackupFile(bId, exportFormat);
      setSuccessMsg("备份文件导出成功！检查您的下载夹中内容。");
    } catch (err: any) {
      setErrorMsg(err.message || "导出文件失败");
    } finally {
      setExporting(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMsg("");
    setImportResult(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (ext === ".json" || ext === ".xlsx" || ext === ".xls") {
        setSelectedFile(file);
      } else {
        setErrorMsg("不受支持的文件格式。仅支持 JSON 和 Excel (.xlsx, .xls) 备份文件。");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    setImportResult(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRestoreImport = async () => {
    if (!selectedFile) return;

    if (importMode === "overwrite") {
      const doubleCheck = confirm(
        "⚠️ ⚠️ ⚠️ 警告：当前选择的是【清空并覆写还原】！\n\n该动作将彻底删除系统现有的所有题库、面试题、错题和学习背题历史记录，并无法恢复！\n\n您确定要抹掉所有数据，开始还原吗？"
      );
      if (!doubleCheck) return;
    }

    try {
      setImporting(true);
      setErrorMsg("");
      setSuccessMsg("");
      setImportResult(null);

      const res = await backupApi.importBackupFile(selectedFile, importMode);
      setImportResult(res);
      setSuccessMsg("备份恢复操作已顺利完结！系统统计参数已重新校正。");
      clearSelectedFile();
      loadData(); // reload latest counters
    } catch (err: any) {
      setErrorMsg(err.message || "解析或载入备份文件失败，请确保格式正确");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Top Intro */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              数据备份与系统恢复
            </h2>
            <p className="text-xs text-neutral-400">
              支持一键将本地或多个面试题库导出为标准 Excel 表格进行查看与手动二次录入，或高保真 JSON 备份，用以完整恢复个人学习历史进度。
            </p>
          </div>
          <button
            onClick={loadData}
            title="刷新依赖列表"
            className="p-1 px-2.5 py-1.5 border hover:bg-neutral-50 active:scale-95 text-neutral-500 rounded-lg text-xs font-mono flex items-center gap-1 transition-all"
          >
            {loadingBanks ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>同步状态</span>
          </button>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs flex items-start gap-2 animate-fadeIn" id="backup-error-toast">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">发生问题</p>
              <p className="mt-0.5 opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs flex items-start gap-2 animate-fadeIn" id="backup-success-toast">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">操作成功</p>
              <p className="mt-0.5 opacity-90">{successMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: BACKUP EXPORT PANEL */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-800">1. 数据备份导出</h3>
                <p className="text-[10px] text-neutral-400 font-mono">EXPORT SYSTEM BACKUP FILE</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Scope */}
              <div className="space-y-1.5">
                <label className="block text-neutral-500 font-bold uppercase tracking-wider text-[10px]">备份源范围 Scope</label>
                <select
                  value={exportBankId}
                  onChange={(e) => setExportBankId(e.target.value)}
                  className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  disabled={loadingBanks}
                >
                  <option value="all">📁 系统全量题库备份 (打包全部题目与状态)</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      📚 {b.name} (含 {b.totalCount} 道题目)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-neutral-400" />
                  选择“系统全量题库备份”会一次性把所有独立题库聚合提取后输出。
                </p>
              </div>

              {/* Format Choices */}
              <div className="space-y-2">
                <label className="block text-neutral-500 font-bold uppercase tracking-wider text-[10px]">导出介质格式 Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat("json")}
                    type="button"
                    className={`p-3 rounded-lg border text-left space-y-1.5 transition-all ${
                      exportFormat === "json"
                        ? "border-blue-500 bg-blue-50/30 text-blue-900"
                        : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <FileJson className={`w-5 h-5 ${exportFormat === "json" ? "text-blue-600" : "text-neutral-400"}`} />
                      <div className="text-[9px] bg-neutral-100 border text-neutral-400 px-1 rounded font-mono">JSON</div>
                    </div>
                    <div className="font-semibold text-xs">高保真 JSON 备份</div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed font-sans font-normal">
                      推荐！包含所有题目、分类、<b>掌握进度、错题次数、是否收藏及用户私有笔记</b>。非常适合系统间完美迁移还原。
                    </p>
                  </button>

                  <button
                    onClick={() => setExportFormat("xlsx")}
                    type="button"
                    className={`p-3 rounded-lg border text-left space-y-1.5 transition-all ${
                      exportFormat === "xlsx"
                        ? "border-teal-500 bg-teal-50/30 text-teal-900"
                        : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <FileSpreadsheet className={`w-5 h-5 ${exportFormat === "xlsx" ? "text-teal-600" : "text-neutral-400"}`} />
                      <div className="text-[9px] bg-neutral-100 border text-neutral-400 px-1 rounded font-mono">XLSX</div>
                    </div>
                    <div className="font-semibold text-xs">标准 Excel 工作簿</div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed font-sans font-normal">
                      通用！多表格（Sheet）模式，每个题库对应一张工作表，列排版整饬，<b>支持二次编辑后再次导入</b>，利于传播浏览。
                    </p>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full mt-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-xs hover:shadow-sm active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 font-sans"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在构造二进制备份链流...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>立即开始备份导出</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: BACKUP RESTORE PANEL */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-800">2. 备份导入恢复</h3>
                <p className="text-[10px] text-neutral-400 font-mono">RESTORE YESTERDAY BACKUP</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Import Mode */}
              <div className="space-y-1.5">
                <label className="block text-neutral-500 font-bold uppercase tracking-wider text-[10px]">系统恢复策略 Action Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`border rounded-lg p-2.5 flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === "append"
                      ? "border-blue-500 bg-blue-50/20"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="mt-1"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-neutral-800">增量覆盖追加</span>
                      <p className="text-[9px] text-neutral-400 leading-relaxed font-sans normal-case">
                        安全。跳过已存在的题库，如有重复题目ID进行属性合并覆盖，不删除当前已有数据。
                      </p>
                    </div>
                  </label>

                  <label className={`border rounded-lg p-2.5 flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === "overwrite"
                      ? "border-rose-500 bg-rose-50/20"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="overwrite"
                      checked={importMode === "overwrite"}
                      onChange={() => setImportMode("overwrite")}
                      className="mt-1"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-rose-800">清空冷拔原装覆写</span>
                      <p className="text-[9px] text-rose-500/80 leading-relaxed font-sans normal-case">
                        ⚠️ 危险！先一键格式化抹除系统内的旧所有数据，再进行精确时光回溯，彻底恢复文件数据。
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Drag and Drop File Upload Area */}
              <div className="space-y-1.5">
                <label className="block text-neutral-500 font-bold uppercase tracking-wider text-[10px]">选择备份资产 Select Asset</label>
                {selectedFile ? (
                  /* Shows Chosen File Metadata and Cancel Options */
                  <div className="border border-indigo-200 bg-indigo-50/20 rounded-lg p-4 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        {selectedFile.name.endsWith(".json") ? (
                          <FileJson className="w-6 h-6" />
                        ) : (
                          <FileSpreadsheet className="w-6 h-6" />
                        )}
                      </div>
                      <div className="space-y-0.5 max-w-[200px] sm:max-w-xs">
                        <p className="font-semibold text-neutral-800 truncate" title={selectedFile.name}>
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          容量大小: {(selectedFile.size / 1024).toFixed(1)} KB | 类型: {selectedFile.name.split(".").pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearSelectedFile}
                      type="button"
                      className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                      title="撤销选取"
                    >
                      <Trash2 className="w-4 h-4 text-neutral-400 hover:text-rose-600" />
                    </button>
                  </div>
                ) : (
                  /* Interactive Zone Drop */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40 bg-white"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="p-2.5 bg-neutral-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="font-semibold text-xs text-neutral-700">推进或者拖拽备份文件至本区域</p>
                    <p className="text-[10px] text-neutral-400 mt-1">支持由本软件导出的 JSON 或者是双语多 Sheet Excel 表格</p>
                  </div>
                )}
              </div>

              {/* Submit Execute Restore button */}
              <button
                onClick={handleRestoreImport}
                disabled={importing || !selectedFile}
                className={`w-full mt-4 py-2.5 rounded-lg font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                  !selectedFile
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : importMode === "overwrite"
                    ? "bg-rose-600 hover:bg-rose-700 text-white active:scale-[0.98]"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]"
                }`}
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在进行全量数据解算复原中...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>
                      {importMode === "overwrite"
                        ? "危险：执行清空全量完美还原"
                        : "执行增量数据追加合并"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* DETAILED RESULTS ON FINISH */}
        {importResult && (
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-neutral-800">最新备份导入结算报告</h3>
                <p className="text-[10px] text-neutral-400 font-mono">IMPORT RESTORATION DETAILED SUMMARY LOG</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/50">
                <span className="text-neutral-400 text-[10px] block font-sans">题库导入/合并数</span>
                <span className="text-lg font-bold text-neutral-800 font-mono mt-1 block">
                  {importResult.banksRestoredCount}
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/50">
                <span className="text-neutral-400 text-[10px] block font-sans">面试题载入总数</span>
                <span className="text-lg font-semibold text-blue-600 font-mono mt-1 block">
                  {importResult.questionsRestoredCount} 道
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/50 col-span-2 md:col-span-1">
                <span className="text-neutral-400 text-[10px] block font-sans">安全状态校验</span>
                <span className="text-[11px] font-semibold text-emerald-600 font-sans mt-2 block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  数据流校验成功
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-neutral-500 text-[10px] uppercase tracking-wider">题库明细 Restored Banks</p>
              <div className="border border-neutral-100 rounded-lg overflow-hidden divide-y divide-neutral-100">
                {importResult.bankSummary.length === 0 ? (
                  <div className="p-3 text-center text-neutral-400">没有导入任何带有题目数据的表</div>
                ) : (
                  importResult.bankSummary.map((summary, idx) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-neutral-400" />
                        <span className="font-semibold text-neutral-800 text-[11px] font-sans">{summary.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="font-bold text-neutral-600">{summary.count}</span>
                        <span className="text-neutral-400">道题目导入成功</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* CRITICAL NOTIFY RULES AND ADVICE */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 leading-none">
            <Info className="w-4 h-4 text-neutral-400" />
            <span>关于数据交换规范的重要提示：</span>
          </h4>
          <ul className="text-[11px] text-neutral-500 space-y-2 leading-relaxed list-disc list-inside">
            <li>
              <b>增量模式与题目去重</b>：系统在每个题库中通过唯一的 <b>题目ID</b> (如 Q0001) 作为题目排他的核对条件。如果在导入文件时，两个题目具有相同的 ID 且已存在，系统会用新数据覆盖描述并 <b>完美保留</b> 原有的收藏指示、错数累加和学习评定级别。
            </li>
            <li>
              <b>跨系统或导出分享</b>：高保真 JSON 文件为本系统私有导出协议。通过 JSON 文件分享给其他同学使用时，对方只需导入，便可以获取与您当前一致的学习指标与个人批注备注。
            </li>
            <li>
              <b>关于 Excel 文件格式兼容性</b>：只要 Excel 表首张工作表（或者表名名为“题库”）符合先前规定的标准中文或者英文对照头（如 <i>题目、参考答案、一级分类、二级分类、题目ID、重要程度、难度</i>），便可以直接拿来快速初始化。
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
