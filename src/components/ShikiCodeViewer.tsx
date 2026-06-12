import { codeToHtml } from 'shiki';

interface ShikiCodeViewerProps {
  code: string;
  lang: string;
}

export async function ShikiCodeViewer({ code, lang }: ShikiCodeViewerProps) {
  try {
    const html = await codeToHtml(code, {
      lang: lang,
      theme: 'github-dark',
    });

    return (
      <div 
        className="shiki-viewer rounded-xl overflow-x-auto p-4 bg-slate-950/80 border border-slate-800/80 text-sm font-mono leading-relaxed max-h-[300px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    console.error('Shiki highlighting failed:', error);
    return (
      <pre className="rounded-xl overflow-x-auto p-4 bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300 max-h-[300px]">
        <code>{code}</code>
      </pre>
    );
  }
}
