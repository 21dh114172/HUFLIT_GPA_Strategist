"use client";

import { memo } from "react";
import { Calculator, Target, BookOpen, BarChart3, Newspaper, MonitorOff } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { value: "manual", icon: Calculator, label: "Nhập điểm" },
  { value: "roadmap", icon: Target, label: "Lộ trình" },
  { value: "subject", icon: BookOpen, label: "Môn lẻ" },
  { value: "scale", icon: BarChart3, label: "Thang điểm" },
  { value: "news", icon: Newspaper, label: "Tin tức" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = memo(({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block sm:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] bottom-nav-safe"
      aria-label="Điều hướng chính"
    >
      <div className="flex items-stretch justify-around w-full px-1 pt-1.5 pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;

            return (
              <button
                key={tab.value}
                id={`bottom-nav-${tab.value}`}
                onClick={() => onTabChange(tab.value)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Chuyển sang tab ${tab.label}`}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[52px] rounded-xl transition-colors active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-x-1 inset-y-0.5 bg-blue-50 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}

                {/* Icon */}
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-dot"
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-bold leading-none tracking-tight transition-colors ${
                    isActive ? "text-blue-700" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* System Switch Button */}
          <button
            onClick={() => {
              localStorage.setItem("app-preference", "legacy");
              window.location.replace(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/legacy/`);
            }}
            aria-label="Chuyển sang bản Classic"
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[52px] rounded-xl transition-colors active:scale-90 cursor-pointer text-slate-400 hover:text-amber-600"
          >
            <div className="bg-amber-50 p-1.5 rounded-lg mb-0.5">
              <MonitorOff className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold leading-none tracking-tight">Classic</span>
          </button>
        </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";
