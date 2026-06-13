"use client";

import React, { useState, useEffect } from "react";
import { Item } from "@/data/items";
import { Navbar } from "./Navbar";
import { CommentSection } from "./CommentSection";
import { AdminConfigViewer } from "./AdminConfigViewer";
import Link from "next/link";

interface OfflineItemDetailFallbackProps {
  id: string;
}

export function OfflineItemDetailFallback({ id }: OfflineItemDetailFallbackProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [highlightHtml, setHighlightHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOfflineItem = async () => {
      setLoading(true);
      const offlineItemsStr = localStorage.getItem("bizarre_items");
      if (offlineItemsStr) {
        try {
          const offlineItems = JSON.parse(offlineItemsStr) as (Item & { highlightHtml?: string })[];
          const found = offlineItems.find((i) => i.id === id);
          if (found) {
            setItem(found);
            
            // Check if highlight html already exists
            if (found.highlightHtml) {
              setHighlightHtml(found.highlightHtml);
            } else {
              // Highlight code using highlight API
              try {
                const res = await fetch("/api/highlight", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    code: found.highlightCode,
                    lang: found.highlightLanguage
                  })
                });
                const data = await res.json();
                if (data.success) {
                  setHighlightHtml(data.html);
                } else {
                  setHighlightHtml(`<pre><code>${found.highlightCode}</code></pre>`);
                }
              } catch (e) {
                setHighlightHtml(`<pre><code>${found.highlightCode}</code></pre>`);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load offline item", e);
        }
      }
      setLoading(false);
    };

    loadOfflineItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#02040a]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">กำลังดึงข้อมูลออฟไลน์...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen bg-[#02040a]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-panel max-w-md w-full p-8 text-center border border-slate-900 rounded-3xl relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-violet-500/10 rounded-3xl -z-10 blur-xl opacity-30" />
            <span className="text-5xl mb-4 block">🔍</span>
            <h1 className="text-xl font-bold text-white mb-2">ไม่พบข้อมูลเนื้อหา</h1>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              เนื้อหาที่คุณกำลังพยายามเข้าถึง ไม่มีอยู่ในระบบออนไลน์ หรืออาจถูกลบไปแล้วจากเบราว์เซอร์ของคุณในโหมดออฟไลน์
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all border border-violet-500/20 active:scale-[0.98]"
            >
              ← กลับสู่หน้าสารบัญหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    Trending: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    New: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Popular: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const typeIcons = {
    game: "🎮",
    anime: "✨",
    movie: "🎬",
    other: "📁",
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#02040a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Navigation Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <Link href="/" className="hover:text-violet-400 transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-slate-400">
            {item.tags.filter(t => ["เกม", "อนิเมะ", "ภาพยนตร์", "ภาพยนต์"].includes(t)).join(" & ") || 
              (item.type === "game" ? "เกม" : item.type === "anime" ? "อนิเมะ" : item.type === "movie" ? "ภาพยนตร์" : "อื่นๆ")}
          </span>
          <span>/</span>
          <span className="text-violet-300 line-clamp-1">{item.title}</span>
        </nav>

        {/* Dynamic 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Area */}
          <article className="lg:col-span-2 space-y-6">
            {/* Cover Banner Image */}
            {item.image && (
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/[0.06] bg-slate-950 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 z-10" />
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Core Info Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {item.category && item.category !== "General" && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-violet-950/40 border border-violet-500/30 text-violet-300 tracking-wider uppercase">
                    {item.category}
                  </span>
                )}
                {item.status && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                )}
                {item.publishedAt && (
                  <span className="text-xs text-slate-500 font-bold">เผยแพร่: {new Date(item.publishedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/30 text-amber-400 border border-amber-500/20">
                  ⚠️ โหมดทดลอง (ออฟไลน์)
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Description Paragraph (WYSIWYG Rich Text HTML) */}
            <div className="space-y-4 text-sm leading-relaxed font-sans">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-white/[0.04] pb-2">เนื้อหาบทความ</h2>
              <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: item.description }} />
            </div>

            {/* Tags Grid */}
            <div className="flex flex-wrap gap-2 pt-2">
              {item.tags.map((tag) => (
                <span 
                  key={tag}
                  className="text-[10px] font-bold px-3 py-1 rounded-lg bg-slate-950 border border-white/[0.04] text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Shiki Code Viewer / Specs Section */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  รายละเอียดคอนฟิกและข้อมูลสเปกเทคนิค (Tech Specs / Config)
                </h2>
              </div>
              
              <AdminConfigViewer 
                highlightHtml={highlightHtml}
                highlightLanguage={item.highlightLanguage}
                code={item.highlightCode}
              />
            </section>

            {/* Interactive Comment System */}
            <CommentSection itemId={item.id} />
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/[0.06] bg-slate-950/20">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/[0.04] pb-3.5">
                <span>💡 ข้อมูลเพิ่มเติมออฟไลน์</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                บล็อกนี้บันทึกอยู่ในหน่วยความจำ LocalStorage ของคุณ ซึ่งแสดงผลได้เฉพาะในเครื่องนี้เท่านั้น หากผูกเชื่อมฐานข้อมูล Supabase จะสามารถซิงก์ข้อมูลขึ้นคลาวด์เพื่อแสดงผลให้ทุกคนเห็นได้ทั่วโลก
              </p>
            </div>

          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 bg-slate-950/20 text-center mt-20">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} BizarreBig.
        </p>
      </footer>
    </div>
  );
}
