"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  History, 
  RotateCcw,
  Target,
  CloudUpload,
  LineChart as ChartIcon,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  calculateManualGPA, 
  GRADE_SCALE, 
  Semester, 
  Course,
  GPAResult,
  parsePortalText,
  findGradeInfo
} from "@/lib/gpa-engine";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STORAGE_KEY = "huflit-manual-gpa-state";

interface ManualTabProps {
  onSwitchToRoadmap?: (data: { 
    gpa: number; 
    credits: number; 
    remainingCredits: number;
    pendingRetakes: { id: string; oldGrade: number; credits: number; name?: string }[];
  }) => void;
}

// Optimization: Memoized Course Row
const CourseRow = memo(({ 
  course, 
  sIdx, 
  cIdx, 
  onUpdate, 
  onRemove, 
  isOnlyCourse 
}: { 
  course: Course; 
  sIdx: number; 
  cIdx: number; 
  onUpdate: (sIdx: number, cIdx: number, field: keyof Course, value: any) => void;
  onRemove: (sIdx: number, cIdx: number) => void;
  isOnlyCourse: boolean;
}) => {
  return (
    <TableRow className="hover:bg-slate-50/80 group transition-colors border-b border-slate-200 last:border-0">
      <TableCell className="ps-6 py-3">
        <Input 
          placeholder="Tên môn học..." 
          value={course.name}
          onChange={(e) => onUpdate(sIdx, cIdx, "name", e.target.value)}
          className="bg-white border-slate-300 h-9 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
        />
      </TableCell>
      <TableCell className="text-center py-3">
        <Input 
          type="number" 
          min="1" 
          value={course.credits}
          onChange={(e) => onUpdate(sIdx, cIdx, "credits", parseInt(e.target.value) || 0)}
          className="bg-white border-slate-300 h-9 text-sm text-center font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
        />
      </TableCell>
      <TableCell className="text-center py-3">
        <Select 
          value={course.grade} 
          onValueChange={(val) => onUpdate(sIdx, cIdx, "grade", val)}
        >
          <SelectTrigger className="bg-white border-slate-300 h-9 w-20 text-sm font-bold text-blue-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm mx-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADE_SCALE.map(g => (
              <SelectItem key={g.grade} value={g.grade} className="font-semibold">{g.grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center py-3">
        <div className="flex flex-col items-center gap-1.5">
          <Switch 
            checked={!!course.isRetake} 
            onCheckedChange={(val) => onUpdate(sIdx, cIdx, "isRetake", val)}
            className="scale-90"
          />
          {course.isRetake && (
            <Select 
              value={course.oldGrade || "D"} 
              onValueChange={(val) => onUpdate(sIdx, cIdx, "oldGrade", val)}
            >
              <SelectTrigger className="h-6 w-14 text-[11px] uppercase font-bold px-1 bg-slate-100/50 border-slate-200 text-slate-600">
                <SelectValue placeholder="Cũ" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_SCALE.filter(g => !['A+', 'A', 'B+', 'B'].includes(g.grade)).map(g => (
                  <SelectItem key={g.grade} value={g.grade} className="text-xs">{g.grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </TableCell>
      <TableCell className="pe-6 text-right py-3">
        <button 
          onClick={() => onRemove(sIdx, cIdx)}
          className={`text-slate-500 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 ${isOnlyCourse ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
});
CourseRow.displayName = "CourseRow";

// Optimization: Memoized Semester Card
const SemesterCard = memo(({
  sem,
  sIdx,
  onUpdateName,
  onRemoveSemester,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  isOnlySemester,
  yearlyStats,
  currentYear,
  showYearSummary,
  semStats
}: {
  sem: Semester;
  sIdx: number;
  onUpdateName: (idx: number, name: string) => void;
  onRemoveSemester: (idx: number) => void;
  onAddCourse: (semIdx: number) => void;
  onUpdateCourse: (semIdx: number, courseIdx: number, field: keyof Course, value: any) => void;
  onRemoveCourse: (semIdx: number, courseIdx: number) => void;
  isOnlySemester: boolean;
  yearlyStats: any;
  currentYear: string | null;
  showYearSummary: boolean;
  semStats?: { 
    gpa: number; 
    isWarning: boolean;
    passedCredits: number;
    failedCredits: number;
    cumulativeCredits: number;
    cumulativeGPA: number;
  };
}) => {
  const yearData = currentYear ? yearlyStats[currentYear] : null;

  return (
    <div className="space-y-6">
      <Card className="ring-0 border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 gap-0">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xs shrink-0">
              {sIdx + 1}
            </div>
            <Input 
              value={sem.name}
              onChange={(e) => onUpdateName(sIdx, e.target.value)}
              className="bg-transparent border-none text-base font-bold text-slate-800 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto w-auto min-w-[150px]"
            />
            {semStats?.isWarning && (
              <Badge variant="destructive" className="py-0.5 px-2 rounded-full font-bold text-[11px] uppercase tracking-tighter shrink-0 shadow-sm border-none">
                <AlertTriangle className="h-3 w-3 mr-1" /> Cảnh báo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              disabled={isOnlySemester}
              onClick={() => onRemoveSemester(sIdx)}
              className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white border-b border-slate-200 z-10">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="w-[45%] text-[11px] font-bold uppercase text-slate-700 tracking-wider ps-6 py-3">Môn học</TableHead>
                  <TableHead className="w-[15%] text-[11px] font-bold uppercase text-slate-700 tracking-wider text-center py-3">Tín chỉ</TableHead>
                  <TableHead className="w-[20%] text-[11px] font-bold uppercase text-slate-700 tracking-wider text-center py-3">Điểm</TableHead>
                  <TableHead className="w-[10%] text-[11px] font-bold uppercase text-slate-700 tracking-wider text-center py-3">Học Lại</TableHead>
                  <TableHead className="w-[10%] text-right pe-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sem.courses.map((course, cIdx) => (
                  <CourseRow 
                    key={cIdx} 
                    course={course} 
                    sIdx={sIdx} 
                    cIdx={cIdx} 
                    onUpdate={onUpdateCourse} 
                    onRemove={onRemoveCourse} 
                    isOnlyCourse={sem.courses.length === 1}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col items-center gap-4">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => onAddCourse(sIdx)}
               className="bg-white border-slate-300 text-blue-600 font-bold px-8 rounded-xl hover:bg-blue-50 transition-all w-full sm:w-auto shadow-sm group"
             >
               <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" /> Thêm môn học
             </Button>

             {semStats && (
               <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 w-full">
                  {/* Chip 1: Passed */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest whitespace-nowrap">TC Đạt</span>
                    <span className="text-base font-bold text-emerald-600">{semStats.passedCredits}</span>
                  </div>
                  
                  {/* Chip 2: Failed */}
                  <div className={`border rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 ${semStats.failedCredits > 0 ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}>
                    <span className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${semStats.failedCredits > 0 ? "text-rose-700" : "text-slate-600"}`}>TC Rớt</span>
                    <span className={`text-base font-bold ${semStats.failedCredits > 0 ? "text-rose-600" : "text-slate-500"}`}>{semStats.failedCredits}</span>
                  </div>

                  {/* Chip 3: Semester GPA */}
                  <div className={`border rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 ${semStats.isWarning ? "bg-rose-50 border-rose-200" : "bg-blue-50 border-blue-200"}`}>
                    <span className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${semStats.isWarning ? "text-rose-700" : "text-blue-700"}`}>GPA HK</span>
                    <span className={`text-base font-bold ${semStats.isWarning ? "text-rose-500" : "text-blue-600"}`}>{semStats.gpa.toFixed(2)}</span>
                  </div>

                  {/* Chip 4: Cum Credits */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">Tích lũy</span>
                    <span className="text-base font-bold text-slate-700">{semStats.cumulativeCredits}</span>
                  </div>

                  {/* Chip 5: Cum GPA */}
                  <div className="col-span-2 lg:col-span-1 bg-white border border-blue-200 rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 shadow-sm">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest whitespace-nowrap">GPA Tích lũy</span>
                    <span className="text-lg font-bold text-blue-700">{semStats.cumulativeGPA.toFixed(2)}</span>
                  </div>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {showYearSummary && yearData && (
        <div className="mt-4 mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-white border border-slate-300 rounded-2xl py-3.5 px-6 flex flex-wrap md:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-500/5 hover:border-blue-400 transition-all group/year">
            {/* Section 1: Year */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0 group-hover/year:scale-110 transition-transform duration-300">
                <History className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">Năm học</div>
                <div className="text-base font-black text-slate-800 whitespace-nowrap tracking-tight">{currentYear}</div>
              </div>
            </div>

            <div className="hidden lg:block h-8 w-px bg-slate-200"></div>

            {/* Section 2: GPA */}
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest hidden sm:block">GPA NĂM</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${(yearData.points / yearData.credits) >= 3.2 ? "text-blue-600" : "text-amber-600"}`}>
                  {(yearData.points / yearData.credits).toFixed(2)}
                </span>
                <span className="text-[11px] font-bold text-slate-500">/ 4.0</span>
              </div>
            </div>

            <div className="hidden lg:block h-8 w-px bg-slate-200"></div>

            {/* Section 3: Credits */}
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest hidden sm:block">Tín chỉ</div>
              <div className="text-xl font-black text-slate-800">{yearData.credits}</div>
            </div>

            {/* Section 4: Status */}
            <div className="md:ms-auto">
              <div className={`py-1.5 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest pointer-events-none shadow-sm border flex items-center gap-2 ${
                 (yearData.points / yearData.credits) >= 3.6 ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                 (yearData.points / yearData.credits) >= 3.2 ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                 <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                    (yearData.points / yearData.credits) >= 3.6 ? "bg-emerald-500" :
                    (yearData.points / yearData.credits) >= 3.2 ? "bg-blue-500" : "bg-slate-400"
                 }`}></div>
                 {(yearData.points / yearData.credits) >= 3.6 ? "Xuất sắc" : 
                  (yearData.points / yearData.credits) >= 3.2 ? "Phong độ tốt" : "Cần cố gắng"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
SemesterCard.displayName = "SemesterCard";

export function ManualTab({ onSwitchToRoadmap }: ManualTabProps) {
  // State
  const [initialGPA, setInitialGPA] = useState<number>(0);
  const [initialCredits, setInitialCredits] = useState<number>(0);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [importText, setImportText] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInitialGPA(parsed.initialGPA || 0);
        setInitialCredits(parsed.initialCredits || 0);
        setSemesters(parsed.semesters || []);
      } catch (e) {
        console.error("Failed to load GPA state", e);
      }
    } else {
      // Default state
      setSemesters([]);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ initialGPA, initialCredits, semesters }));
    }
  }, [initialGPA, initialCredits, semesters, isLoaded]);

  // Calculation Result
  const result: GPAResult = useMemo(() => {
    return calculateManualGPA(semesters, initialGPA, initialCredits);
  }, [semesters, initialGPA, initialCredits]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const data: any[] = [];
    let cumulativePoints = initialGPA * initialCredits;
    let cumulativeCredits = initialCredits;

    semesters.forEach((sem, idx) => {
      // Logic for chart MUST match HUFLIT cumulative rule: Only count passed credits in denom
      sem.courses.forEach(course => {
        const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
        if (gradeInfo) {
          if (course.isRetake) {
            const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
            if (oldGradeInfo) {
              const oldGPA = oldGradeInfo.gpa;
              const isOldF = oldGPA === 0;
              if (isOldF) {
                if (gradeInfo.gpa > 0) {
                  cumulativePoints += gradeInfo.gpa * course.credits;
                  cumulativeCredits += course.credits;
                }
              } else if (gradeInfo.gpa > oldGPA) {
                cumulativePoints += (gradeInfo.gpa - oldGPA) * course.credits;
              }
            }
          } else {
            if (gradeInfo.gpa > 0) {
              cumulativePoints += gradeInfo.gpa * course.credits;
              cumulativeCredits += course.credits;
            }
          }
        }
      });

      const currentGPA = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
      data.push({
        name: sem.name || `HK ${idx + 1}`,
        gpa: parseFloat(currentGPA.toFixed(2)),
      });
    });

    return data;
  }, [semesters, initialGPA, initialCredits]);

  // Yearly Summary Logic
  const getYear = (name: string) => {
    const match = name.match(/\((\d{4}-\d{4})\)/);
    return match ? match[1] : null;
  };

  const yearlyStats = useMemo(() => {
    const stats: Record<string, { points: number; credits: number }> = {};
    semesters.forEach((sem) => {
      const year = getYear(sem.name);
      if (year) {
        if (!stats[year]) stats[year] = { points: 0, credits: 0 };
        sem.courses.forEach((c) => {
          const gInfo = GRADE_SCALE.find(g => g.grade === c.grade);
          if (gInfo) {
            const credits = c.credits || 0;
            stats[year].points += gInfo.gpa * credits;
            stats[year].credits += credits;
          }
        });
      }
    });
    return stats;
  }, [semesters]);

  // Actions
  const addSemester = () => {
    setSemesters([...semesters, { 
      name: `Học kỳ ${semesters.length + 1}`, 
      courses: [{ name: "", credits: 3, grade: "" }] 
    } as any]);
  };

  const removeSemester = (idx: number) => {
    setSemesters(semesters.filter((_, i) => i !== idx));
  };

  const addCourse = (semIdx: number) => {
    const newSemesters = [...semesters];
    newSemesters[semIdx].courses.push({ name: "", credits: 3, grade: "" });
    setSemesters(newSemesters);
  };

  const updateCourse = (semIdx: number, courseIdx: number, field: keyof Course, value: any) => {
    const newSemesters = [...semesters];
    (newSemesters[semIdx].courses[courseIdx] as any)[field] = value;
    setSemesters(newSemesters);
  };

  const removeCourse = (semIdx: number, courseIdx: number) => {
    const newSemesters = [...semesters];
    newSemesters[semIdx].courses.splice(courseIdx, 1);
    setSemesters(newSemesters);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const imported = parsePortalText(importText);
    if (imported.length > 0) {
      setInitialGPA(0);
      setInitialCredits(0);
      setSemesters(imported as any);
      setImportText("");
      setIsImportOpen(false);
    } else {
      alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại nội dung dán.");
    }
  };

  const resetAll = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?")) {
      setInitialGPA(0);
      setInitialCredits(0);
      setSemesters([]);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
      
      <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6 order-last lg:order-first h-fit z-30">
        <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 overflow-hidden">
          <CardHeader className="pb-1 border-b border-slate-200 px-5">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-800 font-bold tracking-tight">Tổng kết</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={resetAll} className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-5 pb-5 space-y-4">
            
            {/* Initial Inputs Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase ps-1">GPA Hiện tại</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                    value={initialGPA || ""}
                    onChange={(e) => setInitialGPA(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase ps-1">Tích lũy</Label>
                  <Input 
                    type="number" 
                    className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                    value={initialCredits || ""}
                    onChange={(e) => setInitialCredits(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* MAIN GPA DISPLAY */}
            <div className="text-center py-1 relative">
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full -z-10"></div>
              <div className="text-[11px] font-bold text-blue-600/80 uppercase tracking-[0.2em] mb-1">GPA TÍCH LŨY MỚI</div>
              <div className={`text-5xl font-black leading-none tracking-tighter drop-shadow-sm ${
                result.gpa >= 3.6 ? "text-emerald-500" :
                result.gpa >= 3.2 ? "text-blue-600" :
                result.gpa >= 2.5 ? "text-amber-500" : "text-rose-500"
              }`}>
                {result.gpa.toFixed(2)}
              </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-2 pt-3 pb-1 border-t border-slate-300">
              <div className="flex flex-col items-center justify-center space-y-0.5 py-1.5 border-r border-slate-300">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Tổng Tín chỉ</div>
                <div className="text-3xl font-bold text-slate-800">{result.totalCredits}</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-1 py-1.5">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Xếp loại</div>
                <div className={`text-xl font-bold whitespace-nowrap ${
                   result.rank === "Xuất sắc" ? "text-emerald-500" :
                   result.rank === "Giỏi" ? "text-blue-600" :
                   result.rank === "Khá" ? "text-amber-500" : "text-slate-700"
                }`}>
                  {result.rank}
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                let remainingCredits = 0;
                let pendingRetakes: any[] = [];
                
                semesters.forEach(sem => {
                  sem.courses.forEach(c => {
                    if (!c.grade || c.grade === "") {
                      if (c.isRetake) {
                        const oldG = findGradeInfo(c.oldGrade || "D");
                        pendingRetakes.push({
                          id: Math.random().toString(),
                          name: c.name,
                          credits: c.credits,
                          oldGrade: oldG?.gpa || 1.0
                        });
                      } else {
                        remainingCredits += c.credits;
                      }
                    }
                  });
                });
                
                onSwitchToRoadmap?.({ 
                  gpa: result.gpa, 
                  credits: result.totalCredits,
                  remainingCredits,
                  pendingRetakes
                });
              }}
              className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"
            >
              Tìm Lộ trình Học Tập <Target className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Biểu đồ biến động GPA */}
        {chartData.length > 1 && (
          <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-6 border-b border-slate-100">
               <div className="flex items-center gap-2">
                 <ChartIcon className="h-4 w-4 text-blue-400" />
                 <CardTitle className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Biến động GPA</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="h-[200px] pt-4 pb-6 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
                  <XAxis 
                    dataKey="name" 
                    hide 
                  />
                  <YAxis 
                    domain={[0, 4]} 
                    ticks={[1, 2, 3, 4]} 
                    fontSize={11} 
                    fontWeight={800}
                    stroke="#64748b"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "20px", 
                      border: "1px solid rgba(255, 255, 255, 0.2)", 
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      padding: "10px 16px"
                    }}
                    itemStyle={{ fontWeight: "900", color: "#2563eb" }}
                    labelStyle={{ fontWeight: "black", color: "#64748b", marginBottom: "4px" }}
                    cursor={{ stroke: '#60a5fa', strokeWidth: 1 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gpa" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorGpa)"
                    dot={{ r: 5, fill: "#fff", strokeWidth: 3, stroke: "#3b82f6" }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: "#2563eb" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cột phải: Thống kê học kỳ */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Toolbar chuyên nghiệp */}
         <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between mb-2 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest ps-2">Công cụ nhanh</div>
             <div className="h-4 w-px bg-slate-200"></div>
             <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
               <DialogTrigger
                 render={
                   <Button variant="outline" className="bg-white border-blue-200 text-blue-700 font-bold shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all rounded-xl px-5 h-9 text-xs">
                      <CloudUpload className="h-4 w-4 mr-2" /> Nhập từ Portal
                   </Button>
                 }
               />
               <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-2xl">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-bold text-slate-800">Nhập dữ liệu từ HUFLIT Portal</DialogTitle>
                   <DialogDescription>
                     Copy toàn bộ bảng điểm từ trang &quot;Kết quả học tập&quot; và dán vào bên dưới.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800 leading-relaxed">
                        <strong>Hướng dẫn:</strong> Truy cập Portal &rarr; Kết quả học tập &rarr; Chọn tất cả (Ctrl+A) &rarr; Copy (Ctrl+C) &rarr; Dán vào đây. Hệ thống sẽ tự động bóc tách môn học và học kỳ.
                      </div>
                    </div>
                    <textarea 
                      className="w-full h-64 p-3 font-mono text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Dán nội dung bảng điểm tại đây..."
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                 </div>
                 <DialogFooter>
                   <Button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700 font-bold px-8 rounded-xl h-11">
                     Phân tích & Nhập ngay
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>
        </div>

         <div className="space-y-8">
          {semesters.map((sem, sIdx) => {
            const currentYear = getYear(sem.name);
            const nextSemester = semesters[sIdx + 1];
            const nextYear = nextSemester ? getYear(nextSemester.name) : null;
            const showYearSummary = !!(currentYear && currentYear !== nextYear);

            return (
              <SemesterCard 
                key={sIdx}
                sIdx={sIdx}
                sem={sem}
                onUpdateName={(idx, name) => {
                   const newSem = [...semesters];
                   newSem[idx].name = name;
                   setSemesters(newSem);
                }}
                onRemoveSemester={removeSemester}
                onAddCourse={addCourse}
                onUpdateCourse={updateCourse}
                onRemoveCourse={removeCourse}
                isOnlySemester={semesters.length === 1}
                yearlyStats={yearlyStats}
                currentYear={currentYear}
                showYearSummary={showYearSummary}
                semStats={result.semesterStats[sIdx]}
              />
            );
          })}
        </div>

        <Button 
          onClick={addSemester}
          className="w-full h-14 bg-white border border-dashed border-slate-400 text-slate-600 hover:border-blue-500 hover:text-blue-700 hover:bg-slate-50 transition-all rounded-2xl group shadow-sm"
        >
          <div className="bg-white p-1.5 rounded-lg shadow-sm mr-3 group-hover:scale-110 transition-transform">
             <Plus className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-bold text-base tracking-tight">Thêm Học kỳ mới</span>
        </Button>
      </div>
    </div>
  );
}
