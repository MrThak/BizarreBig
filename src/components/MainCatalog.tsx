"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Item, categories } from "@/data/items";
import { Hero } from "./Hero";
import { ItemCard } from "./ItemCard";

interface MainCatalogProps {
  initialItems: (Item & { highlightHtml?: string })[];
}

export function MainCatalog({ initialItems }: MainCatalogProps) {
  const [itemsList, setItemsList] = useState<(Item & { highlightHtml?: string })[]>(initialItems);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "game" | "anime" | "movie">("all");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadData = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (data.success) {
        let finalItems = data.items || [];
        setDbCategories(data.categories || []);
        
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

  // Resolve categories dynamically from dbCategories or fallbacks
  const resolvedCats = useMemo(() => {
    const fallback = {
      games: ['All', 'RPG', 'Action', 'Sci-Fi', 'Open World', 'Adventure'],
      anime: ['All', 'Action', 'Fantasy', 'Sci-Fi', 'Supernatural', 'Adventure'],
      movies: ['All', 'Action', 'Sci-Fi', 'Comedy', 'Drama', 'Adventure']
    };

    const parseCategoriesList = (list: any[]) => {
      const gamesCats = ['All'];
      const animeCats = ['All'];
      const movieCats = ['All'];

      list.forEach(cat => {
        let root = cat;
        let limit = 10;
        while (root.parent_id && limit > 0) {
          const parent = list.find(c => c.id === root.parent_id);
          if (!parent) break;
          root = parent;
          limit--;
        }
        
        if (root.slug === 'game' || root.slug === 'games') {
          if (cat.slug !== 'game' && cat.slug !== 'games') {
            gamesCats.push(cat.name);
          }
        } else if (root.slug === 'anime') {
          if (cat.slug !== 'anime') {
            animeCats.push(cat.name);
          }
        } else if (root.slug === 'movie' || root.slug === 'movies') {
          if (cat.slug !== 'movie' && cat.slug !== 'movies') {
            movieCats.push(cat.name);
          }
        }
      });

      return {
        games: gamesCats.length > 1 ? gamesCats : fallback.games,
        anime: animeCats.length > 1 ? animeCats : fallback.anime,
        movies: movieCats.length > 1 ? movieCats : fallback.movies
      };
    };

    if (!dbCategories || dbCategories.length === 0) {
      if (typeof window !== "undefined") {
        const offlineCatsStr = localStorage.getItem("bizarre_categories");
        if (offlineCatsStr) {
          try {
            const offlineCats = JSON.parse(offlineCatsStr);
            if (offlineCats && offlineCats.length > 0) {
              return parseCategoriesList(offlineCats);
            }
          } catch (e) {
            console.error("Failed to parse offline categories", e);
          }
        }
      }
      return fallback;
    }

    return parseCategoriesList(dbCategories);
  }, [dbCategories]);

  // Get dynamic categories list based on active tab
  const activeCategories = useMemo(() => {
    if (activeTab === "game") {
      return resolvedCats.games;
    } else if (activeTab === "anime") {
      return resolvedCats.anime;
    } else if (activeTab === "movie") {
      return resolvedCats.movies;
    } else {
      const combined = new Set([
        "All", 
        ...resolvedCats.games.slice(1), 
        ...resolvedCats.anime.slice(1), 
        ...resolvedCats.movies.slice(1)
      ]);
      return Array.from(combined);
    }
  }, [activeTab, resolvedCats]);

  // Handle tab switch
  const handleTabChange = (tab: "all" | "game" | "anime" | "movie") => {
    setActiveTab(tab);
    setSelectedCategory("All"); // Reset subcategory filter when switching main tab
  };

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      // 1. Filter by Main Tab (Game / Anime / Movie)
      if (activeTab !== "all" && item.type !== activeTab) {
        return false;
      }

      // 2. Filter by Category Pill
      if (selectedCategory !== "All") {
        if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
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
              {category === "All" ? "🏷️ ทั้งหมดในหมวดนี้" : category}
            </button>
          ))}
        </div>

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
              ล้างตัวกรองหมวดหมู่
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
