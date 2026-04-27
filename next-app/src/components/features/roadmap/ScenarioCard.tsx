"use client";

import { TrendingUp, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GRADE_SCALE, type GradeCombination, type RetakeSuggestion } from "@/lib/gpa-engine";
import type { RoadmapComputed } from "@/hooks/useRoadmapState";

interface ScenarioCardProps {
  scenarioText: string;
  combinations: GradeCombination[];
  result: RoadmapComputed["result"];
  retakeSuggestions: RetakeSuggestion[];
  hasManualData: boolean;
  missingScenarios: { label: string; credits: number; gainPerCredit: number }[];
  targetGPA: number;
  totalPointsGap: number;
  onAddRetakeSuggestion(suggestion: RetakeSuggestion): void;
}

export function ScenarioCard({
  scenarioText, combinations, result, retakeSuggestions, hasManualData, missingScenarios, targetGPA, totalPointsGap, onAddRetakeSuggestion,
}: ScenarioCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
      <CardContent className="p-3 sm:p-4 space-y-3">
        <RecommendedScenario scenarioText={scenarioText} />
        {combinations.length > 1 && (
          <AlternativeCombinations combinations={combinations} result={result} targetGPA={targetGPA} />
        )}
        {result.requiredGPA > 4.0 && (
          <RescueSuggestions 
            suggestions={retakeSuggestions} 
            hasManualData={hasManualData} 
            missingScenarios={missingScenarios}
            totalPointsGap={totalPointsGap}
            onAdd={onAddRetakeSuggestion} 
          />
        )}
      </CardContent>
    </Card>
  );
}

function RecommendedScenario({ scenarioText }: { scenarioText: string }) {
  return (
    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <TrendingUp className="h-16 w-16 text-blue-600" />
      </div>
      <div className="relative z-10">
        <div className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Kịch bản khuyến nghị</div>
        <div className="text-sm font-bold text-slate-800 leading-snug tracking-tight">{scenarioText}</div>
      </div>
    </div>
  );
}

interface AlternativeCombinationsProps {
  combinations: GradeCombination[];
  result: RoadmapComputed["result"];
  targetGPA: number;
}

function AlternativeCombinations({ combinations, result, targetGPA }: AlternativeCombinationsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Các phương án thay thế khả thi:</div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] h-5 border-none">
          {combinations.length} tổ hợp
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
        {combinations.map((combo, i) => (
          <CombinationCard key={i} combo={combo} index={i} result={result} targetGPA={targetGPA} />
        ))}
      </div>
    </div>
  );
}

interface CombinationCardProps {
  combo: GradeCombination;
  index: number;
  result: RoadmapComputed["result"];
  targetGPA: number;
}

function CombinationCard({ combo: c, index: i, result, targetGPA }: CombinationCardProps) {
  const earnedPoints = (targetGPA * result.totalFutureCredits) - result.requiredPoints + (c.g1.gpa * c.c1 + c.g2.gpa * c.c2);
  const totalPoints = targetGPA * result.totalFutureCredits;
  const isBest = i === 0;

  return (
    <div className="group/combo p-2 sm:p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[11px] font-bold py-0.5 px-2 rounded-lg uppercase tracking-tight">
            PA {i + 1}: {c.g1.grade} &amp; {c.g2.grade}
          </Badge>
          {isBest && (
            <Badge className="bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase border-none h-4.5 px-2">
              Khuyên dùng
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-1 w-1 rounded-full ${isBest ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-[11px] font-black text-slate-700">
            {earnedPoints.toFixed(2)} <span className="text-slate-400">/ {totalPoints.toFixed(2)}đ</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {c.c1 > 0 && c.c2 > 0 ? (
          <>
            <GradeBlock grade={c.g1.grade} credits={c.c1} />
            <Plus className="h-3 w-3 text-slate-200 shrink-0" />
            <GradeBlock grade={c.g2.grade} credits={c.c2} />
          </>
        ) : (
          <SingleGradeBlock grade={c.c1 > 0 ? c.g1.grade : c.g2.grade} credits={c.c1 + c.c2} />
        )}
      </div>
    </div>
  );
}

type GradeLevel = "excellent" | "good" | "average" | "poor" | "fail";

function getGradeLevel(grade: string): GradeLevel {
  if (grade === "A" || grade === "A+") return "excellent";
  if (grade === "B+" || grade === "B") return "good";
  if (grade === "C+" || grade === "C") return "average";
  if (grade === "D+" || grade === "D") return "poor";
  return "fail";
}

const GRADE_THEME: Record<GradeLevel, {
  bg: string; border: string; badge: string; badgeText: string;
  gradeText: string; label: string;
}> = {
  excellent: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-500",
    badgeText: "text-white",
    gradeText: "text-emerald-700",
    label: "Xuất sắc",
  },
  good: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-500",
    badgeText: "text-white",
    gradeText: "text-blue-700",
    label: "Tốt",
  },
  average: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-500",
    badgeText: "text-white",
    gradeText: "text-amber-700",
    label: "Trung bình",
  },
  poor: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-500",
    badgeText: "text-white",
    gradeText: "text-orange-700",
    label: "Yếu",
  },
  fail: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-500",
    badgeText: "text-white",
    gradeText: "text-rose-700",
    label: "Kém",
  },
};

