-- ====================================================================
-- สคริปต์สร้าง/อัปเดตตารางสำหรับฐานข้อมูล BizarreBig
-- ✅ รันได้ทั้งครั้งแรก (Fresh Install) และอัปเดต (Migration)
-- ✅ ไม่ลบข้อมูลที่มีอยู่เดิม
-- วิธีการใช้งาน:
-- 1. ไปที่แดชบอร์ด Supabase โครงการของคุณ
-- 2. ไปที่เมนู SQL Editor (รูปไอคอน >_ จากแถบด้านซ้าย)
-- 3. คลิก "New query"
-- 4. คัดลอกโค้ดทั้งหมดนี้ไปวางแล้วกดปุ่ม "Run"
-- ====================================================================

-- ─────────────────────────────────────────────
-- 1. ตารางหมวดหมู่ (Categories)
-- ─────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,                                        -- ชื่อหมวดหมู่ เช่น "เกม", "RPG", "อนิเมะ"
  slug       text not null unique,                                 -- slug URL เช่น "game", "rpg", "anime"
  parent_id  uuid references public.categories(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────
-- 2. ตารางบล็อก (Items / Posts)
-- ─────────────────────────────────────────────
create table if not exists public.items (
  id                 text primary key,                             -- slug URL เช่น "elden-ring"
  type               text not null check (type in ('game', 'anime', 'movie', 'other')),
  title              text not null,
  category           text not null default 'General',             -- หมวดหมู่ย่อยหลัก
  description        text not null default '',
  tags               text[] default array[]::text[],              -- แท็กย่อยเพิ่มเติม
  status             text check (status in ('Trending', 'New', 'Popular')),
  published_at       timestamp with time zone,                    -- วันที่เผยแพร่เนื้อหาบล็อก
  bg_gradient        text,
  image              text,
  highlight_language text not null default 'json',               -- ภาษาสำหรับ Shiki syntax highlight
  highlight_code     text not null default '{}',                 -- โค้ดสเปกสำหรับ Shiki
  created_at         timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────
-- 3. ตารางเชื่อมโยง Many-to-Many (Item <-> Category)
-- ─────────────────────────────────────────────
create table if not exists public.item_categories (
  item_id     text references public.items(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (item_id, category_id)
);

-- ─────────────────────────────────────────────
-- 4. ตารางความคิดเห็น (Comments)
-- ─────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid default gen_random_uuid() primary key,
  item_id    text not null,                                       -- อ้างอิง id ของ items
  nickname   text not null,                                       -- ชื่อผู้แสดงความคิดเห็น
  text       text not null,                                       -- เนื้อหาความคิดเห็น
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────
-- 5. Migration: ลบคอลัมน์เก่าออก (ถ้ายังมีอยู่)
--    ปลอดภัย — ถ้าคอลัมน์ไม่มีอยู่จะข้ามไป
-- ─────────────────────────────────────────────
alter table public.items drop column if exists rating;
alter table public.items drop column if exists release_year;

-- ─────────────────────────────────────────────
-- 6. Migration: เพิ่มคอลัมน์ใหม่ (ถ้ายังไม่มี)
-- ─────────────────────────────────────────────
alter table public.items
  add column if not exists published_at timestamp with time zone;

-- ─────────────────────────────────────────────
-- 7. เปิด Row Level Security (RLS)
-- ─────────────────────────────────────────────
alter table public.categories      enable row level security;
alter table public.items           enable row level security;
alter table public.item_categories enable row level security;
alter table public.comments        enable row level security;

-- ─────────────────────────────────────────────
-- 8. Policies: อ่านได้สาธารณะ (Public Read)
-- ─────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'categories' and policyname = 'Allow public read categories'
  ) then
    execute 'create policy "Allow public read categories" on public.categories for select using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'items' and policyname = 'Allow public read items'
  ) then
    execute 'create policy "Allow public read items" on public.items for select using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'item_categories' and policyname = 'Allow public read item_categories'
  ) then
    execute 'create policy "Allow public read item_categories" on public.item_categories for select using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'comments' and policyname = 'Allow public read comments'
  ) then
    execute 'create policy "Allow public read comments" on public.comments for select using (true)';
  end if;

  -- ให้ทุกคนโพสต์ความคิดเห็นได้ (ไม่ต้องล็อกอิน)
  if not exists (
    select 1 from pg_policies
    where tablename = 'comments' and policyname = 'Allow public insert comments'
  ) then
    execute 'create policy "Allow public insert comments" on public.comments for insert with check (true)';
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 9. Policies: เขียน/แก้ไข/ลบได้เฉพาะแอดมิน
-- ─────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'categories' and policyname = 'Allow admin write categories'
  ) then
    execute $p$
      create policy "Allow admin write categories" on public.categories for all
      using  (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
      with check (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'items' and policyname = 'Allow admin write items'
  ) then
    execute $p$
      create policy "Allow admin write items" on public.items for all
      using  (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
      with check (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'item_categories' and policyname = 'Allow admin write item_categories'
  ) then
    execute $p$
      create policy "Allow admin write item_categories" on public.item_categories for all
      using  (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
      with check (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
    $p$;
  end if;
end $$;
