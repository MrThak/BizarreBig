import React from "react";
import { codeToHtml } from "shiki";
import { items, Item } from "@/data/items";
import { Navbar } from "@/components/Navbar";
import { CommentSection } from "@/components/CommentSection";
import { AdminConfigViewer } from "@/components/AdminConfigViewer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = items.find((i) => i.id === id);
  if (!item) {
    return {
      title: "ไม่พบข้อมูล | BizarreBig",
    };
  }
  return {
    title: `${item.title} - รายละเอียด รีวิว และสเปกเทคนิค | BizarreBig`,
    description: item.description,
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = items.find((i) => i.id === id);

  if (!item) {
    notFound();
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

  // Recommendations: 3 items of same type, excluding current one
  const recommendations = items
    .filter((i) => i.type === item.type && i.id !== item.id)
    .slice(0, 3);

  const statusColors = {
    Trending: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    New: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Popular: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

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
            {item.type === "game" ? "เกม" : "อนิเมะ"}
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
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-violet-950/40 border border-violet-500/30 text-violet-300 tracking-wider uppercase">
                  {item.category}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${statusColors[item.status]}`}>
                  {item.status}
                </span>
                <span className="text-xs text-slate-500 font-bold">ปีที่เปิดตัว: {item.releaseYear}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {item.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
                <div className="flex text-amber-400 text-sm">
                  {"★".repeat(Math.round(item.rating / 2))}
                  {"☆".repeat(5 - Math.round(item.rating / 2))}
                </div>
                <span className="text-sm font-bold text-slate-200">{item.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/ 10 คะแนนผู้เล่น</span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">บทนำรีวิวและประเด็นเด่น</h2>
              <p className="whitespace-pre-wrap">{item.description}</p>
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
                          <span className="text-amber-400 text-[10px]">★</span>
                          <span className="text-[10px] font-semibold text-slate-400">{rec.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 text-center py-4">ไม่มีรายการแนะนำเพิ่มเติม</p>
                )}
              </div>
            </div>

            {/* Quick Helper Panel */}
            <div className="p-6 rounded-3xl border border-white/[0.04] bg-slate-950/10 text-xs text-slate-500 space-y-3">
              <h3 className="font-bold text-slate-400">💡 คำแนะนำการใช้งาน</h3>
              <p className="leading-relaxed">
                ข้อมูลสเปกและความต้องการของระบบข้างต้นเป็นเพียงข้อมูลอ้างอิงเบื้องต้นจากผู้ผลิต คุณสามารถคอมเมนต์แชร์การตั้งค่าหรือสเปกที่คุ้มค่ากว่าเพิ่มเติมได้ที่กล่องข้อความด้านล่าง
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 gap-1 pt-1.5 transition-colors"
              >
                ← กลับสู่หน้าหลักสารบัญ
              </Link>
            </div>
          </aside>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 bg-slate-950/20 text-center mt-20">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} BizarreBig. สร้างสรรค์ด้วยความหลงใหลในเกมและอนิเมะ
        </p>
      </footer>
    </div>
  );
}
