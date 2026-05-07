"use client";

import { memo } from "react";
import { LayoutDashboard, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InitialStatsCardProps {
  initialGPA: number;
  initialCredits: number;
  onUpdateGPA: (val: number) => void;
  onUpdateCredits: (val: number) => void;
  onReset: () => void;
  children?: React.ReactNode;
}

const InitialStatsCard = memo(({
  initialGPA,
  initialCredits,
  onUpdateGPA,
  onUpdateCredits,
  onReset,
  children
}: InitialStatsCardProps) => {
  return (
    <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 py-0">
      <CardHeader className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm">
              <LayoutDashboard className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">Tổng kết</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onReset} className="h-7 w-7 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-4 pb-3 space-y-3">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ps-1">GPA Hiện tại</Label>
              <Input
                type="number"
                step="0.01"
                className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                value={initialGPA || ""}
                onChange={(e) => onUpdateGPA(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ps-1">Tích lũy</Label>
              <Input
                type="number"
                className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                value={initialCredits || ""}
                onChange={(e) => onUpdateCredits(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div className="pt-0.5">
          {children}
        </div>
      </CardContent>
    </Card>
  );
});

InitialStatsCard.displayName = "InitialStatsCard";

export default InitialStatsCard;
