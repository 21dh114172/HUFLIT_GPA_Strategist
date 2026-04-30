export const GRADE_SCALE = [
  { grade: 'A+', min: 9.0, max: 10.0, gpa: 4.0 },
  { grade: 'A', min: 8.5, max: 8.9, gpa: 4.0 },
  { grade: 'B+', min: 8.0, max: 8.4, gpa: 3.5 },
  { grade: 'B', min: 7.0, max: 7.9, gpa: 3.0 },
  { grade: 'C+', min: 6.0, max: 6.9, gpa: 2.5 },
  { grade: 'C', min: 5.5, max: 5.9, gpa: 2.0 },
  { grade: 'D+', min: 5.0, max: 5.4, gpa: 1.5 },
  { grade: 'D', min: 4.0, max: 4.9, gpa: 1.0 },
  { grade: 'F', min: 0.0, max: 3.9, gpa: 0.0 },
];

export const APP_CONFIG = {
  MAX_GPA: 4.0,
  MIN_GPA: 0.0,
  MIN_PASS_GPA: 1.0,
  AVG_CREDITS_PER_COURSE: 3,
  MIN_CREDITS_FOR_RETAKE: 2,
};

export const GPA_RANKS = {
  EXCELLENT: { label: 'Xuất sắc', min: 3.6, max: 4.0, color: 'success' },
  GOOD: { label: 'Giỏi', min: 3.2, max: 3.59, color: 'primary' },
  FAIR: { label: 'Khá', min: 2.5, max: 3.19, color: 'info' },
  AVERAGE: { label: 'Trung bình', min: 2.0, max: 2.49, color: 'warning' },
  WEAK: { label: 'Yếu', min: 1.0, max: 1.99, color: 'secondary' },
  POOR: { label: 'Kém', min: 0.0, max: 0.99, color: 'danger' },
};

export const NON_IMPROVABLE_GRADES = ['A+', 'A', 'B+', 'B'];

export interface Course {
  name: string;
  credits: number;
  grade: string;
  isRetake?: boolean;
  oldGrade?: string;
}

export interface Semester {
  name: string;
  courses: Course[];
}

export interface GPAResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  rank: string;
  semesterStats: {
    name: string;
    gpa: number;
    credits: number;
    passedCredits: number;
    failedCredits: number;
    cumulativeCredits: number; // Snapshot cumulative credits up to this sem
    cumulativeGPA: number; // Snapshot cumulative GPA up to this sem
    isWarning: boolean;
  }[];
}

export function findGradeInfo(grade: string) {
  return GRADE_SCALE.find((g) => g.grade === grade);
}

export function roundGPA(gpa: number): number {
  return Math.round(gpa * 100) / 100;
}

export function classifyGPA(gpa: number): string {
  const rounded = parseFloat(gpa.toFixed(2));
  for (const rank of Object.values(GPA_RANKS)) {
    if (rounded >= rank.min && rounded <= rank.max + 0.001) {
      return rank.label;
    }
  }
  return GPA_RANKS.WEAK.label;
}

