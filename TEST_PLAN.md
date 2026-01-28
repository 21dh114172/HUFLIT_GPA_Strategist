# Kế hoạch Kiểm thử (Test Plan) - HUFLIT GPA Strategist

## 1. Tổng quan
Tài liệu này trình bày kế hoạch kiểm thử cho dự án HUFLIT GPA Strategist, nhằm đảm bảo các tính năng tính toán điểm số hoạt động chính xác và mang lại trải nghiệm tốt nhất cho sinh viên HUFLIT.

## 2. Mục tiêu kiểm thử
- Xác nhận tính chính xác của thuật toán tính GPA (hệ 4.0) theo quy chế HUFLIT.
- Đảm bảo giao diện phản hồi tốt (Responsive) trên cả máy tính và thiết bị di động.
- Kiểm tra tính ổn định của việc lưu trữ dữ liệu cục bộ (LocalStorage).
- Xác minh khả năng xử lý lỗi nhập liệu của người dùng.

## 3. Phạm vi kiểm thử (Scope)

### 3.1. Kiểm thử chức năng (Functional Testing)
- **Tính GPA Thủ công:** Thêm/Xóa học kỳ, Thêm/Xóa môn học, chọn điểm chữ, nhập số tín chỉ.
- **Logic Học cải thiện (HUFLIT):** 
    - Chỉ được phép đăng ký học lại cho các môn có điểm < B (C+, C, D+, D, F).
    - Điểm cao hơn trong các lần học sẽ được chọn làm điểm chính thức.
- **Lộ trình GPA:** Tính toán số điểm cần đạt trong các kỳ tới để đạt được GPA mục tiêu.
- **Tính điểm Môn học:** Tính điểm tổng kết từ các đầu điểm thành phần (giữa kỳ, cuối kỳ...).
- **Portal Import:** Kiểm tra tính năng copy-paste hoặc import bảng điểm từ hệ thống Portal HUFLIT.
- **Gợi ý cải thiện:** Kiểm tra thuật toán gợi ý các môn nên học lại để tối ưu GPA.

### 3.2. Kiểm thử giao diện (UI/UX Testing)
- Chế độ Sáng/Tối (Light/Dark mode).
- Hiển thị biểu đồ xu hướng GPA.
- Tính tương thích của giao diện trên các kích thước màn hình khác nhau.

### 3.3. Kiểm thử hiệu năng & Lưu trữ
- Tốc độ phản hồi khi có số lượng lớn dữ liệu học kỳ.
- Dữ liệu không bị mất sau khi tải lại trang (LocalStorage).

## 4. Các kịch bản kiểm thử trọng tâm (Test Scenarios)

| ID | Thành phần | Kịch bản kiểm thử | Kết quả mong đợi |
|:---|:---|:---|:---|
| TC-01 | Tính GPA | Nhập bảng điểm với đầy đủ các loại điểm (A+, A, B+, B, C+, C, D+, D, F) | GPA tổng kết và xếp loại phải khớp với công thức HUFLIT. |
| TC-02 | Học cải thiện | Đánh dấu một môn là "Học cải thiện" từ điểm C lên điểm B | Điểm C cũ bị loại bỏ, điểm B mới được tính vào GPA (vì B > C). |
| TC-02.1 | Học cải thiện | Đánh dấu một môn là "Học cải thiện" từ điểm C lên điểm D | GPA không đổi (vì điểm cũ C > điểm mới D, lấy điểm cao nhất). |
| TC-02.2 | Học cải thiện | Kiểm tra tính năng "Gợi ý cải thiện" cho môn đã bị điểm B+ | Hệ thống không được gợi ý môn này (vì B+ không thuộc diện được cải thiện). |
| TC-03 | Nhập liệu | Nhập số tín chỉ là số âm hoặc bằng 0 | Hệ thống phải báo lỗi hoặc không cho phép tính toán. |
| TC-04 | Lộ trình GPA | Đặt mục tiêu GPA 3.2 khi GPA hiện tại là 2.0 và chỉ còn 10 tín chỉ | Hệ thống phải thông báo mục tiêu này là "Không khả thi". |
| TC-05 | Portal Import | Dán nội dung copy từ bảng điểm Portal HUFLIT | Hệ thống tự động bóc tách đúng tên môn, số tín chỉ và điểm số. |
| TC-06 | Lưu trữ | Refresh trang sau khi đã nhập 3 học kỳ | Dữ liệu vẫn còn nguyên vẹn trong các bảng nhập liệu. |

## 5. Môi trường kiểm thử
- **Trình duyệt:** Google Chrome (Best support), Microsoft Edge, Firefox, Safari (iOS).
- **Thiết bị:** Laptop (Window/macOS), Smartphone (Android/iOS).

## 6. Quy trình báo lỗi
Nếu phát hiện lỗi, Tester sẽ báo cáo qua các bước:
1. Mô tả ngắn gọn lỗi.
2. Các bước tái hiện (Steps to reproduce).
3. Kết quả thực tế vs Kết quả mong đợi.
4. Ảnh chụp màn hình hoặc video minh họa.
