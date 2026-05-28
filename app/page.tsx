"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { statisticsApi, StatOverview } from "@/src/api/statisticsApi";
import { questionBankApi, QuestionBank } from "@/src/api/questionBankApi";
import {
  GraduationCap,
  BookMarked,
  AlertOctagon,
  Star,
  UploadCloud,
  Layers,
  Sparkles,
  ChevronRight,
  BookCheck,
  CheckCircle,
  HelpCircle,
  XCircle,
  Clock,
  Plus
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<StatOverview | null>(null);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [bankStats, setBankStats] = useState<Record<number, StatOverview>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [overallStats, bankList] = await Promise.all([
        statisticsApi.getOverview(),
        questionBankApi.getAll(),
      ]);

      setStats(overallStats);
      setBanks(bankList);

      // Dynamically load statistics per queston bank
      const statsMap: Record<number, StatOverview> = {};
      await Promise.all(
        bankList.map(async (bank) => {
          try {
            const bStat = await statisticsApi.getOverview(bank.id);
            statsMap[bank.id] = bStat;
          } catch (e) {
            console.error(`Error loading stats for bank ${bank.id}`, e);
          }
        })
      );
      setBankStats(statsMap);
    } catch (err: any) {
      setError(err.message || "加载面板数据失败，请重试");
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

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500 font-mono">LOADING CENTRAL DATA BOARD...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top welcome intro */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -z-10"></div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              下午好，开始您的卓越面试修行！ 🚀
            </h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-lg">
              系统当前托管了 <span className="text-blue-600 font-semibold">{banks.length}</span> 个独立面试题库。每日练习和错题归纳，能让您的知识边界无懈可击！
            </p>
          </div>
          <Link
            href="/import"
            className="bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-95 px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-100"
          >
            <UploadCloud className="w-4 h-4" />
            <span>导入 Excel 题库</span>
          </Link>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Primary stats counter grid */}
        {stats && (
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">统计看板 (OVERALL INDEX)</h3>
            
            {/* Top progress highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-neutral-400 block font-medium">综合掌握率</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">{stats.masteryRate}%</span>
                    <span className="text-[10px] text-emerald-600 font-medium">等同 {stats.masteredCount} 题</span>
                  </div>
                  <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${stats.masteryRate}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-neutral-400 block font-medium">今日复习记录</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">{stats.todayReviewCount} 次</span>
                    <span className="text-[10px] text-neutral-400 block">历史总复习: {stats.totalReviewCount}</span>
                  </div>
                  <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min((stats.todayReviewCount / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-neutral-400 block font-medium">错题集留存</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">{stats.wrongCount} 题</span>
                    <span className="text-[10px] text-rose-600 font-medium">急需复刷</span>
                  </div>
                  <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${stats.totalQuestions > 0 ? (stats.wrongCount / stats.totalQuestions) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed numeric parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs">
                <span className="text-[10px] text-neutral-400 block font-medium">总计题目</span>
                <span className="text-xl font-bold tracking-tight text-neutral-900 block mt-1">{stats.totalQuestions} 题</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs border-l-emerald-500 border-l-2">
                <span className="text-[10px] text-emerald-600 block font-semibold">已掌握</span>
                <span className="text-xl font-bold tracking-tight text-emerald-900 block mt-1">{stats.masteredCount} 题</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs border-l-amber-500 border-l-2">
                <span className="text-[10px] text-amber-600 block font-semibold">模糊糊</span>
                <span className="text-xl font-bold tracking-tight text-amber-950 block mt-1">{stats.uncertainCount} 题</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs border-l-rose-500 border-l-2">
                <span className="text-[10px] text-rose-600 block font-semibold">未掌握</span>
                <span className="text-xl font-bold tracking-tight text-rose-950 block mt-1">{stats.notMasteredCount} 题</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs border-l-neutral-400 border-l-2">
                <span className="text-[10px] text-neutral-500 block font-semibold">未学习</span>
                <span className="text-xl font-bold tracking-tight text-neutral-900 block mt-1">{stats.notLearnedCount} 题</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs border-l-orange-500 border-l-2">
                <span className="text-[10px] text-orange-600 block font-semibold">待注答案</span>
                <span className="text-xl font-bold tracking-tight text-orange-950 block mt-1">{stats.missingAnswerCount} 题</span>
              </div>
            </div>
          </section>
        )}

        {/* Quick action gates */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">快捷入口 (QUICK NAVIGATOR)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "开始刷题", icon: GraduationCap, href: "/practice", color: "bg-blue-50 text-blue-600 border-blue-100" },
              { label: "快速背题", icon: BookMarked, href: "/review", color: "bg-teal-50 text-teal-600 border-teal-100" },
              { label: "错题本本", icon: AlertOctagon, href: "/wrong", color: "bg-rose-50 text-rose-600 border-rose-100" },
              { label: "收藏星夹", icon: Star, href: "/favorites", color: "bg-amber-50 text-amber-600 border-amber-100" },
              { label: "导入备份", icon: UploadCloud, href: "/import", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
              { label: "题库设置", icon: Layers, href: "/question-banks", color: "bg-neutral-50 text-neutral-700 border-neutral-200" },
            ].map((gate) => {
              const Icon = gate.icon;
              return (
                <Link
                  key={gate.label}
                  href={gate.href}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-neutral-300 ${gate.color}`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-semibold">{gate.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Dedicated question bank card list grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">我的题库 ({banks.length})</h3>
            <Link href="/question-banks" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
              <span>管理全部</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {banks.length === 0 ? (
            <div className="bg-white rounded-xl p-10 border border-dashed border-neutral-300 flex flex-col items-center text-center justify-center">
              <Layers className="w-10 h-10 text-neutral-300 mb-3" />
              <p className="text-sm font-semibold text-neutral-700">暂无任何题库</p>
              <p className="text-xs text-neutral-400 mt-1">您可以导入 Excel 面试文档，秒速生成体系化的刷题库！</p>
              <Link
                href="/import"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg shadow-sm hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> 导入首个题库
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* All Question Banks combined meta option */}
              <div className="bg-stone-900 text-stone-100 p-5 rounded-xl border border-stone-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-stone-800 rounded-full blur-xl opacity-60"></div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-stone-800 border border-stone-700 text-stone-300 px-2 py-0.5 rounded-md font-mono font-medium">META BANK</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <h4 className="font-bold text-sm tracking-tight text-white mt-1.5">全部题库通关</h4>
                  <p className="text-xs text-stone-400 mt-1 font-sans">混合各大知识点，综合测试，全方位巩固雷达能力。</p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-800">
                  <span className="text-[10px] font-mono text-stone-400">{stats?.totalQuestions || 0} 道混合题目</span>
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-1 bg-white text-stone-900 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-stone-100"
                  >
                    <span>整库开刷</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {banks.map((bank) => {
                const bStat = bankStats[bank.id];
                const rate = bStat ? bStat.masteryRate : 0;
                const total = bank.totalCount;
                const mastered = bStat ? bStat.masteredCount : 0;
                const wrongs = bStat ? bStat.wrongCount : 0;
                const stars = bStat ? bStat.favoriteCount : 0;

                return (
                  <div key={bank.id} className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all flex flex-col justify-between relative shadow-xs">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-semibold">
                          已掌握: {mastered}/{total}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">ID: #{bank.id}</span>
                      </div>
                      
                      <h4 className="font-bold text-sm text-neutral-900 tracking-tight mt-2">{bank.name}</h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1 min-h-[2rem]">
                        {bank.description || "暂无题库说明。可以通过‘题库设置’来进行编辑。"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      {/* Bank Mini Progress Indicator */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span>题库掌握率</span>
                        <span className="font-bold text-neutral-800">{rate}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-400 pt-1">
                        <div className="flex gap-2.5 font-mono">
                          <span className="flex items-center gap-0.5 text-rose-500"><AlertOctagon className="w-3 h-3" />{wrongs}</span>
                          <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3" />{stars}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Link
                            href={`/practice?questionBankId=${bank.id}`}
                            className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:scale-95 px-2.5 py-1 text-[10px] font-semibold rounded-md border border-neutral-200/50"
                          >
                            刷题
                          </Link>
                          <Link
                            href={`/review?questionBankId=${bank.id}`}
                            className="bg-blue-600 text-white hover:bg-blue-700 active:scale-95 px-2.5 py-1 text-[10px] font-semibold rounded-md shadow-xs shadow-blue-100"
                          >
                            背题
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
