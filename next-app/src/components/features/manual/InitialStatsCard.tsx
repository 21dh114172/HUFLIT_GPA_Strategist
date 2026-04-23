"use client";

import { memo } from "react";
import { Calculator, RotateCcw } from "lucide-react";
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
    <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 overflow-hidden">
      <CardHeader className="pb-1 border-b border-slate-200 px-5">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-xl text-slate-800 font-bold tracking-tight">Tổng kết</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-5 pb-5 space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-700 uppercase ps-1">GPA Hiện tại</Label>
              <Input
                type="number"
                step="0.01"
                className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                value={initialGPA || ""}
                onChange={(e) => onUpdateGPA(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-700 uppercase ps-1">Tích lũy</Label>
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
        {children}
      </CardContent>
    </Card>
  );
});

InitialStatsCard.displayName = "InitialStatsCard";

export default InitialStatsCard;
