"use client";

import { useState, useEffect } from "react";
import { Target, RefreshCcw, BookOpen, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RetakeList } from "./RetakeList";
import type { RoadmapState, RoadmapActions, RoadmapComputed } from "@/hooks/useRoadmapState";

interface GoalSetupCardProps {
  state: RoadmapState;
  actions: RoadmapActions;
  computed: RoadmapComputed;
}

const GPA_MILESTONES = [2.0, 2.5, 3.2, 3.6];

export function GoalSetupCard({ state, actions, computed }: GoalSetupCardProps) {
  const { currentGPA, currentCredits, targetGPA, remainingCredits, retakes } = state;

  return (
    <Card className="border-slate-200 bg-white shadow-xl shadow-blue-500/5 rounded-3xl overflow-hidden border">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-black text-slate-800 tracking-tight">Thiết lập mục tiêu</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <StartingPointStep
          currentGPA={currentGPA}
          currentCredits={currentCredits}
          onGPAChange={actions.setCurrentGPA}
          onCreditsChange={actions.setCurrentCredits}
          onSync={actions.syncFromManual}
        />
        <TargetGPAStep
          targetGPA={targetGPA}
          onSelect={actions.setTargetGPA}
        />
        <EffortPlanStep
          currentCredits={currentCredits}
          remainingCredits={remainingCredits}
          retakes={retakes}
          onTotalChange={actions.setTotalGraduationCredits}
          onRemainingChange={actions.setRemainingCredits}
          onAddRetake={actions.addRetake}
          onRemoveRetake={actions.removeRetake}
          onUpdateRetake={actions.updateRetake}
          manualImprovableCourses={computed.manualImprovableCourses}
          onToggleFromManual={actions.toggleRetakeFromManual}
        />
      </CardContent>
    </Card>
  );
}

interface StartingPointStepProps {
  currentGPA: number;
  currentCredits: number;
  onGPAChange(v: number): void;
  onCreditsChange(v: number): void;
  onSync(): void;
}

function StartingPointStep({ currentGPA, currentCredits, onGPAChange, onCreditsChange, onSync }: StartingPointStepProps) {
  const [gpaStr, setGpaStr] = useState(currentGPA === 0 ? "" : currentGPA.toString());
  const [creditsStr, setCreditsStr] = useState(currentCredits === 0 ? "" : currentCredits.toString());

  useEffect(() => {
    if (parseFloat(gpaStr) !== currentGPA) setGpaStr(currentGPA === 0 ? "" : currentGPA.toString());
  }, [currentGPA]);

  useEffect(() => {
    if (parseInt(creditsStr) !== currentCredits) setCreditsStr(currentCredits === 0 ? "" : currentCredits.toString());
  }, [currentCredits]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">01</span>
          <Label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Điểm xuất phát</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          className="h-7 text-[12px] font-black text-blue-600 uppercase hover:bg-blue-50 rounded-lg px-2"
        >
          <RefreshCcw className="h-3 w-3 mr-1.5" /> Đồng bộ
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Input
            type="number"
            step="0.01"
            min={0}
            max={4.0}
            value={gpaStr}
            onChange={e => {
              const s = e.target.value;
              setGpaStr(s);
              const val = s === "" ? 0 : parseFloat(s);
              if (!isNaN(val)) onGPAChange(Math.min(4.0, Math.max(0, val)));
            }}
            placeholder="GPA"
            className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
          />
          <div className="text-[11px] font-bold text-slate-600 text-center uppercase tracking-tighter">GPA hiện tại</div>
        </div>
        <div className="space-y-1">
          <Input
            type="number"
            min={0}
            max={300}
            value={creditsStr}
            onChange={e => {
              const s = e.target.value;
              setCreditsStr(s);
              const val = s === "" ? 0 : parseInt(s);
              if (!isNaN(val)) onCreditsChange(Math.min(300, Math.max(0, val)));
            }}
            placeholder="TC"
            className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
          />
          <div className="text-[11px] font-bold text-slate-600 text-center uppercase tracking-tighter">TC tích lũy</div>
        </div>
      </div>
    </div>
  );
}

interface TargetGPAStepProps {
  targetGPA: number;
  onSelect(v: number): void;
}

