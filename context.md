# BizarreBig — Project Context (อัปเดตล่าสุด: 2026-06-13)

เอกสารนี้บันทึกสถานะปัจจุบัน การเปลี่ยนแปลงที่ผ่านมา และสิ่งที่ต้องทำต่อของโปรเจกต์ BizarreBig
ไว้สำหรับนักพัฒนาและ AI Agent เพื่อให้เริ่มงานต่อได้ทันทีโดยไม่ต้องอ่านประวัติทั้งหมด

---

## ✅ สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|-------|
| ฐานข้อมูล Supabase | ✅ สร้างแล้ว — Project ID: `fieojbzfvbctjxnqjhxo` |
| Schema รันแล้ว (`dynamic_schema.sql`) | ✅ รันแล้วครั้งแรก |
| ตาราง `categories` | ✅ มีอยู่ในฐานข้อมูล |
| ตาราง `items` | ✅ มีอยู่ในฐานข้อมูล |
| ตาราง `item_categories` | ✅ มีอยู่ในฐานข้อมูล |
| ตาราง `comments` | ✅ มีอยู่ในฐานข้อมูล |
| Row Level Security (RLS) | ✅ เปิดใช้งานทุกตาราง |
| Environment Variables (`.env.local`) | ✅ ตั้งค่าแล้ว |
| TypeScript compilation | ✅ ไม่มี error |

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema)

> ไฟล์หลัก: `dynamic_schema.sql` — รันไฟล์เดียวจบทุกตาราง

### ตาราง `items` (บล็อก/โพสต์)

| คอลัมน์ | ประเภท | หมายเหตุ |
|---------|-------|---------|
| `id` | text (PK) | slug เช่น `elden-ring` |
| `type` | text | `game`, `anime`, `movie`, `other` |
| `title` | text | ชื่อเรื่อง |
| `category` | text | หมวดหมู่หลัก |
| `description` | text | คำอธิบาย |
| `tags` | text[] | แท็กย่อย |
| `status` | text | `Trending`, `New`, `Popular` |
| `published_at` | timestamptz | วันที่เผยแพร่เนื้อหาบล็อก |
| `bg_gradient` | text | CSS gradient สำหรับพื้นหลังการ์ด |
| `image` | text | URL รูปภาพ |
| `highlight_language` | text | ภาษา Shiki (default: `json`) |
| `highlight_code` | text | โค้ดสเปก (default: `{}`) |
| `created_at` | timestamptz | auto |

> ❌ **ลบออกแล้ว**: `rating`, `release_year` (ไม่มีใช้แล้ว)
> ✅ **เพิ่มใหม่**: `published_at` แทน

### ตาราง `comments` (ความคิดเห็น)

| คอลัมน์ | ประเภท | หมายเหตุ |
|---------|-------|---------|
| `id` | uuid (PK) | auto-generated |
| `item_id` | text | อ้างอิง `items.id` |
| `nickname` | text | ชื่อผู้แสดงความคิดเห็น |
| `text` | text | เนื้อหาความคิดเห็น |
| `created_at` | timestamptz | auto |

### RLS Policies

| ตาราง | Public Read | Public Insert | Admin Write |
|-------|------------|---------------|-------------|
| `categories` | ✅ | ❌ | ✅ |
| `items` | ✅ | ❌ | ✅ |
| `item_categories` | ✅ | ❌ | ✅ |
| `comments` | ✅ | ✅ (ทุกคนโพสต์ได้) | — |

Admin = บัญชีที่มี JWT email ตรงกับ `thaksin819@gmail.com`

---

## 🔑 Environment Variables

ไฟล์: `.env.local` (อย่า commit ขึ้น Git)

```env
NEXT_PUBLIC_SUPABASE_URL=https://fieojbzfvbctjxnqjhxo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key ที่ตั้งค่าแล้ว>
```

---

## 📁 ไฟล์สำคัญ

