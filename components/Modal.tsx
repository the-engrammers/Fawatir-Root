"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl bg-slate-900 shadow-2xl backdrop-blur-2xl border border-slate-800 text-slate-100 transition-all sm:max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/60">
          <h3 className="font-sans text-base font-bold text-slate-100 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