function TargetGPAStep({ targetGPA, onSelect }: TargetGPAStepProps) {
  const [valStr, setValStr] = useState(targetGPA === 0 ? "" : targetGPA.toString());

  useEffect(() => {
    if (parseFloat(valStr) !== targetGPA) setValStr(targetGPA === 0 ? "" : targetGPA.toString());
  }, [targetGPA]);

  const handleInputChange = (raw: string) => {
    setValStr(raw);
    const val = parseFloat(raw);
    if (isNaN(val)) return onSelect(0);
    onSelect(Math.min(4.0, Math.max(0, val)));
  };

  return (
    <div className="p-6 bg-slate-50/50 border-y border-slate-100 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-md">02</span>
        <Label className="text-[12px] font-black text-blue-600 uppercase tracking-widest">Mục tiêu mong muốn</Label>
      </div>

      <div className="flex gap-2">
        {GPA_MILESTONES.map(val => (
          <Button
            key={val}
            variant={targetGPA === val ? "default" : "outline"}
            className={`flex-1 h-9 text-[12px] font-black transition-all rounded-lg border-slate-200 ${targetGPA === val ? "bg-blue-600 text-white" : "text-slate-500 bg-white"}`}
            onClick={() => {
              setValStr(val.toString());
              onSelect(val);
            }}
          >
            {val.toFixed(1)}
          </Button>
        ))}
      </div>

      <Input
        type="number"
        step="0.05"
        min={0}
        max={4.0}
        value={valStr}
        onChange={e => handleInputChange(e.target.value)}
        placeholder="GPA mục tiêu"
        className="text-center text-2xl font-black text-blue-800 bg-white border-2 border-blue-100 focus:border-blue-500 rounded-2xl h-14"
      />
    </div>
  );
}

interface EffortPlanStepProps {
  currentCredits: number;
  remainingCredits: number;
  retakes: RoadmapState["retakes"];
  onTotalChange(total: number): void;
  onRemainingChange(v: number): void;
  onAddRetake(): void;
  onRemoveRetake(id: string): void;
  onUpdateRetake(id: string, field: string, value: unknown): void;
  manualImprovableCourses: { name: string; credits: number; grade: string; gpa: number }[];
  onToggleFromManual(course: { name: string; credits: number; grade: string }): void;
}

function EffortPlanStep({
  currentCredits, remainingCredits,
  retakes, onTotalChange, onRemainingChange,
  onAddRetake, onRemoveRetake, onUpdateRetake,
  manualImprovableCourses, onToggleFromManual,
}: EffortPlanStepProps) {
  const totalVal = currentCredits + remainingCredits;
  const [totalStr, setTotalStr] = useState(totalVal === 0 ? "" : totalVal.toString());
  const [remStr, setRemStr] = useState(remainingCredits === 0 ? "" : remainingCredits.toString());

  useEffect(() => {
    if (parseInt(totalStr) !== totalVal) setTotalStr(totalVal === 0 ? "" : totalVal.toString());
  }, [totalVal]);

  useEffect(() => {
    if (parseInt(remStr) !== remainingCredits) setRemStr(remainingCredits === 0 ? "" : remainingCredits.toString());
  }, [remainingCredits]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">03</span>
        <Label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Kế hoạch nỗ lực</Label>
      </div>

      <div className="relative grid grid-cols-2 gap-4">
        <div className="space-y-1 relative">
          <Input
            type="number"
            min={0}
            max={300}
            value={totalStr}
            onChange={e => {
              const s = e.target.value;
              setTotalStr(s);
              if (s === "") return onRemainingChange(0);
              const val = parseInt(s);
              if (!isNaN(val)) onTotalChange(Math.min(300, Math.max(0, val)));
            }}
            placeholder="TC tốt nghiệp"
            className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
          />
          <div className="text-[11px] font-bold text-slate-600 text-center uppercase tracking-tighter">Tổng TC ra trường</div>
        </div>

        <div className="absolute left-1/2 top-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white text-slate-400 border border-slate-100 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Hoặc</div>
        </div>

        <div className="space-y-1">
          <Input
            type="number"
            min={0}
            max={200}
            value={remStr}
            onChange={e => {
              const s = e.target.value;
              setRemStr(s);
              const val = s === "" ? 0 : parseInt(s);
              if (!isNaN(val)) onRemainingChange(Math.min(200, Math.max(0, val)));
            }}
            placeholder="TC học tiếp"
            className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
          />
          <div className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-tighter">TC dự kiến học</div>
        </div>
      </div>

      <RetakeList
        retakes={retakes}
        onAdd={onAddRetake}
        onRemove={onRemoveRetake}
        onUpdate={onUpdateRetake}
        manualImprovableCourses={manualImprovableCourses}
        onToggleFromManual={onToggleFromManual}
      />
    </div>
  );
}
