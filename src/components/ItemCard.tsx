"use client";

import React from "react";
import Link from "next/link";
import { Item } from "@/data/items";

interface ItemCardProps {
  item: Item & { highlightHtml?: string };
}

function stripHtml(html: string): string {
  if (!html) return "";
  // Simple regex to remove HTML tags cleanly
  return html.replace(/<[^>]*>/g, "");
}

export function ItemCard({ item }: ItemCardProps) {
  // Status colors mapping
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
    <div className="group relative glass-card rounded-2xl flex flex-col justify-between overflow-hidden border border-white/[0.04] bg-slate-950/40">
      {/* Absolute glow following item's category color tone */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-r from-violet-600/15 to-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10 group-hover:scale-150 transition-transform duration-700" />

      <div>
        {/* Cover Image Block */}
        {item.image && (
          <Link href={`/items/${item.id}`} className="relative w-full h-44 overflow-hidden border-b border-white/[0.04] bg-slate-950 block">
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/35 z-10" />
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
            />
            {/* Badges layered over image */}
            <div className="absolute top-3 left-3 z-20 flex gap-2">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/60 border border-white/10 text-slate-100 flex items-center gap-1 backdrop-blur-md">
                <span>{typeIcons[item.type] || "📁"}</span>
                <span>
                  {item.tags.filter(t => ["เกม", "อนิเมะ", "ภาพยนตร์", "ภาพยนต์"].includes(t)).join(" & ") || 
                    (item.type === "game" ? "เกม" : item.type === "anime" ? "อนิเมะ" : item.type === "movie" ? "ภาพยนตร์" : "อื่นๆ")}
                </span>
              </span>
            </div>
            
            <div className="absolute top-3 right-3 z-20">
              <span className={`text-[10px] font-bold px-2 py-1 rounded border backdrop-blur-md bg-black/40 ${statusColors[item.status]}`}>
                {item.status}
              </span>
            </div>
          </Link>
        )}

        <div className="p-5">
          {/* Title & Metadata */}
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors duration-200 line-clamp-1">
            <Link href={`/items/${item.id}`}>
              {item.title}
            </Link>
          </h3>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
            {item.category && item.category !== "General" && (
              <>
                <span className="text-cyan-400">{item.category}</span>
                {item.publishedAt && <span>•</span>}
              </>
            )}
            {item.publishedAt && (
              <span>เผยแพร่ {new Date(item.publishedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
            {stripHtml(item.description)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950/60 border border-white/[0.04] text-slate-400 group-hover:text-slate-300 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer link to detail page */}
      <div className="px-5 pb-5 mt-auto">
        <Link
          href={`/items/${item.id}`}
          className="w-full py-2 px-3.5 rounded-xl text-[11px] font-bold flex items-center justify-between border bg-slate-950/60 hover:bg-slate-900 border-white/[0.06] hover:border-slate-700/80 text-slate-300 hover:text-white transition-all duration-300"
        >
          <span>🔍 อ่านรายละเอียดและรีวิว</span>
          <span className="text-[9px] text-slate-500 font-mono font-bold tracking-wider">{item.highlightLanguage.toUpperCase()}</span>
        </Link>
      </div>
    </div>
  );
}
