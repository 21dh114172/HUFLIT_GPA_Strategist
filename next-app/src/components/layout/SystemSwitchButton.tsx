"use client";

import { MonitorOff, ChevronRight, Info } from "lucide-react";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const SystemSwitchButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const handleSwitch = useCallback(() => {
    localStorage.setItem("app-preference", "legacy");
    toast.success("Đang chuyển sang phiên bản Classic...", {
      description: "Hệ thống sẽ tải lại trang.",
    });
    
    // Smooth transition
    setTimeout(() => {
      window.location.replace(`${basePath}/legacy/`);
    }, 800);
  }, [basePath]);

  return (
    <div className="relative flex items-center">
      {/* Desktop Version: Button with Tooltip-like Info */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 border shadow-sm outline-none
            ${isOpen 
              ? "bg-slate-900 border-slate-900 text-white" 
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          aria-label="Tùy chọn phiên bản"
        >
          <MonitorOff className={`h-3.5 w-3.5 transition-transform duration-500 ${isOpen ? "rotate-12" : ""}`} />
          <span className="text-[11px] font-bold tracking-tight">Classic Mode</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              className="absolute left-full ml-2 z-50 bg-white border border-slate-200 p-3 rounded-2xl shadow-xl min-w-[200px]"
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="bg-amber-100 p-1.5 rounded-lg shrink-0">
                  <Info className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">Phiên bản Classic</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Dành cho các trình duyệt cũ hoặc thiết bị yếu.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitch}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1 group"
              >
                Chuyển ngay
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Version: Simple Icon Button */}
      <button
        onClick={handleSwitch}
        className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 active:scale-90 transition-all outline-none"
        aria-label="Chuyển sang bản Classic"
      >
        <MonitorOff className="h-4 w-4" />
      </button>
    </div>
  );
};
