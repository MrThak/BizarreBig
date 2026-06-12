import { NextResponse } from "next/server";
import { codeToHtml } from "shiki";

export async function POST(request: Request) {
  try {
    const { code, lang } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Code is required" },
        { status: 400 }
      );
    }

    const targetLang = lang || "json";
    let highlightHtml = "";
    
    try {
      highlightHtml = await codeToHtml(code, {
        lang: targetLang,
        theme: "github-dark",
      });
    } catch (err) {
      console.error(`Shiki highlight API error for lang: ${targetLang}`, err);
      highlightHtml = `<pre><code>${code}</code></pre>`;
    }

    return NextResponse.json({
      success: true,
      html: highlightHtml
    });
  } catch (error: any) {
    console.error("API Highlight error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
