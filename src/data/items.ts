export interface Item {
  id: string;
  type: 'game' | 'anime' | 'movie' | 'other';
  title: string;
  category: string;
  rating: number;
  description: string;
  tags: string[];
  status: 'Trending' | 'New' | 'Popular';
  releaseYear: number;
  highlightCode: string;
  highlightLanguage: string;
  bgGradient: string;
  image: string;
}

export const categories = {
  games: ['All', 'RPG', 'Action', 'Sci-Fi', 'Open World', 'Adventure'],
  anime: ['All', 'Action', 'Fantasy', 'Sci-Fi', 'Supernatural', 'Adventure']
};

export function mapDbItemToItem(dbItem: any): Item {
  const tags = dbItem.tags || [];
  const lowerTags = tags.map((t: string) => t.toLowerCase());

  // Derive virtual type from tags
  let type: 'game' | 'anime' | 'movie' | 'other' = 'other';
  if (lowerTags.includes('เกม') || lowerTags.includes('game') || lowerTags.includes('games')) {
    type = 'game';
  } else if (lowerTags.includes('อนิเมะ') || lowerTags.includes('anime') || lowerTags.includes('animes')) {
    type = 'anime';
  } else if (lowerTags.includes('ภาพยนตร์') || lowerTags.includes('ภาพยนต์') || lowerTags.includes('movie') || lowerTags.includes('movies')) {
    type = 'movie';
  } else if (dbItem.type) {
    type = dbItem.type as any;
  }

  // Derive virtual category from tags (first tag that is not type tag)
  const typeTags = ['เกม', 'game', 'games', 'อนิเมะ', 'anime', 'animes', 'ภาพยนตร์', 'ภาพยนต์', 'movie', 'movies', 'other'];
  const category = tags.find((t: string) => !typeTags.includes(t.toLowerCase())) || dbItem.category || 'General';

  return {
    id: dbItem.id,
    type,
    title: dbItem.title,
    category,
    rating: Number(dbItem.rating),
    description: dbItem.description,
    tags,
    status: dbItem.status as 'Trending' | 'New' | 'Popular',
    releaseYear: dbItem.release_year,
    highlightCode: dbItem.highlight_code,
    highlightLanguage: dbItem.highlight_language,
    bgGradient: dbItem.bg_gradient,
    image: dbItem.image
  };
}

export function mapItemToDbItem(item: Item) {
  // Combine tags to make sure type and category are present in tags array
  const mainTypeTag = item.type === 'game' ? 'เกม' : item.type === 'anime' ? 'อนิเมะ' : item.type === 'movie' ? 'ภาพยนตร์' : '';
  const listTags = [...item.tags];
  
  if (mainTypeTag && !listTags.some(t => t.toLowerCase() === mainTypeTag.toLowerCase() || t.toLowerCase() === item.type.toLowerCase())) {
    listTags.unshift(mainTypeTag);
  }
  if (item.category && item.category !== 'General' && !listTags.some(t => t.toLowerCase() === item.category.toLowerCase())) {
    listTags.push(item.category);
  }

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    category: item.category || 'General',
    rating: item.rating,
    description: item.description,
    tags: listTags,
    status: item.status,
    release_year: item.releaseYear,
    highlight_code: item.highlightCode,
    highlight_language: item.highlightLanguage,
    bg_gradient: item.bgGradient,
    image: item.image
  };
}

