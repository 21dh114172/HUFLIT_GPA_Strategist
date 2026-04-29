import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GRADE_SCALE } from "@/lib/gpa-engine";
import { Sun, Sunset, Moon, Coffee } from "lucide-react";

// Local helper to map grades to colors
function getGradeColorClass(grade: string) {
  if (grade.startsWith("A")) return "bg-emerald-100 text-emerald-700 font-semibold";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700 font-semibold";
  if (grade.startsWith("C")) return "bg-amber-100 text-amber-700 font-semibold";
  if (grade.startsWith("D")) return "bg-orange-100 text-orange-700 font-semibold";
  if (grade === "F") return "bg-red-100 text-red-700 font-semibold";
  return "bg-slate-100 text-slate-700";
}

const SCHEDULE = [
  {
    session: "Sáng",
    icon: <Sun className="h-4 w-4 text-amber-500" strokeWidth={2} />,
    items: [
      { period: "1", start: "06:45", end: "07:35" },
      { period: "2", start: "07:35", end: "08:25" },
      { period: "3", start: "08:25", end: "09:15" },
      { break: "Giải lao 15 phút", time: "09:15 - 09:30" },
      { period: "4", start: "09:30", end: "10:20" },
      { period: "5", start: "10:20", end: "11:10" },
      { period: "6", start: "11:10", end: "12:00" },
    ]
  },
  {
    session: "Chiều",
    icon: <Sunset className="h-4 w-4 text-orange-500" strokeWidth={2} />,
    items: [
      { period: "7", start: "12:45", end: "13:35" },
      { period: "8", start: "13:35", end: "14:25" },
      { period: "9", start: "14:25", end: "15:15" },
      { break: "Giải lao 15 phút", time: "15:15 - 15:30" },
      { period: "10", start: "15:30", end: "16:20" },
      { period: "11", start: "16:20", end: "17:10" },
      { period: "12", start: "17:10", end: "18:00" },
    ]
  },
  {
    session: "Tối",
    icon: <Moon className="h-4 w-4 text-blue-500" strokeWidth={2} />,
    items: [
      { period: "13", start: "18:15", end: "19:05" },
      { period: "14", start: "19:05", end: "19:55" },
      { period: "15", start: "19:55", end: "20:45" },
    ]
  }
];

