import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "HUFLIT GPA Strategist - Tính toán & Lập kế hoạch điểm số",
  description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh. Hỗ trợ import bảng điểm từ Portal.",
  keywords: ["HUFLIT", "GPA", "Calculator", "Tính điểm", "Tín chỉ", "Sinh viên", "Portal", "Kế hoạch học tập"],
  authors: [{ name: "TienxDun" }],
  openGraph: {
    title: "HUFLIT GPA Strategist - Tính toán & Lập kế hoạch điểm số",
    description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh.",
    url: "https://tienxdun.github.io/HUFLIT_GPA_Strategist/",
    siteName: "HUFLIT GPA Strategist",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HUFLIT GPA Strategist - Tính toán & Lập kế hoạch điểm số",
    description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh.",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
