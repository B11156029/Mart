// script.js
let currentProgress = 0;
const totalNeeded = 10; // 設定團購所需的總數量

function incrementProgress() {
    if (currentProgress < totalNeeded) {
        currentProgress++;
        updateProgressBar();
        updatePrice();
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercentage = (currentProgress / totalNeeded) * 100;

    progressBar.style.width = progressPercentage + '%';
    progressText.textContent = `${currentProgress} / ${totalNeeded}`;
}

function updatePrice() {
    const currentPriceElement = document.getElementById('current-price');
    let currentPrice = 100; // 初始價格

    if (currentProgress >= 10) {
        currentPrice = 85;
    } else if (currentProgress >= 5) {
        currentPrice = 100;
    }

    currentPriceElement.textContent = currentPrice;
}