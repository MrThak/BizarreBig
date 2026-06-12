-- ====================================================================
-- สคริปต์สร้างตารางสำหรับเก็บหมวดหมู่และคีย์ย่อยแบบลำดับขั้น (Hierarchical Categories)
-- และข้อมูลบล็อกรีวิวเกม/อนิเมะ/ภาพยนตร์ (Catalog Items)
-- วิธีการใช้งาน:
-- 1. ไปที่แดชบอร์ด Supabase โครงการของคุณ
-- 2. ไปที่เมนู SQL Editor (รูปไอคอน >_ จากแถบด้านซ้าย)
-- 3. คลิก "New query"
-- 4. คัดลอกโค้ดทั้งหมดนี้ไปวางแล้วกดปุ่ม "Run"
-- ====================================================================

-- 1. ล้างตารางเก่าออกก่อนหากเคยมีอยู่ (เพื่อป้องกันโครงสร้างทับซ้อน)
drop table if exists public.item_categories cascade;
drop table if exists public.categories cascade;
drop table if exists public.items cascade;

-- 2. สร้างตารางหมวดหมู่ (Categories) ที่รองรับการซ้อนกันแบบลำดับขั้น (Self-Referencing Parent ID)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,                                          -- ชื่อหมวดหมู่ เช่น "เกม", "RPG", "อนิเมะ", "Isekai"
  slug text not null unique,                                   -- สลักภาษาอังกฤษสำหรับ URL เช่น "game", "rpg", "anime"
  parent_id uuid references public.categories(id) on delete cascade, -- ชี้กลับไปหมวดหมู่พ่อ
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. สร้างตารางเก็บรายการเนื้อหาบล็อก (Items / Posts)
create table public.items (
  id text primary key,                                         -- รหัสอ้างอิง URL เช่น "elden-ring"
  type text not null check (type in ('game', 'anime', 'movie', 'other')), -- ประเภทหลัก
  title text not null,
  category text not null,                                      -- หมวดหมู่ย่อยหลัก
  rating numeric(3, 1) default 0.0,
  description text not null,
  tags text[] default array[]::text[],                         -- แท็กย่อยเพิ่มเติม
  status text check (status in ('Trending', 'New', 'Popular')),
  release_year integer,
  bg_gradient text,
  image text,
  highlight_language text not null default 'json',             -- ภาษาสำหรับ Shiki
  highlight_code text not null,                                -- ตัวโค้ดสเปก Shiki
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ตารางเชื่อมโยงเนื้อหากับหมวดหมู่แบบ Many-to-Many
create table public.item_categories (
  item_id text references public.items(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (item_id, category_id)
);

-- 5. เปิดระบบความปลอดภัยระดับแถว (Row Level Security)
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.item_categories enable row level security;

-- 6. กำหนดนโยบายให้บุคคลทั่วไปสามารถเปิดอ่านข้อมูลได้ทุกคน (Public Select)
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read items" on public.items for select using (true);
create policy "Allow public read item_categories" on public.item_categories for select using (true);

-- 7. กำหนดนโยบายให้เฉพาะบัญชีแอดมิน thaksin819@gmail.com เขียน/แก้ไข/ลบข้อมูลได้
create policy "Allow admin write categories" on public.categories for all
using (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
with check (auth.jwt() ->> 'email' = 'thaksin819@gmail.com');

create policy "Allow admin write items" on public.items for all
using (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
with check (auth.jwt() ->> 'email' = 'thaksin819@gmail.com');

create policy "Allow admin write item_categories" on public.item_categories for all
using (auth.jwt() ->> 'email' = 'thaksin819@gmail.com')
with check (auth.jwt() ->> 'email' = 'thaksin819@gmail.com');
