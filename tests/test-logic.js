// Simple test script for GPA calculation logic
import { calculateManualGPA, generateRetakeSuggestions } from '../js/core/calculator.js';
import { GRADE_SCALE } from '../js/core/constants.js';
import { parsePortalText } from '../js/core/utils.js';

function assert(condition, message) {
    if (!condition) {
        console.error('❌ FAIL: ' + message);
        return false;
    }
    console.log('✅ PASS: ' + message);
    return true;
}

function runTests() {
    console.log('--- Bắt đầu kiểm thử Logic Tính GPA ---');

    // TC-01: Kiểm thử tính GPA thông thường
    const tc01_semesters = [
        {
            courses: [
                { name: 'Môn 1', credits: 3, grade: 'A' },    // 4.0 * 3 = 12
                { name: 'Môn 2', credits: 2, grade: 'B' },    // 3.0 * 2 = 6
            ]
        }
    ];
    const res01 = calculateManualGPA(tc01_semesters, 0, 0);
    // (12 + 6) / 5 = 18 / 5 = 3.6
    assert(Math.abs(res01.gpa - 3.6) < 0.01, 'TC-01: GPA cơ bản (3.6)');

    // TC-02: Học cải thiện từ C (2.0) lên B (3.0)
    // Giả sử đã có 1 môn C - 3 tín chỉ
    const tc02_semesters = [
        {
            courses: [
                { name: 'Môn Cải Thiện', credits: 3, grade: 'B', isRetake: true, oldGrade: 'C' }
            ]
        }
    ];
    // Initial: C (2.0) * 3 = 6 points, 3 credits
    const res02 = calculateManualGPA(tc02_semesters, 2.0, 3);
    // New GPA should be (6 - 6 + 9) / 3 = 3.0 (or via my new logic: 6 + (3.0-2.0)*3 = 9 / 3 = 3.0)
    assert(Math.abs(res02.gpa - 3.0) < 0.01, 'TC-02: Cải thiện từ C lên B (GPA tăng lên 3.0)');

    // TC-02.1: Học cải thiện từ C (2.0) lên D (1.0)
    const tc02_1_semesters = [
        {
            courses: [
                { name: 'Môn Cải Thiện', credits: 3, grade: 'D', isRetake: true, oldGrade: 'C' }
            ]
        }
    ];
    const res02_1 = calculateManualGPA(tc02_1_semesters, 2.0, 3);
    // New grade (1.0) < old grade (2.0) -> GPA should remain 2.0
    assert(Math.abs(res02_1.gpa - 2.0) < 0.01, 'TC-02.1: Cải thiện từ C lên D (GPA giữ nguyên 2.0)');

    // TC-02.3: Học cải thiện từ F (0.0) lên C (2.0)
    const tc02_3_semesters = [
        {
            courses: [
                { name: 'Môn F', credits: 3, grade: 'C', isRetake: true, oldGrade: 'F' }
            ]
        }
    ];
    // Initial points = 0, Initial credits = 0 (since F doesn't count towards credits)
    const res02_3 = calculateManualGPA(tc02_3_semesters, 0, 0);
    // New: (0 + 2.0*3) / 3 = 2.0
    assert(Math.abs(res02_3.gpa - 2.0) < 0.01 && res02_3.totalCredits === 3, 'TC-02.3: Cải thiện từ F lên C (Tăng tín chỉ tích lũy)');

    // TC-02.4: Kiểm tra gợi ý học cải thiện (Gợi ý đúng diện được phép)
    const manualSems = [
        {
            name: 'Học kỳ 1',
            courses: [
                { id: '1', name: 'Môn A', credits: 3, grade: 'A' },
                { id: '2', name: 'Môn B', credits: 3, grade: 'B' },
                { id: '3', name: 'Môn C', credits: 3, grade: 'C' }
            ]
        }
    ];
    const suggestions = generateRetakeSuggestions(1.0, 3.2, manualSems);
    // Should only suggest 'Môn C' because A and B are excluded
    assert(suggestions.length > 0, 'TC-02.4: Có gợi ý học cải thiện');
    assert(suggestions.every(s => s.courses.every(c => c.name === 'Môn C')), 'TC-02.4: Chỉ gợi ý môn C (không gợi ý A, B)');

    // TC-05: Portal Import test
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Triết học Mác - Lênin 3.0 7.0 3.00 B
2 1010444 Tiếng Anh 1 4.0 8.5 4.00 A
    `;
    const imported = parsePortalText(portalString);
    assert(imported.length === 1, 'TC-05: Parse thành công 1 học kỳ');
    assert(imported[0].courses.length === 2, 'TC-05: Parse thành công 2 môn học');
    assert(imported[0].courses[0].name === 'Triết học Mác - Lênin', 'TC-05: Tên môn học chính xác');
    assert(imported[0].courses[0].credits === 3.0, 'TC-05: Số tín chỉ chính xác');
    assert(imported[0].courses[0].grade === 'B', 'TC-05: Điểm chữ chính xác');

    console.log('--- Kết thúc kiểm thử ---');
}

runTests();
