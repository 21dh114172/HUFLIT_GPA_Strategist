# Hướng dẫn Phát triển & Kiến trúc Dự án (Project Guidelines & Architecture)

Tài liệu này đóng vai trò là "Kim chỉ nam" (Guild Style) cho toàn bộ đội ngũ phát triển dự án HUFLIT GPA Strategist. Mọi đóng góp code cần tuân thủ nghiêm ngặt các quy định dưới đây để đảm bảo chất lượng, tính nhất quán và khả năng bảo trì.

---

## 1. Triết lý Thiết kế (Design Philosophy)

*   **No Build Step**: Dự án chạy trực tiếp trên trình duyệt hiện đại (ES6 Modules) mà không cần Webpack, Babel hay bước build nào. Điều này giúp đơn giản hóa việc triển khai và debugging.
*   **Performance First**: Ưu tiên code thuần (Vanilla JS), hạn chế lạm dụng thư viện nặng. CSS ưu tiên sử dụng Utility class hoặc CSS Variables.
*   **Separation of Concerns**: Tách biệt rõ ràng giữa Business Logic (Core), State Management (Data) và User Interface (DOM).
*   **Predictable State**: Luồng dữ liệu phải đơn hướng và dễ đoán (Action -> State Change -> Notify -> Render).

---

## 2. Kiến trúc Hệ thống (System Architecture)

Dự án áp dụng mô hình **MVC rút gọn (Model-View-Controller)** kết hợp với **Observer Pattern**:

1.  **Model (Store + Core)**: 
    *   Chứa dữ liệu (`store.js`) và logic nghiệp vụ (`calculator.js`).
    *   Là "Source of Truth" duy nhất của ứng dụng.
    *   Không biết gì về DOM/Giao diện.
2.  **View (Renderers)**:
    *   Chịu trách nhiệm tạo ra HTML string và chèn vào DOM (`renderers.js`).
    *   Chỉ đọc dữ liệu từ Store, không tự ý sửa đổi dữ liệu gốc.
    *   Tự động cập nhật khi Store thông báo thay đổi (Observer).
3.  **Controller (Events)**:
    *   Lắng nghe tương tác người dùng (`events.js`).
    *   Gọi các Action trong Store để thay đổi dữ liệu.
    *   Gọi renderer ban đầu khi load trang.

### Sơ đồ Luồng dữ liệu
```
[User Input] --> [Event Listener] --> [Store Action]
                                          |
                                          v
                                   [Update State]
                                          |
                                          v
[DOM Update] <--- [Render Function] <-- [Notify Observers]
```

---

## 3. Cấu trúc Thư mục & M naming (Project Structure)

Cấu trúc thư mục được tổ chức theo chức năng kỹ thuật:

```
/
├── assets/                 # Tài nguyên tĩnh (Images, dummy data)
├── css/                    
│   ├── main.css            # Styles chính, biến CSS toàn cục
│   └── components/         # (Tương lai) Styles riêng cho từng component phức tạp
├── js/
│   ├── main.js             # Entry Point: Khởi tạo app và routing cơ bản
│   ├── core/               # PURE LOGIC (Không phụ thuộc DOM/Browser API)
│   │   ├── calculator.js   # Các thuật toán tính toán GPA
│   │   ├── constants.js    # Các hằng số (Thang điểm, Config)
│   │   └── utils.js        # Hàm tiện ích dùng chung (Format tiền, date)
│   ├── state/              # DATA MANAGEMENT
│   │   └── store.js        # Central Store & Observer Logic
│   └── ui/                 # INTERFACE LOGIC
│       ├── events.js       # Xử lý sự kiện (Click, Change, Input)
│       ├── renderers.js    # Tạo HTML Templates & DOM Manipulation
│       └── effects.js      # Hiệu ứng hình ảnh (không ảnh hưởng logic)
├── index.html              # Layout chính
├── ARCHITECTURE.md         # Tài liệu tổng quan (Cấp cao)
└── PROJECT_GUIDELINES.md   # Tài liệu chi tiết này
```

---

## 4. Quy chuẩn Coding (Coding Standards)

### 4.1. JavaScript (ES6+)

*   **Variables**: 
    *   Luôn dùng `const` mặc định. Chỉ dùng `let` khi giá trị thực sự thay đổi. Tránh tuyệt đối `var`.
    *   *Naming*: `camelCase` cho biến và hàm (vd: `calculateGpa`, `userSettings`).
*   **Constants**:
    *   Đặt trong `js/core/constants.js`.
    *   *Naming*: `UPPER_SNAKE_CASE` (vd: `MAX_CREDITS`, `GRADE_SCALE`).
