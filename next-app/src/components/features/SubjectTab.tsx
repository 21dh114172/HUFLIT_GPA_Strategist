"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRADE_SCALE } from "@/lib/gpa-engine";
import { Calculator, Target, Info } from "lucide-react";

export function SubjectTab() {
  const [ratio, setRatio] = useState<number>(0.4);
  const [processScore, setProcessScore] = useState<number>(0);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 10) val = 10;
    setProcessScore(val);
  };

  const processRatio = ratio;
  const finalRatio = 1 - ratio;
  const accumulatedScore = processScore * processRatio;

  const minFinalToPass = Math.max(0, (4.0 - accumulatedScore) / finalRatio);
  const scoreToPassDisplay = minFinalToPass > 10 ? "Trượt" : minFinalToPass.toFixed(1);

  const validScales = GRADE_SCALE.filter((g) => g.gpa > 0).sort((a, b) => b.min - a.min);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Left Column: Config */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-blue-500/10 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Cấu hình môn học</CardTitle>
            </div>
            <CardDescription className="text-slate-600 font-bold">Chọn tỷ lệ điểm và nhập điểm quá trình</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ps-1">Tỷ lệ (Quá trình / Cuối kỳ)</Label>
                <button className="text-[11px] font-black text-blue-700 hover:underline flex items-center gap-1 uppercase tracking-tight">
                  <Info className="h-3 w-3" /> Cách tính
                </button>
              </div>
              <div className="flex p-1 bg-white/30 backdrop-blur-md border border-white/20 rounded-xl">
                {[
                  { value: 0.3, label: "30/70" },
                  { value: 0.4, label: "40/60" },
                  { value: 0.5, label: "50/50" }
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRatio(r.value)}
                    className={`flex-1 py-2 text-sm font-black rounded-lg transition-all ${
                      ratio === r.value
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-blue-600 hover:bg-white/50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="process-score" className="text-[11px] font-black text-blue-600 uppercase tracking-widest ps-1">Điểm quá trình (Hệ 10)</Label>
              <div className="p-4 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl space-y-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={processScore}
                  onChange={handleScoreChange}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center">
                  <Input
                    id="process-score"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={processScore || ""}
                    onChange={handleScoreChange}
                    className="text-center font-black text-blue-700 text-2xl py-8 bg-white/50 border-white/20 rounded-2xl focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex items-center justify-between">
               <div className="space-y-0.5">
                 <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Điểm đã có</p>
                 <p className="text-[11px] font-bold text-blue-700/80 uppercase tracking-tighter">(Quá trình × Tỷ lệ)</p>
               </div>
               <span className="text-3xl font-black text-blue-700">{accumulatedScore.toFixed(2)}</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between">
               <div className="space-y-0.5">
                 <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Tối thiểu qua môn</p>
                 <p className="text-[11px] font-bold text-emerald-700/80 uppercase tracking-tighter">(Để đạt D / 4.0 chung cuộc)</p>
               </div>
               <span className="text-3xl font-black text-emerald-700">{scoreToPassDisplay}</span>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Right Column: Target grades */}
      <div className="lg:col-span-7">
        <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-blue-500/10 rounded-3xl overflow-hidden h-full">
          <CardHeader className="pb-4 border-b border-white/10">
             <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Mục tiêu Điểm thi</CardTitle>
            </div>
            <CardDescription className="text-slate-600 font-bold">Điểm thi cần đạt để đạt từng mức GPA.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 gap-3">
               {validScales.map((scale) => {
                 const requiredFinal = (scale.min - accumulatedScore) / finalRatio;
                 const isImpossible = requiredFinal > 10;
                 const isAlreadyAchieved = requiredFinal <= 0;
                 const pct = Math.min(100, Math.max(0, (requiredFinal / 10) * 100));

                 let barColor = "bg-slate-300";
                 let cardClass = "bg-slate-50 border-slate-200";
                 let gradeRingClass = "border-slate-300 text-slate-700 bg-slate-50";
                 let scoreFontClass = "text-slate-900";
                 let labelClass = "text-slate-600";

                 if (isAlreadyAchieved) {
                   barColor = "bg-emerald-400";
                   cardClass = "bg-emerald-50 border-emerald-200";
                   gradeRingClass = "border-emerald-300 text-emerald-700 bg-emerald-50";
                   scoreFontClass = "text-emerald-600";
                   labelClass = "text-emerald-700";
                 } else if (isImpossible) {
                   barColor = "bg-rose-300";
                   cardClass = "bg-rose-50/60 border-rose-100 opacity-70";
                   gradeRingClass = "border-rose-200 text-rose-500";
                   scoreFontClass = "text-rose-500";
                   labelClass = "text-rose-600";
                 } else if (pct <= 40) {
                   barColor = "bg-emerald-400";
                   scoreFontClass = "text-slate-900";
                 } else if (pct <= 65) {
                   barColor = "bg-blue-500";
                 } else if (pct <= 85) {
                   barColor = "bg-amber-400";
                 } else {
                   barColor = "bg-orange-500";
                 }

                 const scoreDisplay = isAlreadyAchieved ? "Đã đạt" : isImpossible ? "—" : requiredFinal.toFixed(2);
                 const labelDisplay = isAlreadyAchieved ? "Đã đảm bảo" : isImpossible ? "Không khả thi" : "Cần đạt / 10";

                 return (
                   <div key={scale.grade} className={`p-4 rounded-2xl border flex flex-col gap-3 ${cardClass}`}>
                     {/* Row 1: Grade badge + Score annotation */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <span className={`flex items-center justify-center h-10 w-10 rounded-full font-black text-sm bg-white shadow-sm border-2 ${gradeRingClass}`}>
                           {scale.grade}
                         </span>
                         <div className="flex flex-col">
                           <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Loại</span>
                           <span className="text-xs font-bold text-slate-700">GPA {scale.gpa.toFixed(1)}</span>
                         </div>
                       </div>

                       {/* Score + label */}
                       <div className="flex flex-col items-end gap-0.5">
                         <span className={`font-black text-2xl leading-none ${scoreFontClass}`}>
                           {scoreDisplay}
                         </span>
                         <span className={`text-[11px] font-bold uppercase tracking-widest ${labelClass}`}>
                           {labelDisplay}
                         </span>
                       </div>
                     </div>

                     {/* Row 2: Progress bar */}
                     <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                       <div
                         className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                         style={{ width: isAlreadyAchieved ? "100%" : isImpossible ? "100%" : `${pct}%` }}
                       />
                     </div>
                   </div>
                 );
               })}
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
