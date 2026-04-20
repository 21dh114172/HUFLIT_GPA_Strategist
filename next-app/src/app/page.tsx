"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppHeader } from "@/components/layout/AppHeader";
import { TabSkeleton } from "@/components/features/TabSkeleton";
import { Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic Imports for performance optimization
const ScaleTab = dynamic(() => import("@/components/features/ScaleTab").then(mod => mod.ScaleTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const SubjectTab = dynamic(() => import("@/components/features/SubjectTab").then(mod => mod.SubjectTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const ManualTab = dynamic(() => import("@/components/features/ManualTab").then(mod => mod.ManualTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const RoadmapTab = dynamic(() => import("@/components/features/RoadmapTab").then(mod => mod.RoadmapTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("manual");
  const [roadmapInitialData, setRoadmapInitialData] = useState<{ 
    gpa: number; 
    credits: number;
    remainingCredits?: number;
    pendingRetakes?: { id: string; oldGrade: number; credits: number; name?: string }[];
  } | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Smooth scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchToRoadmap = (data: any) => {
    setRoadmapInitialData(data);
    setActiveTab("roadmap");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen bg-slate-50/50 text-slate-900 pb-20">
      {/* Background Blobs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-cyan-100/40 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-sky-100/30 blur-[80px] pointer-events-none -z-10"></div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full relative z-10">
        
        {/* Header - Refactored to separate component */}
        <AppHeader activeTab={activeTab} />

        {/* Main Content Area */}
        <div className="max-w-[1074px] mx-auto px-4 mt-6">
          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "visible" }}
              >
                <TabsContent value="roadmap" className="focus-visible:outline-none focus-visible:ring-0 m-0">
                  <RoadmapTab initialData={roadmapInitialData} />
                </TabsContent>

                <TabsContent value="manual" className="focus-visible:outline-none focus-visible:ring-0 m-0">
                  <ManualTab onSwitchToRoadmap={handleSwitchToRoadmap} />
                </TabsContent>

                <TabsContent value="subject" className="focus-visible:outline-none focus-visible:ring-0 m-0">
                  <SubjectTab />
                </TabsContent>

                <TabsContent value="scale" className="focus-visible:outline-none focus-visible:ring-0 m-0">
                  <ScaleTab />
                </TabsContent>

                <TabsContent value="news" className="focus-visible:outline-none focus-visible:ring-0 m-0">
                  <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200">
                    <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="font-medium text-lg">Bản tin Sinh viên</h3>
                    <p className="text-sm mt-1">Phân hệ kết nối Notion API đang được thiết lập.</p>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Tabs>
    </main>
  );
}
