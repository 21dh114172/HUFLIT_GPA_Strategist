"use client";

import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface PortalImportDialogProps {
  onImport: (text: string) => void;
}

const PortalImportDialog = ({ onImport }: PortalImportDialogProps) => {
  const [importText, setImportText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = () => {
    if (!importText.trim()) return;
    onImport(importText);
    setImportText("");
    setIsOpen(false);
  };

  return (
    <div className="pt-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                const Component = isLink ? 'a' : 'div' as any;
                
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
  );
};

export default PortalImportDialog;
