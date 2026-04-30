"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Course, GRADE_SCALE } from "@/lib/gpa-engine";

interface CourseRowProps {
  course: Course;
  sIdx: number;
  cIdx: number;
  onUpdate: (sIdx: number, cIdx: number, field: keyof Course, value: any) => void;
  onRemove: (sIdx: number, cIdx: number) => void;
}

const CourseRow = memo(({
  course,
  sIdx,
  cIdx,
  onUpdate,
  onRemove,
}: CourseRowProps) => {
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
            <SelectValue placeholder="Điểm" />
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
          className="text-slate-500 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 opacity-100 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
});

CourseRow.displayName = "CourseRow";

export default CourseRow;
