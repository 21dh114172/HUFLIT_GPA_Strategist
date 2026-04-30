# Phân tích Logic điểm F và Học lại (HUFLIT Portal)

Tài liệu này phân tích dữ liệu thực tế từ Portal để xác định chính xác công thức tính toán của trường, đặc biệt là cách xử lý điểm F trong điểm thành phần và điểm tích lũy.

## 1. Dữ liệu mẫu (Dữ liệu do người dùng cung cấp)

```text
[Dữ liệu gốc chứa nhiều điểm F và các môn học lại đã được ghi nhận trong PORTAL_SAMPLE.md]
```

## 2. Phân tích toán học (Reverse Engineering)

Dựa trên dữ liệu học kỳ HK01 (2022-2023) và HK02 (2022-2023):

### A. Cách tính GPA Học kỳ (Semester GPA)
- **Quy tắc**: Điểm F **PHẢI** tính vào mẫu số.
- **Chứng minh (HK01 2022-2023)**:
    - Tổng điểm (Points): môn đạt (29.5) + môn F (0) = 29.5.
    - Tổng tín chỉ (Denominator): môn đạt (15) + môn F (2) = **17**.
    - GPA HK: $29.5 / 17 = 1.735 \approx \mathbf{1.74}$ (Khớp hoàn toàn với Portal).

### B. Cách tính GPA Tích lũy (Cumulative GPA)
- **Quy tắc cực kỳ quan trọng**: Điểm F **KHÔNG** tính vào điểm tích lũy. Mẫu số tích lũy chỉ tính các môn đã **ĐẠT (>= D)**.
- **Chứng minh (HK01 2022-2023)**:
    - Điểm tích lũy trước đó (HK02 21-22): 114.52 điểm / 37 tín chỉ (GPA 3.09).
    - HK01 22-23 thêm 29.5 điểm và môn F (Toán ứng dụng - 2 tín chỉ).
    - Nếu tính F: $(114.52 + 29.5) / (37 + 17) = 2.66$.
    - Nếu không tính F: $(114.52 + 29.5) / (37 + 15) = 144.02 / 52 = \mathbf{2.77}$ (Khớp hoàn toàn với Portal).
- **Kết luận**: Tại HUFLIT, điểm F chỉ làm xấu GPA học kỳ đó. GPA tích lũy toàn khóa chỉ tính trên các môn sinh viên đã "tích lũy" được (tức là đã đậu).

### C. Logic Học lại và Cải thiện
- **Học lại môn F**: Khi môn F được học lại và đậu, số tín chỉ của môn đó mới bắt đầu được cộng vào mẫu số tích lũy, và điểm mới được cộng vào tử số.
- **Học cải thiện (D -> B)**: Mẫu số tích lũy không đổi (vì môn đó đã được tính vào "tích lũy" từ trước). Chỉ có phần chênh lệch điểm (Delta Points) được cộng thêm vào tử số.
- **Chứng minh (HK03 2024-2025 - SV Công nghệ)**:
    - SV học cải thiện môn Tư tưởng Hồ Chí Minh (D+ -> C).
    - Tín chỉ tích lũy giữ nguyên: 140.
    - Điểm tăng thêm (Delta): $(2.0 - 1.5) \times 2 = 1.0$ điểm.
    - GPA Tích lũy mới: $(340.2 + 1.0) / 140 = \mathbf{2.44}$ (Khớp).

### D. Chứng minh trên Dữ liệu Quản trị (Dữ liệu mẫu 2)
- **HK01 2022-2023**: Có môn F (Toán ứng dụng - 2TC). GPA HK = 1.74 (Tính cả F).
- **HK02 2022-2023**: Có 2 môn F (6TC). GPA HK = 1.45 (Tính cả F).
- **Tích lũy cuối HK02 22-23**: 
    - Tổng điểm đạt: 174.52.
    - Tín chỉ tích lũy (Chỉ môn đậu): 67.
    - GPA Tích lũy: $174.52 / 67 = \mathbf{2.60}$ (Khớp hoàn toàn với Portal).

## 3. Chỉ dẫn cho Agent (Implementation Rules)

1. **Engine tính toán**: 
   - `calculateSemesterGPA`: `Points / TotalCredits` (Incs F).
   - `calculateCumulativeGPA`: `TotalPoints / PassedCredits` (Excs F).
2. **Cảnh báo học vụ**: 
   - Sử dụng `SemesterGPA` (có tính F) để xét cảnh báo < 0.8 hoặc < 1.0.
3. **Hiển thị**:
   - Trong bảng Summary của từng kỳ: Hiển thị GPA kỳ (có tính F).
   - Trong Sidebar Tổng kết: Hiển thị GPA tích lũy (chỉ tính môn đậu).
