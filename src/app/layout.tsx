import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Anuphan, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BizarreBig - Game & Anime Hub",
  description: "แหล่งรวมข้อมูลจัดหมวดหมู่และแนะนำเกมกับอนิเมะระดับพรีเมียม ในดีไซน์ Dark Theme หรูหราล้ำสมัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${plusJakarta.variable} ${anuphan.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100 font-sans">{children}</body>
    </html>
  );
}
