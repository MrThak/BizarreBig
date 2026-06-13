import { Navbar } from "@/components/Navbar";
import { MainCatalog } from "@/components/MainCatalog";
import { items } from "@/data/items";
import { codeToHtml } from "shiki";

export const revalidate = 3600; // Cache page for 1 hour

export default async function Home() {
  // Process items and syntax-highlight their code blocks on the server
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

  return (
    <div className="flex flex-col min-h-screen bg-[#060913]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Interactive Catalog (Hero + Search + Grid) */}
      <MainCatalog initialItems={itemsWithHighlight} />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900/80 py-8 bg-slate-950/20 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} BizarreBig Hub.
        </p>
      </footer>
    </div>
  );
}
