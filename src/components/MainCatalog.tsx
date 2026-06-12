"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Item } from "@/data/items";
import { Hero } from "./Hero";
import { ItemCard } from "./ItemCard";

interface MainCatalogProps {
  initialItems: (Item & { highlightHtml?: string })[];
}

// Helper function to check if item belongs to a tab based on tags or type
function matchTab(item: Item, tab: "all" | "game" | "anime" | "movie"): boolean {
  if (tab === "all") return true;
  const lowerTags = item.tags.map((t) => t.toLowerCase().trim());
  if (tab === "game") {
    return (
      lowerTags.includes("เกม") ||
      lowerTags.includes("game") ||
      lowerTags.includes("games") ||
      item.type === "game"
    );
  }
  if (tab === "anime") {
    return (
      lowerTags.includes("อนิเมะ") ||
      lowerTags.includes("anime") ||
      lowerTags.includes("animes") ||
      item.type === "anime"
    );
  }
  if (tab === "movie") {
    return (
      lowerTags.includes("ภาพยนตร์") ||
      lowerTags.includes("ภาพยนต์") ||
      lowerTags.includes("movie") ||
      lowerTags.includes("movies") ||
      item.type === "movie"
    );
  }
  return false;
}

export function MainCatalog({ initialItems }: MainCatalogProps) {
  const [itemsList, setItemsList] = useState<(Item & { highlightHtml?: string })[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "game" | "anime" | "movie">("all");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadData = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (data.success) {
        let finalItems = data.items || [];
        
        // 2. Load offline custom items
        const offlineItemsStr = localStorage.getItem("bizarre_items");
        if (offlineItemsStr) {
          try {
            const offlineItems = JSON.parse(offlineItemsStr) as (Item & { highlightHtml?: string })[];
            if (offlineItems.length > 0) {
              const offlineIds = new Set(offlineItems.map(item => item.id));
              const filteredDbItems = finalItems.filter((item: any) => !offlineIds.has(item.id));
              finalItems = [...offlineItems, ...filteredDbItems];
            }
          } catch (err) {
            console.error("Failed to parse offline items", err);
          }
        }
        
        setItemsList(finalItems);
      }
    } catch (err) {
      console.error("Failed to fetch live items, loading offline:", err);
      const offlineItemsStr = localStorage.getItem("bizarre_items");
      if (offlineItemsStr) {
        try {
          const offlineItems = JSON.parse(offlineItemsStr) as (Item & { highlightHtml?: string })[];
          const offlineIds = new Set(offlineItems.map(item => item.id));
          const filteredStatic = initialItems.filter(item => !offlineIds.has(item.id));
          setItemsList([...offlineItems, ...filteredStatic]);
        } catch (e) {
          setItemsList(initialItems);
        }
      } else {
        setItemsList(initialItems);
      }
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };
    window.addEventListener("bizarre_db_sync", handleSync);
    window.addEventListener("bizarre_auth_change", handleSync);
    return () => {
      window.removeEventListener("bizarre_db_sync", handleSync);
      window.removeEventListener("bizarre_auth_change", handleSync);
    };
  }, [initialItems]);

  // Get dynamic categories list (Filter Pills) based on active tab and tags present in matching items
  const activeCategories = useMemo(() => {
    const tagsSet = new Set<string>();
    
    itemsList.forEach((item) => {
      // Check if item matches the active tab via tag helper
      if (!matchTab(item, activeTab)) {
        return;
      }
      
      // Add tags
      item.tags.forEach((tag) => {
        // Exclude the main type tags and general tags to avoid duplicates
        const mainTags = ["เกม", "game", "games", "อนิเมะ", "anime", "animes", "ภาพยนตร์", "ภาพยนต์", "movie", "movies", "other", "general"];
        if (tag && !mainTags.includes(tag.toLowerCase().trim())) {
          tagsSet.add(tag.trim());
        }
      });
    });

    const sortedTags = Array.from(tagsSet).sort((a, b) => a.localeCompare(b, 'th'));
    return ["All", ...sortedTags];
  }, [activeTab, itemsList]);

  // Handle tab switch
  const handleTabChange = (tab: "all" | "game" | "anime" | "movie") => {
    setActiveTab(tab);
    setSelectedCategory("All"); // Reset subcategory filter when switching main tab
  };

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      // 1. Filter by Main Tab (Game / Anime / Movie) via tag helper
      if (!matchTab(item, activeTab)) {
        return false;
      }

      // 2. Filter by Category Pill (checks tags array)
      if (selectedCategory !== "All") {
        const hasCategoryTag = item.tags.some(
          (t) => t.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
        );
        if (!hasCategoryTag) {
          return false;
        }
      }

      // 3. Filter by Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesDescription = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query));

        return matchesTitle || matchesCategory || matchesDescription || matchesTags;
      }

      return true;
    });
  }, [itemsList, activeTab, selectedCategory, searchQuery]);

  return (
    <>
      {/* Hero section with search & tab controller */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Subcategory Filter & Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Pills Navigation */}
        {activeCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 items-center justify-center mb-10 pb-4 border-b border-slate-900/60">
            {activeCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_-5px_rgba(6,182,212,0.4)]"
                    : "bg-slate-950/40 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                }`}
              >
                {category === "All" ? "🏷️ แท็กทั้งหมดในหมวดนี้" : category}
              </button>
            ))}
          </div>
        )}

        {/* Catalog Info Count */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <span>รายการค้นหา</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
              พบ {filteredItems.length} รายการ
            </span>
          </h2>
          {selectedCategory !== "All" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
            >
              ล้างตัวกรองแท็ก
            </button>
          )}
        </div>

        {/* Main Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-16 text-center border border-slate-900 max-w-lg mx-auto">
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-lg font-bold text-white mb-2">ไม่พบรายการที่ตรงเงื่อนไข</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              ลองเปลี่ยนคำค้นหา หรือเปิดสวิตช์ไปที่หมวดหมู่อื่นเพื่อดูรายการเพิ่มเติม
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setActiveTab("all");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all duration-200"
            >
              รีเซ็ตการค้นหาทั้งหมด
            </button>
          </div>
        )}
      </main>
    </>
  );
}