| ไฟล์ | บทบาท |
|------|------|
| `dynamic_schema.sql` | Schema หลัก — รันใน Supabase SQL Editor |
| `supabase_schema.sql` | ⚠️ ไฟล์เก่า (ใช้ `dynamic_schema.sql` แทน) |
| `src/data/items.ts` | TypeScript interface `Item` และ mapper จาก Supabase |
| `src/app/admin/page.tsx` | หน้า Admin สำหรับจัดการข้อมูล |
| `src/components/ItemCard.tsx` | การ์ดแสดงรายการ |
| `src/app/items/[id]/page.tsx` | หน้ารายละเอียด |
| `src/components/OfflineItemDetailFallback.tsx` | fallback สำหรับโหมดออฟไลน์ |
| `content.md` | ภาพรวมโปรเจกต์ ฟีเจอร์ และแผนงาน |

---

## 🔄 การเปลี่ยนแปลงล่าสุด

### 2026-06-14
- ✅ ปรับปรุงโครงสร้างข้อมูลเป็นระบบหลายแท็ก (Multi-tags) เพื่อการคัดกรองเนื้อหาที่ยืดหยุ่นขึ้น
- ✅ รวมตัวแก้เนื้อหา RichTextEditor ในหน้าจัดการข้อมูล (Admin Panel) เพื่อให้พิมพ์เนื้อหาและวางรูปภาพได้โดยตรง (Ctrl+V)
- ✅ เพิ่มระบบสกัดรูปปกอัตโนมัติ (Auto-extract cover image) จากรูปภาพแรกของบทความ
- ✅ ปรับแต่งสคริปต์ `dynamic_schema.sql` (ตาราง นโยบาย RLS) ให้เป็น Idempotent รันซ้ำได้ปลอดภัย ไม่เกิดข้อผิดพลาด
- ✅ พัฒนาหน้าเว็บหลัก (Main Catalog), การ์ดรีวิว, หน้ารายละเอียด และตัวจัดการเบื้องหลังให้ทันสมัย ปรับสีสันแบบดาร์กโหมดพรีเมียม
- ✅ ผ่านการทดสอบคอมไพล์ Next.js build สำเร็จ 100%

### 2026-06-13
- ✅ สร้างฐานข้อมูล Supabase ครั้งแรกสำเร็จ
- ✅ รวม `supabase_schema.sql` เข้าใน `dynamic_schema.sql` เป็นไฟล์เดียว
- ✅ แก้ทุก Policy ใน `dynamic_schema.sql` ให้เป็น idempotent (`DO $$ IF NOT EXISTS`)

### 2026-06-12
- ✅ ลบคอลัมน์ `rating` และ `release_year` ออกจาก schema และ UI ทั้งหมด
- ✅ เพิ่มคอลัมน์ `published_at` (วันที่เผยแพร่เนื้อหาบล็อก)
- ✅ อัปเดต TypeScript interface `Item` ใน `src/data/items.ts`
- ✅ อัปเดต UI: `ItemCard`, `ItemDetailPage`, `OfflineItemDetailFallback`, Admin page

---

## 🚀 ขั้นตอนถัดไปที่แนะนำ

1. **ตั้งค่า Google OAuth** — ทำตามคู่มือใน `content.md` หัวข้อ "การตั้งค่าระบบเข้าสู่ระบบด้วย Google OAuth"
2. **ทดสอบ Admin Panel** — เข้า `/admin` ด้วยบัญชี `thaksin819@gmail.com` เพื่อลองเพิ่มข้อมูลจริง
3. **เพิ่มข้อมูลตัวอย่าง** — เพิ่มเกม/อนิเมะตัวแรกผ่านหน้า Admin
4. **Deploy บน Vercel** — ทำตามคู่มือใน `content.md` หัวข้อ "คู่มือการตั้งค่าโดเมนและขึ้นระบบออนไลน์"

---

## ⚠️ ข้อควรระวัง

- `supabase_schema.sql` ยังคงอยู่ในโปรเจกต์แต่ **ไม่ต้องรันอีกต่อไป** — ใช้ `dynamic_schema.sql` เท่านั้น
- อย่า commit ไฟล์ `.env.local` ขึ้น Git (ควรเพิ่มใน `.gitignore`)
- รหัสผ่านแอดมินแบบด่วน (`admin`) อยู่ใน `Navbar.tsx` — แก้ไขก่อน deploy จริง
