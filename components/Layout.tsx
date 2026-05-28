"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  List,
  UploadCloud,
  GraduationCap,
  BookMarked,
  AlertOctagon,
  Star,
  ChevronRight,
  Sparkles,
  BookCheck,
  Database
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    { name: "首页看板", href: "/", icon: Home },
    { name: "题库管理", href: "/question-banks", icon: BookOpen },
    { name: "题目列表", href: "/questions", icon: List },
    { name: "背题模式", href: "/review", icon: BookMarked },
    { name: "刷题模式", href: "/practice", icon: GraduationCap },
    { name: "错题集", href: "/wrong", icon: AlertOctagon, badge: "wrong" },
    { name: "收藏夹", href: "/favorites", icon: Star, badge: "favorite" },
    { name: "导入中心", href: "/import", icon: UploadCloud },
    { name: "备份恢复", href: "/backup", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800 flex flex-col font-sans">
      {/* Top Banner Bar for desktop */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 px-4 py-3 md:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-1.5 text-white shadow-xs">
            <BookCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-neutral-900 flex items-center gap-1.5">
              面试刷题宝典
              <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-0.5 notranslate" translate="no">
                <Sparkles className="w-2.5 h-2.5" /> Core
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">INTERVIEW QUESTION LAB</p>
          </div>
        </div>
        
        <div className="text-xs text-neutral-500 font-mono flex items-center gap-1 bg-neutral-100/60 px-2.5 py-1 rounded-md border border-neutral-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>Local Engine Active</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto md:px-6 md:py-6 gap-6 mb-16 md:mb-0">
        {/* Left Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden md:block">
          <nav className="bg-white rounded-xl p-3 border border-neutral-200/80 shadow-xs space-y-1 sticky top-20">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">主要模块</div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-link-${item.name}`}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? "text-white" : "text-neutral-400"}`} />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Core Main Viewport Container */}
        <main className="flex-1 min-w-0 bg-transparent px-4 py-4 md:px-0 md:py-0">
          {children}
        </main>
      </div>

      {/* Persistent Bottom TabBar Selector specifically optimized for mobile */}
      <nav id="mobile-bottom-tab" className="md:hidden fixed bottom-0 left-0 right-0 py-2 pb-3 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 z-50 flex justify-around items-center shadow-lg">
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 rounded-sm w-16 text-center transition-all ${
                isActive ? "text-blue-600" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? "bg-blue-50 text-blue-600" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] mt-0.5 font-medium tracking-tight block truncate w-full">{item.name}</span>
            </Link>
          );
        })}
        {/* Add secondary dynamic portal or drawer quick selector for other sections */}
        <Link
          href="/wrong"
          className={`flex flex-col items-center justify-center p-1 rounded-sm w-16 text-center transition-all ${
            pathname === "/wrong" || pathname === "/favorites" || pathname === "/import"
              ? "text-blue-600"
              : "text-neutral-500"
          }`}
        >
          <div className={`p-1 rounded-md ${pathname === "/wrong" || pathname === "/favorites" || pathname === "/import" ? "bg-blue-50 text-blue-600" : ""}`}>
            <AlertOctagon className="w-5 h-5" />
          </div>
          <span className="text-[9px] mt-0.5 font-medium tracking-tight block">错题集</span>
        </Link>
      </nav>
    </div>
  );
}