export function calculateManualGPA(
  semesters: Semester[],
  initialGPA: number = 0,
  initialCredits: number = 0
): GPAResult {
  const baseCredits = Math.max(0, initialCredits || 0);
  const baseGPA = Math.max(0, initialGPA || 0);

  // HUFLIT Cumulative logic: Only counts passed credits in denominator
  const state = {
    totalPoints: baseGPA * baseCredits,
    totalCredits: baseCredits, // This will track PASSING credits for Cumulative GPA
  };

  const semesterStats: GPAResult["semesterStats"] = [];

  if (!Array.isArray(semesters)) return { gpa: 0, totalCredits: 0, totalPoints: 0, rank: "N/A", semesterStats: [] };

  semesters.forEach((semester, sIdx) => {
    if (!semester?.courses?.length) {
      semesterStats.push({
        name: semester?.name || `Học kỳ ${sIdx + 1}`,
        gpa: 0,
        credits: 0,
        passedCredits: 0,
        failedCredits: 0,
        cumulativeGPA: state.totalCredits > 0 ? state.totalPoints / state.totalCredits : 0,
        cumulativeCredits: state.totalCredits,
        isWarning: false
      });
      return;
    }

    let semPoints = 0;
    let semCredits = 0;
    let passedCreditsInSem = 0;
    let failedCreditsInSem = 0;

    semester.courses.forEach((course) => {
      const gradeInfo = findGradeInfo(course.grade);
      if (!gradeInfo) return;

      const courseCredits = course.credits || 0;
      
      // Every course counts for SEMESTER GPA (Denominator)
      semPoints += gradeInfo.gpa * courseCredits;
      semCredits += courseCredits;

      if (gradeInfo.gpa > 0) {
        passedCreditsInSem += courseCredits;
      } else {
        failedCreditsInSem += courseCredits;
      }

      if (course.isRetake) {
        const oldGradeInfo = findGradeInfo(course.oldGrade || '');
        if (oldGradeInfo) {
          const newGPA = gradeInfo.gpa;
          const oldGPA = oldGradeInfo.gpa;
          const isOldF = oldGPA === 0;

          if (isOldF) {
            if (newGPA > 0) {
              state.totalPoints += newGPA * courseCredits;
              state.totalCredits += courseCredits;
            }
          } else {
            if (newGPA > oldGPA) {
              state.totalPoints += (newGPA - oldGPA) * courseCredits;
            }
          }
        }
      } else {
        if (gradeInfo.gpa > 0) {
          state.totalPoints += gradeInfo.gpa * courseCredits;
          state.totalCredits += courseCredits;
        }
      }
    });

    const semGPA = semCredits > 0 ? semPoints / semCredits : 0;
    const threshold = sIdx === 0 ? 0.8 : 1.0;
    const isWarning = semCredits > 0 && semGPA < threshold;

    semesterStats.push({
      name: semester.name || `HK ${sIdx + 1}`,
      gpa: roundGPA(semGPA),
      credits: semCredits,
      passedCredits: passedCreditsInSem,
      failedCredits: failedCreditsInSem,
      cumulativeCredits: state.totalCredits,
      cumulativeGPA: state.totalCredits > 0 ? roundGPA(state.totalPoints / state.totalCredits) : 0,
      isWarning
    });
  });

  const finalCumulativeGpa = state.totalCredits > 0 ? state.totalPoints / state.totalCredits : 0;

  return {
    gpa: roundGPA(finalCumulativeGpa),
    totalCredits: state.totalCredits,
    totalPoints: roundGPA(state.totalPoints),
    rank: classifyGPA(finalCumulativeGpa),
    semesterStats
  };
}

export function calculateTargetResult(
  currentGPA: number,
  currentCredits: number,
  targetGPA: number,
  newCredits: number,
  retakes: { oldGrade: number; credits: number; targetGrade?: number }[] = []
) {
  let removedPoints = 0;
  let retakeTotalCredits = 0;
  let creditsFromF = 0;
  let lockedRetakePoints = 0;     // Points from retakes with a fixed target grade
  let lockedRetakeCredits = 0;    // Credits from retakes with a fixed target grade

  for (const item of retakes) {
    const oldGrade = item.oldGrade;
    const creds = item.credits;
    if (!isNaN(oldGrade) && !isNaN(creds)) {
      removedPoints += oldGrade * creds;
      retakeTotalCredits += creds;
      if (oldGrade === 0) {
        creditsFromF += creds;
      }

      // If user locked a target grade for this retake, account for it separately
      if (item.targetGrade !== undefined && !isNaN(item.targetGrade)) {
        lockedRetakePoints += item.targetGrade * creds;
        lockedRetakeCredits += creds;
      }
    }
  }

  const currentTotalPoints = currentGPA * currentCredits;
  const effectiveCurrentPoints = currentTotalPoints - removedPoints + lockedRetakePoints;
  const totalFutureCredits = currentCredits + newCredits + creditsFromF;
  const targetTotalPoints = targetGPA * totalFutureCredits;

  const requiredPoints = targetTotalPoints - effectiveCurrentPoints;
  // Exclude locked retake credits from the "effort pool" since their contribution is already accounted
  const totalEffortCredits = newCredits + (retakeTotalCredits - lockedRetakeCredits);
  const requiredGPA = totalEffortCredits > 0 
    ? requiredPoints / totalEffortCredits 
    : (requiredPoints > 0.001 ? Infinity : 0);

  return {
    requiredGPA: roundGPA(requiredGPA),
    requiredPoints: roundGPA(requiredPoints),
    totalFutureCredits,
    effectiveCurrentPoints: roundGPA(effectiveCurrentPoints),
    targetTotalPoints: roundGPA(targetTotalPoints),
    newCredits,
    totalEffortCredits,
  };
}

