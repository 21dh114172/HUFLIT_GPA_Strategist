"use client";

import { GraduationCap, Calculator, Target, BookOpen, Newspaper, BarChart3 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memo } from "react";
import { AuthorInfoDialog } from "./AuthorInfoDialog";
import Image from "next/image";

interface AppHeaderProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const AppHeader = memo(({ activeTab, onTabChange }: AppHeaderProps) => {
  return (
    <header className="sticky top-3 z-50 w-full px-4 mb-4">
      <div className="w-[1026px] max-w-[95%] mx-auto h-12 flex items-center justify-between px-2.5 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full transition-all">
        
        {/* Logo Section */}
        <div 
          onClick={() => onTabChange?.("manual")}
          className="flex items-center gap-2 pl-1.5 group cursor-pointer shrink-0 active:scale-95 transition-transform"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-1.5 rounded-full shadow-md group-hover:scale-110 transition-transform">
            <GraduationCap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-[13px] tracking-tight text-slate-800 hidden md:block">HUFLIT</span>
        </div>

        {/* Nav Menu (Floating Pill Tabs) */}
        <div className="flex-1 flex items-center justify-center h-full px-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="flex items-center h-10 gap-1 sm:gap-2 border-none p-1 bg-slate-50/50 rounded-full">
            {[
              { value: "manual", icon: Calculator, label: "Nhập điểm" },
              { value: "roadmap", icon: Target, label: "Lộ trình" },
              { value: "subject", icon: BookOpen, label: "Môn lẻ" },
              { value: "scale", icon: BarChart3, label: "Thang điểm" },
              { value: "news", icon: Newspaper, label: "Tin tức" },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="h-8 sm:h-8.5 relative rounded-full border-none px-4 sm:px-6 py-0 text-[10px] sm:text-[11px] font-bold text-slate-500 transition-all focus-visible:ring-0 flex items-center justify-center group shadow-none 
                  data-active:bg-blue-100/70 data-active:text-blue-700 tracking-tight"
              >
                <span className="whitespace-nowrap mb-0.5">{tab.label}</span>
                
                {/* Underline Indicator - Refined for a sleeker look */}
                <div className="absolute inset-x-0 bottom-[5px] flex justify-center opacity-0 group-data-active:opacity-100 transition-all duration-300">
                  <div className="w-6 h-[2px] bg-blue-600 rounded-full opacity-80" />
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-1.5 pr-0.5 shrink-0">
          <div 
            onClick={() => onTabChange?.("news")}
            className="hidden sm:flex w-7 h-7 rounded-full items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-all text-slate-400 hover:text-blue-600 active:scale-90"
          >
            <Newspaper className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <AuthorInfoDialog>
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-sm active:scale-90 transition-transform cursor-pointer overflow-hidden border-none outline-none">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                <Image 
                  src="/ava.jpg" 
                  alt="TienxDun" 
                  fill 
                  className="object-cover"
                />
              </div>
            </button>
          </AuthorInfoDialog>
        </div>

      </div>
    </header>
  );
});

AppHeader.displayName = "AppHeader";
