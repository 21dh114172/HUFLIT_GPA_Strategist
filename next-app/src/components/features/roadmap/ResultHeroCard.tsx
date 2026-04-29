"use client";

import { AlertCircle, TrendingUp } from "lucide-react";
import type { RoadmapComputed } from "@/hooks/useRoadmapState";
import {
  getStatusTextColor,
  getStatusBorderColor,
  isStatusNegative,
  getStatusLabel,
  getDisplayGPA,
  getDisplayLabel,
} from "@/lib/roadmap-utils";

interface ResultHeroCardProps {
  result: RoadmapComputed["result"];
  status: RoadmapComputed["status"];
  maxPossibleGPA: number;
  targetGPA: number;
  currentCredits: number;
}

export function ResultHeroCard({ result, status, maxPossibleGPA, targetGPA, currentCredits }: ResultHeroCardProps) {
  const textColor = getStatusTextColor(status);
  const borderColor = getStatusBorderColor(status);
  const isNegative = isStatusNegative(status);

  return (
    <div className={`p-4 sm:p-5 border shadow-sm overflow-hidden bg-white transition-all duration-700 rounded-[2rem] flex flex-col items-center text-center space-y-4 ${borderColor}`}>
      <GPADisplay status={status} requiredGPA={result.requiredGPA} textColor={textColor} />
      <StatusBadge status={status} maxPossibleGPA={maxPossibleGPA} textColor={textColor} isNegative={isNegative} />
      <StatsRow result={result} status={status} maxPossibleGPA={maxPossibleGPA} targetGPA={targetGPA} currentCredits={currentCredits} />
    </div>
  );
}

interface GPADisplayProps {
  status: ResultHeroCardProps["status"];
  requiredGPA: number;
  textColor: string;
}

function GPADisplay({ status, requiredGPA, textColor }: GPADisplayProps) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
        {getDisplayLabel(status)}
      </div>
      <div className={`text-5xl sm:text-6xl font-black tracking-tighter py-0.5 ${textColor}`}>
        {getDisplayGPA(status, requiredGPA)}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: ResultHeroCardProps["status"];
  maxPossibleGPA: number;
  textColor: string;
  isNegative: boolean;
}

function StatusBadge({ status, maxPossibleGPA, textColor, isNegative }: StatusBadgeProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${textColor}`}>
      {isNegative ? <AlertCircle className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
      <span className="font-bold text-[11px] uppercase tracking-widest">
        {getStatusLabel(status, maxPossibleGPA)}
      </span>
    </div>
  );
}

interface StatsRowProps {
  result: ResultHeroCardProps["result"];
  status: ResultHeroCardProps["status"];
  maxPossibleGPA: number;
  targetGPA: number;
  currentCredits: number;
}

function StatsRow({ result, status, maxPossibleGPA, targetGPA, currentCredits }: StatsRowProps) {
  const isImpossible = status === "impossible";

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full pt-4 border-t border-slate-100">
        <StatItem
          label="TC HIỆN TẠI"
          value={currentCredits}
          subtitle="Đã tích lũy"
        />
        <StatItem
          label="TC SẼ HỌC"
          value={result.totalEffortCredits}
          subtitle="Học mới & cải thiện"
        />
        <StatItem
          label={isImpossible ? "GPA TỐI ĐA" : "GPA MỤC TIÊU"}
          value={isImpossible ? maxPossibleGPA.toFixed(2) : targetGPA.toFixed(2)}
          subtitle={isImpossible ? "Khả năng cao nhất" : "Mục tiêu ra trường"}
        />
      </div>
      
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng tín chỉ khi tốt nghiệp:</span>
        <span className="text-[11px] font-black text-blue-600">{result.totalFutureCredits} TC</span>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: number | string;
  subtitle: string;
}

function StatItem({ label, value, subtitle }: StatItemProps) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-500 font-medium leading-tight">{subtitle}</div>
    </div>
  );
}
