"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Target, 
  TrendingUp, 
  Lightbulb, 
  AlertCircle, 
  ArrowRight,
  RefreshCcw,
  PlusCircle,
  X,
  Dna,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  findGradeInfo,
  APP_CONFIG,
  GRADE_SCALE
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
  } catch (e) {}
  return null;
}

export function RoadmapTab({ initialData }: RoadmapTabProps) {
  const savedState = loadSavedRoadmapState();

  // State — initialized from localStorage first, then overridden by initialData if provided
  const [currentGPA, setCurrentGPA] = useState<number>(initialData?.gpa ?? savedState?.currentGPA ?? 0);
  const [currentCredits, setCurrentCredits] = useState<number>(initialData?.credits ?? savedState?.currentCredits ?? 0);
  const [targetGPA, setTargetGPA] = useState<number>(savedState?.targetGPA ?? 3.2);
  const [remainingCredits, setRemainingCredits] = useState<number>(initialData?.remainingCredits ?? savedState?.remainingCredits ?? 0);
  const [retakes, setRetakes] = useState<RetakeItem[]>(initialData?.pendingRetakes ?? savedState?.retakes ?? []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mark as loaded after first render (prevents saving on initial mount)
  useEffect(() => { setIsLoaded(true); }, []);

  // Persist to localStorage whenever state changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify({
      currentGPA,
      currentCredits,
      targetGPA,
      remainingCredits,
      retakes,
    }));
  }, [isLoaded, currentGPA, currentCredits, targetGPA, remainingCredits, retakes]);

  // Update when initialData changes (from other tabs — overrides saved state)
  useEffect(() => {
    if (initialData) {
      setCurrentGPA(initialData.gpa);
      setCurrentCredits(initialData.credits);
      setRemainingCredits(initialData.remainingCredits || 0);
      setRetakes(initialData.pendingRetakes || []);
      
      // Auto-suggest next target milestone
      const milestones = [2.0, 2.5, 3.2, 3.6];
      const nextTarget = milestones.find(m => m > initialData.gpa) || 4.0;
      setTargetGPA(nextTarget);
    }
  }, [initialData]);

  // Load from Manual Tab state automatically on mount if no initialData
  useEffect(() => {
    if (!initialData) {
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Allow user to pull it manually with the sync button
      } catch (e) {}
    }
    }
  }, []);

  const syncFromManual = () => {
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (saved) {
      try {
        const { semesters, initialGPA, initialCredits } = JSON.parse(saved);
        const result = calculateManualGPA(semesters, initialGPA, initialCredits);
        
        setCurrentGPA(result.gpa);
        setCurrentCredits(result.totalCredits);
        
        // Find pending retakes from manual semesters (only those without a new grade yet)
        const manualRetakes: any[] = [];
        semesters.forEach((sem: any) => {
          sem.courses.forEach((c: any) => {
            // A pending retake is one marked as retake but hasn't received a new grade yet
            if (c.isRetake && (!c.grade || c.grade === "")) {
              const gInfo = GRADE_SCALE.find(g => g.grade === c.oldGrade);
              manualRetakes.push({
                id: Math.random().toString(),
                oldGrade: gInfo?.gpa || 1.0,
                credits: c.credits,
                name: c.name
              });
            }
          });
        });
        
        if (manualRetakes.length > 0) {
          setRetakes(manualRetakes);
        }
        
      } catch (e) {
        console.error("Sync error:", e);
      }
    }
  };

  // Calculation Results
  const result = useMemo(() => {
    return calculateTargetResult(currentGPA, currentCredits, targetGPA, remainingCredits, retakes);
  }, [currentGPA, currentCredits, targetGPA, remainingCredits, retakes]);

  const combinations = useMemo(() => {
    if (result.requiredGPA > 4.0 || result.requiredGPA <= 0) return [];
    return generateGradeCombinations(result.totalEffortCredits, result.requiredPoints);
  }, [result]);

  const scenarioText = useMemo(() => {
    const isImpossible = result.requiredGPA > 4.0 || (result.totalEffortCredits === 0 && currentGPA < targetGPA);
    if (combinations.length > 0) return generateScenarioText(combinations[0], result.totalEffortCredits, isImpossible);
    return generateScenarioText(null, result.totalEffortCredits, isImpossible);
  }, [combinations, result, currentGPA, targetGPA]);

  // Retake Manager
  const addRetake = () => {
    setRetakes([...retakes, { id: Math.random().toString(), oldGrade: 1.0, credits: 3, targetGrade: undefined }]);
  };

  const removeRetake = (id: string) => {
    setRetakes(retakes.filter(r => r.id !== id));
  };

  const updateRetake = (id: string, field: string, value: any) => {
    setRetakes(retakes.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Recommendations for impossible targets
  const retakeSuggestions = useMemo(() => {
    if (result.requiredGPA <= 4.0) return [];
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (!saved) return [];
    try {
      const { semesters } = JSON.parse(saved);
      const deficit = result.requiredPoints - (4.0 * result.totalEffortCredits);
      return generateRetakeSuggestions(deficit, targetGPA, semesters);
    } catch(e) { return []; }
  }, [result, targetGPA]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-blue-500/10 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white/20 border-b border-white/10 py-5 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Thiết lập mục tiêu</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ps-1">GPA hiện tại</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={currentGPA || ""} 
                    onChange={(e) => setCurrentGPA(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="h-11 font-black text-blue-600 bg-white/50 border-white/20 rounded-2xl focus:ring-blue-500 transition-all text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ps-1">TC tích lũy</Label>
                  <Input 
                    type="number" 
                    value={currentCredits || ""} 
                    onChange={(e) => setCurrentCredits(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="h-11 font-black text-blue-600 bg-white/50 border-white/20 rounded-2xl focus:ring-blue-500 transition-all text-center"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button 
                  onClick={syncFromManual} 
                  className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <RefreshCcw className="h-4.5 w-4.5 mr-2 group-hover:rotate-180 transition-transform duration-700" /> 
                  Đồng bộ dữ liệu học tập
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <Label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ps-1">GPA Mục tiêu mong muốn</Label>
              <div className="grid grid-cols-4 gap-2">
                {[2.0, 2.5, 3.2, 3.6].map(val => (
                  <Button 
                    key={val}
                    variant={targetGPA === val ? "default" : "outline"}
                    className={`h-10 text-[11px] font-black transition-all rounded-xl border-white/20 ${targetGPA === val ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-500 bg-white/30 backdrop-blur-md hover:bg-white/50'}`}
                    onClick={() => setTargetGPA(val)}
                  >
                    {val.toFixed(1)}
                  </Button>
                ))}
              </div>
              <Input 
                type="number" 
                step="0.05" 
                value={targetGPA || ""} 
                onChange={(e) => setTargetGPA(parseFloat(e.target.value) || 0)}
                placeholder="Ví dụ: 3.60"
                className="mt-2 text-center text-2xl font-black text-blue-700 bg-blue-500/10 border-blue-200/50 rounded-3xl h-14 shadow-inner"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Số tín chỉ sẽ học tiếp</Label>
              <Input 
                type="number" 
                value={remainingCredits || ""} 
                onChange={(e) => setRemainingCredits(parseInt(e.target.value) || 0)}
                placeholder="Ví dụ: 15"
                className="h-10 font-bold text-lg rounded-xl"
              />
              <p className="text-xs text-slate-400 italic ps-1">* 15: 1 học kỳ, 30: 1 năm học, 60: 2 năm</p>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between mb-3">
                 <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kế hoạch cải thiện</Label>
                 <Button variant="ghost" size="sm" onClick={addRetake} className="h-7 text-xs font-black text-blue-600 uppercase tracking-tighter">
                    <PlusCircle className="h-3 w-3 mr-1" /> Thêm môn học lại
                 </Button>
              </div>
              
              <div className="space-y-3">
                {retakes.length > 0 && (
                  <div className="grid grid-cols-12 gap-1.5 px-3 pb-1">
                    <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm cũ</div>
                    <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">TC</div>
                    <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dự kiến</div>
                    <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ps-1">Tên môn</div>
                  </div>
                )}
                
                {retakes.map(r => (
                  <div key={r.id} className={`grid grid-cols-12 gap-1.5 items-center p-2 border rounded-2xl group/item transition-all hover:shadow-sm ${r.targetGrade !== undefined ? 'bg-blue-50/40 border-blue-100 hover:border-blue-200' : 'bg-slate-50/50 border-slate-100/50 hover:bg-white hover:border-blue-100'}`}>
                    {/* Col: Điểm cũ */}
                    <div className="col-span-3">
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
                        <SelectTrigger className="h-8 w-full text-xs font-bold bg-white border-slate-200 text-rose-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['F', 'D', 'D+', 'C', 'C+'].map(grade => (
                            <SelectItem key={grade} value={grade} className="font-bold">{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Col: Tín chỉ */}
                    <div className="col-span-2">
                       <Input 
                        placeholder="TC" 
                        type="number" 
                        value={r.credits} 
                        onChange={(e) => updateRetake(r.id, "credits", parseInt(e.target.value) || 0)}
                        className="h-8 w-full text-center text-xs font-bold bg-white border-slate-200 rounded-lg px-1"
                      />
                    </div>

                    {/* Col: Điểm dự kiến (NEW) */}
                    <div className="col-span-3">
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
                        <SelectTrigger className={`h-8 w-full text-xs font-bold border rounded-lg ${r.targetGrade !== undefined ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto" className="text-slate-400 font-bold italic">Tự động</SelectItem>
                          {GRADE_SCALE.filter(g => g.gpa > 0).map(g => (
                            <SelectItem key={g.grade} value={String(g.gpa)} className="font-bold">{g.grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Col: Tên môn + Nút xóa */}
                    <div className="col-span-3 truncate ps-1">
                      <div className="text-xs font-bold text-slate-600 truncate" title={r.name || "Môn học cải thiện"}>
                         {r.name || "Môn cải thiện"}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeRetake(r.id)} className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/item:opacity-100 transition-all rounded-lg">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {retakes.length > 0 && (
                  <div className="flex justify-between items-center px-4 py-2 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 mt-2">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tổng tín chỉ cải thiện</span>
                     <span className="text-sm font-black text-blue-600">{retakes.reduce((acc, r) => acc + (r.credits || 0), 0)} TC</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Output */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Main KPI Card */}
        <Card className={`border-none shadow-2xl shadow-blue-500/10 overflow-hidden text-white transition-all duration-700 rounded-[2.5rem] relative ${
           result.requiredGPA > 4.0 ? "bg-gradient-to-br from-red-600 to-rose-800" :
           result.requiredGPA > 3.6 ? "bg-gradient-to-br from-amber-500 to-orange-700" :
           result.requiredGPA > 3.2 ? "bg-gradient-to-br from-blue-500 to-violet-800" : "bg-gradient-to-br from-emerald-500 to-teal-800"
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
          <CardContent className="p-8 flex flex-col items-center text-center space-y-5">
            <div className="space-y-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1 px-4 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                {result.totalEffortCredits === 0 && currentGPA < targetGPA ? "Yêu cầu hành động" : "GPA Cần đạt trung bình"}
              </Badge>
              <div className="text-7xl font-black tracking-tighter drop-shadow-md py-2">
                {result.totalEffortCredits === 0 && currentGPA < targetGPA ? "RETAKE" : 
                 result.requiredGPA <= 0 ? "ĐẠT" : 
                 result.requiredGPA > 4.0 ? "---" : 
                 result.requiredGPA.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2 py-1.5 px-6 bg-black/10 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
              {result.totalEffortCredits === 0 && currentGPA < targetGPA ? <AlertCircle className="h-4 w-4 text-white" /> :
               result.requiredGPA > 4.0 ? <AlertCircle className="h-4 w-4 text-white" /> : <TrendingUp className="h-4 w-4 text-white" />}
              <span className="font-bold text-sm uppercase tracking-tight">
                {result.totalEffortCredits === 0 && currentGPA < targetGPA ? "Cần thêm môn học lại" :
                 result.requiredGPA > 4.0 ? "Mục tiêu không khả thi" : 
                 result.requiredGPA > 3.7 ? "Cần nỗ lực cực kỳ lớn" :
                 result.requiredGPA > 3.2 ? "Đòi hỏi tập trung cao" : "Khá khả thi, hãy duy trì"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-8 w-full pt-6 border-t border-white/10">
               <div className="space-y-1">
                 <div className="text-xs opacity-70 font-bold uppercase tracking-wider">Tín chỉ mới</div>
                 <div className="text-2xl font-black">{result.totalFutureCredits}</div>
               </div>
               <div className="space-y-1">
                 <div className="text-xs opacity-70 font-bold uppercase tracking-wider">TC cần thi</div>
                 <div className="text-2xl font-black">{result.totalEffortCredits}</div>
               </div>
               <div className="space-y-1">
                 <div className="text-xs opacity-70 font-bold uppercase tracking-wider">GPA cuối</div>
                 <div className="text-2xl font-black">{targetGPA.toFixed(2)}</div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestion & Roadmap Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
           <CardHeader className="bg-slate-50/20 border-b border-slate-50 py-4 px-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-md font-bold text-slate-700">Lộ trình hành động</CardTitle>
              </div>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
              
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <TrendingUp className="h-24 w-24 text-blue-600" />
                 </div>
                 <div className="relative z-10">
                    <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2.5">Kịch bản khuyến nghị</div>
                    <div className="text-lg font-bold text-slate-800 leading-snug tracking-tight">
                       {scenarioText}
                    </div>
                </div>
              </div>

              {/* Combinations List - Upgraded UI */}
              {combinations.length > 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Các phương án thay thế khả thi:</div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] h-5 border-none">
                      {combinations.length} tổ hợp
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {combinations.map((c, i) => {
                      const { c1, c2 } = c;
                      return (
                        <div key={i} className="group/combo p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                          {/* Combo Header */}
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-xs font-bold py-0.5 px-3 rounded-lg uppercase tracking-tight">
                                   PA {i + 1}: {c.g1.grade} & {c.g2.grade}
                                </Badge>
                                {i === 0 && (
                                   <Badge className="bg-emerald-100 text-emerald-700 text-xs font-black uppercase border-none h-5">Khuyên dùng</Badge>
                                )}
                             </div>
                             <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-xs font-black text-slate-700">{(targetGPA * (currentCredits + remainingCredits)).toFixed(2)}đ</span>
                             </div>
                          </div>

                          {/* Combo Body */}
                          <div className="flex items-center gap-4">
                            {c1 > 0 && c2 > 0 ? (
                            <>
                              {/* Box 1 */}
                              <div className="flex-1 flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl relative overflow-hidden">
                                 <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                    c.g1.grade === 'A+' ? 'bg-emerald-500' : 
                                    c.g1.grade === 'A' ? 'bg-emerald-400' : 
                                    c.g1.grade === 'B+' ? 'bg-blue-500' : 
                                    c.g1.grade === 'B' ? 'bg-blue-400' : 'bg-slate-300'
                                 }`} />
                                 <span className="text-2xl font-black text-slate-800 ps-2">{c.g1.grade}</span>
                                 <span className="text-xs font-bold text-slate-400 uppercase">{c.c1} TC</span>
                              </div>

                              <Plus className="h-4 w-4 text-slate-200 shrink-0" />

                              {/* Box 2 */}
                              <div className="flex-1 flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl relative overflow-hidden">
                                 <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                    c.g2.grade === 'C+' ? 'bg-amber-500' : 
                                    c.g2.grade === 'C' ? 'bg-amber-400' : 
                                    c.g2.grade === 'D+' ? 'bg-orange-500' : 
                                    c.g2.grade === 'D' ? 'bg-rose-500' : 
                                    c.g2.grade === 'B' ? 'bg-blue-400' : 'bg-slate-300'
                                 }`} />
                                 <span className="text-2xl font-black text-slate-800 ps-2">{c.g2.grade}</span>
                                 <span className="text-xs font-bold text-slate-400 uppercase">{c.c2} TC</span>
                              </div>
                            </>
                          ) : (
                            /* Single Box Case (e.g., All remaining must be A+) */
                            <div className="w-full flex items-center justify-between p-4 bg-blue-50/30 border border-blue-100 rounded-3xl relative overflow-hidden">
                               <div className={`absolute top-0 left-0 w-2 h-full ${
                                  (c1 > 0 ? c.g1.grade : c.g2.grade) === 'A+' ? 'bg-emerald-500' : 
                                  (c1 > 0 ? c.g1.grade : c.g2.grade) === 'A' ? 'bg-emerald-400' : 'bg-blue-500'
                               }`} />
                               <div className="ps-2">
                                  <span className="text-3xl font-black text-slate-800">{c1 > 0 ? c.g1.grade : c.g2.grade}</span>
                                  <span className="ms-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Toàn bộ tín chỉ còn lại</span>
                               </div>
                               <span className="text-lg font-black text-blue-600">{c1 + c2} TC</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
                  <p className="text-center text-xs text-slate-400 italic">Danh sách sắp xếp theo độ khả thi giảm dần</p>
                </div>
              )}

              {/* Impossible Case: Retake suggestions */}
              {result.requiredGPA > 4.0 && (
                <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                   <div className="flex items-center gap-2 text-rose-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-bold uppercase text-xs tracking-wider">Gợi ý cứu vãn lộ trình</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed">
                      Mục tiêu hiện tại cao hơn khả năng từ tín chỉ mới. Hãy cân nhắc **học cải thiện** các môn sau:
                   </p>
                   
                   <div className="space-y-2.5">
                     {retakeSuggestions.length > 0 ? (
                       retakeSuggestions.map((s, idx) => (
                         <div key={idx} className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl flex items-center justify-between group/suggest transition-all hover:bg-rose-50">
                            <div className="flex flex-col gap-0.5">
                               <div className="text-sm font-bold text-slate-800">{s.courses.map(c => c.name).join(" & ")}</div>
                               <div className="text-xs font-bold text-rose-400 uppercase tracking-tighter">Tăng khoảng {s.totalGain.toFixed(2)} điểm</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => {
                               const newRetakes = [...retakes];
                               s.courses.forEach(c => {
                                 const gInfo = findGradeInfo(c.grade);
                                 newRetakes.push({ id: Math.random().toString(), oldGrade: gInfo?.gpa || 1.0, credits: c.credits, name: c.name });
                               });
                               setRetakes(newRetakes);
                            }} className="h-8 border-rose-200 text-rose-600 font-bold text-xs uppercase hover:bg-rose-500 hover:text-white transition-all rounded-xl">
                               Thử thêm
                            </Button>
                         </div>
                       ))
                     ) : (
                       <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                          <p className="text-xs text-slate-400 italic">Nhập dữ liệu tại "Tính thủ công" để nhận gợi ý cứu vãn lộ trình.</p>
                       </div>
                     )}
                   </div>
                </div>
              )}
           </CardContent>
        </Card>

        {/* Info Box */}
        <div className="p-6 bg-white/30 backdrop-blur-xl border border-white/20 rounded-[2rem] flex gap-6 items-center shadow-xl shadow-blue-500/5">
           <div className="bg-blue-600 p-3.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Dna className="h-7 w-7 text-white" />
           </div>
           <div>
              <h4 className="text-sm font-black text-blue-900 mb-1 leading-none uppercase tracking-widest opacity-60">Cơ chế thuật toán</h4>
              <p className="text-xs text-blue-700/60 font-medium leading-relaxed max-w-xl">
                Sử dụng thuật toán tối ưu hóa tổ hợp để phân tách chỉ số GPA sang số lượng môn học khả thi. Hệ thống ưu tiên các môn học có tín chỉ cao để giảm thiểu số lượng môn cần đạt điểm tối đa (A+).
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
