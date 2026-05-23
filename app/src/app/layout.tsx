import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ThemeInitializer } from "@/components/ui/ThemeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MathalamaEdu — Событийно-Ориентированный Конвейер Обучения (Event-Driven LMS)",
  description: "Премиальная интерактивная образовательная платформа с Bento UI интерфейсом, геймификацией и последовательным доступом (Content Dripping) к урокам.",
  keywords: ["Mathalama", "LMS", "Bento UI", "Golang", "Next.js", "React"],
  authors: [{ name: "Mathalama Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col antialiased" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <ThemeInitializer />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
