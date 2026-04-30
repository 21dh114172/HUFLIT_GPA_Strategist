import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HUFLIT GPA Strategist",
    short_name: "GPA Strategist",
    description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/ava.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
