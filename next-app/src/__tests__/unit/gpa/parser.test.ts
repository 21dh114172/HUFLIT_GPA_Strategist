import { describe, it, expect } from 'vitest';
import { parsePortalText } from '../../../lib/gpa/parser';

describe('parsePortalText', () => {
  it('should correctly parse portal text with A+ grades', () => {
    const portalText = `
Năm học: 2023-2024 - Học kỳ: HK1
1 123456 Tên môn học 1 3 9.5 4.0 A+
2 123457 Tên môn học 2 2 8.0 3.5 B+
    `;
    const result = parsePortalText(portalText);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('HK1 (2023-2024)');
    expect(result[0].courses).toHaveLength(2);
    
    expect(result[0].courses[0].name).toBe('Tên môn học 1');
    expect(result[0].courses[0].grade).toBe('A+');
    expect(result[0].courses[0].credits).toBe(3);
    
    expect(result[0].courses[1].name).toBe('Tên môn học 2');
    expect(result[0].courses[1].grade).toBe('B+');
  });

  it('should handle standard A grades correctly', () => {
    const portalText = `
Năm học: 2023-2024 - Học kỳ: HK2
1 123458 Tên môn học 3 3 8.5 4.0 A
    `;
    const result = parsePortalText(portalText);
    expect(result[0].courses[0].name).toBe('Tên môn học 3');
    expect(result[0].courses[0].grade).toBe('A');
  });

  it('should handle ungraded subjects', () => {
    const portalText = `
Năm học: 2023-2024 - Học kỳ: HK3
1 123459 Tên môn học 4 3 Chưa nhập điểm
    `;
    const result = parsePortalText(portalText);
    expect(result[0].courses[0].name).toBe('Tên môn học 4');
    expect(result[0].courses[0].grade).toBe('');
    expect(result[0].courses[0].credits).toBe(3);
  });

  it('should identify retake courses based on history', () => {
    const portalText = `
Năm học: 2022-2023 - Học kỳ: HK1
1 123450 Môn lặp lại 3 4.0 1.0 D
Năm học: 2023-2024 - Học kỳ: HK1
1 123450 Môn lặp lại 3 8.5 4.0 A
    `;
    const result = parsePortalText(portalText);
    
    expect(result).toHaveLength(2);
    
    // Check HK1 2023-2024 (the second semester in sorted output)
    const retakeCourse = result[1].courses[0];
    expect(retakeCourse.name).toBe('Môn lặp lại');
    expect(retakeCourse.isRetake).toBe(true);
    expect(retakeCourse.oldGrade).toBe('D');
    expect(retakeCourse.grade).toBe('A');
  });
});