*   **Functions**:
    *   Ưu tiên **Pure Functions** trong thư mục `js/core`: Không side-effects, input giống nhau luôn ra output giống nhau.
    *   Tên hàm bắt đầu bằng động từ: `get...`, `set...`, `calculate...`, `render...`, `handle...`.
    *   Hàm xử lý sự kiện trong `events.js` nên đặt tên `handle[Subject][Event]` (vd: `handleSemesterAdd`, `handleInputChange`).
*   **Modules**:
    *   Sử dụng `export` tường minh (Named exports) thay vì `export default` để dễ refactor và tree-shaking (tinh thần).

### 4.2. HTML & DOM

*   **Semantic HTML**: Sử dụng đúng thẻ (`<button>` cho hành động, `<a>` cho điều hướng, `<section>`, `<header>`, `<footer>`).
*   **IDs & Classes**:
    *   **IDs**: Dùng cho JavaScript hooks (unique). Naming: `kebab-case` (vd: `#target-result-container`, `#btn-calc-gpa`).
    *   **Classes**: Dùng cho styling. Naming: `kebab-case` (theo Bootstrap hoặc custom utility).
*   **Attributes**: Luôn có `alt` cho `<img>`, `type` cho `<button>`.

### 4.3. CSS

*   Sử dụng CSS Variables (`:root`) cho màu sắc, spacing để dễ theming.
*   Tránh lồng nhau quá 3 cấp (Nesting > 3 levels deep).
*   Mobile-first: Viết style mặc định cho mobile, dùng `@media (min-width: ...)` cho desktop.

---

## 5. Hướng dẫn Quản lý State (State Management Guild)

Store (`js/state/store.js`) là "trái tim" của ứng dụng. Tuân thủ tuyệt đối:

1.  **Read-Only cho bên ngoài**: Các module khác không được truy cập trực tiếp biến `state` (ví dụ: `targetState`). Phải dùng getter (vd: `getManualState()`) hoặc copy object trả về.
2.  **Mutation qua Action**: Chỉ các hàm được export từ `store.js` mới được quyền sửa đổi giá trị biến state.
3.  **Persistence**: Khi state thay đổi quan trọng, cần lưu ngay vào `localStorage` (nếu cần thiết) trong cùng action đó.
4.  **Notification**: Mọi action thay đổi state phải gọi `notify()` ở cuối để cập nhật UI.

Ví dụ Action chuẩn:
```javascript
export function updateTargetGPA(newValue) {
    // 1. Validate
    if (newValue < 0 || newValue > 4.0) return;
    
    // 2. Mutate State
    targetState.targetGpa = parseFloat(newValue);
    
    // 3. Side Effects (Save/Calc)
    recalculateLogicInternal(); // Nếu có
    
    // 4. Notify UI
    notify();
}
```

---

## 6. Quy trình Phát triển Tính năng (Feature Workflow)

Để thêm một tính năng mới (ví dụ: Tab mới "Dự báo học bổng"), hãy đi theo quy trình hình chữ V:

1.  **Define State (`store.js`)**: Dữ liệu cần lưu là gì? (vd: `scholarshipCriteria`). Viết các action get/set.
2.  **Core Logic (`calculator.js`)**: Viết hàm tính toán thuần túy (vd: `checkScholarshipEligibility(gpa, drl)`). Input là dữ liệu, output là kết quả.
3.  **UI Layout (`index.html`)**: Thêm tab container, inputs, outputs với ID định danh rõ ràng.
4.  **Rendering (`renderers.js`)**: Viết hàm `renderScholarshipResult(data)` nhận dữ liệu và innerHTML vào DOM. Đăng ký hàm này vào `subscribe()` của Store.
5.  **Events (`events.js`)**: Viết hàm `initScholarshipTab()`, lắng nghe input change, gọi Action của Store.
6.  **Integration (`main.js`)**: Gọi `initScholarshipTab()` khi ứng dụng khởi động.

---

## 7. Kiểm thử & Review (QA Checklist)

Trước khi commit code:
*   [ ] Không có lỗi console log đỏ/vàng trên Chrome DevTools.
*   [ ] Đã test trên giao diện Mobile (Responsive mode).
*   [ ] Các biến Global không bị rò rỉ (tất cả phải nằm trong Module scope).
*   [ ] Đã format code (Indentation: 4 spaces hoặc 2 spaces nhất quán).
*   [ ] Không hardcode các giá trị magic number (đưa vào `constants.js`).

---
*Tài liệu này được cập nhật lần cuối vào tháng 01/2026 bởi Team Architecture.*
