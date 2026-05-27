import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Golf Weather — 한국 골프장 날씨",
    template: "%s · Golf Weather",
  },
  description:
    "한국 골프장의 현재 날씨, 시간별 예보, 강수 확률, 바람, 골프 적합도 점수와 복장 추천을 한눈에 확인하세요.",
  keywords: [
    "골프 날씨",
    "골프장 날씨",
    "golf weather korea",
    "라운딩 날씨",
    "골프 예보",
  ],
  openGraph: {
    title: "Golf Weather — 한국 골프장 날씨",
    description:
      "한국 골프장의 날씨와 골프 적합도 점수를 빠르게 확인하세요.",
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "Golf Weather",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golf Weather — 한국 골프장 날씨",
    description: "한국 골프장 날씨 & 골프 적합도 점수",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3faf6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1714" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