export function parsePortalText(text: string): Semester[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const semesters: Semester[] = [];
  let currentSemester: Semester | null = null;

  for (const line of lines) {
    const semMatch = line.match(/Năm học:\s*(\d{4}-\d{4})\s*-\s*Học kỳ:\s*(HK\d+)/i);
    if (semMatch) {
      currentSemester = {
        name: `${semMatch[2]} (${semMatch[1]})`,
        courses: []
      };
      semesters.push(currentSemester);
      continue;
    }

    const courseMatch = line.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+([A-Z]\+?)(?=\s|$)/);
    const ungradedMatch = line.match(/(\d+(?:\.\d+)?)\s+(?=Chưa nhập điểm|Chưa khảo sát)/);

    if (courseMatch && currentSemester) {
      const matchIndex = courseMatch.index || 0;
      const prefix = line.substring(0, matchIndex).trim();
      let courseName = prefix;
      const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
      if (nameMatch) {
        courseName = nameMatch[1].trim();
      }

      if (courseName.includes('*')) continue;

      const credits = parseFloat(courseMatch[1]);
      let gradeChar = courseMatch[4];

      if (gradeChar === 'A+') gradeChar = 'A';

      const isValidGrade = GRADE_SCALE.some(g => g.grade === gradeChar);

      if (isValidGrade && credits < 20) {
        currentSemester.courses.push({
          name: courseName,
          credits: credits,
          grade: gradeChar,
          isRetake: false,
          oldGrade: 'D'
        });
      }
    } else if (ungradedMatch && currentSemester) {
      const credits = parseFloat(ungradedMatch[1]);
      const matchIndex = ungradedMatch.index || 0;
      const prefix = line.substring(0, matchIndex).trim();
      let courseName = prefix;
      const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
      if (nameMatch) {
        courseName = nameMatch[1].trim();
      }
      
      if (courseName.includes('*')) continue;
      
      if (credits < 20) {
        currentSemester.courses.push({
          name: courseName,
          credits: credits,
          grade: "",
          isRetake: false,
          oldGrade: ""
        });
      }
    }
  }

  const allCourses: { course: Course; semValue: number }[] = [];
  semesters.map((sem, semIdx) => {
    let semValue = semIdx;
    const match = sem.name.match(/HK(\d+)\s*\((\d{4})-(\d{4})\)/);
    if (match) {
      const hk = parseInt(match[1]);
      const year = parseInt(match[2]);
      semValue = year * 10 + hk;
    }
    sem.courses.forEach(course => {
      allCourses.push({ course, semValue });
    });
  });

  allCourses.sort((a, b) => a.semValue - b.semValue);
  const courseHistory = new Map<string, string>();

  allCourses.forEach(item => {
    const name = item.course.name;
    if (courseHistory.has(name)) {
      item.course.isRetake = true;
      item.course.oldGrade = courseHistory.get(name);
    }
    courseHistory.set(name, item.course.grade);
  });

  return semesters;
}

export interface GradeCombination {
  g1: { grade: string; gpa: number };
  c1: number;
  g2: { grade: string; gpa: number };
  c2: number;
  totalPoints: number;
}

