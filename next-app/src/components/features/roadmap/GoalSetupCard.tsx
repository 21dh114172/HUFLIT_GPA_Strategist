"use client";

import { useState, useEffect } from "react";
import { Target, RefreshCcw, BookOpen, GraduationCap, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RetakeList } from "./RetakeList";
import type { RoadmapState, RoadmapActions, RoadmapComputed } from "@/hooks/useRoadmapState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2 px-5">
        <div className="flex items-center gap-3">
          <Target className="h-4 w-4 text-blue-600" strokeWidth={2} />
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">Thiết lập mục tiêu</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-2 space-y-2 relative">
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
          onTotalChange={actions.setTotalGraduationCredits}
          onRemainingChange={actions.setRemainingCredits}
        />

        <ImprovementStep
          retakes={retakes}
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
    <div className="p-2.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm space-y-2 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden shrink">
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100/50 shrink-0">01</span>
          <div className="flex items-center gap-1 min-w-0">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap truncate">
              Dữ liệu tích lũy
            </Label>
            <HelpCircle className="h-3 w-3 text-slate-300 shrink-0 cursor-help" title="Điểm và tín chỉ bạn đang có tính đến hiện tại" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSync();
            toast.success("Đã đồng bộ dữ liệu thành công", {
              description: "Thông tin GPA và tín chỉ đã được cập nhật từ tab Nhập điểm.",
              duration: 2000,
            });
          }}
          className="h-7 text-[8px] font-black text-blue-600 uppercase tracking-wider hover:bg-blue-50 rounded-xl px-2 gap-1 border border-blue-100/50 shrink-0"
        >
          <RefreshCcw className="h-2.5 w-2.5" strokeWidth={3} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-[13px]">
        <div className="relative group">
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
            placeholder="0.00"
            className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-2xl h-11 shadow-sm transition-all group-hover:border-blue-200"
          />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-blue-100 text-[8px] font-black text-blue-600 uppercase tracking-wider whitespace-nowrap pointer-events-none">Điểm GPA hiện tại</div>
        </div>

        <div className="relative group">
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
            placeholder="0"
            className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-2xl h-11 shadow-sm transition-all group-hover:border-blue-200"
          />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-blue-100 text-[8px] font-black text-blue-600 uppercase tracking-wider whitespace-nowrap pointer-events-none">Số tín chỉ tích lũy</div>
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
    <div className="p-2.5 bg-blue-50/30 border border-blue-100/50 rounded-[1.5rem] shadow-sm space-y-2 relative z-10">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded-lg shadow-sm shadow-blue-200">02</span>
        <Label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] flex items-center gap-1.5">
          Mục tiêu mong muốn
          <HelpCircle className="h-3 w-3 text-blue-300" title="Mức điểm GPA bạn muốn đạt được khi ra trường" />
        </Label>
      </div>

      <div className="flex gap-2">
        {GPA_MILESTONES.map(val => (
          <Button
            key={val}
            variant={targetGPA === val ? "default" : "outline"}
            className={`flex-1 h-9 text-[11px] font-black transition-all rounded-xl border-slate-200 ${targetGPA === val ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 bg-white hover:bg-blue-50/50"}`}
            onClick={() => {
              setValStr(val.toString());
              onSelect(val);
            }}
          >
            {val.toFixed(1)}
          </Button>
        ))}
      </div>

      <div className="relative group mt-[13px]">
        <Input
          type="number"
          step="0.05"
          min={0}
          max={4.0}
          value={valStr}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="GPA mục tiêu"
          className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-2xl h-11 shadow-sm transition-all group-hover:border-blue-200"
        />
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-blue-100 text-[8px] font-black text-blue-600 uppercase tracking-wider whitespace-nowrap pointer-events-none">GPA mục tiêu</div>
      </div>
    </div>
  );
}

interface EffortPlanStepProps {
  currentCredits: number;
  remainingCredits: number;
  onTotalChange(total: number): void;
  onRemainingChange(v: number): void;
}

function EffortPlanStep({
  currentCredits, remainingCredits,
  onTotalChange, onRemainingChange,
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
    <div className="p-2.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm space-y-2 relative z-10">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">03</span>
        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
          Kế hoạch nỗ lực
          <HelpCircle className="h-3 w-3 text-slate-300" title="Chọn cách nhập số tín chỉ còn lại để tính toán" />
        </Label>
      </div>

      <Tabs defaultValue="remaining" className="w-full gap-0">
        <TabsList className="grid w-full grid-cols-2 h-7 bg-slate-50 rounded-xl p-0.5">
          <TabsTrigger value="remaining" className="text-[9px] font-black uppercase tracking-tighter rounded-lg data-active:bg-white data-active:text-blue-600 data-active:shadow-sm transition-all">
            <BookOpen className="h-3 w-3 mr-1.5" /> Còn lại
          </TabsTrigger>
          <TabsTrigger value="total" className="text-[9px] font-black uppercase tracking-tighter rounded-lg data-active:bg-white data-active:text-blue-600 data-active:shadow-sm transition-all">
            <GraduationCap className="h-3 w-3 mr-1.5" /> Tổng cộng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="total" className="mt-[13px]">
          <div className="relative group">
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
              placeholder="Ví dụ: 140"
              className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-2xl h-11 shadow-sm transition-all group-hover:border-blue-200"
            />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-blue-100 text-[8px] font-black text-blue-600 uppercase tracking-wider whitespace-nowrap pointer-events-none">Tổng tín chỉ toàn khóa học</div>
          </div>
        </TabsContent>

        <TabsContent value="remaining" className="mt-[13px]">
          <div className="relative group">
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
              placeholder="Ví dụ: 30"
              className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-2xl h-11 shadow-sm transition-all group-hover:border-blue-200"
            />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-blue-100 text-[8px] font-black text-blue-600 uppercase tracking-wider whitespace-nowrap pointer-events-none">Số tín chỉ dự kiến học tiếp</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ImprovementStepProps {
  retakes: RoadmapState["retakes"];
  onAddRetake(): void;
  onRemoveRetake(id: string): void;
  onUpdateRetake(id: string, field: string, value: unknown): void;
  manualImprovableCourses: { name: string; credits: number; grade: string; gpa: number }[];
  onToggleFromManual(course: { name: string; credits: number; grade: string }): void;
}

function ImprovementStep({
  retakes, onAddRetake, onRemoveRetake, onUpdateRetake,
  manualImprovableCourses, onToggleFromManual,
}: ImprovementStepProps) {
  return (
    <div className="p-2.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm space-y-2 relative z-10">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100/50 shadow-sm">04</span>
        <Label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] flex items-center gap-1.5">
          Học cải thiện
          <HelpCircle className="h-3 w-3 text-blue-300" title="Chọn các môn bạn muốn học cải thiện để nâng cao điểm GPA" />
        </Label>
      </div>

      <div className="pt-1">
        <RetakeList
          retakes={retakes}
          onAdd={onAddRetake}
          onRemove={onRemoveRetake}
          onUpdate={onUpdateRetake}
          manualImprovableCourses={manualImprovableCourses}
          onToggleFromManual={onToggleFromManual}
        />
      </div>
    </div>
  );
}
