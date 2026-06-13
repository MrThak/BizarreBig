"use client";

import React, { useState, useEffect } from "react";

interface AdminConfigViewerProps {
  highlightHtml: string;
  highlightLanguage: string;
  code: string;
}

export function AdminConfigViewer({ highlightHtml, highlightLanguage, code }: AdminConfigViewerProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkAuth = () => {
      const role = localStorage.getItem("bizarre_user_role");
      setIsAdmin(role === "admin");
    };

    window.addEventListener("bizarre_auth_change", checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener("bizarre_auth_change", checkAuth);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  // ยังไม่ hydrate หรือไม่ใช่แอดมิน → ซ่อนทั้งหมด
  if (!isMounted || !isAdmin) {
    return null;
  }

  // แอดมินเท่านั้นที่เห็นส่วนนี้
  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Section heading — เห็นเฉพาะแอดมิน */}
      <div className="flex items-center gap-2">
        <span className="text-lg">⚙️</span>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          รายละเอียดคอนฟิกและข้อมูลสเปกเทคนิค (Tech Specs / Config)
        </h2>
      </div>

      <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 bg-slate-950/90 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-violet-950/20 border-b border-violet-900/30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] text-violet-300 font-mono ml-2 uppercase font-bold">
              admin_config.{highlightLanguage} (ADMIN VIEW)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-2 py-0.5 rounded border text-[8px] font-bold transition-all duration-200 ${
                isCopied
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-900 hover:bg-slate-800 border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isCopied ? "✓ คัดลอกสำเร็จ!" : "📄 คัดลอก"}
            </button>
            <span className="text-[9px] text-violet-400 font-mono font-bold tracking-wider">
              SHIKI
            </span>
          </div>
        </div>

        {/* Code Body */}
        <div
          className="overflow-x-auto text-[12px] font-mono leading-relaxed text-slate-300 scrollbar-thin max-h-[350px]"
          dangerouslySetInnerHTML={{ __html: highlightHtml }}
        />
      </div>
      </div>
    </div>
  );
}
