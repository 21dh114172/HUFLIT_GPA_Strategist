import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const withBasePath = (path: string) => `${basePath}${path}`;

  return {
    name: "HUFLIT GPA Strategist",
    short_name: "GPA Strategist",
    description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh.",
    start_url: withBasePath("/"),
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: withBasePath("/favicon.ico"),
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: withBasePath("/ava.jpg"),
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
