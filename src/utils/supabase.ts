import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// เช็กว่าผู้ใช้ตั้งค่า URL และ Key ของ Supabase จริงหรือยัง (ไม่ใช้ค่า Placeholder)
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE"
);

// สร้างและส่งออกไคลเอนต์ Supabase
// หากไม่มีการตั้งค่าคีย์ จะใช้ที่อยู่จำลองเพื่อป้องกันไม่ให้แอปพลิเคชัน Crash
const activeUrl = isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co";
const activeKey = isSupabaseConfigured ? supabaseAnonKey : "placeholder";

export const supabase = createClient(activeUrl, activeKey);
