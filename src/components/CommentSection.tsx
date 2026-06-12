"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

interface Comment {
  id: string;
  nickname: string;
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  itemId: string;
}

export function CommentSection({ itemId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลคอมเมนต์
  useEffect(() => {
    setIsMounted(true);
    const fetchComments = async () => {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        // ดึงจากฐานข้อมูล Supabase จริง
        try {
          const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("item_id", itemId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data) {
            const formattedComments: Comment[] = data.map((item: any) => ({
              id: item.id,
              nickname: item.nickname,
              text: item.text,
              createdAt: new Date(item.created_at).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
            setComments(formattedComments);
          }
        } catch (err) {
          console.error("Error fetching comments from Supabase:", err);
        }
      } else {
        // โหมดทดลอง: ดึงจาก LocalStorage ของเบราว์เซอร์
        const key = `bizarre_comments_${itemId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            setComments(JSON.parse(saved));
          } catch (err) {
            console.error("Failed to parse comments from localStorage", err);
          }
        }
      }
      setIsLoading(false);
    };

    fetchComments();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !text.trim()) return;

    if (isSupabaseConfigured) {
      // ส่งข้อมูลไปยัง Supabase จริง
      try {
        const { data, error } = await supabase
          .from("comments")
          .insert([
            {
              item_id: itemId,
              nickname: nickname.trim(),
              text: text.trim(),
            },
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          const newComment: Comment = {
            id: data[0].id,
            nickname: data[0].nickname,
            text: data[0].text,
            createdAt: new Date(data[0].created_at).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setComments([newComment, ...comments]);
        }
      } catch (err) {
        console.error("Error inserting comment to Supabase:", err);
        alert("ไม่สามารถบันทึกความคิดเห็นลง Supabase ได้!");
      }
    } else {
      // โหมดทดลอง: เก็บลง LocalStorage
      const newComment: Comment = {
        id: Math.random().toString(36).substring(2, 9),
        nickname: nickname.trim(),
        text: text.trim(),
        createdAt: new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
      const key = `bizarre_comments_${itemId}`;
      localStorage.setItem(key, JSON.stringify(updatedComments));
    }

    // ล้างช่องเขียนคอมเมนต์หลังส่งสำเร็จ
    setText("");
  };

  if (!isMounted) {
    return (
      <div className="w-full py-6 text-center text-xs text-slate-500">
        กำลังโหลดความคิดเห็น...
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-white/[0.06] pt-10">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span>💬 ความคิดเห็นและคำแนะนำ</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-white/[0.04] text-slate-500 font-mono">
          {comments.length}
        </span>
      </h3>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-2xl border border-white/[0.04] bg-slate-950/20 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ร่วมแสดงความคิดเห็น</h4>
          {isSupabaseConfigured ? (
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
              ● Live ฐานข้อมูลจริง
            </span>
          ) : (
            <span className="text-[9px] font-bold text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
              ● โหมดทดลอง (ออฟไลน์)
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Nickname Input */}
          <div>
            <label htmlFor="nickname" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
              ชื่อผู้โพสต์ / นามแฝง
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="กรอกชื่อของคุณ..."
              required
              className="w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/30 transition-all duration-300"
            />
          </div>

          {/* Comment Text Input */}
          <div>
            <label htmlFor="comment-text" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
              ข้อความแสดงความคิดเห็น
            </label>
            <textarea
              id="comment-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ร่วมแชร์ความเห็น สเปก หรือข้อมูลเทคนิคกับเกมเมอร์คนอื่น ๆ..."
              required
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/30 transition-all duration-300 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_4px_15px_-4px_rgba(139,92,246,0.4)] border border-violet-500/20 active:scale-[0.98]"
            >
              ส่งความคิดเห็น 🚀
            </button>
          </div>
        </div>
      </form>

      {/* Comment List Section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-slate-500">
            กำลังโหลดข้อมูลความคิดเห็นย้อนหลัง...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const index = comment.nickname.length % 5;
            const gradients = [
              "from-violet-500 to-purple-600",
              "from-cyan-500 to-blue-600",
              "from-pink-500 to-rose-600",
              "from-amber-500 to-orange-600",
              "from-emerald-500 to-teal-600"
            ];
            const activeGradient = gradients[index];

            return (
              <div 
                key={comment.id}
                className="p-4 rounded-xl border border-white/[0.04] bg-slate-950/20 flex gap-3.5 items-start animate-fade-in"
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeGradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}>
                  {comment.nickname.charAt(0).toUpperCase()}
                </div>

                {/* Body */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-200">{comment.nickname}</span>
                    <span className="text-[9px] text-slate-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 border border-dashed border-white/[0.04] rounded-2xl bg-slate-950/10">
            <span className="text-2xl mb-2 block">💬</span>
            <p className="text-xs text-slate-500">ยังไม่มีความคิดเห็นในหน้านี้</p>
            <p className="text-[10px] text-slate-600 mt-1">เขียนความคิดเห็นเป็นคนแรกเพื่อเริ่มการแชร์ข้อมูลกันเลย!</p>
          </div>
        )}
      </div>
    </div>
  );
}
