# HUFLIT GPA Strategist

Công cụ tính toán GPA và lập kế hoạch điểm số dành riêng cho sinh viên HUFLIT. Hỗ trợ import bảng điểm từ Portal đào tạo, tính toán điểm thi cuối kỳ, dự đoán GPA mục tiêu và gợi ý môn học lại thông minh.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/TienxDun/HUFLIT_GPA_Strategist)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://tienxdun.github.io/HUFLIT_GPA_Strategist/)

## ✨ Tính năng chính

### 1. 🎯 Lộ trình GPA (Target GPA)
- **Dự đoán điểm số**: Tính toán chính xác điểm trung bình (GPA) bạn cần đạt được trong các tín chỉ còn lại để chạm tới mục tiêu (ví dụ: từ 3.2 lên 3.6).
- **Hỗ trợ Học cải thiện**: Tính toán kết hợp giữa việc học các môn mới và học lại các môn điểm thấp.
- **Kết quả dự báo chi tiết**:
    -  **Khả thi**: Hiển thị con số GPA cụ thể cần đạt cho mỗi môn học sắp tới.
    -  **Đã đạt**: Thông báo khi GPA hiện tại của bạn đã đủ để đạt mục tiêu mà không cần áp lực điểm số cao.
    -  **Cảnh báo**: Tự động phát hiện nếu mục tiêu quá cao (GPA yêu cầu > 4.0) hoặc khi bạn không còn đủ tín chỉ để thay đổi kết quả.
    -  **Gợi ý thông minh**: Trong trường hợp "bất khả thi", hệ thống sẽ tự động quét lịch sử học tập (từ tab Tính thủ công) và đề xuất danh sách các môn nên học lại để tối ưu hóa điểm số nhanh nhất.

![Lộ trình GPA](assets/images/Tab1.png)
*Giao diện nhập liệu và kết quả tính toán*

### 2. 📝 Tính GPA Thủ công & Import dữ liệu
- **Import thông minh**: Copy bảng điểm trực tiếp từ Portal đào tạo và dán vào công cụ. Tự động nhận diện tên môn, số tín chỉ và điểm số.
- **Quản lý chi tiết**: Quản lý điểm số theo từng học kỳ, tính GPA tích lũy và GPA từng kỳ theo thờigian thực.
- **Biểu đồ tiến trình**: Theo dõi sự thay đổi GPA qua các học kỳ với biểu đồ trực quan (Chart.js).
- Chuyển dữ liệu sang tab "Lộ trình GPA" để lập kế hoạch.

![Tính GPA thủ công](assets/images/Tab2.2.png)

#### Hướng dẫn Import từ Portal
1. Truy cập Portal đào tạo, vào phần Kết quả học tập.
2. Bôi đen và copy toàn bộ bảng điểm.
3. Dán vào công cụ để tự động nhập.

![Hướng dẫn Import 1](assets/images/HD1.png)
![Hướng dẫn Import 2](assets/images/HD2.png)

### 3. 📊 Tính điểm Môn học (Course Grade)
Tính toán điểm thi cuối kỳ cần đạt dựa trên điểm quá trình và tỷ lệ phần trăm.

![Tính điểm môn học](assets/images/Tab3.png)

### 4. 📋 Thang điểm chuẩn HUFLIT
- Tích hợp sẵn thang điểm quy đổi (A, B+, B, C+...) theo quy chế mới nhất.
- Phân loại học lực dựa trên GPA tích lũy.
- Thờigian biểu học tập chi tiết theo tiết.

### 5. 📰 Tin tức & Tài liệu
- **Tin tức cập nhật**: Thông báo hoạt động, kế hoạch nghỉ lễ, thông báo rèn luyện.
- **Sổ tay Sinh viên**: Cẩm nang Đại học HUFLIT với lazy loading để tiết kiệm băng thông.
- **Hình ảnh phóng to**: Nhấn vào ảnh để xem chi tiết.

### 6. 🌙 Chế độ tối/sáng
- Chuyển đổi giữa giao diện sáng và tối.
- Lưu trữ tùy chọn trong trình duyệt.

### 7. 📖 Hướng dẫn sử dụng tích hợp
- Modal hướng dẫn chi tiết cho từng tab.
- Tự động hiển thị lần đầu truy cập.
- Yêu cầu xác nhận để đóng.

