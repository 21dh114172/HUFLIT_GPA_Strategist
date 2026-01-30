import { GRADE_SCALE } from '../core/constants.js';
import { calculateYearlyStats, getYearInfo, calculateManualGPA } from '../core/calculator.js';
import { getManualState, getTargetState } from '../state/store.js';

let gpaChart = null;
let chartJsLoaded = false;

// Lazy load Chart.js only when needed
async function ensureChartJsLoaded() {
    if (chartJsLoaded || typeof Chart !== 'undefined') {
        chartJsLoaded = true;
        return true;
    }
    
    // Chart.js is loaded with defer, wait for it
    return new Promise((resolve) => {
        const checkChart = () => {
            if (typeof Chart !== 'undefined') {
                chartJsLoaded = true;
                resolve(true);
            } else {
                setTimeout(checkChart, 50);
            }
        };
        checkChart();
    });
}

export function initGradeScaleTab() {
    const tableBody = document.getElementById('grade-scale-table-body');
    const classificationBody = document.getElementById('classification-table-body');
    if (!tableBody && !classificationBody) return;

    const { semesters, initialGpa: manualGpa, initialCredits: manualCredits } = getManualState();
    const { gpa: manualCalcGpa } = calculateManualGPA(semesters, parseFloat(manualGpa) || 0, parseFloat(manualCredits) || 0);

    const targetState = getTargetState();
    const targetTabGpa = parseFloat(targetState.currentGpa) || 0;

    // Choose the GPA to highlight (Preferred: Manual tab if it has credits)
    const totalManualCredits = semesters.reduce((sum, sem) => sum + sem.courses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0), 0) + (parseFloat(manualCredits) || 0);

    let currentGPA = 0;
    let hasData = false;

    if (totalManualCredits > 0) {
        currentGPA = parseFloat(manualCalcGpa.toFixed(2));
        hasData = true;
    } else if (targetTabGpa > 0) {
        currentGPA = parseFloat(targetTabGpa.toFixed(2));
        hasData = true;
    }

    // 1. Render Classification Table
    if (classificationBody) {
        const classifications = [
            { label: 'Xuất sắc', min: 3.60, max: 4.00, color: 'success' },
            { label: 'Giỏi', min: 3.20, max: 3.59, color: 'primary' },
            { label: 'Khá', min: 2.50, max: 3.19, color: 'info' },
            { label: 'Trung bình', min: 2.00, max: 2.49, color: 'warning' },
            { label: 'Yếu', min: 1.00, max: 1.99, color: 'secondary' },
            { label: 'Kém', min: 0.00, max: 0.99, color: 'danger' }
        ];

        classificationBody.innerHTML = classifications.map(c => {
            const isActive = hasData && currentGPA >= c.min && currentGPA <= (c.max + 0.001);
            const rowClass = isActive ? `table-${c.color} animate-pulse shadow-sm` : '';
            const badge = isActive ? `<span class="badge bg-white text-${c.color} ms-2 px-2 py-1 border border-${c.color} shadow-sm" style="font-size: 0.7rem; font-weight: 800;">BẠN ĐANG Ở ĐÂY <i class="bi bi-geo-alt-fill"></i></span>` : '';

            let textColorClass = `text-${c.color}`;
            if (c.color === 'info' || c.color === 'warning') textColorClass += '-emphasis';

            return `
                <tr class="transition-all ${rowClass}">
                    <td class="ps-4 py-3 fw-bold ${textColorClass}">${c.label}${badge}</td>
                    <td class="text-end pe-4 small text-secondary fw-medium">${c.min.toFixed(2)} - ${c.max.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }

    // 2. Render Credit Grade Scale Table
    if (tableBody) {
        const scaleData = [
            { grade: 'A+', h10: '9.0 - 10', gpa: 4.0, color: 'success' },
            { grade: 'A', h10: '8.5 - 8.9', gpa: 4.0, color: 'success' },
            { grade: 'B+', h10: '8.0 - 8.4', gpa: 3.5, color: 'primary' },
            { grade: 'B', h10: '7.0 - 7.9', gpa: 3.0, color: 'primary' },
            { grade: 'C+', h10: '6.0 - 6.9', gpa: 2.5, color: 'info' },
            { grade: 'C', h10: '5.5 - 5.9', gpa: 2.0, color: 'info' },
            { grade: 'D+', h10: '5.0 - 5.4', gpa: 1.5, color: 'warning' },
            { grade: 'D', h10: '4.0 - 4.9', gpa: 1.0, color: 'warning' },
            { grade: 'F', h10: '< 4.0', gpa: 0, color: 'danger' }
        ];

        tableBody.innerHTML = scaleData.map((item, index) => {
            let isActive = false;
            if (hasData) {
                if (index === 0) isActive = currentGPA === 4.0;
                else {
                    const prevGpa = scaleData[index - 1].gpa;
                    isActive = currentGPA >= item.gpa && currentGPA < prevGpa;
                }
            }

            return `
                <tr class="align-middle transition-all">
                    <td class="ps-4 py-3">
                        <div class="d-flex align-items-center gap-2">
                             <span class="fw-bold text-${item.color}">${item.grade}</span>
                        </div>
                    </td>
                    <td class="text-center small text-secondary fw-medium">${item.h10}</td>
                    <td class="text-end pe-4 fw-bold text-primary">${item.gpa.toFixed(1)}</td>
                </tr>
            `;
        }).join('');
    }
}

// Track last rendered state to avoid unnecessary re-renders
let lastRenderedHash = '';

function generateStateHash(semesters, initialGpa, initialCredits) {
    // Create a simple hash from the state to detect changes
    const stateString = JSON.stringify({
        sems: semesters.map(s => ({
            id: s.id,
            name: s.name,
            courses: s.courses.map(c => ({
                id: c.id,
                name: c.name,
                credits: c.credits,
                grade: c.grade,
                isRetake: c.isRetake,
                oldGrade: c.oldGrade
            }))
        })),
        gpa: initialGpa,
        credits: initialCredits
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
        const char = stateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

export function renderManualSemesters() {
    const manualSemesterList = document.getElementById('manual-semester-list');
    if (!manualSemesterList) return;

    const { semesters: manualSemesters, initialGpa, initialCredits } = getManualState();

    // Skip render if state hasn't changed (optimization for mobile)
    const currentHash = generateStateHash(manualSemesters, initialGpa, initialCredits);
    if (currentHash === lastRenderedHash) {
        return;
    }
    lastRenderedHash = currentHash;

    // Pre-calculate cumulative GPA for each semester
    let runningTotalPoints = (parseFloat(initialGpa) || 0) * (parseFloat(initialCredits) || 0);
    let runningTotalCredits = parseFloat(initialCredits) || 0;

    const semesterCumulativeGPAs = manualSemesters.map(sem => {
        sem.courses.forEach(course => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(course.credits) || 0;

            if (course.isRetake) {
                const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
                const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;

                // "Điểm cao hơn trong các lần học là điểm chính thức của học phần"
                if (gpa > oldGpa) {
                    runningTotalPoints += (gpa - oldGpa) * credits;

                    if (oldGpa === 0 && gpa > 0) {
                        runningTotalCredits += credits;
                    }
                }
            } else {
                // Add current course
                runningTotalPoints += gpa * credits;
                if (gpa > 0) {
                    runningTotalCredits += credits;
                }
            }
        });

        const cumGPA = runningTotalCredits > 0 ? (runningTotalPoints / runningTotalCredits).toFixed(2) : '0.00';
        return cumGPA;
    });

    // Calculate Yearly Stats
    const yearStats = calculateYearlyStats(manualSemesters);

    manualSemesterList.innerHTML = manualSemesters.map((sem, index) => {
        const semTotalCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);

        // Calculate Semester GPA (excluding ungraded and F grades to match Global GPA logic)
        let semGpaPoints = 0;
        let semGpaCredits = 0;

        sem.courses.forEach(c => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(c.credits) || 0;

            if (gradeInfo) {
                semGpaPoints += gpa * credits;
                semGpaCredits += credits;
            }
        });

        const semGPA = semGpaCredits > 0 ? (semGpaPoints / semGpaCredits).toFixed(2) : '0.00';
        const cumGPA = semesterCumulativeGPAs[index];

        // Check if we should show year summary
        let yearSummaryHtml = '';
        const currentYear = getYearInfo(sem.name);
        const nextSem = manualSemesters[index + 1];
        const nextYear = nextSem ? getYearInfo(nextSem.name) : null;

        if (!nextYear || nextYear.id !== currentYear.id) {
            // End of year group
            const stat = yearStats[currentYear.id];
            if (stat && stat.credits > 0) {
                const yearGPA = (stat.points / stat.credits).toFixed(2);
                yearSummaryHtml = `
                    <div class="alert alert-info d-flex justify-content-between align-items-center mb-3 shadow-sm border-info-subtle bg-info-subtle text-info-emphasis py-2 px-3">
                        <div class="d-flex align-items-center overflow-hidden">
                            <i class="bi bi-mortarboard-fill me-2 text-info opacity-75 d-none d-sm-inline-block"></i>
                            <span class="fw-bold small text-truncate">GPA trung bình ${stat.label}</span>
                        </div>
                        <span class="badge bg-info text-dark border border-info-subtle year-gpa-badge ms-2" 
                              style="font-size: 0.85rem; font-weight: 700;" data-year-id="${currentYear.id}">GPA ${yearGPA}</span>
                    </div>
                `;
            }
        }

        return `
        <div class="card shadow-sm mb-3 ani-fade-in-up hover-translate-y" style="animation-delay: ${index * 0.1}s">
            <div class="card-header d-flex justify-content-between align-items-start align-items-md-center py-2 px-3">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-1 gap-md-2" style="min-width: 0; flex: 1;">
                    <span class="fw-bold text-primary text-truncate">${sem.name}</span>
                    <div class="d-flex gap-1 flex-wrap semester-header-badges">
                        <span class="badge bg-light text-secondary border semester-total-credits" data-sem-id="${sem.id}">${semTotalCredits} TC</span>
                        <span class="badge bg-primary text-white border semester-gpa" data-sem-id="${sem.id}">GPA ${semGPA}</span>
                        <span class="badge bg-success text-white border semester-cum-gpa" data-sem-id="${sem.id}" title="GPA Tích lũy"><span class="d-none d-sm-inline">GPA </span>tích lũy ${cumGPA}</span>
                    </div>
                </div>
                <div class="ms-2 flex-shrink-0">
                    <button class="btn btn-sm btn-link text-danger delete-semester-btn p-1" data-id="${sem.id}" title="Xóa học kỳ">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body p-2">
                <div class="table-responsive">
                    <table class="table table-borderless align-middle mb-0">
                        <thead class="text-muted small border-bottom text-nowrap">
                            <tr>
                                <th style="width: 35%">Môn học</th>
                                <th style="width: 20%; min-width: 70px;">TC</th>
                                <th style="width: 20%; min-width: 75px;">Điểm</th>
                                <th style="width: 20%; min-width: 50px;">Lại?</th>
                                <th style="width: 5%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sem.courses.map(course => `
                                <tr>
                                    <td>
                                        <input type="text" class="form-control form-control-sm manual-input" 
                                            placeholder="Tên môn" value="${course.name}" 
                                            data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="name">
                                    </td>
                                    <td>
                                        <div class="input-group input-group-sm flex-nowrap" style="min-width: 80px;">
                                            <button class="btn btn-outline-secondary px-1 adjust-credit-btn" type="button" data-action="decrease" data-sem-id="${sem.id}" data-course-id="${course.id}">-</button>
                                            <input type="number" class="form-control form-control-sm manual-input text-center px-0" 
                                                value="${course.credits}" min="0" readonly
                                                data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="credits">
                                            <button class="btn btn-outline-secondary px-1 adjust-credit-btn" type="button" data-action="increase" data-sem-id="${sem.id}" data-course-id="${course.id}">+</button>
                                        </div>
                                    </td>
                                    <td>
                                        <select class="form-select form-select-sm manual-input ${course.grade === '' ? 'border-warning bg-warning-subtle' : ''}"
                                            data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="grade">
                                            <option value="" ${course.grade === '' ? 'selected' : ''}>--</option>
                                            ${GRADE_SCALE.map(g => `<option value="${g.grade}" ${course.grade === g.grade ? 'selected' : ''}>${g.grade}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td>
                                        <div class="d-flex flex-column gap-1">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input manual-input" type="checkbox" 
                                                    ${course.isRetake ? 'checked' : ''}
                                                    data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="isRetake">
                                            </div>
                                            ${course.isRetake ? `
                                                <select class="form-select form-select-xs manual-input" style="font-size: 0.75rem; padding: 2px;"
                                                    data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="oldGrade">
                                                    <option value="" disabled>Điểm cũ</option>
                                                    ${GRADE_SCALE
                    .filter(g => !['A+', 'A', 'B+', 'B'].includes(g.grade))
                    .map(g => `<option value="${g.grade}" ${course.oldGrade === g.grade ? 'selected' : ''}>${g.grade}</option>`).join('')}
                                                </select>
                                            ` : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm text-muted delete-course-btn" 
                                            data-sem-id="${sem.id}" data-course-id="${course.id}">
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button class="btn btn-sm btn-light w-100 mt-2 text-muted add-course-btn" data-id="${sem.id}">
                    <i class="bi bi-plus"></i> Thêm môn học
                </button>
            </div>
        </div>
        ${yearSummaryHtml}
    `;
    }).join('');

    // Update Chart (async to handle lazy loading)
    renderGPAChart(manualSemesters, initialGpa, initialCredits);
}

export async function renderGPAChart(semesters, initialGpa, initialCredits) {
    const ctx = document.getElementById('gpa-chart');
    if (!ctx) return;

    if (!semesters || semesters.length === 0) {
        if (gpaChart) {
            gpaChart.destroy();
            gpaChart = null;
        }
        return;
    }

    // Ensure Chart.js is loaded before proceeding
    await ensureChartJsLoaded();

    // Calculate cumulative GPA for each semester (consistent with renderManualSemesters)
    let runningTotalPoints = (parseFloat(initialGpa) || 0) * (parseFloat(initialCredits) || 0);
    let runningTotalCredits = parseFloat(initialCredits) || 0;

    const dataPoints = [];
    const labels = [];

    semesters.forEach(sem => {
        sem.courses.forEach(course => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(course.credits) || 0;

            if (course.isRetake) {
                const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
                const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;
                if (gpa > oldGpa) {
                    runningTotalPoints += (gpa - oldGpa) * credits;
                    if (oldGpa === 0 && gpa > 0) runningTotalCredits += credits;
                }
            } else {
                runningTotalPoints += gpa * credits;
                if (gpa > 0) runningTotalCredits += credits;
            }
        });

        const cumGPA = runningTotalCredits > 0 ? (runningTotalPoints / runningTotalCredits).toFixed(2) : '0.00';
        dataPoints.push(parseFloat(cumGPA));
        labels.push(sem.name.replace('Năm học: ', '').replace(' - Học kỳ: ', ' '));
    });

    if (gpaChart) {
        gpaChart.data.labels = labels;
        gpaChart.data.datasets[0].data = dataPoints;
        gpaChart.update();
    } else {
        // Create new chart
        const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const textColor = isDarkMode ? '#adb5bd' : '#6c757d';
        const brandRed = '#d32f2f';

        gpaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'GPA Tích lũy',
                    data: dataPoints,
                    borderColor: brandRed,
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: brandRed,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => `GPA: ${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 4.0,
                        ticks: {
                            stepSize: 0.5,
                            color: textColor
                        },
                        grid: {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor,
                            font: { size: 10 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}
