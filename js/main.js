import { initCourseGradeTab, initTargetGPATab, initManualCalcTab, initContactButton, initThemeToggle, initUserGuide, fetchVisitCount, initFeedbackForm, initNewsTab, initGradeScaleSort } from './ui/events.js';
import { initGradeScaleTab } from './ui/renderers.js';
import { decodeState } from './core/share.js';
import { setTargetState } from './state/store.js';


console.log("HUFLIT GPA Strategist loaded (Modular).");

document.addEventListener('DOMContentLoaded', () => {
    // Xử lý dữ liệu chia sẻ từ URL (Tham số 's' cho bản ngắn gọn)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('s') || urlParams.get('share');
    if (sharedData) {
        const decodedState = decodeState(sharedData);
        if (decodedState) {
            setTargetState(decodedState);
        }
    }

    initCourseGradeTab();
    initTargetGPATab();
    initManualCalcTab();
    initGradeScaleTab();
    initContactButton();
    initThemeToggle();
    initUserGuide();
    initFeedbackForm();
    initNewsTab();
    initGradeScaleSort();
    fetchVisitCount();

    // Auto-calculate if shared data is present
    if (sharedData) {
        setTimeout(() => {
            const calcBtn = document.getElementById('calc-target-btn');
            if (calcBtn) calcBtn.click();
            
            // Xóa tham số share trên URL để tránh nạp lại khi refresh (tùy chọn)
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 500);
    }

    // Sync Desktop and Mobile Tabs
    const allNavLinks = document.querySelectorAll('.nav-link[data-bs-toggle="pill"]');
    allNavLinks.forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target');
            const correspondingLinks = document.querySelectorAll(`.nav-link[data-bs-toggle="pill"][data-bs-target="${targetId}"]`);
            
            correspondingLinks.forEach(other => {
                if (other !== e.target) {
                    other.classList.add('active');
                    other.setAttribute('aria-selected', 'true');
                    
                    const container = other.closest('.nav');
                    if (container) {
                        container.querySelectorAll('.nav-link').forEach(sib => {
                            if (sib !== other) {
                                sib.classList.remove('active');
                                sib.setAttribute('aria-selected', 'false');
                            }
                        });
                    }
                }
            });

            // Cuộn lên đầu trang khi chuyển tab
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
});
