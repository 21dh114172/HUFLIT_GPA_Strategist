"use client";

import { useState, useEffect, useMemo, memo, useCallback, useDeferredValue } from "react";
import { toast } from "sonner";
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
  BookOpen,
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
      <TableCell className="ps-6 py-1.5">
        <Input
          placeholder="Tên môn học..."
          value={course.name}
          onChange={(e) => onUpdate(sIdx, cIdx, "name", e.target.value)}
          className="bg-white border-slate-300 h-8 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
        />
      </TableCell>
      <TableCell className="text-center py-1.5">
        <Input
          type="number"
          min="1"
          value={course.credits}
          onChange={(e) => onUpdate(sIdx, cIdx, "credits", parseInt(e.target.value) || 0)}
          className="bg-white border-slate-300 h-8 text-sm text-center font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
        />
      </TableCell>
      <TableCell className="text-center py-1.5">
        <Select
          value={course.grade}
          onValueChange={(val) => onUpdate(sIdx, cIdx, "grade", val)}
        >
          <SelectTrigger className="bg-white border-slate-300 h-8 w-20 text-sm font-bold text-blue-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm mx-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADE_SCALE.map(g => (
              <SelectItem key={g.grade} value={g.grade} className="font-semibold">{g.grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center py-1.5">
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
      <TableCell className="pe-6 text-right py-1.5">
        <button
          onClick={() => onRemove(sIdx, cIdx)}
          className="text-slate-500 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 opacity-100"
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
    <div className="space-y-4">
      <Card className="ring-0 border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 gap-0">
        <CardHeader className="bg-white border-b border-slate-100 py-2 px-5 flex flex-row items-center justify-between group/header transition-all hover:bg-slate-50/30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon Group */}
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0 group-hover/header:scale-105 transition-transform duration-300">
              <BookOpen className="h-4 w-4" />
            </div>
            
            {/* Title Content - One Line */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap">Học kỳ {String(sIdx + 1).padStart(2, '0')}</span>
                <div className="h-3 w-px bg-slate-200 hidden sm:block" />
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  value={sem.name}
                  onChange={(e) => onUpdateName(sIdx, e.target.value)}
                  className="bg-transparent border-none text-sm font-black text-slate-800 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto w-full placeholder:text-slate-400 truncate"
                  placeholder="Tên học kỳ..."
                />
                {semStats?.isWarning && (
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" title="Cảnh báo học tập" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ms-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={isOnlySemester}
              onClick={() => onRemoveSemester(sIdx)}
              className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover/header:opacity-100"
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
                  <TableHead className="w-[45%] text-[11px] font-bold uppercase text-slate-700 tracking-wider ps-6 py-2.5">Môn học</TableHead>
                  <TableHead className="w-[15%] text-[11px] font-bold uppercase text-slate-700 tracking-wider text-center py-2.5">Tín chỉ</TableHead>
                  <TableHead className="w-[20%] text-[11px] font-bold uppercase text-slate-700 tracking-wider text-center py-2.5">Điểm</TableHead>
                  <TableHead className="w-[10%] text-[11px] font-bold uppercase text-slate-700 tracking-wider text-center py-2.5">Học Lại</TableHead>
                  <TableHead className="w-[10%] text-right pe-6 py-2.5"></TableHead>
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
          <div className="p-2 bg-slate-50 border-t border-slate-200 flex flex-col items-center gap-2">
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
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-1 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest whitespace-nowrap">TC Đạt</span>
                  <span className="text-sm font-bold text-emerald-600">{semStats.passedCredits}</span>
                </div>
 
                {/* Chip 2: Failed */}
                <div className={`border rounded-xl py-1 px-2 flex flex-col items-center justify-center ${semStats.failedCredits > 0 ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${semStats.failedCredits > 0 ? "text-rose-700" : "text-slate-600"}`}>TC Rớt</span>
                  <span className={`text-sm font-bold ${semStats.failedCredits > 0 ? "text-rose-600" : "text-slate-500"}`}>{semStats.failedCredits}</span>
                </div>
 
                {/* Chip 3: Semester GPA */}
                <div className={`border rounded-xl py-1 px-2 flex flex-col items-center justify-center ${semStats.isWarning ? "bg-rose-50 border-rose-200" : "bg-blue-50 border-blue-200"}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${semStats.isWarning ? "text-rose-700" : "text-blue-700"}`}>GPA HK</span>
                  <span className={`text-sm font-bold ${semStats.isWarning ? "text-rose-500" : "text-blue-600"}`}>{semStats.gpa.toFixed(2)}</span>
                </div>
 
                {/* Chip 4: Cum Credits */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl py-1 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">TC Tích lũy</span>
                  <span className="text-sm font-bold text-slate-700">{semStats.cumulativeCredits}</span>
                </div>
 
                {/* Chip 5: Cum GPA */}
                <div className="col-span-2 lg:col-span-1 bg-white border border-blue-200 rounded-xl py-1 px-2 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest whitespace-nowrap">GPA Tích lũy</span>
                  <span className="text-base font-bold text-blue-700">{semStats.cumulativeGPA.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showYearSummary && yearData && (
        <div className="my-4 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="bg-slate-50/80 backdrop-blur-md border border-slate-200 rounded-2xl py-3 px-6 flex items-center justify-between shadow-sm group/year transition-all hover:bg-white hover:border-blue-300">
            {/* Year Info */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm group-hover/year:scale-110 transition-transform">
                <History className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Năm học</p>
                <p className="text-sm font-black text-slate-800 leading-none">{currentYear}</p>
              </div>
            </div>
 
            <div className="h-8 w-px bg-slate-200 mx-4" />
 
            {/* Stats Group */}
            <div className="flex-1 flex items-center justify-around">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">GPA NĂM</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-xl font-black ${(yearData.points / yearData.credits) >= 3.2 ? "text-blue-600" : "text-amber-600"}`}>
                    {(yearData.points / yearData.credits).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/ 4.0</span>
                </div>
              </div>
 
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tín chỉ</p>
                <p className="text-xl font-black text-slate-800">
                  {yearData.credits}
                </p>
              </div>
 
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Xếp loại</p>
                <p className={`text-sm font-black uppercase tracking-tight ${(yearData.points / yearData.credits) >= 3.6 ? "text-emerald-600" : (yearData.points / yearData.credits) >= 3.2 ? "text-blue-600" : "text-slate-600"}`}>
                  {(yearData.points / yearData.credits) >= 3.6 ? "Xuất sắc" : (yearData.points / yearData.credits) >= 3.2 ? "Giỏi" : (yearData.points / yearData.credits) >= 2.5 ? "Khá" : "Trung bình"}
                </p>
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


  // Performance Optimization: Defer heavy calculations
  const deferredSemesters = useDeferredValue(semesters);
  const deferredInitialGPA = useDeferredValue(initialGPA);
  const deferredInitialCredits = useDeferredValue(initialCredits);

  const result = useMemo(() => 
    calculateManualGPA(deferredSemesters, deferredInitialGPA, deferredInitialCredits), 
    [deferredSemesters, deferredInitialGPA, deferredInitialCredits]
  );

  // Chart Data Preparation - Reusing result for performance
  const chartData = useMemo(() => {
    return result.semesterStats.map(s => ({
      name: s.name,
      gpa: s.cumulativeGPA
    }));
  }, [result.semesterStats]);

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
  const addSemester = useCallback(() => {
    setSemesters(prev => [...prev, {
      name: `Học kỳ ${prev.length + 1}`,
      courses: [{ name: "", credits: 3, grade: "" }]
    } as any]);
  }, []);

  const removeSemester = useCallback((idx: number) => {
    setSemesters(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const addCourse = useCallback((semIdx: number) => {
    setSemesters(prev => {
      const newSemesters = [...prev];
      newSemesters[semIdx] = {
        ...newSemesters[semIdx],
        courses: [...newSemesters[semIdx].courses, { name: "", credits: 3, grade: "" }]
      };
      return newSemesters;
    });
  }, []);

  const updateCourse = useCallback((semIdx: number, courseIdx: number, field: keyof Course, value: any) => {
    setSemesters(prev => {
      const newSemesters = [...prev];
      const newCourses = [...newSemesters[semIdx].courses];
      newCourses[courseIdx] = { ...newCourses[courseIdx], [field]: value };
      newSemesters[semIdx] = { ...newSemesters[semIdx], courses: newCourses };
      return newSemesters;
    });
  }, []);

  const removeCourse = useCallback((semIdx: number, courseIdx: number) => {
    setSemesters(prev => {
      const newSemesters = [...prev];
      const newCourses = [...newSemesters[semIdx].courses];
      newCourses.splice(courseIdx, 1);
      
      if (newCourses.length === 0) {
        return newSemesters.filter((_, i) => i !== semIdx);
      }
      
      newSemesters[semIdx] = { ...newSemesters[semIdx], courses: newCourses };
      return newSemesters;
    });
  }, []);

  const updateSemesterName = useCallback((idx: number, name: string) => {
    setSemesters(prev => {
      const newSemesters = [...prev];
      newSemesters[idx] = { ...newSemesters[idx], name };
      return newSemesters;
    });
  }, []);

  const handleImport = () => {
    if (!importText.trim()) return;
    const imported = parsePortalText(importText);
    if (imported.length > 0) {
      const totalCourses = imported.reduce((acc, sem) => acc + sem.courses.length, 0);
      
      setInitialGPA(0);
      setInitialCredits(0);
      setSemesters(imported as any);
      setImportText("");
      setIsImportOpen(false);
      
      toast.success(`Phân tích thành công!`, {
        description: `Đã nạp ${imported.length} học kỳ với ${totalCourses} môn học vào hệ thống.`
      });
    } else {
      toast.error("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại nội dung dán.");
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pb-20">
 
      <div className="lg:col-span-4 sticky top-20 space-y-4 order-first h-fit z-20 self-start">
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

            {/* Import Portal Button Integration */}
            <div className="pt-2">
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger render={
                  <Button variant="outline" className="w-full bg-white border-blue-200 text-blue-700 font-bold shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all rounded-xl h-10 text-xs gap-2" />
                }>
                  <CloudUpload className="h-4 w-4" /> Nhập dữ liệu từ Portal
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-white border-slate-200 shadow-2xl p-0 overflow-hidden rounded-3xl">
                  <DialogHeader className="p-10 pb-0">
                    <div className="flex items-center gap-5 mb-2">
                      <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <CloudUpload className="h-7 w-7" />
                      </div>
                      <div>
                        <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Nhập dữ liệu Portal</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-base">
                          Tự động hóa việc nhập điểm chỉ với vài giây.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="px-10 py-8 space-y-8">
                    {/* Step-by-Step Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { step: 1, text: "Truy cập Portal HUFLIT", icon: "🌐", url: "https://portal.huflit.edu.vn/Home/Marks" },
                        { step: 2, text: "Ctrl+A rồi Ctrl+C bảng điểm", icon: "📋" },
                        { step: 3, text: "Dán kết quả vào ô bên dưới", icon: "🎯" }
                      ].map((s) => {
                        const isLink = !!s.url;
                        const Component = isLink ? 'a' : 'div';
                        
                        return (
                          <Component 
                            key={s.step} 
                            href={s.url}
                            target={isLink ? "_blank" : undefined}
                            rel={isLink ? "noopener noreferrer" : undefined}
                            className={`bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-blue-300 transition-all ${isLink ? 'cursor-pointer hover:bg-blue-50/50 hover:shadow-md active:scale-95' : ''}`}
                          >
                            <div className="text-xs font-black text-blue-600/30 absolute top-2 right-3 italic text-3xl group-hover:text-blue-600/10 transition-colors">0{s.step}</div>
                            <span className="text-2xl">{s.icon}</span>
                            <span className="text-xs font-bold text-slate-700 leading-tight pr-4">{s.text}</span>
                            {isLink && (
                              <div className="text-[9px] font-bold text-blue-600 mt-auto bg-blue-50 px-2 py-0.5 rounded-md inline-block w-fit">NHẤP ĐỂ MỞ ↗</div>
                            )}
                          </Component>
                        );
                      })}
                    </div>

                    {/* Enhanced Textarea Area */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
                      <div className="relative">
                        <textarea
                          className="w-full h-[400px] p-5 font-mono text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
                          placeholder="Nhấp vào đây và nhấn Ctrl + V để dán bảng điểm..."
                          value={importText}
                          onChange={(e) => setImportText(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-slate-200 rounded-lg shadow-sm">
                          <div className={`h-2.5 w-2.5 rounded-full ${importText.length > 50 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {importText.length > 0 ? "Sẵn sàng phân tích" : "Chờ dữ liệu"}
                          </span>
                        </div>
                      </div>
                    </div>

                    
                  </div>

                  <DialogFooter className="p-8 bg-white border-t border-slate-100 flex justify-center">
                    <Button 
                      onClick={handleImport} 
                      disabled={!importText.trim()}
                      className={`
                        h-14 min-w-[280px] px-8 rounded-xl
                        font-bold text-base tracking-tight
                        transition-all duration-200
                        ${!importText.trim() 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/15 active:scale-95'
                        }
                      `}
                    >
                      Bắt đầu phân tích
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* MAIN GPA DISPLAY */}
            <div className="text-center py-1 relative">
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full -z-10"></div>
              <div className="text-[11px] font-bold text-blue-600/80 uppercase tracking-[0.2em] mb-1">GPA TÍCH LŨY MỚI</div>
              <div className={`text-5xl font-black leading-none tracking-tighter drop-shadow-sm ${result.gpa >= 3.6 ? "text-emerald-500" :
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
                <div className={`text-xl font-bold whitespace-nowrap ${result.rank === "Xuất sắc" ? "text-emerald-500" :
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
      </div>      {/* Cột phải: Thống kê học kỳ */}
      <div className="lg:col-span-8 space-y-4">
        <div className="space-y-4">
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
                onUpdateName={updateSemesterName}
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
