import fs from "fs";
import path from "path";
import { codeToHtml } from "shiki";
import { Navbar } from "@/components/Navbar";
import { MainCatalog } from "@/components/MainCatalog";
import { items } from "@/data/items";

// Force dynamic execution or let it statically generate if needed, but since it reads content.md, SSR is fine
export const revalidate = 3600; // Cache page for 1 hour

export default async function Home() {
  // 1. Process items and syntax-highlight their code blocks on the server
  const itemsWithHighlight = await Promise.all(
    items.map(async (item) => {
      let highlightHtml = "";
      try {
        highlightHtml = await codeToHtml(item.highlightCode, {
          lang: item.highlightLanguage,
          theme: "github-dark",
        });
      } catch (err) {
        console.error(`Error highlighting code for item: ${item.id}`, err);
        highlightHtml = `<pre><code>${item.highlightCode}</code></pre>`;
      }
      return {
        ...item,
        highlightHtml,
      };
    })
  );

  // 2. Read the local content.md file and highlight its markdown on the server
  let contentMdHtml = "";
  let contentMdRaw = "";
  try {
    const filePath = path.join(process.cwd(), "content.md");
    contentMdRaw = fs.readFileSync(filePath, "utf8");
    contentMdHtml = await codeToHtml(contentMdRaw, {
      lang: "markdown",
      theme: "github-dark",
    });
  } catch (err) {
    console.error("Error reading or highlighting content.md", err);
    contentMdHtml = `<pre><code>Failed to load content.md</code></pre>`;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#060913]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Interactive Catalog (Hero + Search + Grid) */}
      <MainCatalog initialItems={itemsWithHighlight} />

      {/* Developer Section: content.md Viewer */}
      <section id="roadmap" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900/80 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-xl font-bold text-white">คู่มือระบบ & แผนผังการพัฒนา (content.md)</h2>
              <p className="text-xs text-slate-500">
                ไฟล์คู่มือควบคุมทิศทางเว็บไซต์ การเพิ่ม/แก้ไขฟีเจอร์ และคู่มือการย้ายโฟลเดอร์ทำงาน (Migration Path)
              </p>
            </div>
          </div>

          {/* Premium Code Display for content.md */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/80 shadow-2xl">
            {/* Window controls bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-slate-800/50">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">content.md</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">MARKDOWN • SHIKI HIGHLIGHT</span>
            </div>

            {/* Code Body */}
            <div 
              className="p-6 overflow-x-auto max-h-[500px] text-sm font-mono leading-relaxed text-slate-300 scrollbar-thin"
              dangerouslySetInnerHTML={{ __html: contentMdHtml }}
            />
          </div>

          {/* Quick Notice */}
          <div className="mt-4 p-4 rounded-xl bg-violet-950/10 border border-violet-900/20 text-xs text-violet-400 leading-relaxed">
            💡 <strong>เกร็ดความรู้:</strong> คุณสามารถแก้ไขไฟล์ <code className="text-white font-mono bg-violet-950/40 px-1 rounded">content.md</code> ที่เครื่องของคุณเพื่อปรับทิศทางของโปรเจกต์ หรือปฏิบัติตามคำแนะนำในการย้ายโฟลเดอร์ไปยัง <code className="text-white font-mono bg-violet-950/40 px-1 rounded">F:\\BizarreBig</code> ได้ตลอดเวลา
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900/80 py-8 bg-slate-950/20 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} BizarreBig Hub. สร้างสรรค์ด้วยความหลงใหลในเกมและอนิเมะ
        </p>
      </footer>
    </div>
  );
}
