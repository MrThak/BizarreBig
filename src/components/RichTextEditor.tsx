"use client";

import React, { useRef, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content once, using a ref so we don't trigger unnecessary resets during typing
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "<p><br></p>";
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // If editor becomes completely empty, set a default paragraph tag
      if (html === "" || html === "<br>") {
        onChange("<p><br></p>");
      } else {
        onChange(html);
      }
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    // Focus the editor first to ensure command is executed in context
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Capture pastes of images or texts
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        hasImage = true;
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            // Insert image inline
            executeCommand("insertImage", base64);
          };
          reader.readAsDataURL(file);
        }
      }
    }

    if (hasImage) {
      // Prevent standard pasting if an image was handled
      e.preventDefault();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        executeCommand("insertImage", base64);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so same file can be uploaded again
    e.target.value = "";
  };

  return (
    <div className="border border-white/[0.08] rounded-2xl bg-slate-900/60 overflow-hidden flex flex-col text-xs focus-within:border-violet-500/50 transition-all duration-300">
      
      {/* CSS injection for styling contenteditable img dynamically */}
      <style dangerouslySetInnerHTML={{ __html: `
        .editable-area img {
          max-width: 100%;
          max-height: 280px;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin: 1rem auto;
          display: block;
        }
        .editable-area {
          outline: none;
        }
        .editable-area ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .editable-area ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .editable-area blockquote {
          border-left: 3px solid #a78bfa;
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          color: #94a3b8;
          font-style: italic;
        }
      `}} />

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950/80 border-b border-white/[0.06] text-slate-300">
        
        {/* Basic Text Formats */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="p-1 hover:bg-slate-800 rounded font-bold hover:text-white transition-all w-8 h-8 flex items-center justify-center border border-white/5 active:scale-95"
          title="ตัวหนา (Bold)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="p-1 hover:bg-slate-800 rounded italic hover:text-white transition-all w-8 h-8 flex items-center justify-center border border-white/5 active:scale-95"
          title="ตัวเอียง (Italic)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="p-1 hover:bg-slate-800 rounded underline hover:text-white transition-all w-8 h-8 flex items-center justify-center border border-white/5 active:scale-95"
          title="ขีดเส้นใต้ (Underline)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => executeCommand("strikeThrough")}
          className="p-1 hover:bg-slate-800 rounded line-through hover:text-white transition-all w-8 h-8 flex items-center justify-center border border-white/5 active:scale-95"
          title="ขีดฆ่า (Strikethrough)"
        >
          S
        </button>

        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        {/* List formatting */}
        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-1 hover:bg-slate-800 rounded hover:text-white transition-all px-2 h-8 flex items-center justify-center border border-white/5 active:scale-95 font-semibold text-[10px]"
          title="รายการหัวข้อ (Bullet List)"
        >
          • รายการ
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="p-1 hover:bg-slate-800 rounded hover:text-white transition-all px-2 h-8 flex items-center justify-center border border-white/5 active:scale-95 font-semibold text-[10px]"
          title="รายการตัวเลข (Numbered List)"
        >
          1. รายการ
        </button>

        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        {/* Quotes & Links */}
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
          className="p-1 hover:bg-slate-800 rounded hover:text-white transition-all px-2 h-8 flex items-center justify-center border border-white/5 active:scale-95 font-semibold text-[10px]"
          title="อัญพจน์/คำพูด (Blockquote)"
        >
          ” อ้างอิง
        </button>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt("กรุณาระบุ URL สำหรับแทรกลิงก์:");
            if (url) executeCommand("createLink", url);
          }}
          className="p-1 hover:bg-slate-800 rounded hover:text-white transition-all px-2 h-8 flex items-center justify-center border border-white/5 active:scale-95 font-semibold text-[10px]"
          title="แทรกลิงก์ (Insert Link)"
        >
          🔗 ลิงก์
        </button>

        {/* Image insertion */}
        <label className="p-1 hover:bg-slate-800 rounded hover:text-white transition-all px-2.5 h-8 flex items-center justify-center border border-white/5 active:scale-95 font-semibold text-[10px] cursor-pointer">
          📷 แทรตรูปภาพ
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />
        </label>

        <span className="text-[10px] text-slate-500 ml-auto mr-1 hidden sm:inline">
          📋 สามารถกดวางภาพตรงๆ (Ctrl+V) เพื่ออัปโหลดด่วนได้เลย!
        </span>
      </div>

      {/* Editor Main Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="editable-area p-4 min-h-[300px] max-h-[600px] overflow-y-auto focus:outline-none text-slate-200 leading-relaxed font-sans text-sm"
        style={{ outline: "none" }}
      />
    </div>
  );
}
