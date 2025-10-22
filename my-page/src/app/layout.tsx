import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import SiteHeader from "@/widgets/site-header/ui/SiteHeader";
import ThreeScene from "@/widgets/three-scene/ui/ThreeScene";

const pretendard = localFont({
  src: "../../public/fonts/pretendard/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Chois me",
  description: "This website was developed by me.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr" className={`${pretendard.variable}`}>
      <body className={`${pretendard.className} mr-12 ml-12 mt-12 mb-12`}>
        <ThreeScene />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