export function generateGradeCombinations(credits: number, targetPoints: number): GradeCombination[] {
  const combinations: GradeCombination[] = [];
  const grades = GRADE_SCALE
    .filter(g => g.gpa > 0 && g.grade !== 'A+')
    .map(g => ({ 
      grade: g.grade, 
      gpa: g.gpa
    }));
  
  // Try all pairs of grades
  const allPossible: GradeCombination[] = [];
  for (let i = 0; i < grades.length; i++) {
    for (let j = i; j < grades.length; j++) {
      const combination = calculateCombination(grades[i], grades[j], credits, targetPoints);
      if (combination) {
        // Only keep if the combination is meaningful:
        // 1. If it's the same grade pair, take the one that works
        // 2. Both c1 and c2 should ideally be >= 2 (standard credits at HUFLIT)
        // 3. Avoid huge gaps between g1 and g2 (difficult to manage effort)
        
        // Filter out 1-credit outcomes as HUFLIT courses are min 2 credits
        if (combination.c1 === 1 || combination.c2 === 1) {
          continue;
        }

        const gap = Math.abs(combination.g1.gpa - combination.g2.gpa);
        if (gap <= 2.0) { // Max gap A+ (4.0) vs C (2.0)
          allPossible.push(combination);
        }
      }
    }
  }
  
  // Deduplicate by EFFECTIVE OUTCOME, not grade names
  // e.g. "C+ & C" with c2=0 and "C+ & D+" with c2=0 are both "just get C+ for everything"
  const uniqueOutcomes = new Map<string, GradeCombination>();
  allPossible.forEach(c => {
    let key: string;
    if (c.c2 === 0) {
      // All credits go to g1 — key is just g1 grade
      key = `${c.g1.grade}:ALL`;
    } else if (c.c1 === 0) {
      // All credits go to g2 — key is just g2 grade
      key = `${c.g2.grade}:ALL`;
    } else {
      // True two-grade mix — key is the sorted pair + credit split
      key = `${c.g1.grade}-${c.c1}:${c.g2.grade}-${c.c2}`;
    }

    if (!uniqueOutcomes.has(key)) {
      uniqueOutcomes.set(key, c);
    }
  });

  return Array.from(uniqueOutcomes.values())
    .sort((a, b) => {
      const totalCredits = a.c1 + a.c2;
      const totalCreditsB = b.c1 + b.c2;
      
      // Primary sort: effective GPA required (lower = easier = rank first)
      // effectiveGPA = totalPoints / totalCredits reflects the REAL average grade needed
      const effectiveGPAA = totalCredits > 0 ? a.totalPoints / totalCredits : 0;
      const effectiveGPAB = totalCreditsB > 0 ? b.totalPoints / totalCreditsB : 0;
      
      if (Math.abs(effectiveGPAA - effectiveGPAB) > 0.01) {
        return effectiveGPAA - effectiveGPAB;
      }
      
      // Secondary: prefer balanced splits (small gap between g1 and g2)
      const gapA = Math.abs(a.g1.gpa - a.g2.gpa);
      const gapB = Math.abs(b.g1.gpa - b.g2.gpa);
      return gapA - gapB;
    });
}

function calculateCombination(g1: { grade: string; gpa: number }, g2: { grade: string; gpa: number }, credits: number, targetPoints: number): GradeCombination | null {
  let c1 = 0;
  let found = false;
  
  if (Math.abs(g1.gpa - g2.gpa) < 0.01) {
    if (credits * g1.gpa >= targetPoints - 0.01) {
      c1 = 0;
      found = true;
    }
  } else {
    // Equation: c1*g1 + (credits-c1)*g2 >= targetPoints
    // c1(g1-g2) >= targetPoints - credits*g2
    const numerator = targetPoints - (credits * g2.gpa);
    const denominator = g1.gpa - g2.gpa;
    
    let minC1 = Math.ceil(numerator / denominator - 0.0001);
    if (minC1 < 0) minC1 = 0;
    
    // Constraints: no half-credits at HUFLIT usually, but we work with integers for simple suggestions
    if (minC1 <= credits) {
      c1 = minC1;
      found = true;
    }
  }
  
  if (!found) return null;
  
  const c2 = credits - c1;
  const totalPoints = (c1 * g1.gpa) + (c2 * g2.gpa);
  
  return { g1, c1, g2, c2, totalPoints };
}

