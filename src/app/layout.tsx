import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 活動需求 Brief 產生器 | cick tools",
  description:
    "將婚禮、品牌活動與企業活動需求整理成活動摘要、服務項目、預算時程判斷與下一步建議的作品集 demo。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
