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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (data.success) {
        let finalItems = data.items || [];
        
        // 2. Load offline custom items only if the database is in offline mode
        if (data.isOffline) {
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
    setSelectedTags([]); // Reset subcategory filter when switching main tab
  };

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      // 1. Filter by Main Tab (Game / Anime / Movie) via tag helper
      if (!matchTab(item, activeTab)) {
        return false;
      }

      // 2. Filter by Category Pills (all selected tags must match)
      if (selectedTags.length > 0) {
        const itemLowerTags = item.tags.map(t => t.toLowerCase().trim());
        const matchesAllTags = selectedTags.every(
          (selTag) => itemLowerTags.includes(selTag.toLowerCase().trim())
        );
        if (!matchesAllTags) {
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
  }, [itemsList, activeTab, selectedTags, searchQuery]);

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
        {/* Category Filter Bar */}
        {activeCategories.length > 1 && (
          <div className="flex flex-col items-center mb-8">
            <button
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="group flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold text-slate-300 border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 hover:text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <span className="text-cyan-400 group-hover:scale-110 transition-transform">🏷️</span>
              <span>{isTagsExpanded ? "ซ่อนแท็กทั้งหมด" : "แสดงแท็กทั้งหมด"}</span>
              {selectedTags.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold max-w-[200px] md:max-w-[400px] truncate">
                  เลือกอยู่: {selectedTags.join(", ")}
                </span>
              )}
              <svg
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-300 ${
                  isTagsExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expandable Tags Container */}
            <div
              className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
                isTagsExpanded
                  ? "max-h-[500px] opacity-100 mt-6"
                  : "max-h-0 opacity-0 mt-0 pointer-events-none"
              }`}
            >
              <div className="relative p-2.5 rounded-2xl bg-slate-950/25 border border-white/[0.03] backdrop-blur-sm">
                <div className="flex flex-wrap gap-2 justify-center py-1 max-w-5xl mx-auto">
                  {activeCategories.map((category) => {
                    const isActive = category === "All"
                      ? selectedTags.length === 0
                      : selectedTags.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          if (category === "All") {
                            setSelectedTags([]);
                          } else {
                            setSelectedTags((prev) =>
                              prev.includes(category)
                                ? prev.filter((t) => t !== category)
                                : [...prev, category]
                            );
                          }
                        }}
                        className={`
                          relative px-4 py-1.5 rounded-full text-[11px] font-bold
                          tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer
                          ${isActive
                            ? "text-white border border-cyan-400/50 bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-cyan-500/15 shadow-[0_0_18px_-4px_rgba(6,182,212,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
                            : "text-slate-400 border border-white/[0.06] bg-slate-950/40 hover:text-slate-100 hover:border-slate-600/60 hover:bg-slate-900/60"
                          }
                        `}
                      >
                        {/* Active glow dot */}
                        {isActive && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_2px_rgba(6,182,212,0.7)]" />
                        )}
                        {category === "All" ? "✦ ทั้งหมด" : category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom separator line with glow */}
            <div className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-slate-800/80 to-transparent" />
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
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
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
                setSelectedTags([]);
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
