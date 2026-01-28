export function initSnowEffect() {
    // Disabled
}

/**
 * Hiệu ứng chạy số tự động từ giá trị cũ đến giá trị mới
 * @param {HTMLElement} element - Phần tử chứa số
 * @param {number} start - Giá trị bắt đầu
 * @param {number} end - Giá trị kết thúc
 * @param {number} duration - Thời gian chạy (ms)
 * @param {number} decimals - Số chữ số thập phân
 */
export function animateValue(element, start, end, duration = 1000, decimals = 2) {
    if (!element) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;

        // Format based on value
        if (isNaN(value)) {
            element.innerHTML = end;
            return;
        }

        element.innerHTML = value.toFixed(decimals);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Kích hoạt rung phản hồi (Haptic Feedback) trên thiết bị di động
 * @param {number} duration - Thời gian rung (ms), mặc định 10ms (rung nhẹ)
 */
export function triggerHapticFeedback(duration = 10) {
    // Chỉ rung nếu thiết bị hỗ trợ và người dùng đang thao tác
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

export function initChristmasTreeInteraction() {
    // Disabled
    /*
    const treeContainer = document.querySelector('.christmas-tree-container');
    const tree = document.querySelector('.christmas-tree');

    if (treeContainer && tree) {
        treeContainer.addEventListener('click', () => {
            // 1. Shake Effect
            // Remove class if it exists to restart animation
            tree.classList.remove('shake');
            
            // Trigger reflow
            void tree.offsetWidth;
            
            // Add class
            tree.classList.add('shake');

            // Remove class after animation ends to return to sway
            setTimeout(() => {
                tree.classList.remove('shake');
            }, 500); // Match animation duration

            // 2. Toggle Snow Effect
            const snowContainer = document.getElementById('snow-container');
            if (snowContainer) {
                if (snowContainer.style.display === 'none') {
                    snowContainer.style.display = 'block';
                } else {
                    snowContainer.style.display = 'none';
                }
            }
        });
    }
    */
}
