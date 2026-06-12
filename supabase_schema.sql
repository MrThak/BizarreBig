-- ====================================================================
-- สคริปต์สร้างตารางฐานข้อมูลและตั้งค่าสิทธิ์บน Supabase
-- วิธีการใช้งาน:
-- 1. ไปที่แดชบอร์ดโครงการ Supabase ของคุณ
-- 2. ไปที่แถบ SQL Editor (รูปตัวไอคอนใบงานโค้ด >_ จากแถบด้านซ้าย)
-- 3. คลิก "New query"
-- 4. คัดลอกโค้ด SQL ด้านล่างนี้ทั้งหมดไปวาง
-- 5. กดปุ่ม "Run" ที่ขวาบน เพื่อสร้างตารางให้พร้อมทำงาน
-- ====================================================================

-- 1. สร้างตารางสำหรับเก็บข้อมูลความคิดเห็น (Comments)
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  item_id text not null,
  nickname text not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. เปิดระบบความปลอดภัยระดับแถว (Row Level Security)
alter table public.comments enable row level security;

-- 3. ตั้งนโยบายสิทธิ์ (Policies) ให้บุคคลทั่วไปสามารถดึงข้อมูลคอมเมนต์ไปอ่านได้
create policy "Allow public read access"
on public.comments for select
using (true);

-- 4. ตั้งนโยบายสิทธิ์ (Policies) ให้บุคคลทั่วไปสามารถพิมพ์ส่งคอมเมนต์เข้ามาเขียนลงฐานข้อมูลได้
create policy "Allow public insert access"
on public.comments for insert
with check (true);
