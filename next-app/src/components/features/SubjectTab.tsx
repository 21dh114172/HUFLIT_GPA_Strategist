"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Info } from "lucide-react";
import { useSubjectCalculator } from "@/hooks/useSubjectCalculator";
import { SubjectConfigCard } from "./subject/SubjectConfigCard";
import { GradeRequirementCard } from "./subject/GradeRequirementCard";

/**
 * SubjectTab Component
 * 
 * Manages the "Tính môn lẻ" (Individual Subject Calculation) view.
 * Uses useSubjectCalculator for business logic and focused sub-components for UI.
 */
export function SubjectTab() {
  const {
    ratio,
    setRatio,
    processScore,
    handleScoreChange,
    accumulatedScore,
    minFinalToPass,
    calculateRequiredFinal,
    validScales
  } = useSubjectCalculator();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Left Column: Configuration and General Info */}
      <div className="lg:col-span-4 sticky top-20 h-fit self-start z-20 space-y-4 w-full flex flex-col">
        <SubjectConfigCard
          ratio={ratio}
          setRatio={setRatio}
          processScore={processScore}
          handleScoreChange={handleScoreChange}
          accumulatedScore={accumulatedScore}
          minFinalToPass={minFinalToPass}
        />
        
        {/* Hướng dẫn sử dụng Tab */}
        <Card className="hidden lg:block border-white/20 bg-white/40 backdrop-blur-xl shadow-lg shadow-blue-500/5 rounded-3xl overflow-hidden mt-4">
          <CardContent className="p-5 space-y-3">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center justify-start gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Info className="w-4 h-4" />
                </span>
                Mẹo sử dụng
             </h3>
             <ul className="text-sm text-slate-600 space-y-2 list-none p-0 m-0">
               <li className="flex items-start gap-2">
                 <span className="text-blue-500 mt-0.5">•</span>
                 <span>Chọn tỷ lệ phần trăm tương ứng với môn học.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-blue-500 mt-0.5">•</span>
                 <span>Nhập điểm quá trình để xem số điểm cần qua môn tối thiểu.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-blue-500 mt-0.5">•</span>
                 <span>Bảng mục tiêu giúp bạn biết điểm cuối kỳ cần thi để đạt được GPA mong muốn.</span>
               </li>
             </ul>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Target grades calculation results */}
      <div className="lg:col-span-8 space-y-4 w-full">
        <Card className="w-full border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-blue-500/10 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-bold text-slate-800 tracking-tight">
                Mục tiêu Điểm thi
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 font-medium">
              Điểm thi cần đạt để đạt từng mức GPA mục tiêu.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-2">
                {validScales.map((scale) => (
                  <GradeRequirementCard
                    key={scale.grade}
                    grade={scale.grade}
                    gpa={scale.gpa}
                    requiredFinal={calculateRequiredFinal(scale.min)}
                  />
                ))}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