function GradeBlock({ grade, credits }: { grade: string; credits: number }) {
  const level = getGradeLevel(grade);
  const theme = GRADE_THEME[level];

  return (
    <div className={`flex-1 flex items-center justify-between px-2.5 h-10 ${theme.bg} border ${theme.border} rounded-xl transition-all duration-200 hover:shadow-sm`}>
      <span className={`text-xl font-black tracking-tighter ${theme.gradeText}`}>{grade}</span>
      <div className={`flex items-center gap-1 px-1.5 py-0.5 ${theme.badge} rounded-lg`}>
        <span className={`text-[11px] font-black ${theme.badgeText} tabular-nums`}>{credits}</span>
        <span className={`text-[11px] font-bold ${theme.badgeText} opacity-80 uppercase`}>TC</span>
      </div>
    </div>
  );
}

function SingleGradeBlock({ grade, credits }: { grade: string; credits: number }) {
  const level = getGradeLevel(grade);
  const theme = GRADE_THEME[level];

  return (
    <div className={`w-full flex items-center justify-between px-3 h-10 ${theme.bg} border ${theme.border} rounded-xl transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-black tracking-tighter ${theme.gradeText}`}>{grade}</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Toàn bộ tín chỉ còn lại</span>
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 ${theme.badge} rounded-lg`}>
        <span className={`text-xs font-black ${theme.badgeText} tabular-nums`}>{credits}</span>
        <span className={`text-[11px] font-bold ${theme.badgeText} opacity-80 uppercase`}>TC</span>
      </div>
    </div>
  );
}


interface RescueSuggestionsProps {
  suggestions: RetakeSuggestion[];
  hasManualData: boolean;
  missingScenarios: { label: string; credits: number; gainPerCredit: number }[];
  totalPointsGap: number;
  onAdd(suggestion: RetakeSuggestion): void;
}

function RescueSuggestions({ suggestions, hasManualData, missingScenarios, totalPointsGap, onAdd }: RescueSuggestionsProps) {
  const primaryMissing = missingScenarios.length > 0 ? missingScenarios[0].credits : 0;

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-black uppercase text-sm tracking-widest">Cứu vãn lộ trình</span>
        </div>
      </div>

      {missingScenarios.length > 0 ? (
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-rose-100 bg-rose-50/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Khoảng cách mục tiêu</span>
              {suggestions.length > 0 ? (
                <Badge className="bg-amber-500 text-white border-none text-[11px] font-black px-2 h-5">CÓ THỂ CỨU VÃN</Badge>
              ) : (
                <Badge className="bg-rose-500 text-white border-none text-[11px] font-black px-2 h-5">KHÔNG KHẢ THI</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/60 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Tín chỉ thiếu (~A)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-rose-600 tracking-tighter">{primaryMissing}</span>
                  <span className="text-[11px] font-bold text-rose-400 uppercase">TC</span>
                </div>
              </div>
              <div className="bg-white/60 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Điểm tổng thiếu</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-rose-600 tracking-tighter">{totalPointsGap.toFixed(2)}</span>
                  <span className="text-[11px] font-bold text-rose-400 uppercase">Điểm</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-500 leading-tight italic opacity-80">
              * Bạn cần bổ sung tối thiểu lượng điểm/tín chỉ trên để đạt GPA mục tiêu.
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Phương án đề xuất từ bảng điểm:</div>
            
            <div className="space-y-3">
              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <RescueSuggestionRow key={idx} suggestion={s} onAdd={onAdd} index={idx} />
                ))
              ) : (
                <div className="p-8 text-center bg-white/50 rounded-xl border border-dashed border-rose-200">
                   <p className="text-[11px] font-bold text-slate-400 uppercase italic">
                     {hasManualData 
                       ? "Không tìm thấy môn học cũ phù hợp để cải thiện." 
                       : "Vui lòng nhập dữ liệu ở tab Manual để nhận gợi ý."}
                   </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                Nếu không muốn học lại, hãy cân nhắc <span className="font-bold">giảm mục tiêu GPA</span> hoặc <span className="font-bold">tăng số tín chỉ</span> dự kiến ở phần thiết lập.
              </p>
            </div>
          </div>
        </div>
      ) : (
        !hasManualData && (
          <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
              Nhập dữ liệu Manual để nhận gợi ý học cải thiện tối ưu
            </p>
          </div>
        )
      )}
    </div>
  );
}

interface RescueSuggestionRowProps {
  suggestion: RetakeSuggestion;
  onAdd(suggestion: RetakeSuggestion): void;
  index: number;
}

function RescueSuggestionRow({ suggestion: s, onAdd, index }: RescueSuggestionRowProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm hover:border-rose-200 hover:shadow-md transition-all duration-300 overflow-hidden group/row">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
             <div className="flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-black">
               {index + 1}
             </div>
             <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
               Phương án cải thiện {s.courses.length} môn
             </span>
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[11px] font-black h-5">
            +{s.totalGain.toFixed(2)}đ TỔNG
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          {s.courses.map((course, cIdx) => (
            <div key={cIdx} className="flex items-center justify-between bg-slate-50/50 p-2 rounded-lg border border-slate-50">
              <div className="flex flex-col gap-0.5 max-w-[65%]">
                <span className="text-[12px] font-bold text-slate-800 truncate">{course.name}</span>
                <span className="text-[11px] font-medium text-slate-400">{course.credits} tín chỉ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-rose-500">{course.grade}</span>
                  <div className="h-[1px] w-3 bg-slate-300 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 border-t border-r border-slate-300 rotate-45" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-600">A</span>
                </div>
                <div className="text-[11px] font-black text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                  +{( (4.0 - (GRADE_SCALE.find(g => g.grade === course.grade)?.gpa || 0)) * course.credits ).toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onAdd(s)}
          className="w-full h-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-lg transition-all duration-300 shadow-md shadow-blue-500/10 border-none"
        >
          Áp dụng phương án này
        </Button>
      </div>
    </div>
  );
}

