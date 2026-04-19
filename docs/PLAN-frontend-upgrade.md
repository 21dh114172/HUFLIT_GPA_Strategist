# KẾ HOẠCH DỰ ÁN: Nâng cấp Frontend & Tích hợp Notion API (Deployment via GitHub Actions)

## 1. Tổng quan Dự án
**Mục tiêu:** Nâng cấp kiến trúc cũ của "HUFLIT GPA Strategist" lên stack Frontend hiện đại, duy trì luồng triển khai tự động qua GitHub Actions lên GitHub Pages.
**Công nghệ (Tech Stack):** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI.
**Quản lý Dữ liệu:** LocalStorage / IndexedDB lưu trữ logic và dữ liệu offline. Notion API làm CMS cho mục Tin tức.
**Chiến lược Chuyển đổi (Migration):** Áp dụng Test-Driven Development (TDD) đối với các file tính toán cũ để đảm bảo logic tính toán kết quả giống 100% bản gốc.
**Triển khai (Deployment):** Sử dụng GitHub Actions để thực hiện Static Export và đẩy lên GitHub Pages (giữ nguyên hạ tầng cũ).

## 2. Chi tiết Công việc (Task Breakdown)

### Giai đoạn 1: Khởi tạo & Thiết lập Kiến trúc 🏗️
- [ ] Khởi tạo dự án Next.js với cấu hình `output: 'export'` trong `next.config.js`.
- [ ] Cài đặt Tailwind CSS, Shadcn UI và Lucide React Icons.
- [ ] Thiết lập hệ thống thiết kế (Design Tokens) theo phong cách tối giản.
- [ ] Tạo file `docs/ARCHITECTURE.md` (ADR) để định hình cấu trúc các component.

### Giai đoạn 2: Chuyển đổi Core TDD (GPA Engine) 🧮
- [ ] Tách biệt các file logic cũ: `/legacy/js/core/calculator.js`, `app-constants.js`, và `validators.js`.
- [ ] Viết các bộ Unit Test (Vitest/Jest) cover tất cả các trường hợp luật tính điểm của HUFLIT.
- [ ] Lập trình module `lib/gpa-engine.ts` dùng TypeScript với kiến trúc sạch.
- [ ] Chạy kiểm thử để đảm bảo `gpa-engine.ts` vượt qua 100% các kịch bản test.

### Giai đoạn 3: Triển khai Giao diện Người dùng (5 Tabs Chính) 🎨
- [ ] **Tab 1: Thang điểm** - Trang tĩnh render nhanh.
- [ ] **Tab 2: Tính điểm môn học** - Form tính điểm tùy chỉnh với React Hooks.
- [ ] **Tab 3: Tính GPA Thủ công** - Giao diện bảng tính Spreadsheet-style dùng Shadcn UI.
- [ ] **Tab 4: Lộ trình GPA** - Component UI Kanban/Tree lưu trạng thái dùng `localStorage`.
- [ ] **Tab 5: Tin tức** - Tích hợp Notion API (Fetching tại build-time hoặc client-side để phù hợp Static Export).

### Giai đoạn 4: Cấu hình GitHub Actions & Triển khai 🚀
- [ ] Cập nhật file `.github/workflows/deploy.yml` để hỗ trợ build Next.js (Node.js setup, npm install, npm run build).
- [ ] Cấu hình GitHub Actions để upload thư mục `out/` làm artifact cho GitHub Pages.
- [ ] Xử lý responsive trên thiết bị di động (375px & 768px).
- [ ] Chạy các kiểm tra chất lượng giao diện và UX qua script `checklist.py`.

## 3. Phân công Agent

- **`project-planner`**: Theo dõi tiến độ và đảm bảo tính tương thích với GitHub Pages.
- **`frontend-specialist`**: Thực thi code Next.js, React, Tailwind CSS và thiết lập Shadcn UI.
- **`testing-patterns`**: Thiết kế các bộ test Vitest cho quá trình TDD Migration.

## 4. Danh sách Kiểm tra Hoàn tất (Phase 5)
- [ ] GitHub Actions báo xanh (Deploy thành công lên GitHub Pages).
- [ ] Các Unit Test cho thư viện `gpa-engine.ts` phải báo Passed 100%.
- [ ] Điểm hiệu năng Lighthouse đạt chuẩn (Nhanh và mượt).
- [ ] Website hoạt động chính xác sau khi export sang dạng tĩnh (không lỗi đường dẫn asset).
