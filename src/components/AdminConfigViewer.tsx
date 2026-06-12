"use client";

import React, { useState, useEffect } from "react";

interface AdminConfigViewerProps {
  highlightHtml: string;
  highlightLanguage: string;
  code: string;
}

export function AdminConfigViewer({ highlightHtml, highlightLanguage, code }: AdminConfigViewerProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkAuth = () => {
      const role = localStorage.getItem("bizarre_user_role");
      const email = localStorage.getItem("bizarre_user_email") || "";
      setIsAdmin(role === "admin");
      setUserEmail(email);
    };

    // Listen to custom auth events from Navbar or other login forms
    window.addEventListener("bizarre_auth_change", checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener("bizarre_auth_change", checkAuth);
    };
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      localStorage.setItem("bizarre_user_role", "admin");
      setIsAdmin(true);
      setErrorMsg("");
      setPassword("");
      // แจ้งเตือน Navbar และคอมโพเนนต์อื่น ๆ ให้ทำงานพร้อมกัน
      window.dispatchEvent(new Event("bizarre_auth_change"));
    } else {
      setErrorMsg("รหัสผ่านไม่ถูกต้อง! โปรดลองอีกครั้ง");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full py-10 text-center text-xs text-slate-500">
        กำลังโหลดข้อมูลความปลอดภัย...
      </div>
    );
  }

  // หากเป็นแอดมิน ให้แสดงข้อมูลโค้ดสเปก Shiki ทันที
  if (isAdmin) {
    return (
      <div className="space-y-3 animate-fade-in">
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
    );
  }

  // หากเป็นผู้ใช้ทั่วไป ให้แสดงสถานะล็อกและช่องกรอกรหัสผ่านปลดล็อค
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-slate-950/80 p-8 text-center shadow-xl animate-fade-in">
      {/* Mesh lock glow in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

      <span className="text-3xl mb-3 block animate-pulse">🔒</span>
      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
        จำกัดสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Only)
      </h3>
      
      {userEmail ? (
        <div className="mb-6">
          <p className="text-[10px] text-amber-400 font-bold bg-amber-950/20 border border-amber-500/20 py-1.5 px-3 rounded-xl inline-block text-center">
            ลงชื่อเข้าใช้ด้วยอีเมล: {userEmail} 🌐
          </p>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
            บัญชี Google ของคุณไม่มีสิทธิ์ผู้ดูแลระบบ โปรดใช้รหัสผ่านหรือเข้าสู่ระบบด้วยอีเมลแอดมินเพื่อเข้าถึงหน้านี้
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
          ข้อมูลความต้องการระบบ สเปกเครื่อง และไฟล์ตั้งค่าอย่างละเอียด จำกัดสิทธิ์การเข้าถึงสำหรับบัญชีผู้ดูแลระบบ (Admin) เท่านั้น
        </p>
      )}

      {/* Unlock Form */}
      <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-3 relative z-10">
        <div className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านแอดมินเพื่อปลดล็อก..."
            className="flex-1 h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/80 transition-all"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all border border-violet-500/20 active:scale-[0.98]"
          >
            ปลดล็อค 🔑
          </button>
        </div>
        
        {errorMsg && (
          <p className="text-[10px] text-rose-400 font-medium animate-pulse">{errorMsg}</p>
        )}
      </form>
      
      <p className="text-[9px] text-slate-600 mt-4 tracking-wider uppercase font-bold">
        hint: รหัสผ่านคือ "admin" หรือเข้าสู่ระบบ Google ด้วยอีเมลแอดมิน
      </p>
    </div>
  );
}