### 8. 📱 Responsive Design & PWA
- Tương thích hoàn toàn với mobile và desktop.
- Giao diện tối ưu cho từng kích thước màn hình.
- Progressive Web App (PWA) - cài đặt như ứng dụng native.

### 9. 💬 Góp ý & Cộng đồng
- Form gửi góp ý với phân loại (tính năng mới, báo lỗi, cải tiến).
- Hiển thị cộng đồng ý kiến công khai.

## 🛠 Công nghệ sử dụng

- **Frontend**: HTML5, CSS3 (Bootstrap 5.3)
- **JavaScript**: Vanilla JS (ES6 Modules, Modular Architecture)
- **Storage**: LocalStorage cho dữ liệu cá nhân
- **Charts**: Chart.js cho biểu đồ GPA
- **PDF Export**: jsPDF + html2canvas
- **Markdown**: Marked.js cho hiển thị tài liệu
- **Icons**: Bootstrap Icons
- **Fonts**: Google Fonts (Inter)
- **Analytics**: GoatCounter (Privacy-focused)
- **PWA**: Service Worker (Manifest-based)
- **Build**: No build process - Direct deployment

## 🚀 Cách sử dụng

1. Mở file `index.html` trong trình duyệt hoặc truy cập [trang web đã deploy](https://tienxdun.github.io/HUFLIT_GPA_Strategist/).
2. Chọn tab chức năng trên thanh điều hướng.
3. Nhập dữ liệu và xem kết quả tức thì.
4. Sử dụng nút chuyển đổi theme để thay đổi giao diện.
5. Nhấn vào avatar để xem thông tin liên hệ và hướng dẫn.

## 📂 Cấu trúc dự án

```
HUFLIT_GPA_Strategist/
├── index.html                  # Giao diện chính (Single Page Application)
├── manifest.json               # PWA manifest
├── LICENSE                     # Giấy phép MIT
├── README.md                   # Tài liệu này
├── css/
│   └── main.css                # CSS chính với tối ưu animation
├── js/                         # Mã nguồn JavaScript (ES6 Modules)
│   ├── main.js                 # Entry point: Khởi tạo ứng dụng
│   ├── core/                   # Business Logic & Constants
│   │   ├── app-constants.js    # Hằng số ứng dụng (Grade scales, Config)
│   │   ├── constants.js        # Hằng số cũ (deprecated)
│   │   ├── calculator.js       # Các hàm tính toán thuần túy
│   │   ├── utils.js            # Hàm tiện ích (Parser, Format)
│   │   ├── validators.js       # Hàm validate dữ liệu
│   │   └── share.js            # Chia sẻ dữ liệu (Export/Import)
│   ├── state/                  # State Management
│   │   ├── store.js            # Central Store & Observer pattern
│   │   └── actions.js          # Các action cập nhật state
│   ├── services/               # Services
│   │   └── storage.js          # Quản lý LocalStorage
│   └── ui/                     # User Interface Logic
│       ├── events.js           # Event Listeners & Controller Logic
│       ├── renderers.js        # DOM Manipulation & HTML Generation
│       ├── effects.js          # Visual Effects
│       └── components/         # UI Components
│           └── template-utils.js
├── templates/                  # HTML Templates
│   ├── components/modals/      # Modal components
│   ├── shared/                 # Shared templates
│   └── tabs/                   # Tab content templates
├── assets/                     # Tài nguyên tĩnh
│   └── images/                 # Hình ảnh & screenshots
├── tests/                      # Unit Tests
│   ├── fixtures/               # Test data
│   ├── test-logic.js           # Test runner
│   └── unit/                   # Unit test files
│       ├── calculator.test.js
│       ├── utils.test.js
│       └── validators.test.js
└── .github/
    ├── workflows/
    │   └── deploy.yml          # GitHub Actions - Auto deploy to Pages
    ├── ARCHITECTURE.md         # Tài liệu kiến trúc kỹ thuật
    ├── PROJECT_GUIDELINES.md   # Quy tắc dự án
    └── copilot-instructions.md # Hướng dẫn cho Copilot
```


## 📞 Liên hệ

- **Tác giả**: Tiến Dũng 
- **Facebook**: [tienxdun](https://www.facebook.com/tienxdun/)

---

*Công cụ này được phát triển với mục đích hỗ trợ học tập cho các sinh viên trường Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT).*

## Giấy phép

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.
