"use client";

import { X, PlusCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADE_SCALE } from "@/lib/gpa-engine";
import type { RetakeItem } from "@/hooks/useRoadmapState";

interface RetakeListProps {
  retakes: RetakeItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: unknown) => void;
  manualImprovableCourses: { name: string; credits: number; grade: string; gpa: number }[];
  onToggleFromManual(course: { name: string; credits: number; grade: string }): void;
}

export function RetakeList({
  retakes,
  onAdd,
  onRemove,
  onUpdate,
  manualImprovableCourses,
  onToggleFromManual,
}: RetakeListProps) {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-6">
      {/* Suggestions Section */}
      {manualImprovableCourses.length > 0 && (
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-blue-600" />
            <Label className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
              Gợi ý từ bảng điểm ({manualImprovableCourses.length})
            </Label>
          </div>
          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {manualImprovableCourses.map((c, i) => {
              const isAdded = retakes.some(r => r.name === c.name);
              return (
                <button
                  key={i}
                  onClick={() => onToggleFromManual(c)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-bold transition-all w-full group/btn ${
                    isAdded
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 -translate-y-0.5"
                      : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      c.grade === "F" ? "bg-rose-500" : "bg-amber-500"
                    }`} />
                    <span className="truncate pr-2">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">{c.credits}TC</span>
                    <span className={`px-1.5 py-0.5 rounded-lg text-[11px] font-black shrink-0 ${
                      isAdded 
                        ? "bg-white/20 text-white" 
                        : (c.grade === "F" ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500")
                    }`}>
                      {c.grade}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Retake List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <Label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">
            Môn đã chọn ({retakes.length})
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="h-7 text-[12px] font-black text-blue-700 uppercase border-blue-100 hover:bg-blue-50 rounded-lg px-2"
          >
            <PlusCircle className="h-3 w-3 mr-1" /> Thêm môn
          </Button>
        </div>

        <div className="space-y-2">
          {retakes.length > 0 ? (
            <>
              <RetakeTableHeader />
              <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
                {retakes.map(r => (
                  <RetakeRow key={r.id} retake={r} onRemove={onRemove} onUpdate={onUpdate} />
                ))}
              </div>
              <RetakeTotalRow retakes={retakes} />
            </>
          ) : (
            <div className="p-4 text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/30">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter italic opacity-70">
                Chưa có môn cải thiện
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RetakeTableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 px-1 mb-1">
      <div className="col-span-4 text-[11px] font-black text-slate-500 uppercase text-center">Điểm cũ</div>
      <div className="col-span-3 text-[11px] font-black text-slate-500 uppercase text-center">Tín chỉ</div>
      <div className="col-span-4 text-[11px] font-black text-slate-500 uppercase text-center">Dự kiến</div>
      <div className="col-span-1" />
    </div>
  );
}

interface RetakeRowProps {
  retake: RetakeItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: unknown) => void;
}

function RetakeRow({ retake: r, onRemove, onUpdate }: RetakeRowProps) {
  const oldGradeLabel = GRADE_SCALE.find(g => g.gpa === r.oldGrade)?.grade ?? "D";

  return (
    <div className="grid grid-cols-12 gap-1.5 items-center bg-slate-50/50 p-1.5 rounded-xl border border-slate-100/50 group transition-all hover:bg-white hover:border-blue-100">
      <div className="col-span-4">
        <Select
          value={oldGradeLabel}
          onValueChange={val => {
            const gInfo = GRADE_SCALE.find(g => g.grade === val);
            if (gInfo) onUpdate(r.id, "oldGrade", gInfo.gpa);
          }}
        >
          <SelectTrigger className="h-7 w-20 text-[11px] font-bold bg-white border-slate-100 text-rose-500 rounded-lg focus:ring-0 mx-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["F", "D", "D+", "C", "C+"].map(grade => (
              <SelectItem key={grade} value={grade} className="text-[11px] font-bold">{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-3">
        <Input
          type="number"
          value={r.credits}
          onChange={e => onUpdate(r.id, "credits", parseInt(e.target.value) || 0)}
          className="h-7 text-center text-[11px] font-bold bg-white border-slate-100 rounded-lg px-1 focus:ring-0"
        />
      </div>

      <div className="col-span-4">
        <Select
          value={r.targetGrade !== undefined ? String(r.targetGrade) : "auto"}
          onValueChange={val => {
            if (!val) return;
            const targetGrade = val === "auto" ? undefined : parseFloat(val);
            onUpdate(r.id, "targetGrade", targetGrade);
          }}
        >
          <SelectTrigger className={`h-7 text-[11px] font-bold border rounded-lg focus:ring-0 justify-center ${r.targetGrade !== undefined ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto" className="text-[11px] font-bold italic">Auto</SelectItem>
            {GRADE_SCALE.filter(g => g.gpa > 0).map(g => (
              <SelectItem key={g.grade} value={String(g.gpa)} className="text-[11px] font-bold">{g.grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(r.id)}
          className="h-6 w-6 text-slate-400 hover:text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function RetakeTotalRow({ retakes }: { retakes: RetakeItem[] }) {
  const total = retakes.reduce((acc, r) => acc + (r.credits || 0), 0);
  return (
    <div className="flex justify-between items-center px-3 py-1.5 bg-blue-50/50 rounded-lg border border-dashed border-blue-100 mt-2">
      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">Tổng tín chỉ cải thiện</span>
      <span className="text-[11px] font-black text-blue-600">{total} TC</span>
    </div>
  );
}
