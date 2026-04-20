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
    icon: <Sun className="h-4 w-4 text-amber-500" />,
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
    icon: <Sunset className="h-4 w-4 text-orange-500" />,
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
    icon: <Moon className="h-4 w-4 text-blue-500" />,
    items: [
      { period: "13", start: "18:15", end: "19:05" },
      { period: "14", start: "19:05", end: "19:55" },
      { period: "15", start: "19:55", end: "20:45" },
    ]
  }
];

export function ScaleTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* Cột trái: Thang điểm */}
      <div className="lg:col-span-12 xl:col-span-5 space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-800">Thang điểm HUFLIT</CardTitle>
            <CardDescription>
              Quy chuẩn quy đổi từ điểm hệ số 10 sang chữ hệ số 4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Điểm Chữ</TableHead>
                    <TableHead className="font-semibold text-slate-700">Hệ 10 (Min - Max)</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">GPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GRADE_SCALE.map((scale) => (
                    <TableRow key={scale.grade} className="hover:bg-slate-50/50">
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getGradeColorClass(scale.grade)}`}>
                          {scale.grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {scale.min.toFixed(1)} - {scale.max.toFixed(1)}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 text-right">{scale.gpa.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-blue-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800">Xếp loại Học lực</CardTitle>
            <CardDescription>Tốt nghiệp dựa trên tổng điểm GPA.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
             <RankCard title="Xuất sắc" range="3.6 - 4.0" color="bg-emerald-100 text-emerald-800 border-emerald-200" />
             <RankCard title="Giỏi" range="3.2 - 3.59" color="bg-blue-100 text-blue-800 border-blue-200" />
             <RankCard title="Khá" range="2.5 - 3.19" color="bg-cyan-100 text-cyan-800 border-cyan-200" />
             <RankCard title="T.Bình" range="2.0 - 2.49" color="bg-amber-100 text-amber-800 border-amber-200" />
             <RankCard title="Yếu" range="1.0 - 1.99" color="bg-orange-100 text-orange-800 border-orange-200" />
             <RankCard title="Kém" range="< 1.0" color="bg-red-100 text-red-800 border-red-200" />
          </CardContent>
        </Card>
      </div>

      {/* Cột phải: Thời gian biểu */}
      <div className="lg:col-span-12 xl:col-span-7">
        <Card className="border-slate-200 shadow-sm h-full overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Coffee className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Thời gian biểu</CardTitle>
                <CardDescription>Chi tiết lịch học theo từng tiết</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[80px] text-center font-bold text-slate-500 uppercase text-xs tracking-widest">Buổi</TableHead>
                    <TableHead className="w-[60px] text-center font-bold text-slate-500 uppercase text-xs tracking-widest ps-4">Tiết</TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-widest">Bắt đầu</TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-widest">Kết thúc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHEDULE.map((session) => (
                    <React.Fragment key={session.session}>
                      {session.items.map((item, idx) => (
                        <TableRow key={idx} className={`group ${item.break ? "bg-amber-50/50" : "hover:bg-slate-50/50"}`}>
                          {idx === 0 && (
                            <TableCell rowSpan={session.items.length} className="border-r border-slate-100">
                              <div className="flex flex-col items-center gap-1">
                                {session.icon}
                                <span className="font-bold text-xs uppercase text-slate-700 tracking-wider leading-none mt-1">{session.session}</span>
                              </div>
                            </TableCell>
                          )}
                          
                          {item.break ? (
                            <TableCell colSpan={3} className="py-2 text-center">
                               <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-700/80 italic">
                                 <Coffee className="h-3 w-3" /> {item.break} ({item.time})
                               </div>
                            </TableCell>
                          ) : (
                            <>
                              <TableCell className="text-center font-bold text-blue-600 text-sm ps-4">
                                {item.period}
                              </TableCell>
                              <TableCell className="font-mono text-slate-500 font-medium tabular-nums">{item.start}</TableCell>
                              <TableCell className="font-mono text-slate-500 font-medium tabular-nums">{item.end}</TableCell>
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

function RankCard({ title, range, color }: { title: string, range: string, color: string }) {
  return (
    <div className={`p-3 rounded-xl border ${color} flex flex-col justify-center items-center text-center`}>
      <span className="font-bold text-xs tracking-wider uppercase">{title}</span>
      <span className="text-[12px] font-bold mt-0.5">{range}</span>
    </div>
  );
}
