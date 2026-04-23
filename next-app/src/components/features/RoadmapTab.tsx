"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Target,
  RefreshCcw,
  PlusCircle,
  X,
  Dna,
  Plus,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Calculator,
  Info,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  calculateTargetResult,
  generateGradeCombinations,
  generateScenarioText,
  generateRetakeSuggestions,
  calculateManualGPA,
  GRADE_SCALE,
  findGradeInfo
} from "@/lib/gpa-engine";

const MANUAL_STORAGE_KEY = "huflit-manual-gpa-state";
const ROADMAP_STORAGE_KEY = "huflit-roadmap-state";

interface RetakeItem {
  id: string;
  oldGrade: number;
  credits: number;
  name?: string;
  targetGrade?: number; // undefined = Auto (system decides)
}

interface RoadmapTabProps {
  initialData?: {
    gpa: number;
    credits: number;
    remainingCredits?: number;
    pendingRetakes?: RetakeItem[];
  } | null;
}

// Helper to load saved state from localStorage
function loadSavedRoadmapState() {
  try {
    const saved = localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { }
  return null;
}

export function RoadmapTab({ initialData }: RoadmapTabProps) {
  const savedState = loadSavedRoadmapState();

  const [currentGPA, setCurrentGPA] = useState<number>(initialData?.gpa ?? savedState?.currentGPA ?? 0);
  const [currentCredits, setCurrentCredits] = useState<number>(initialData?.credits ?? savedState?.currentCredits ?? 0);
  const [targetGPA, setTargetGPA] = useState<number>(savedState?.targetGPA ?? 0);
  const [remainingCredits, setRemainingCredits] = useState<number>(initialData?.remainingCredits ?? savedState?.remainingCredits ?? 0);
  const [retakes, setRetakes] = useState<RetakeItem[]>(initialData?.pendingRetakes ?? savedState?.retakes ?? []);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify({
      currentGPA, currentCredits, targetGPA, remainingCredits, retakes,
    }));
  }, [isLoaded, currentGPA, currentCredits, targetGPA, remainingCredits, retakes]);

  useEffect(() => {
    if (initialData) {
      setCurrentGPA(initialData.gpa);
      setCurrentCredits(initialData.credits);
      setRemainingCredits(initialData.remainingCredits || 0);
      setRetakes(initialData.pendingRetakes || []);
      const milestones = [2.0, 2.5, 3.2, 3.6];
      const nextTarget = milestones.find(m => m > initialData.gpa) || 0;
      setTargetGPA(nextTarget);
    }
  }, [initialData]);

  const syncFromManual = () => {
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (saved) {
      try {
        const { semesters, initialGPA, initialCredits } = JSON.parse(saved);
        const result = calculateManualGPA(semesters, initialGPA, initialCredits);
        setCurrentGPA(result.gpa);
        setCurrentCredits(result.totalCredits);
        const manualRetakes: any[] = [];
        semesters.forEach((sem: any) => {
          sem.courses.forEach((c: any) => {
            if (c.isRetake && (!c.grade || c.grade === "")) {
              const gInfo = GRADE_SCALE.find(g => g.grade === c.oldGrade);
              manualRetakes.push({ id: Math.random().toString(), oldGrade: gInfo?.gpa || 1.0, credits: c.credits, name: c.name });
            }
          });
        });
        if (manualRetakes.length > 0) setRetakes(manualRetakes);
      } catch (e) { }
    }
  };

  const result = useMemo(() => calculateTargetResult(currentGPA, currentCredits, targetGPA, remainingCredits, retakes),
    [currentGPA, currentCredits, targetGPA, remainingCredits, retakes]);

  const maxPossibleGPA = useMemo(() => {
    if (!result || result.totalFutureCredits === 0) return currentGPA;
    const pointsToReplace = retakes.reduce((acc, r) => acc + (r.oldGrade * r.credits), 0);
    const effectiveCurrentPoints = (currentGPA * currentCredits) - pointsToReplace;
    const fixedTargetPoints = retakes.filter(r => r.targetGrade !== undefined).reduce((acc, r) => acc + (r.targetGrade! * r.credits), 0);
    const maxEffortPoints = result.totalEffortCredits * 4.0;
    return (effectiveCurrentPoints + fixedTargetPoints + maxEffortPoints) / result.totalFutureCredits;
  }, [currentGPA, currentCredits, retakes, result]);

  const combinations = useMemo(() => {
    if (result.requiredGPA > 4.0 || result.requiredGPA <= 0) return [];
    return generateGradeCombinations(result.totalEffortCredits, result.requiredPoints);
  }, [result]);

  const scenarioText = useMemo(() => {
    const isImpossible = result.requiredGPA > 4.0 || (result.totalEffortCredits === 0 && currentGPA < targetGPA);
    if (combinations.length > 0) return generateScenarioText(combinations[0], result.totalEffortCredits, isImpossible);
    return generateScenarioText(null, result.totalEffortCredits, isImpossible);
  }, [combinations, result, currentGPA, targetGPA]);

  const addRetake = () => setRetakes([...retakes, { id: Math.random().toString(), oldGrade: 1.0, credits: 3, targetGrade: undefined }]);
  const removeRetake = (id: string) => setRetakes(retakes.filter(r => r.id !== id));
  const updateRetake = (id: string, field: string, value: any) => setRetakes(retakes.map(r => r.id === id ? { ...r, [field]: value } : r));

  const retakeSuggestions = useMemo(() => {
    if (result.requiredGPA <= 4.0) return [];
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (!saved) return [];
    try {
      const { semesters } = JSON.parse(saved);
      const deficit = result.requiredPoints - (4.0 * result.totalEffortCredits);
      return generateRetakeSuggestions(deficit, targetGPA, semesters);
    } catch (e) { return []; }
  }, [result, targetGPA]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4 sticky top-20 space-y-6 h-fit z-20 self-start">
        <Card className="border-slate-200 bg-white shadow-xl shadow-blue-500/5 rounded-3xl overflow-hidden border">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-black text-slate-800 tracking-tight">Thiết lập mục tiêu</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* STEP 1: ĐIỂM XUẤT PHÁT */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">01</span>
                  <Label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Điểm xuất phát</Label>
                </div>
                <Button variant="ghost" size="sm" onClick={syncFromManual} className="h-7 text-[12px] font-black text-blue-600 uppercase hover:bg-blue-50 rounded-lg px-2">
                  <RefreshCcw className="h-3 w-3 mr-1.5" /> Đồng bộ
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Input
                    type="number" step="0.01" value={currentGPA || ""}
                    onChange={(e) => setCurrentGPA(parseFloat(e.target.value) || 0)}
                    placeholder="GPA"
                    className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
                  />
                  <div className="text-[12px] font-bold text-slate-600 text-center uppercase tracking-tighter">GPA hiện tại</div>
                </div>
                <div className="space-y-1">
                  <Input
                    type="number" value={currentCredits || ""}
                    onChange={(e) => setCurrentCredits(parseInt(e.target.value) || 0)}
                    placeholder="TC"
                    className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
                  />
                  <div className="text-[12px] font-bold text-slate-600 text-center uppercase tracking-tighter">TC tích lũy</div>
                </div>
              </div>
            </div>

            {/* STEP 2: ĐÍCH ĐẾN */}
            <div className="p-6 bg-slate-50/50 border-y border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-md">02</span>
                <Label className="text-[12px] font-black text-blue-600 uppercase tracking-widest">Mục tiêu mong muốn</Label>
              </div>

              <div className="flex gap-2">
                {[2.0, 2.5, 3.2, 3.6].map(val => (
                  <Button
                    key={val} variant={targetGPA === val ? "default" : "outline"}
                    className={`flex-1 h-9 text-[12px] font-black transition-all rounded-lg border-slate-200 ${targetGPA === val ? 'bg-blue-600 text-white' : 'text-slate-500 bg-white'}`}
                    onClick={() => setTargetGPA(val)}
                  >
                    {val.toFixed(1)}
                  </Button>
                ))}
              </div>

              <Input
                type="number" step="0.05" min={0} max={4.0} value={targetGPA || ""}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (isNaN(val)) setTargetGPA(0);
                  else if (val > 4.0) setTargetGPA(4.0);
                  else if (val < 0) setTargetGPA(0);
                  else setTargetGPA(val);
                }}
                placeholder="GPA mục tiêu"
                className="text-center text-2xl font-black text-blue-800 bg-white border-2 border-blue-100 focus:border-blue-500 rounded-2xl h-14"
              />
            </div>

            {/* STEP 3: KẾ HOẠCH NỖ LỰC */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">03</span>
                <Label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Kế hoạch nỗ lực</Label>
              </div>

              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <Input
                    type="number" value={(currentCredits + remainingCredits) || ""}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 0;
                      setRemainingCredits(Math.max(0, total - currentCredits));
                    }}
                    placeholder="TC tốt nghiệp"
                    className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
                  />
                  <div className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-tighter">Tổng TC ra trường</div>
                </div>
                
                <div className="absolute left-1/2 top-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-white text-slate-400 border border-slate-100 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Hoặc</div>
                </div>

                <div className="space-y-1">
                  <Input
                    type="number" value={remainingCredits || ""}
                    onChange={(e) => setRemainingCredits(parseInt(e.target.value) || 0)}
                    placeholder="TC học tiếp"
                    className="h-10 font-bold text-blue-700 bg-white border-slate-200 rounded-xl focus:border-blue-500 transition-all text-center"
                  />
                  <div className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-tighter">TC dự kiến học</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Học cải thiện</Label>
                  <Button variant="outline" size="sm" onClick={addRetake} className="h-7 text-[12px] font-black text-blue-700 uppercase border-blue-100 hover:bg-blue-50 rounded-lg px-2">
                    <PlusCircle className="h-3 w-3 mr-1" /> Thêm môn
                  </Button>
                </div>

                <div className="space-y-2">
                  {retakes.length > 0 ? (
                    <>
                      <div className="grid grid-cols-12 gap-2 px-1 mb-1">
                        <div className="col-span-4 text-[11px] font-black text-slate-500 uppercase text-center">Điểm cũ</div>
                        <div className="col-span-3 text-[11px] font-black text-slate-500 uppercase text-center">Tín chỉ</div>
                        <div className="col-span-4 text-[11px] font-black text-slate-500 uppercase text-center">Dự kiến</div>
                        <div className="col-span-1"></div>
                      </div>

                      {retakes.map(r => (
                        <div key={r.id} className="grid grid-cols-12 gap-1.5 items-center bg-slate-50/50 p-1.5 rounded-xl border border-slate-100/50 group transition-all hover:bg-white hover:border-blue-100">
                          <div className="col-span-4">
                            <Select
                              value={(() => {
                                const gInfo = GRADE_SCALE.find(g => g.gpa === r.oldGrade);
                                return gInfo?.grade || "D";
                              })()}
                              onValueChange={(val) => {
                                const gInfo = GRADE_SCALE.find(g => g.grade === val);
                                if (gInfo) updateRetake(r.id, "oldGrade", gInfo.gpa);
                              }}
                            >
                              <SelectTrigger className="h-7 w-20 text-[10px] font-bold bg-white border-slate-100 text-rose-500 rounded-lg focus:ring-0 mx-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['F', 'D', 'D+', 'C', 'C+'].map(grade => (
                                  <SelectItem key={grade} value={grade} className="text-[10px] font-bold">{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-3">
                            <Input
                              type="number" value={r.credits}
                              onChange={(e) => updateRetake(r.id, "credits", parseInt(e.target.value) || 0)}
                              className="h-7 text-center text-[10px] font-bold bg-white border-slate-100 rounded-lg px-1 focus:ring-0"
                            />
                          </div>

                          <div className="col-span-4">
                            <Select
                              value={r.targetGrade !== undefined ? String(r.targetGrade) : "auto"}
                              onValueChange={(val) => {
                                if (val === "auto" || !val) {
                                  updateRetake(r.id, "targetGrade", undefined);
                                } else {
                                  updateRetake(r.id, "targetGrade", parseFloat(val as string));
                                }
                              }}
                            >
                              <SelectTrigger className={`h-7 text-[11px] font-bold border rounded-lg focus:ring-0 justify-center ${r.targetGrade !== undefined ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto" className="text-[10px] font-bold italic">Auto</SelectItem>
                                {GRADE_SCALE.filter(g => g.gpa > 0).map(g => (
                                  <SelectItem key={g.grade} value={String(g.gpa)} className="text-[10px] font-bold">{g.grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon" onClick={() => removeRetake(r.id)} className="h-6 w-6 text-slate-400 hover:text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center px-3 py-1.5 bg-blue-50/50 rounded-lg border border-dashed border-blue-100 mt-2">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Tổng tín chỉ cải thiện</span>
                        <span className="text-[10px] font-black text-blue-600">{retakes.reduce((acc, r) => acc + (r.credits || 0), 0)} TC</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter italic opacity-70">Chưa có môn cải thiện</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-4">
        <div className={`p-8 sm:p-10 border shadow-sm overflow-hidden bg-white transition-all duration-700 rounded-[2.5rem] flex flex-col items-center text-center space-y-8 ${result.requiredGPA > 4.0 || (result.totalEffortCredits === 0 && currentGPA < targetGPA) ? "border-rose-100" :
            result.requiredGPA > 3.6 ? "border-amber-100" :
              result.requiredGPA > 3.2 ? "border-blue-100" : "border-emerald-100"
          }`}>

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {result.totalEffortCredits === 0 && currentGPA < targetGPA ? "Yêu cầu hành động" : "GPA Cần đạt trung bình"}
            </div>
            <div className={`text-6xl sm:text-7xl font-black tracking-tighter py-1 ${result.requiredGPA > 4.0 || (result.totalEffortCredits === 0 && currentGPA < targetGPA) ? "text-rose-500" :
                result.requiredGPA > 3.6 ? "text-amber-500" :
                  result.requiredGPA > 3.2 ? "text-blue-500" : "text-emerald-500"
              }`}>
              {result.totalEffortCredits === 0 && currentGPA < targetGPA ? "RETAKE" :
                result.requiredGPA <= 0 ? "ĐẠT" :
                  result.requiredGPA.toFixed(2)}
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 ${result.requiredGPA > 4.0 || (result.totalEffortCredits === 0 && currentGPA < targetGPA) ? "text-rose-500" :
              result.requiredGPA > 3.6 ? "text-amber-500" :
                result.requiredGPA > 3.2 ? "text-blue-500" : "text-emerald-500"
            }`}>
            {result.totalEffortCredits === 0 && currentGPA < targetGPA || result.requiredGPA > 4.0 ? <AlertCircle className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            <span className="font-bold text-[11px] uppercase tracking-widest">
              {result.totalEffortCredits === 0 && currentGPA < targetGPA ? "Cần thêm môn học lại" :
                result.requiredGPA > 4.0 ? `Không khả thi • GPA tối đa có thể đạt: ${maxPossibleGPA.toFixed(2)}` :
                  result.requiredGPA > 3.7 ? "Cần nỗ lực cực kỳ lớn" :
                    result.requiredGPA > 3.2 ? "Đòi hỏi tập trung cao" : "Khá khả thi, hãy duy trì"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full pt-8 border-t border-slate-100">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tín chỉ tích lũy</div>
              <div className="text-2xl font-black text-slate-800">{result.totalFutureCredits}</div>
              <div className="text-[9px] text-slate-500 font-medium leading-tight">Tổng TC khi ra trường</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tín chỉ nỗ lực</div>
              <div className="text-2xl font-black text-slate-800">{result.totalEffortCredits}</div>
              <div className="text-[9px] text-slate-500 font-medium leading-tight">Bao gồm TC mới & học lại/học cải thiện</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{result.requiredGPA > 4.0 ? "GPA TỐI ĐA" : "GPA MỤC TIÊU"}</div>
              <div className="text-2xl font-black text-slate-800">{result.requiredGPA > 4.0 ? maxPossibleGPA.toFixed(2) : targetGPA.toFixed(2)}</div>
              <div className="text-[9px] text-slate-500 font-medium leading-tight">{result.requiredGPA > 4.0 ? "Khả năng cao nhất" : "Mục tiêu ra trường"}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger render={
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 font-bold text-[11px] uppercase tracking-wider h-8 rounded-xl group transition-all">
                <Calculator className="h-3.5 w-3.5 mr-2 opacity-50 group-hover:opacity-100 transition-all" />
                Chi tiết thuật toán & Đối soát
              </Button>
            } />
            <DialogContent className="sm:max-w-2xl w-[95vw] sm:w-[90vw] max-h-[90vh] rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sm:p-12 overflow-y-auto bg-white flex flex-col gap-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 opacity-60">
                  <Info className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cơ chế tính toán</span>
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Thuật toán lộ trình & Đối soát</DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed">
                  Kiểm tra chi tiết các bước tính toán để đảm bảo lộ trình chính xác.
                </DialogDescription>
              </div>

              <div className="space-y-8">
                {/* STEP 1 */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-blue-600">01.</span> Điểm hiện có
                  </div>
                  <div className="font-mono text-sm text-slate-600 space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">Điểm TL hiện tại:</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 mr-1"></span>{(currentGPA * currentCredits).toFixed(2)}</span></div>
                    <div className="flex items-baseline justify-between gap-2 text-slate-400"><span className="truncate">Điểm cải thiện:</span><span className="shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 opacity-70">-</span>{(retakes.reduce((acc, r) => acc + (r.oldGrade * r.credits), 0)).toFixed(2)}</span></div>
                    <div className="flex items-baseline justify-between gap-2 text-slate-900 font-bold pt-1.5 border-t border-dashed border-slate-200 mt-1"><span className="truncate">Điểm hiện có (X):</span><span className="shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 text-slate-400">=</span>{(currentGPA * currentCredits - retakes.reduce((acc, r) => acc + (r.oldGrade * r.credits), 0)).toFixed(2)}</span></div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-blue-600">02.</span> Tín chỉ tương lai
                  </div>
                  <div className="font-mono text-sm text-slate-600 space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">TC hiện có:</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 mr-1"></span>{currentCredits}</span></div>
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">TC mới:</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 opacity-70">+</span>{remainingCredits}</span></div>
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">TC bù rớt:</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 opacity-70">+</span>{result.totalFutureCredits - currentCredits - remainingCredits}</span></div>
                    <div className="flex items-baseline justify-between gap-2 text-slate-900 font-bold pt-1.5 border-t border-dashed border-slate-200 mt-1"><span className="truncate">TC tương lai (Y):</span><span className="shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 text-slate-400">=</span>{result.totalFutureCredits}</span></div>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-blue-600">03.</span> Nỗ lực cần thiết
                  </div>
                  <div className="font-mono text-sm text-slate-600 space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">Mục tiêu × Y:</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 mr-1"></span>{(targetGPA * result.totalFutureCredits).toFixed(2)}</span></div>
                    <div className="flex items-baseline justify-between gap-2 text-slate-400"><span className="truncate">Điểm hiện có (X):</span><span className="shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 opacity-70">-</span>{(currentGPA * currentCredits - retakes.reduce((acc, r) => acc + (r.oldGrade * r.credits), 0)).toFixed(2)}</span></div>
                    <div className="flex items-baseline justify-between gap-2 text-slate-900 font-bold pt-1.5 border-t border-dashed border-slate-200 mt-1"><span className="truncate">Nỗ lực cần (Z):</span><span className="shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 text-slate-400">=</span>{result.requiredPoints.toFixed(2)}</span></div>
                  </div>
                </div>

                {/* STEP 4 */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-blue-600">04.</span> Kết quả trung bình
                  </div>
                  <div className="font-mono text-sm text-slate-600 space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">Nỗ lực cần (Z):</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 mr-1"></span>{result.requiredPoints.toFixed(2)}</span></div>
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate">TC nỗ lực:</span><span className="font-medium shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 opacity-70">/</span>{result.totalEffortCredits}</span></div>
                    <div className="flex items-baseline justify-between gap-2 text-blue-600 font-black pt-1.5 border-t border-dashed border-slate-200 mt-1 text-base"><span className="truncate">GPA CẦN ĐẠT:</span><span className="shrink-0 tabular-nums"><span className="inline-block w-4 text-center mr-1 opacity-70">=</span>{result.requiredGPA.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <TrendingUp className="h-20 w-20 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1.5">Kịch bản khuyến nghị</div>
                <div className="text-md font-bold text-slate-800 leading-tight tracking-tight">{scenarioText}</div>
              </div>
            </div>

            {combinations.length > 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Các phương án thay thế khả thi:</div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] h-5 border-none">{combinations.length} tổ hợp</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2.5 max-h-[420px] overflow-y-auto pr-2">
                  {combinations.map((c, i) => (
                    <div key={i} className="group/combo p-2.5 sm:p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[10px] font-bold py-0.5 px-2.5 rounded-lg uppercase tracking-tight">
                            PA {i + 1}: {c.g1.grade} & {c.g2.grade}
                          </Badge>
                          {i === 0 && <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase border-none h-4.5">Khuyên dùng</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          <span className="text-[10px] font-black text-slate-700">
                            {((targetGPA * result.totalFutureCredits) - result.requiredPoints + (c.g1.gpa * c.c1 + c.g2.gpa * c.c2)).toFixed(2)} <span className="text-slate-400">/ {(targetGPA * result.totalFutureCredits).toFixed(2)}đ</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.c1 > 0 && c.c2 > 0 ? (
                          <>
                            <div className="flex-1 flex items-center justify-between p-2 bg-slate-50/50 rounded-xl relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1 h-full ${c.g1.grade.startsWith('A') ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                              <span className="text-xl font-black text-slate-800 ps-1.5">{c.g1.grade}</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase">{c.c1} TC</span>
                            </div>
                            <Plus className="h-3 w-3 text-slate-200" />
                            <div className="flex-1 flex items-center justify-between p-2 bg-slate-50/50 rounded-xl relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1 h-full ${c.g2.grade.startsWith('D') ? 'bg-rose-500' : 'bg-blue-400'}`} />
                              <span className="text-xl font-black text-slate-800 ps-1.5">{c.g2.grade}</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase">{c.c2} TC</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full flex items-center justify-between p-3 bg-blue-50/30 border border-blue-100 rounded-2xl relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full bg-blue-500`} />
                            <div className="ps-1.5">
                              <span className="text-2xl font-black text-slate-800">{c.c1 > 0 ? c.g1.grade : c.g2.grade}</span>
                              <span className="ms-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Toàn bộ tín chỉ còn lại</span>
                            </div>
                            <span className="text-md font-black text-blue-600">{c.c1 + c.c2} TC</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.requiredGPA > 4.0 && (
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-bold uppercase text-xs tracking-wider">Cứu vãn lộ trình</span>
                </div>
                <div className="space-y-2">
                  {retakeSuggestions.length > 0 ? retakeSuggestions.map((s, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl flex items-center justify-between group/suggest transition-all hover:bg-rose-50">
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-bold text-slate-800">{s.courses.map(course => course.name).join(" & ")}</div>
                        <div className="text-xs font-bold text-rose-400 uppercase tracking-tighter">Tăng {s.totalGain.toFixed(2)} điểm</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        const newRetakes = [...retakes];
                        s.courses.forEach(c => {
                          const gInfo = findGradeInfo(c.grade);
                          newRetakes.push({ id: Math.random().toString(), oldGrade: gInfo?.gpa || 1.0, credits: c.credits, name: c.name });
                        });
                        setRetakes(newRetakes);
                      }} className="h-8 border-rose-200 text-rose-600 font-bold text-xs uppercase hover:bg-rose-600 hover:text-white rounded-xl transition-all">Thử ngay</Button>
                    </div>
                  )) : <p className="text-[11px] text-slate-500 italic">Nhập dữ liệu Manual để nhận gợi ý.</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