export const items: Item[] = [
  {
    id: 'elden-ring',
    type: 'game',
    title: 'Elden Ring',
    category: 'RPG',
    rating: 9.8,
    description: 'มหาศึกสายใยแห่งแหวนเอลเดน เกมแนว Action RPG สุดอลังการในโลกดาร์กแฟนตาซีจาก FromSoftware ร่วมสร้างสรรค์โดย George R. R. Martin',
    tags: ['เกม', 'RPG', 'Dark Fantasy', 'Open World', 'Action RPG', 'Difficult'],
    status: 'Popular',
    releaseYear: 2022,
    bgGradient: 'from-amber-900/40 via-yellow-950/20 to-slate-950',
    image: '/images/elden-ring.png',
    highlightLanguage: 'json',
    highlightCode: `{
  "title": "Elden Ring",
  "developer": "FromSoftware",
  "publisher": "Bandai Namco",
  "systemRequirements": {
    "minimum": {
      "OS": "Windows 10",
      "processor": "Intel Core i5-8400 | AMD Ryzen 3 3300X",
      "memory": "12 GB RAM",
      "graphics": "NVIDIA GeForce GTX 1060 3GB | AMD Radeon RX 580 4GB"
    },
    "recommended": {
      "OS": "Windows 10/11",
      "processor": "Intel Core i7-8700K | AMD Ryzen 5 3600X",
      "memory": "16 GB RAM",
      "graphics": "NVIDIA GeForce GTX 1070 8GB | AMD Radeon RX Vega 56 8GB"
    }
  }
}`
  },
  {
    id: 'cyberpunk-2077',
    type: 'game',
    title: 'Cyberpunk 2077',
    category: 'Sci-Fi',
    rating: 9.2,
    description: 'ผจญภัยใน Night City นครแห่งอนาคตที่เต็มไปด้วยแสงสีนีออน การดัดแปลงร่างกาย และความขัดแย้งระหว่างองค์กรยักษ์ใหญ่ สวมบทบาทเป็น V รับบทเป็นทหารรับจ้างนอกกฎหมาย',
    tags: ['เกม', 'Sci-Fi', 'Cyberpunk', 'Open World', 'Action RPG'],
    status: 'Trending',
    releaseYear: 2020,
    bgGradient: 'from-cyan-900/40 via-blue-950/20 to-slate-950',
    image: '/images/cyberpunk-2077.png',
    highlightLanguage: 'yaml',
    highlightCode: `game_info:
  title: "Cyberpunk 2077: Phantom Liberty"
  version: "2.12"
  ray_tracing:
    enabled: true
    path_tracing: true
    dlss_mode: "Frame Generation"
  graphics_preset: "Ray Tracing Overdrive"
  features:
    - Custom Cyberware Calibration
    - Smart Gun Targeting System
    - Monowire Weapon Integration`
  },
  {
    id: 'genshin-impact',
    type: 'game',
    title: 'Genshin Impact',
    category: 'Adventure',
    rating: 9.0,
    description: 'เดินทางข้ามทวีป Teyvat เพื่อตามหาพี่น้องที่หายไปในเกม Open-world Action RPG สไตล์อนิเมะที่สวยงามและมีกลไกธาตุที่เป็นเอกลักษณ์',
    tags: ['เกม', 'Adventure', 'Anime RPG', 'Open World', 'Gacha'],
    status: 'Popular',
    releaseYear: 2020,
    bgGradient: 'from-emerald-950/40 via-teal-950/20 to-slate-950',
    image: '/images/genshin-impact.png',
    highlightLanguage: 'json',
    highlightCode: `{
  "character": {
    "name": "Raiden Shogun",
    "element": "Electro",
    "weapon": "Polearm",
    "role": "Sub-DPS / Battery",
    "best_artifacts": {
      "set": "Emblem of Severed Fate",
      "sands": "Energy Recharge",
      "goblet": "Electro DMG / ATK%",
      "circlet": "CRIT Rate / CRIT DMG"
    }
  }
}`
  },
  {
    id: 'demon-slayer',
    type: 'anime',
    title: 'Demon Slayer (Kimetsu no Yaiba)',
    category: 'Action',
    rating: 9.6,
    description: 'เรื่องราวของ คามาโดะ ทันจิโร่ เด็กหนุ่มผู้ผันตัวมาเป็นนักล่าอสูรเพื่อหาทางรักษาเนซึโกะ น้องสาวที่กลายเป็นอสูร โดดเด่นด้วยงานภาพระดับท็อปจาก ufotable',
    tags: ['อนิเมะ', 'Action', 'Dark Fantasy', 'Shonen', 'Historical'],
    status: 'Popular',
    releaseYear: 2019,
    bgGradient: 'from-rose-950/40 via-red-950/20 to-slate-950',
    image: '/images/demon-slayer.png',
    highlightLanguage: 'yaml',
    highlightCode: `anime_profile:
  title: "Demon Slayer: Kimetsu no Yaiba"
  studio: "ufotable"
  main_characters:
    - Tanjiro Kamado (Water/Sun Breathing)
    - Nezuko Kamado (Blood Demon Art)
    - Zenitsu Agatsuma (Thunder Breathing)
    - Inosuke Hashibira (Beast Breathing)
  episodes: 26 + Movies + Seasons
  themes: "Family, Perseverance, Revenge"`
  },
  {
    id: 'jujutsu-kaisen',
    type: 'anime',
    title: 'Jujutsu Kaisen',
    category: 'Supernatural',
    rating: 9.5,
    description: 'อิตาโดริ ยูจิ นักเรียนมัธยมปลายผู้กลืนนิ้วต้องสาปของเรียวเมน สุคุนะ เข้าไป ทำให้ต้องเข้าสู่โลกของไสยเวทและการต่อสู้เพื่อปราบวิญญาณคำสาป',
    tags: ['อนิเมะ', 'Supernatural', 'Action', 'Dark Fantasy', 'School'],
    status: 'Trending',
    releaseYear: 2020,
    bgGradient: 'from-violet-950/40 via-purple-950/20 to-slate-950',
    image: '/images/jujutsu-kaisen.png',
    highlightLanguage: 'json',
    highlightCode: `{
  "domain_expansion": {
    "user": "Satoru Gojo",
    "technique_name": "Unlimited Void (Muryōkūsho)",
    "effect": "มอบคุณสมบัติของการรับรู้ที่ไม่มีที่สิ้นสุดแก่เป้าหมาย ทำให้สมองเป็นอัมพาตจากข้อมูลจำนวนมหาศาล",
    "classification": "Barrier Technique",
    "lethal_level": "Max"
  }
}`
  },
  {
    id: 'cyberpunk-edgerunners',
    type: 'anime',
    title: 'Cyberpunk: Edgerunners',
    category: 'Sci-Fi',
    rating: 9.4,
    description: 'อนิเมะสปินออฟจากโลกของ Cyberpunk 2077 เล่าเรื่องของ David Martinez เด็กหนุ่มข้างถนนที่พยายามเอาชีวิตรอดใน Night City โดยผันตัวมาเป็น Edgerunner',
    tags: ['อนิเมะ', 'Sci-Fi', 'Cyberpunk', 'Tragedy', 'Action'],
    status: 'Popular',
    releaseYear: 2022,
    bgGradient: 'from-yellow-950/40 via-amber-950/20 to-slate-950',
    image: '/images/cyberpunk-edgerunners.png',
    highlightLanguage: 'yaml',
    highlightCode: `series_metadata:
  title: "Cyberpunk: Edgerunners"
  studio: "Studio Trigger"
  collaboration: "CD Projekt Red"
  soundtrack:
    opening: "This Fffire"
    insert_song: "I Want to Stay at Your House"
  episodes: 10
  rating: "R-17+"`
  },
  {
    id: 'frieren-journey',
    type: 'anime',
    title: 'Frieren: Beyond Journey\'s End',
    category: 'Fantasy',
    rating: 9.9,
    description: 'เรื่องราวบทสรุปหลังจากปราบราชาปีศาจสำเร็จ ฟรีเรน เมจเอลฟ์ผู้มีอายุยืนยาวได้เริ่มออกเดินทางครั้งใหม่เพื่อเรียนรู้หัวใจและเวลาอันแสนสั้นของมนุษย์',
    tags: ['อนิเมะ', 'Fantasy', 'Adventure', 'Slice of Life', 'Emotional'],
    status: 'New',
    releaseYear: 2023,
    bgGradient: 'from-sky-950/40 via-indigo-950/20 to-slate-950',
    image: '/images/frieren-journey.png',
    highlightLanguage: 'json',
    highlightCode: `{
  "mage": {
    "name": "Frieren",
    "title": "Frieren the Slayer",
    "magic_type": "Mana Suppression / Offensive Magic",
    "favorite_magic": "เวทมนตร์ที่ทำให้เกิดทุ่งดอกไม้ประดับสวน",
    "stats": {
      "mana_capacity": "ระดับมหาศาล (สะกดไว้มากกว่า 90%)",
      "age": "มากกว่า 1,000 ปี"
    }
  }
}`
  }
];
