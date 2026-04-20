"use client";

import { GraduationCap, Calculator, Target, BookOpen, Newspaper, BarChart3 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AppHeaderProps {
  activeTab: string;
}

export function AppHeader({ activeTab }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-[1074px] mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
          <div className="transition-transform group-hover:scale-110">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 hidden lg:block">
            HUFLIT GPA
          </h1>
        </div>

        {/* Nav Menu (Minimalist Tabs) */}
        <div className="flex-1 flex items-center justify-center h-full mx-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList variant="line" className="flex items-center h-full gap-6 sm:gap-8 border-none p-0 bg-transparent">
            {[
              { value: "manual", icon: Calculator, label: "Nhập điểm" },
              { value: "roadmap", icon: Target, label: "Lập lộ trình" },
              { value: "subject", icon: BookOpen, label: "Tính môn lẻ" },
              { value: "scale", icon: BarChart3, label: "Thang điểm" },
              { value: "news", icon: Newspaper, label: "Tin tức" },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="h-full relative rounded-none border-none bg-transparent px-0 py-0 text-xs sm:text-sm font-black text-slate-500 data-active:text-blue-600 transition-all focus-visible:ring-0 flex items-center gap-2 group shadow-none data-active:shadow-none after:hidden tracking-tight"
              >
                <tab.icon className="h-4 w-4 shrink-0 text-slate-400 group-data-active:text-blue-600 transition-colors" /> 
                <span className="hidden sm:inline">{tab.label}</span>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-data-active:scale-x-100 transition-transform origin-center duration-300" />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Profile Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
            <span className="text-sm font-black text-blue-600">H</span>
          </div>
        </div>

      </div>
    </header>
  );
}