export function ScaleTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pb-4 min-w-full">
      
      {/* Cột trái: Thang điểm & Xếp loại */}
      <div className="lg:col-span-4 sticky top-14 space-y-2 h-fit z-20 self-start w-full">
        {/* Card 1: Thang điểm học tập */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="py-2 px-4 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-[12px] text-slate-800 font-black uppercase tracking-widest">Thang điểm HUFLIT</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-center w-16">Chữ</TableHead>
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400">Hệ 10</TableHead>
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-right pr-4">GPA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {GRADE_SCALE.map((scale) => (
                  <TableRow key={scale.grade} className="hover:bg-slate-50/50 border-b-slate-50 transition-colors">
                    <TableCell className="py-1 text-center">
                      <span className={`inline-flex items-center pl-2.5 w-9 h-5 rounded-md text-[11px] font-bold font-mono ${getGradeColorClass(scale.grade)}`}>
                        {scale.grade}
                      </span>
                    </TableCell>
                    <TableCell className="py-1 text-xs text-slate-600 font-medium font-mono tabular-nums">
                      {scale.min.toFixed(1)} - {scale.max.toFixed(1)}
                    </TableCell>
                    <TableCell className="py-1 text-xs font-bold text-slate-800 text-right pr-4 font-mono tabular-nums">
                      {scale.gpa.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Card 2: Xếp loại học lực (Standardized Table) */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="py-2 px-4 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-[12px] text-slate-800 font-black uppercase tracking-widest">Xếp loại Học lực</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 pl-4">Phân loại</TableHead>
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-right pr-4">Khoảng GPA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { rank: "Xuất sắc", range: "3.6 - 4.0", color: "bg-emerald-100 text-emerald-700" },
                  { rank: "Giỏi", range: "3.2 - 3.59", color: "bg-blue-100 text-blue-700" },
                  { rank: "Khá", range: "2.5 - 3.19", color: "bg-cyan-100 text-cyan-700" },
                  { rank: "Trung bình", range: "2.0 - 2.49", color: "bg-amber-100 text-amber-700" },
                  { rank: "Yếu", range: "1.0 - 1.99", color: "bg-orange-100 text-orange-700" },
                  { rank: "Kém", range: "< 1.0", color: "bg-red-100 text-red-700" },
                ].map((item) => (
                  <TableRow key={item.rank} className="hover:bg-slate-50/50 border-b-slate-50 transition-colors">
                    <TableCell className="py-1 pl-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                        {item.rank}
                      </span>
                    </TableCell>
                    <TableCell className="py-1 text-xs font-medium text-slate-600 text-right pr-4 font-mono tabular-nums">
                      {item.range}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Card 3: Điểm rèn luyện (Standardized Table) */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="py-2 px-4 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-[12px] text-slate-800 font-black uppercase tracking-widest">Điểm rèn luyện</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 pl-4">Xếp loại</TableHead>
                  <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-right pr-4">Khoảng điểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { rank: "Xuất sắc", range: "90 - 100", color: "bg-emerald-100 text-emerald-700" },
                  { rank: "Tốt", range: "80 - <90", color: "bg-blue-100 text-blue-700" },
                  { rank: "Khá", range: "65 - <80", color: "bg-cyan-100 text-cyan-700" },
                  { rank: "Trung bình", range: "50 - <65", color: "bg-amber-100 text-amber-700" },
                  { rank: "Yếu", range: "35 - <50", color: "bg-orange-100 text-orange-700" },
                  { rank: "Kém", range: "< 35", color: "bg-red-100 text-red-700" },
                ].map((item) => (
                  <TableRow key={item.rank} className="hover:bg-slate-50/50 border-b-slate-50 transition-colors">
                    <TableCell className="py-1 pl-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                        {item.rank}
                      </span>
                    </TableCell>
                    <TableCell className="py-1 text-xs font-medium text-slate-600 text-right pr-4 font-mono tabular-nums">
                      {item.range}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Cột phải: Thời gian biểu */}
      <div className="lg:col-span-8 space-y-2">
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="py-2.5 px-4 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-1.5 rounded-lg">
                  <Coffee className="h-4 w-4 text-blue-600" strokeWidth={2} />
                </div>
                <div>
                  <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">Thời gian biểu Tiết học</CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent border-b-slate-100">
                    <TableHead className="w-[100px] text-center text-[11px] font-bold uppercase text-slate-400 tracking-wider border-r border-slate-100/50">Buổi</TableHead>
                    <TableHead className="w-[80px] text-center text-[11px] font-bold uppercase text-slate-400 tracking-wider">Tiết</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center">Thời gian chi tiết</TableHead>
                    <TableHead className="w-[100px] text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHEDULE.map((session) => (
                    <React.Fragment key={session.session}>
                      {session.items.map((item, idx) => (
                        <TableRow key={idx} className={`group border-b-slate-50 ${item.break ? "bg-amber-50/20" : "hover:bg-slate-50/50 transition-colors"}`}>
                          {idx === 0 && (
                            <TableCell rowSpan={session.items.length} className="border-r border-slate-100/50 bg-slate-50/10">
                              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                                <div className="p-1.5 rounded-full bg-white shadow-sm border border-slate-100">
                                  {React.cloneElement(session.icon as React.ReactElement<{ className?: string }>, { className: "h-3.5 w-3.5" })}
                                </div>
                                <span className="font-bold text-[10px] uppercase text-slate-600 tracking-widest vertical-text">{session.session}</span>
                              </div>
                            </TableCell>
                          )}
                          
                          {item.break ? (
                            <TableCell colSpan={3} className="py-2">
                               <div className="flex items-center justify-center gap-3 px-6">
                                 <div className="h-[1px] flex-1 bg-amber-200/40"></div>
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest whitespace-nowrap">
                                   <Coffee className="h-3.5 w-3.5" strokeWidth={2.5} /> {item.break} <span className="text-amber-400 font-mono">({item.time})</span>
                                 </div>
                                 <div className="h-[1px] flex-1 bg-amber-200/40"></div>
                               </div>
                            </TableCell>
                          ) : (
                            <>
                              <TableCell className="text-center py-2">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                  {item.period}
                                </span>
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex items-center justify-center gap-3">
                                  <span className="font-mono text-xs text-slate-700 font-bold tabular-nums bg-slate-50 px-2 py-1 rounded border border-slate-100">{item.start}</span>
                                  <span className="text-slate-300 text-[10px] font-bold">→</span>
                                  <span className="font-mono text-xs text-slate-700 font-bold tabular-nums bg-slate-50 px-2 py-1 rounded border border-slate-100">{item.end}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <div className="inline-block w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-400 group-hover:scale-125 transition-all duration-300 shadow-sm"></div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