export function generateScenarioText(combination: GradeCombination | null, totalEffortCredits: number = 0, isImpossible: boolean = false): string {
  if (isImpossible) {
    if (totalEffortCredits === 0) return "Cần thêm môn học cải thiện hoặc đăng ký tín chỉ mới để nâng điểm.";
    return "Mục tiêu hiện tại không khả thi với số tín chỉ dự kiến này.";
  }
  
  if (!combination) return "Hãy thiết lập số tín chỉ và mục tiêu để xem kịch bản.";
  
  const { g1, c1, g2, c2 } = combination;
  const textParts = [];
  
  const avgCred = APP_CONFIG.AVG_CREDITS_PER_COURSE;
  
  if (c1 > 0) {
    const num1 = Math.ceil(c1 / avgCred);
    textParts.push(`${num1} môn ${g1.grade}`);
  }
  
  if (c2 > 0) {
    const num2 = Math.ceil(c2 / avgCred);
    textParts.push(`${num2} môn ${g2.grade}`);
  }
  
  if (textParts.length === 0) return "Bạn đã đạt mục tiêu.";
  
  return `Bạn cần đạt ít nhất ${textParts.join(' và ')} trong thời gian tới.`;
}

export interface RetakeSuggestion {
  courses: Course[];
  totalGain: number;
  totalCredits: number;
}

export function generateRetakeSuggestions(deficitPoints: number, targetGPA: number, semesters: Semester[]): RetakeSuggestion[] {
  const candidates: any[] = [];
  
  for (const sem of semesters) {
    for (const course of sem.courses) {
      if (NON_IMPROVABLE_GRADES.includes(course.grade)) continue;
      
      const gradeInfo = findGradeInfo(course.grade);
      if (!gradeInfo) continue;
      
      const currentGPA = gradeInfo.gpa;
      const credits = course.credits || 0;
      
      if (credits < APP_CONFIG.MIN_CREDITS_FOR_RETAKE) continue;
      
      // Potential gain if getting A (4.0)
      const gain = (APP_CONFIG.MAX_GPA - currentGPA) * credits;
      
      candidates.push({ ...course, currentGPA, gain });
    }
  }
  
  // Sort candidates by efficiency (gain per credit) then by gain
  candidates.sort((a, b) => (b.gain / b.credits) - (a.gain / a.credits) || b.gain - a.gain);
  
  const allSuggestions: RetakeSuggestion[] = [];
  const seenKeys = new Set<string>();

  function addSuggestion(courses: any[]) {
    const sortedNames = courses.map(c => c.name).sort();
    const key = sortedNames.join('|');
    if (seenKeys.has(key)) return;
    
    const totalGain = courses.reduce((acc, c) => acc + c.gain, 0);
    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    
    if (totalGain >= deficitPoints) {
      allSuggestions.push({ courses, totalGain, totalCredits });
      seenKeys.add(key);
    }
  }

  // Try 1 course
  for (const c of candidates) {
    addSuggestion([c]);
  }

  // Try pairs
  for (let i = 0; i < Math.min(candidates.length, 15); i++) {
    for (let j = i + 1; j < Math.min(candidates.length, 15); j++) {
      addSuggestion([candidates[i], candidates[j]]);
    }
  }

  // Try triples (only if we don't have enough suggestions yet)
  if (allSuggestions.length < 10) {
    for (let i = 0; i < Math.min(candidates.length, 10); i++) {
      for (let j = i + 1; j < Math.min(candidates.length, 10); j++) {
        for (let k = j + 1; k < Math.min(candidates.length, 10); k++) {
          addSuggestion([candidates[i], candidates[j], candidates[k]]);
        }
      }
    }
  }

  // Rank suggestions:
  // 1. Closest to deficit (but still >= deficit)
  // 2. Minimum credits used
  return allSuggestions
    .sort((a, b) => {
      const diffA = a.totalGain - deficitPoints;
      const diffB = b.totalGain - deficitPoints;
      
      // If one is significantly closer to deficit, prefer it
      if (Math.abs(diffA - diffB) > 0.5) return diffA - diffB;
      
      // Otherwise prefer fewer credits
      return a.totalCredits - b.totalCredits;
    })
    .slice(0, 5);
}
