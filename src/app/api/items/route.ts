import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";
import { mapDbItemToItem, items as staticItems } from "@/data/items";
import { codeToHtml } from "shiki";

export const revalidate = 0; // Disable cache for this dynamic API route

export async function GET() {
  try {
    let itemsToProcess = [];
    let categoriesList = [];

    if (isSupabaseConfigured) {
      // 1. Fetch items
      const { data: dbItems, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (itemsError) {
        console.error("Failed to fetch items from Supabase in API:", itemsError);
      }

      if (dbItems && dbItems.length > 0) {
        itemsToProcess = dbItems.map(mapDbItemToItem);
      } else {
        itemsToProcess = staticItems;
      }

      // 2. Fetch categories
      const { data: dbCategories, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (catError) {
        console.error("Failed to fetch categories from Supabase in API:", catError);
      } else if (dbCategories) {
        categoriesList = dbCategories;
      }
    } else {
      // โหมดออฟไลน์
      itemsToProcess = staticItems;
    }

    // ทำ Syntax Highlight ให้โค้ดสเปกแต่ละรายการผ่าน Shiki บนเซิร์ฟเวอร์
    const itemsWithHighlight = await Promise.all(
      itemsToProcess.map(async (item) => {
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

    return NextResponse.json({
      success: true,
      items: itemsWithHighlight,
      categories: categoriesList,
      isOffline: !isSupabaseConfigured
    });
  } catch (error: any) {
    console.error("API Items error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
