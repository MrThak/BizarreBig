"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "user";
}

export function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [mockName, setMockName] = useState("");
  const [mockEmail, setMockEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const syncUserFromStorage = () => {
    const role = localStorage.getItem("bizarre_user_role");
    const email = localStorage.getItem("bizarre_user_email") || "";
    const name = localStorage.getItem("bizarre_user_name") || "";
    const avatarUrl = localStorage.getItem("bizarre_user_avatar") || "";
    
    if (role) {
      setUser({
        email,
        name: name || (role === "admin" ? "ผู้ดูแลระบบ (Admin)" : "ผู้ใช้ทั่วไป"),
        avatarUrl,
        role: role as "admin" | "user",
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    syncUserFromStorage();

    // Check active Supabase session on mount
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || "";
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split("@")[0];
          const avatarUrl = session.user.user_metadata?.avatar_url || "";
          const isAdminEmail = email.toLowerCase() === "thaksin819@gmail.com";
          const role = isAdminEmail ? "admin" : "user";
          
          localStorage.setItem("bizarre_user_role", role);
          localStorage.setItem("bizarre_user_email", email);
          localStorage.setItem("bizarre_user_name", name);
          localStorage.setItem("bizarre_user_avatar", avatarUrl);
          
          syncUserFromStorage();
          window.dispatchEvent(new Event("bizarre_auth_change"));
        }
      });

      // Listen to Supabase changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split("@")[0];
          const avatarUrl = session.user.user_metadata?.avatar_url || "";
          const isAdminEmail = email.toLowerCase() === "thaksin819@gmail.com";
          const role = isAdminEmail ? "admin" : "user";
          
          localStorage.setItem("bizarre_user_role", role);
          localStorage.setItem("bizarre_user_email", email);
          localStorage.setItem("bizarre_user_name", name);
          localStorage.setItem("bizarre_user_avatar", avatarUrl);
          
          syncUserFromStorage();
          window.dispatchEvent(new Event("bizarre_auth_change"));
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem("bizarre_user_role");
          localStorage.removeItem("bizarre_user_email");
          localStorage.removeItem("bizarre_user_name");
          localStorage.removeItem("bizarre_user_avatar");
          syncUserFromStorage();
          window.dispatchEvent(new Event("bizarre_auth_change"));
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Listen to other components changing authentication (e.g. locking component)
  useEffect(() => {
    window.addEventListener("bizarre_auth_change", syncUserFromStorage);
    return () => {
      window.removeEventListener("bizarre_auth_change", syncUserFromStorage);
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google login failed", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ Google OAuth: " + err.message);
    }
  };

  const handleMockGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockEmail) {
      alert("กรุณากรอกอีเมล!");
      return;
    }
    const name = mockName.trim() || "Gamer";
    const email = mockEmail.trim().toLowerCase();
    const isAdminEmail = email === "thaksin819@gmail.com";
    const role = isAdminEmail ? "admin" : "user";
    
    // Generate initials avatar using Dicebear
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;

    localStorage.setItem("bizarre_user_role", role);
    localStorage.setItem("bizarre_user_email", email);
    localStorage.setItem("bizarre_user_name", name);
    localStorage.setItem("bizarre_user_avatar", avatar);
    
    syncUserFromStorage();
    window.dispatchEvent(new Event("bizarre_auth_change"));
    setShowLoginModal(false);
    setMockEmail("");
    setMockName("");
    
    if (isAdminEmail) {
      alert("ยินดีต้อนรับผู้ดูแลระบบจำลอง (Admin Mode)!");
    } else {
      alert(`เข้าสู่ระบบในฐานะผู้ใช้ทั่วไปแล้ว: ${name}`);
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin") {
      localStorage.setItem("bizarre_user_role", "admin");
      localStorage.setItem("bizarre_user_name", "ผู้ดูแลระบบ (Admin)");
      localStorage.setItem("bizarre_user_email", "admin@bizarrebig.com");
      localStorage.setItem("bizarre_user_avatar", "");
      
      syncUserFromStorage();
      window.dispatchEvent(new Event("bizarre_auth_change"));
      setShowLoginModal(false);
      setAdminPassword("");
      setErrorMsg("");
      alert("ยินดีต้อนรับผู้ดูแลระบบ (Admin Passcode Auth)!");
    } else {
      setErrorMsg("รหัสผ่านไม่ถูกต้อง! ลองใช้อีกครั้ง");
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        alert("ออกจากระบบ Supabase เรียบร้อยแล้ว");
        return;
      }
    }
    
    // Handle offline sign out
    localStorage.removeItem("bizarre_user_role");
    localStorage.removeItem("bizarre_user_email");
    localStorage.removeItem("bizarre_user_name");
    localStorage.removeItem("bizarre_user_avatar");
    
    syncUserFromStorage();
    window.dispatchEvent(new Event("bizarre_auth_change"));
    alert("ออกจากระบบจำลองเรียบร้อยแล้ว");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.06] backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300">
              <span className="text-white text-base font-black tracking-tighter m-auto">B</span>
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-fuchsia-300 to-cyan-200 group-hover:from-white group-hover:to-cyan-200 transition-all duration-300">
              BizarreBig
            </span>
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {isMounted && (
              <>
                {isSupabaseConfigured ? (
                  <span className="hidden sm:inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 rounded-lg shadow-sm">
                    ⚡ เชื่อมต่อ Supabase แล้ว
                  </span>
                ) : (
                  <span className="hidden sm:inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/30 border border-amber-500/20 rounded-lg shadow-sm">
                    ⚠️ โหมดทดลอง (ออฟไลน์)
                  </span>
                )}
              </>
            )}

            {isMounted && (
              user ? (
                <div className="flex items-center gap-3">
                  {/* Admin Shortcut Button */}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="h-9 rounded-xl bg-violet-950/35 border border-violet-500/35 hover:border-violet-500/60 hover:bg-violet-950/50 text-violet-300 hover:text-white transition-all flex items-center gap-1.5 px-3.5 text-xs font-bold shadow-md shadow-violet-950/20 active:scale-[0.95]"
                      title="เข้าสู่ระบบจัดการหลังบ้าน"
                    >
                      <span>⚙️</span>
                      <span className="hidden md:inline">จัดการหลังบ้าน</span>
                    </Link>
                  )}

                  {/* Profile Details */}
                  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] p-1.5 pr-3.5 rounded-full shadow-inner">
                    {/* Avatar */}
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-7 h-7 rounded-full border border-violet-500/30 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white border border-violet-400/30">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Name and Badge */}
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] font-bold text-slate-200 line-clamp-1 max-w-[80px] sm:max-w-[120px]">
                        {user.name}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-wider ${
                        user.role === "admin" ? "text-violet-400" : "text-slate-400"
                      }`}>
                        {user.role === "admin" ? "แอดมิน 👑" : "ผู้ใช้ทั่วไป 🌐"}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="p-2 h-9 w-9 rounded-xl bg-slate-900 border border-white/[0.06] text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all flex items-center justify-center active:scale-[0.95]"
                    title="ออกจากระบบ"
                  >
                    🚪
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/30 shadow-md shadow-violet-900/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  เข้าสู่ระบบ 🔑
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowLoginModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-slate-950/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-fade-in z-10 overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Close Button */}
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <span className="text-white text-xl font-black">B</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                เข้าสู่ระบบ BizarreBig
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                เข้าใช้งานเพื่อปลดล็อกฟีเจอร์และแสดงความคิดเห็น
              </p>
            </div>

            <div className="space-y-5">
              {/* Google Login Section */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  บัญชี Google
                </label>
                
                {isSupabaseConfigured ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-all font-bold text-xs shadow-md active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.67 0 3.16.58 4.34 1.7l3.25-3.25C17.61 1.68 15.02 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.86 3C6.26 7.58 8.87 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.52z" />
                      <path fill="#FBBC05" d="M5.36 14.5c-.24-.73-.38-1.5-.38-2.3c0-.8.14-1.57.38-2.3L1.5 6.9C.54 8.82 0 10.97 0 13.2c0 2.23.54 4.38 1.5 6.3l3.86-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.3 1.09-4.3 1.09-3.13 0-5.74-2.54-6.69-5.46L1.45 16.3C3.35 20.15 7.32 23 12 23z" />
                    </svg>
                    <span>เข้าสู่ระบบด้วย Google 🌐</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-slate-900/60 border border-white/[0.04] p-4 space-y-3">
                    <span className="inline-block px-2 py-0.5 text-[8px] font-black uppercase text-amber-400 bg-amber-950/30 border border-amber-500/20 rounded-md">
                      ⚠️ โหมดทดลอง (ออฟไลน์)
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      ระบบ Supabase ยังไม่เชื่อมต่อ จะใช้การจำลองสิทธิ์แทน โปรดป้อนข้อมูลทดสอบด้านล่าง:
                    </p>
                    
                    <form onSubmit={handleMockGoogleLogin} className="space-y-2">
                      <input
                        type="text"
                        placeholder="ชื่อเล่นจำลอง (เช่น Thaksin)"
                        value={mockName}
                        onChange={(e) => setMockName(e.target.value)}
                        className="w-full h-8.5 px-3 rounded-lg bg-slate-950 border border-white/[0.08] text-[10px] text-slate-200 focus:outline-none focus:border-violet-500"
                      />
                      <input
                        type="email"
                        placeholder="อีเมล (ใส่ thaksin819@gmail.com เพื่อเป็น Admin)"
                        value={mockEmail}
                        onChange={(e) => setMockEmail(e.target.value)}
                        className="w-full h-8.5 px-3 rounded-lg bg-slate-950 border border-white/[0.08] text-[10px] text-slate-200 focus:outline-none focus:border-violet-500"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full h-9 mt-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all text-[10px] font-bold text-white shadow-md active:scale-[0.98]"
                      >
                        เข้าสู่ระบบ Google (จำลอง) 🌐
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]"></div>
                </div>
                <span className="relative px-3 text-[9px] font-bold text-slate-500 bg-slate-950 uppercase tracking-widest">
                  หรือใช้รหัสผ่าน
                </span>
              </div>

              {/* Passcode Login Section */}
              <form onSubmit={handlePasscodeLogin} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  รหัสผ่านผู้ดูแลระบบ (Admin Passcode)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่าน (เริ่มต้นคือ admin)..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-3.5 h-9 rounded-xl text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all border border-white/[0.06] active:scale-[0.98]"
                  >
                    เข้าใช้งาน 🔑
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-[9px] text-rose-400 font-medium animate-pulse">{errorMsg}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

