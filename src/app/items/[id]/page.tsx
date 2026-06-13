import React from "react";
import { codeToHtml } from "shiki";
import { items, Item, mapDbItemToItem } from "@/data/items";
import { Navbar } from "@/components/Navbar";
import { CommentSection } from "@/components/CommentSection";
import { AdminConfigViewer } from "@/components/AdminConfigViewer";
import { OfflineItemDetailFallback } from "@/components/OfflineItemDetailFallback";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";
import Link from "next/link";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let item = items.find((i) => i.id === id);

  if (!item && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();
        
      if (data && !error) {
        item = mapDbItemToItem(data);
      }
    } catch (e) {
      console.error("SEO Metadata: Error loading item from Supabase:", e);
    }
  }

  if (!item) {
    return {
      title: "รายละเอียดเนื้อหา | BizarreBig",
    };
  }

  return {
    title: `${item.title} - รายละเอียด รีวิว และสเปกเทคนิค | BizarreBig`,
    description: item.description,
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  let item = items.find((i) => i.id === id);

  // ดึงข้อมูลสดจาก Supabase หากเชื่อมต่อฐานข้อมูล
  if (!item && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();
        
      if (data && !error) {
        item = mapDbItemToItem(data);
      }
    } catch (e) {
      console.error("Error loading item from Supabase server side:", e);
    }
  }

  // หากไม่พบไอเทมในทั้งโค้ด Static และ Supabase ให้ใช้ Fallback Client-side เช็ก LocalStorage
  if (!item) {
    return <OfflineItemDetailFallback id={id} />;
  }

  // Generate syntax highlighted html for the code block
  let highlightHtml = "";
  try {
    highlightHtml = await codeToHtml(item.highlightCode, {
      lang: item.highlightLanguage,
      theme: "github-dark",
    });
  } catch (err) {
    console.error("Failed to highlight code for item detail page", err);
    highlightHtml = `<pre><code>${item.highlightCode}</code></pre>`;
  }

  // Helper to check if two items share any main classification category
  const sharesMainType = (a: Item, b: Item) => {
    const mainTags = ["เกม", "อนิเมะ", "ภาพยนตร์", "ภาพยนต์"];
    const aMain = a.tags.filter(t => mainTags.includes(t));
    const bMain = b.tags.filter(t => mainTags.includes(t));
    const hasSharedTag = aMain.some(t => bMain.includes(t));
    return hasSharedTag || a.type === b.type;
  };

  // Recommendations: 3 items of same type, excluding current one
  const recommendations = items
    .filter((i) => sharesMainType(item, i) && i.id !== item.id)
    .slice(0, 3);

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

  // Extract combined category names for breadcrumb
  const breadcrumbCategory = item.tags.filter(t => ["เกม", "อนิเมะ", "ภาพยนตร์", "ภาพยนต์"].includes(t)).join(" & ") || 
    (item.type === "game" ? "เกม" : item.type === "anime" ? "อนิเมะ" : item.type === "movie" ? "ภาพยนตร์" : "อื่นๆ");

  return (
    <div className="flex flex-col min-h-screen bg-[#02040a]">
      {/* Sticky header navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Navigation Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <Link href="/" className="hover:text-violet-400 transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-slate-400">
            {breadcrumbCategory}
          </span>
          <span>/</span>
          <span className="text-violet-300 line-clamp-1">{item.title}</span>
        </nav>

        {/* Dynamic 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content Area (Left / Column span 2) */}
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
                {isSupabaseConfigured && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                    ● Live ฐานข้อมูลจริง
                  </span>
                )}
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

            {/* Shiki Code Viewer / Specs Section — แสดงเฉพาะแอดมิน */}
            <AdminConfigViewer 
              highlightHtml={highlightHtml}
              highlightLanguage={item.highlightLanguage}
              code={item.highlightCode}
            />

            {/* Interactive Comment System */}
            <CommentSection itemId={item.id} />
          </article>

          {/* Sidebar / Recommended Contents Area (Right / Column span 1) */}
          <aside className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/[0.06] bg-slate-950/20">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/[0.04] pb-3.5">
                <span>📚 คอนเทนต์อื่น ๆ แนะนำ</span>
              </h2>

              <div className="space-y-5">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <Link 
                      href={`/items/${rec.id}`}
                      key={rec.id}
                      className="group flex gap-3.5 items-start p-2.5 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all duration-300"
                    >
                      {/* Thumbnail image */}
                      {rec.image && (
                        <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/[0.04] bg-slate-950 shrink-0 relative">
                          <img 
                            src={rec.image} 
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Detail Text */}
                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wide">
                          {rec.category}
                        </span>
                        <h3 className="text-xs font-bold text-slate-200 group-hover:text-violet-300 transition-colors duration-200 line-clamp-1">
                          {rec.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {rec.publishedAt ? (
                            <span className="text-[10px] text-slate-500">{new Date(rec.publishedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' })}</span>
                          ) : (
                            <span className="text-[10px] text-slate-600">—</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 text-center py-4">ไม่มีรายการแนะนำเพิ่มเติม</p>
                )}
              </div>
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
