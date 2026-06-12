"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Item, mapItemToDbItem, items as staticItems } from "@/data/items";
import { Navbar } from "@/components/Navbar";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "tags">("items");

  // Data states
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // Item Form Fields
  const [itemId, setItemId] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  
  // Tag-based selection fields
  const [hasGameTag, setHasGameTag] = useState(true);
  const [hasAnimeTag, setHasAnimeTag] = useState(false);
  const [hasMovieTag, setHasMovieTag] = useState(false);
  const [otherTagsInput, setOtherTagsInput] = useState("");

  const [itemRating, setItemRating] = useState(9.0);
  const [itemDescription, setItemDescription] = useState("");
  const [itemStatus, setItemStatus] = useState<"Trending" | "New" | "Popular">("New");
  const [itemReleaseYear, setItemReleaseYear] = useState(new Date().getFullYear());
  const [itemBgGradient, setItemBgGradient] = useState("from-violet-950/40 via-purple-950/20 to-slate-950");
  const [itemImage, setItemImage] = useState("");
  const [itemHighlightLanguage, setItemHighlightLanguage] = useState("json");
  const [itemHighlightCode, setItemHighlightCode] = useState("");

  const checkAuth = () => {
    const role = localStorage.getItem("bizarre_user_role");
    const email = localStorage.getItem("bizarre_user_email") || "";
    setIsAdmin(role === "admin" || email.toLowerCase() === "thaksin819@gmail.com");
  };

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
    window.addEventListener("bizarre_auth_change", checkAuth);
    return () => {
      window.removeEventListener("bizarre_auth_change", checkAuth);
    };
  }, []);

  // Fetch items list
  const fetchData = async () => {
    if (!isAdmin) return;

    try {
      if (isSupabaseConfigured) {
        const { data: dbItems, error: itemErr } = await supabase
          .from("items")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (itemErr) {
          console.warn("Supabase query failed, falling back to offline mode:", itemErr);
          setDbError("ตาราง 'items' ยังไม่ได้สร้างในระบบ Supabase กรุณารันสคริปต์ SQL บนแดชบอร์ดของคุณเพื่อใช้งานระบบเชื่อมต่อคลาวด์");
          loadOfflineData();
          return;
        }

        setDbError(null); // Clear error since query succeeded

        if (dbItems) {
          const formattedItems = dbItems.map((item: any) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            category: item.category,
            rating: Number(item.rating),
            description: item.description,
            tags: item.tags || [],
            status: item.status,
            releaseYear: item.release_year,
            highlightCode: item.highlight_code,
            highlightLanguage: item.highlight_language,
            bgGradient: item.bg_gradient,
            image: item.image,
          }));
          setItemsList(formattedItems);
        }
      } else {
        loadOfflineData();
      }
    } catch (e: any) {
      console.error("Failed to fetch admin dashboard data", e);
      setDbError(e.message || "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
      loadOfflineData();
    }
  };

  const loadOfflineData = () => {
    const savedItems = localStorage.getItem("bizarre_items");
    if (savedItems) {
      setItemsList(JSON.parse(savedItems));
    } else {
      setItemsList(staticItems);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Dynamic tags analysis for the tags tab
  const systemTags = useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    itemsList.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'th'));
  }, [itemsList]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin") {
      localStorage.setItem("bizarre_user_role", "admin");
      localStorage.setItem("bizarre_user_email", "admin@bizarrebig.com");
      localStorage.setItem("bizarre_user_name", "ผู้ดูแลระบบ (Admin)");
      setIsAdmin(true);
      setPasscode("");
      setPasscodeError("");
      window.dispatchEvent(new Event("bizarre_auth_change"));
      alert("ยินดีต้อนรับผู้ดูแลระบบ! (รหัสผ่านถูกต้อง)");
    } else {
      setPasscodeError("รหัสผ่านไม่ถูกต้อง! ลองอีกครั้ง");
    }
  };

  const openItemModal = (item: Item | null = null) => {
    const mainTypeTags = ["เกม", "game", "games", "อนิเมะ", "anime", "animes", "ภาพยนตร์", "ภาพยนต์", "movie", "movies"];
    
    if (item) {
      setEditingItem(item);
      setItemId(item.id);
      setItemTitle(item.title);
      
      // Check main tags existence
      const lowerTags = item.tags.map(t => t.toLowerCase().trim());
      setHasGameTag(lowerTags.includes("เกม") || lowerTags.includes("game") || lowerTags.includes("games"));
      setHasAnimeTag(lowerTags.includes("อนิเมะ") || lowerTags.includes("anime") || lowerTags.includes("animes"));
      setHasMovieTag(lowerTags.includes("ภาพยนตร์") || lowerTags.includes("ภาพยนต์") || lowerTags.includes("movie") || lowerTags.includes("movies"));
      
      // Filter out main tags for the text input
      const filteredOther = item.tags.filter(t => !mainTypeTags.includes(t.toLowerCase().trim()));
      setOtherTagsInput(filteredOther.join(", "));

      setItemRating(item.rating);
      setItemDescription(item.description);
      setItemStatus(item.status);
      setItemReleaseYear(item.releaseYear);
      setItemBgGradient(item.bgGradient || "from-violet-950/40 via-purple-950/20 to-slate-950");
      setItemImage(item.image || "");
      setItemHighlightLanguage(item.highlightLanguage || "json");
      setItemHighlightCode(item.highlightCode || "");
    } else {
      setEditingItem(null);
      setItemId("");
      setItemTitle("");
      setHasGameTag(true);
      setHasAnimeTag(false);
      setHasMovieTag(false);
      setOtherTagsInput("");
      setItemRating(9.0);
      setItemDescription("");
      setItemStatus("New");
      setItemReleaseYear(new Date().getFullYear());
      setItemBgGradient("from-amber-900/40 via-yellow-950/20 to-slate-950");
      setItemImage("");
      setItemHighlightLanguage("json");
      setItemHighlightCode("");
    }
    setShowItemModal(true);
  };

  const handleMainTagToggle = (tag: "game" | "anime" | "movie") => {
    if (tag === "game") {
      setHasGameTag(!hasGameTag);
      if (!hasGameTag) {
        setItemBgGradient("from-amber-900/40 via-yellow-950/20 to-slate-950");
      }
    } else if (tag === "anime") {
      setHasAnimeTag(!hasAnimeTag);
      if (!hasAnimeTag) {
        setItemBgGradient("from-rose-950/40 via-red-950/20 to-slate-950");
      }
    } else if (tag === "movie") {
      setHasMovieTag(!hasMovieTag);
      if (!hasMovieTag) {
        setItemBgGradient("from-cyan-950/40 via-blue-950/20 to-slate-950");
      }
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId.trim() || !itemTitle.trim()) {
      alert("กรุณากรอกไอดี URL และชื่อหัวข้อ!");
      return;
    }

    // Combine main tags and typed tags
    const finalTags: string[] = [];
    if (hasGameTag) finalTags.push("เกม");
    if (hasAnimeTag) finalTags.push("อนิเมะ");
    if (hasMovieTag) finalTags.push("ภาพยนตร์");

    const splitOthers = otherTagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    splitOthers.forEach((tag) => {
      // Avoid duplicate tags
      if (!finalTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        finalTags.push(tag);
      }
    });

    // Derive type and category columns for DB schema constraints
    let derivedType: 'game' | 'anime' | 'movie' | 'other' = 'other';
    if (hasGameTag) derivedType = 'game';
    else if (hasAnimeTag) derivedType = 'anime';
    else if (hasMovieTag) derivedType = 'movie';

    const derivedCategory = splitOthers[0] || "General";

    // Call API /api/highlight to pre-highlight code
    let highlightHtml = "";
    try {
      const res = await fetch("/api/highlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: itemHighlightCode,
          lang: itemHighlightLanguage
        })
      });
      const resData = await res.json();
      if (resData.success) {
        highlightHtml = resData.html;
      }
    } catch (err) {
      console.error("Failed to generate code highlight dynamically", err);
    }

    const itemData: Item & { highlightHtml?: string } = {
      id: itemId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
      type: derivedType,
      title: itemTitle.trim(),
      category: derivedCategory,
      rating: Number(itemRating),
      description: itemDescription.trim(),
      tags: finalTags,
      status: itemStatus,
      releaseYear: Number(itemReleaseYear),
      bgGradient: itemBgGradient.trim(),
      image: itemImage.trim(),
      highlightLanguage: itemHighlightLanguage,
      highlightCode: itemHighlightCode.trim(),
      highlightHtml: highlightHtml || undefined
    };

    if (isSupabaseConfigured && !dbError) {
      try {
        const dbReadyItem = mapItemToDbItem(itemData);
        
        let error;
        if (editingItem) {
          const { error: err } = await supabase
            .from("items")
            .update(dbReadyItem)
            .eq("id", editingItem.id);
          error = err;
        } else {
          const { error: err } = await supabase
            .from("items")
            .insert([dbReadyItem]);
          error = err;
        }

        if (error) throw error;
        alert(editingItem ? "แก้ไขเนื้อหาบนฐานข้อมูลสำเร็จ! ✨" : "สร้างเนื้อหาใหม่บนฐานข้อมูลสำเร็จ! ➕");
      } catch (err: any) {
        console.error("Error saving item to Supabase:", err);
        alert("บันทึกลง Supabase ล้มเหลว: " + err.message);
        return;
      }
    } else {
      // LocalStorage
      const currentOffline = localStorage.getItem("bizarre_items");
      let list: any[] = currentOffline ? JSON.parse(currentOffline) : [];
      
      if (editingItem) {
        list = list.filter((i) => i.id !== editingItem.id);
      } else {
        const exists = list.some((i) => i.id === itemData.id);
        if (exists) {
          alert("ไอดี URL นี้ซ้ำในระบบออฟไลน์ กรุณาใช้ไอดีอื่น!");
          return;
        }
      }

      list.unshift(itemData);
      localStorage.setItem("bizarre_items", JSON.stringify(list));
      alert(editingItem ? "แก้ไขเนื้อหาออฟไลน์สำเร็จ! ✨" : "สร้างเนื้อหาออฟไลน์สำเร็จ! ➕");
    }

    setShowItemModal(false);
    fetchData();
    window.dispatchEvent(new Event("bizarre_db_sync"));
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm(`คุณต้องการลบเนื้อหาไอดี "${id}" ใช่หรือไม่?`)) return;

    if (isSupabaseConfigured && !dbError) {
      try {
        const { error } = await supabase
          .from("items")
          .delete()
          .eq("id", id);

        if (error) throw error;
        alert("ลบเนื้อหาออกจากฐานข้อมูลสำเร็จ!");
      } catch (err: any) {
        console.error("Failed to delete item from Supabase:", err);
        alert("ลบล้มเหลว: " + err.message);
        return;
      }
    } else {
      const currentOffline = localStorage.getItem("bizarre_items");
      if (currentOffline) {
        const list = JSON.parse(currentOffline).filter((i: any) => i.id !== id);
        localStorage.setItem("bizarre_items", JSON.stringify(list));
        alert("ลบเนื้อหาออฟไลน์สำเร็จ!");
      }
    }

    fetchData();
    window.dispatchEvent(new Event("bizarre_db_sync"));
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#02040a]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Locked Overlay if user is not authorized
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-[#02040a]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="glass-panel max-w-md w-full p-8 text-center border border-white/[0.08] rounded-3xl relative shadow-[0_0_50px_rgba(244,63,94,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-violet-500/10 rounded-3xl -z-10 blur-xl opacity-30 animate-pulse" />
            <span className="text-5xl mb-4 block">🔒</span>
            <h1 className="text-lg font-black text-white uppercase tracking-wider mb-2">เข้าถึงแผงควบคุมหลักถูกจำกัด</h1>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              เฉพาะบัญชีผู้ดูแลระบบ (Admin) หรือผู้อัปโหลดบล็อกหลักที่ล็อกอินด้วยอีเมล <code className="text-white font-mono bg-violet-950/40 px-1 rounded">thaksin819@gmail.com</code> เท่านั้นจึงจะสามารถจัดการหลังบ้านได้
            </p>
            
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="กรอกรหัสผ่านผู้ดูแลระบบ (Passcode)..."
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all text-center"
                  required
                />
                {passcodeError && (
                  <p className="text-[10px] text-rose-400 mt-2 font-bold animate-pulse">{passcodeError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all border border-violet-500/20 active:scale-[0.98]"
              >
                เข้าสู่แผงควบคุมแอดมิน 🔑
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#02040a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-black text-white tracking-tight">แผงควบคุมผู้ดูแลระบบ (Admin CMS Dashboard)</h1>
              {isSupabaseConfigured && !dbError ? (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded-md">
                  LIVE DATABASE
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase text-amber-400 bg-amber-950/40 border border-amber-500/20 rounded-md">
                  OFFLINE CACHE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              จัดการเขียน แก้ไข และลบบล็อกบทความรีวิว รวมถึงดูจำนวนความนิยมของแท็กต่างๆ ในระบบได้อย่างอิสระ
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openItemModal()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/30 transition-all shadow-md active:scale-[0.98]"
            >
              เขียนบล็อก/รีวิวใหม่ ➕
            </button>
          </div>
        </div>

        {/* Supabase Table Missing Warning Banner */}
        {isSupabaseConfigured && dbError && (
          <div className="p-4 mb-6 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 leading-relaxed shadow-lg flex items-start gap-3.5 animate-fade-in">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wide">โครงสร้างตาราง Supabase ยังไม่เสร็จสมบูรณ์</h4>
              <p>
                ระบบตรวจพบการตั้งค่า Supabase URL และ Key แต่การดึงข้อมูลจากตารางขัดข้อง ({dbError})
              </p>
              <p className="text-slate-400 font-bold mt-1 text-[10px]">
                💡 วิธีแก้ไข: กรุณาคัดลอกสคริปต์ SQL จากไฟล์ <code className="text-white bg-slate-900 px-1 py-0.5 rounded font-mono">dynamic_schema.sql</code> ไปวางและรัน (Run) ใน SQL Editor ของ Supabase เพื่อเปิดใช้ระบบออนไลน์
              </p>
              <p className="text-emerald-400 font-black mt-1.5 text-[10px] uppercase">
                ⚙️ โหมดชั่วคราว: กำลังทำงานและเซฟข้อมูลในโหมดออฟไลน์ (LocalStorage) แทนชั่วคราวเพื่อป้องกันระบบขัดข้อง
              </p>
            </div>
          </div>
        )}

        {/* CMS Tabs */}
        <div className="flex border-b border-white/[0.04] mb-8">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "items"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📚 จัดการบล็อก/รีวิว ({itemsList.length})
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "tags"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🏷️ แท็กทั้งหมดในระบบ ({systemTags.length})
          </button>
        </div>

        {/* Tab content 1: ITEMS */}
        {activeTab === "items" && (
          <div className="space-y-6">
            <div className="glass-panel overflow-hidden border border-white/[0.06] rounded-3xl bg-slate-950/20">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-slate-300 text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">ปก</th>
                      <th className="px-6 py-4">ไอดี URL / ชื่อเรื่อง</th>
                      <th className="px-6 py-4">คะแนน</th>
                      <th className="px-6 py-4">แท็กทั้งหมด</th>
                      <th className="px-6 py-4">ป้ายสถานะ</th>
                      <th className="px-6 py-4">เปิดตัวปี</th>
                      <th className="px-6 py-4 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {itemsList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-3.5">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-12 h-8.5 rounded-lg border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-8.5 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] text-slate-600">
                              NO IMG
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-white leading-snug">{item.title}</span>
                            <span className="font-mono text-[9px] text-slate-500">{item.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-amber-400">{item.rating.toFixed(1)}</td>
                        <td className="px-6 py-3.5 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            item.status === "Trending" ? "bg-pink-950/40 text-pink-400 border border-pink-500/20" :
                            item.status === "Popular" ? "bg-amber-950/40 text-amber-400 border border-amber-500/20" :
                            "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">{item.releaseYear}</td>
                        <td className="px-6 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => openItemModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.95]"
                          >
                            แก้ไข ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 transition-all active:scale-[0.95]"
                          >
                            ลบ 🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {itemsList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          ไม่พบรายการข้อมูลในหน้านี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab content 2: DYNAMIC TAGS LIST */}
        {activeTab === "tags" && (
          <div className="glass-panel p-6 border border-white/[0.06] rounded-3xl bg-slate-950/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 pb-2.5 border-b border-white/[0.04]">
              รายการแท็กทั้งหมดที่ถูกใช้งาน (ประมวลผลสดจากบล็อกรีวิว)
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {systemTags.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/[0.06] shadow-sm hover:border-violet-500/40 transition-all"
                >
                  <span className="text-xs font-bold text-slate-200">{tag.name}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-violet-950/40 border border-violet-500/20 text-violet-400">
                    {tag.count} บล็อก
                  </span>
                </div>
              ))}
              
              {systemTags.length === 0 && (
                <p className="text-xs text-slate-500 py-6 text-center w-full">ยังไม่มีแท็กใด ๆ ในระบบ ณ ขณะนี้</p>
              )}
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-violet-950/10 border border-violet-900/20 text-xs text-violet-400 leading-relaxed max-w-2xl">
              💡 <strong>ข้อแนะนำ:</strong> แท็กต่างๆ จะถูกคำนวณและแสดงผลโดยอัตโนมัติเมื่อมีการเขียนหรือบันทึกบล็อกรีวิวใหม่ คุณสามารถพิมพ์เพิ่มแท็กย่อยอื่นๆ เช่น <code className="text-white font-mono bg-violet-950/40 px-1 rounded">Action RPG</code>, <code className="text-white font-mono bg-violet-950/40 px-1 rounded">Sci-Fi</code> หรือแท็กใดๆ ก็ได้ภายในฟอร์มบทความ
            </div>
          </div>
        )}
      </main>

      {/* Item Modal Form (Create / Edit Modal) */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowItemModal(false)} />
          
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-950/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 overflow-y-auto scrollbar-thin">
            <h3 className="text-base font-extrabold text-white mb-6 border-b border-white/[0.04] pb-4">
              {editingItem ? "✏️ แก้ไขเนื้อหาบล็อกรีวิว" : "➕ เขียนบทความบล็อกรีวิวใหม่"}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-6">
              {/* Row 1: ID & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    ไอดี URL ภาษาอังกฤษ (Unique ID เช่น elden-ring)
                  </label>
                  <input
                    type="text"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="เช่น elden-ring"
                    className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500"
                    disabled={!!editingItem}
                    required
                  />
                  <p className="text-[9px] text-slate-500 mt-1">⚠️ ไอดีห้ามซ้ำ และไม่สามารถแก้ไขได้ในภายหลัง</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ชื่อเรื่องบทความ (Title)</label>
                  <input
                    type="text"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder="เช่น Elden Ring"
                    className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              {/* Tag Toggles for Primary Classification */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2.5 tracking-wider">
                  แท็กหลักของบล็อก (เลือกได้หลายหมวดหมู่พร้อมกัน)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleMainTagToggle("game")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      hasGameTag
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_15px_-5px_rgba(245,158,11,0.4)]"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🎮</span> เกม (Game)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMainTagToggle("anime")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      hasAnimeTag
                        ? "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_15px_-5px_rgba(244,63,94,0.4)]"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>✨</span> อนิเมะ (Anime)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMainTagToggle("movie")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      hasMovieTag
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_-5px_rgba(6,182,212,0.4)]"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🎬</span> ภาพยนตร์ (Movie)
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5">
                  💡 บล็อกรีวิว 1 เรื่อง สามารถจัดเป็นได้หลายแท็ก (เช่น เป็นทั้งเกมและอนิเมะ) หรือไม่จัดอยู่ในหมวดหลักเลยก็ได้
                </p>
              </div>

              {/* Input for all other Tags */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  แท็กอื่นๆ และหมวดหมู่ย่อยทั้งหมด (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={otherTagsInput}
                  onChange={(e) => setOtherTagsInput(e.target.value)}
                  placeholder="เช่น RPG, Action RPG, Open World, Sci-Fi, Dark Fantasy"
                  className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">
                  💡 แท็กเหล่านี้จะถูกนำไปใช้เป็นปุ่มตัวเลือกฟิลเตอร์ด้านล่างของหน้าหลักโดยอัตโนมัติ (เช่น Action RPG ถือว่าเป็น Tag)
                </p>
              </div>

              {/* Row: Rating & Release Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">คะแนนรีวิว (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={itemRating}
                    onChange={(e) => setItemRating(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ปีที่วางจำหน่าย / เปิดตัว</label>
                  <input
                    type="number"
                    value={itemReleaseYear}
                    onChange={(e) => setItemReleaseYear(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">บทนำอธิบายรีวิว (Description)</label>
                <textarea
                  rows={3}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="เขียนเนื้อหาเกริ่นนำ ประเด็นเด่น ความประทับใจ..."
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                  required
                />
              </div>

              {/* Status & Shiki highlight language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ป้ายสถานะติดแอป</label>
                  <select
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value as any)}
                    className="w-full h-9.5 px-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="New">New (ใหม่ล่าสุด)</option>
                    <option value="Trending">Trending (มาแรงมาก)</option>
                    <option value="Popular">Popular (ยอดนิยมสูงสุด)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ภาษาโค้ดสำหรับไฮไลเตอร์ Shiki</label>
                  <select
                    value={itemHighlightLanguage}
                    onChange={(e) => setItemHighlightLanguage(e.target.value)}
                    className="w-full h-9.5 px-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="css">CSS</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
              </div>

              {/* Specs Code Box */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">โค้ดสเปกรวมถึงรายละเอียดทางเทคนิค (Specs / Tech Config)</label>
                <textarea
                  rows={4}
                  value={itemHighlightCode}
                  onChange={(e) => setItemHighlightCode(e.target.value)}
                  placeholder={itemHighlightLanguage === "json" ? `{\n  "systemRequirements": {\n    "os": "Windows 10/11",\n    "gpu": "RTX 3060"\n  }\n}` : `requirements:\n  os: "Windows 10/11"\n  gpu: "RTX 3060"`}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              {/* Row 6: Image URL & BG Gradient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">ลิงก์ URL รูปภาพหน้าปก</label>
                  <input
                    type="text"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="เช่น /images/elden-ring.png หรือ https://..."
                    className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">คลาสไล่สีหลังการ์ด (CSS Gradients)</label>
                  <input
                    type="text"
                    value={itemBgGradient}
                    onChange={(e) => setItemBgGradient(e.target.value)}
                    placeholder="เช่น from-rose-950/40 via-red-950/20 to-slate-950"
                    className="w-full h-9.5 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3.5 border-t border-white/[0.04] pt-5">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900 hover:bg-slate-800 border border-white/5 active:scale-[0.98]"
                >
                  ยกเลิก ✕
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 transition-all active:scale-[0.98] shadow-md shadow-violet-950/50"
                >
                  บันทึกข้อมูล 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 bg-slate-950/20 text-center mt-20">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} BizarreBig. สร้างสรรค์ด้วยความหลงใหลในเกมและอนิเมะ
        </p>
      </footer>
    </div>
  );
}
