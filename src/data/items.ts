export interface Item {
  id: string;
  type: 'game' | 'anime' | 'movie' | 'other';
  title: string;
  category: string;
  description: string;
  tags: string[];
  status: 'Trending' | 'New' | 'Popular';
  publishedAt?: string;   // ISO date string เช่น "2024-06-13"
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
    description: dbItem.description,
    tags,
    status: dbItem.status as 'Trending' | 'New' | 'Popular',
    publishedAt: dbItem.published_at ?? undefined,
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
    description: item.description,
    tags: listTags,
    status: item.status,
    published_at: item.publishedAt ?? null,
    highlight_code: item.highlightCode,
    highlight_language: item.highlightLanguage,
    bg_gradient: item.bgGradient,
    image: item.image
  };
}

export const items: Item[] = [];
