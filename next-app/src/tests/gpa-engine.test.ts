import { describe, it, expect } from 'vitest';
import {
  calculateManualGPA,
  calculateTargetResult,
  classifyGPA,
  roundGPA,
} from '../lib/gpa-engine';

describe('GPA Engine Core Functions', () => {
  describe('roundGPA', () => {
    it('should round GPA to 2 decimal places', () => {
      expect(roundGPA(3.14159)).toBe(3.14);
      expect(roundGPA(3.555)).toBe(3.56);
      expect(roundGPA(3.999)).toBe(4.00);
      expect(roundGPA(3)).toBe(3.00);
    });
  });

  describe('classifyGPA', () => {
    it('should correctly classify GPA values into ranks', () => {
      expect(classifyGPA(4.0)).toBe('Xuất sắc');
      expect(classifyGPA(3.6)).toBe('Xuất sắc');
      expect(classifyGPA(3.5)).toBe('Giỏi');
      expect(classifyGPA(3.2)).toBe('Giỏi');
      expect(classifyGPA(3.1)).toBe('Khá');
      expect(classifyGPA(2.5)).toBe('Khá');
      expect(classifyGPA(2.4)).toBe('Trung bình');
      expect(classifyGPA(2.0)).toBe('Trung bình');
      expect(classifyGPA(1.9)).toBe('Yếu');
      expect(classifyGPA(1.0)).toBe('Yếu');
      expect(classifyGPA(0.9)).toBe('Kém');
      expect(classifyGPA(0.0)).toBe('Kém');
    });
  });

  describe('calculateManualGPA', () => {
    it('should correctly calculate GPA for normal semesters', () => {
      const semesters = [
        {
          name: 'Học kỳ 1',
          courses: [
            { name: 'Triết học', credits: 3, grade: 'A' }, // 3 * 4.0 = 12.0
            { name: 'Toán cao cấp', credits: 3, grade: 'B' }, // 3 * 3.0 = 9.0
            { name: 'Vật lý', credits: 2, grade: 'C' }, // 2 * 2.0 = 4.0
          ],
        },
      ];
      // Total points: 25.0
      // Total credits: 8
      // GPA: 25.0 / 8 = 3.125 => 3.13
      const result = calculateManualGPA(semesters);
      expect(result.gpa).toBe(3.13);
      expect(result.totalCredits).toBe(8);
      expect(result.totalPoints).toBe(25.0);
      expect(result.rank).toBe('Khá');
    });

    it('should correctly calculate GPA with initial state', () => {
      const semesters = [
        {
          name: 'Học kỳ 2',
          courses: [
            { name: 'OOP', credits: 4, grade: 'A+' }, // 4 * 4.0 = 16.0
          ],
        },
      ];
      // Initial: GPA 3.0, Credits 10 => 30 points
      // Total points: 30 + 16 = 46.0
      // Total credits: 10 + 4 = 14
      // GPA: 46.0 / 14 = 3.2857 => 3.29
      const result = calculateManualGPA(semesters, 3.0, 10);
      expect(result.gpa).toBe(3.29);
      expect(result.totalCredits).toBe(14);
      expect(result.totalPoints).toBe(46.0);
    });

    it('should handle retake courses correctly', () => {
      const semesters = [
        {
          name: 'Học kỳ 3 (Học lại)',
          courses: [
            { name: 'Triết học', credits: 3, grade: 'A', isRetake: true, oldGrade: 'F' },
          ],
        },
      ];
      // Initial: GPA 2.0, Credits 10 (Total points 20)
      // Retaking a 3-credit F course with an A (gpa 4.0).
      // Since oldGPA=0 and newGPA=4.0, credits added: +3.
      // Points delta: (4.0 - 0) * 3 = +12.0
      // New Points: 20 + 12 = 32.
      // New Credits: 10 + 3 = 13.
      // New GPA: 32 / 13 = 2.461 => 2.46
      const result = calculateManualGPA(semesters, 2.0, 10);
      
      expect(result.totalCredits).toBe(13);
      expect(result.totalPoints).toBe(32);
      expect(result.gpa).toBe(2.46);
    });

    it('should handle retake courses correctly - improve grade', () => {
      const semesters = [
        {
          name: 'Học kỳ 3 (Cải thiện)',
          courses: [
            { name: 'Triết học', credits: 3, grade: 'A', isRetake: true, oldGrade: 'C' },
          ],
        },
      ];
      // Initial: GPA 2.0, Credits 10 (Points = 20) (Includes the 3-credit C).
      // Retaking C (2.0) with A (4.0).
      // Credits remain 10 since C is already passed.
      // Points delta: (4.0 - 2.0) * 3 = +6
      // New Points: 20 + 6 = 26
      // New GPA: 26 / 10 = 2.6
      const result = calculateManualGPA(semesters, 2.0, 10);
      
      expect(result.totalCredits).toBe(10);
      expect(result.totalPoints).toBe(26);
      expect(result.gpa).toBe(2.6);
    });
  });

  describe('calculateTargetResult', () => {
    it('should calculate required target GPA without retakes', () => {
      // Current: 2.0 GPA, 10 Credits.
      // Want: Target 3.0 GPA with 10 New Credits.
      // Required points total = 3.0 * (10 + 10) = 60.
      // Current points = 20.
      // Required points new = 40.
      // Required GPA = 40 / 10 = 4.0
      const result = calculateTargetResult(2.0, 10, 3.0, 10);
      expect(result.requiredGPA).toBe(4.0);
      expect(result.requiredPoints).toBe(40.0);
      expect(result.totalFutureCredits).toBe(20);
    });
  });
});
