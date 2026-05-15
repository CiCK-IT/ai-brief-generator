import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 客戶需求整理助手 | cick tools",
  description:
    "將客戶零散需求整理成專案摘要、需求類型、核心功能、成熟度與下一步建議的作品集 demo。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
