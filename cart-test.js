// cart-test.js - 購物車測試功能
import { testCartCalculation, createLogDisplay, logToDisplay } from './cart-logger.js';
import { calculateSubtotal, parsePrice } from './cart.js';

// 初始化測試功能
export function initCartTest() {
    // 創建測試按鈕
    const cartHeader = document.querySelector('.cart-header');
    if (cartHeader) {
        const testButton = document.createElement('button');
        testButton.className = 'test-cart-button';
        testButton.textContent = '測試金額計算';
        testButton.style.cssText =
            'background-color: #4caf50; color: white; border: none; padding: 5px 10px; margin-left: 10px; border-radius: 4px; cursor: pointer;';
        testButton.onclick = runCartTest;
        cartHeader.appendChild(testButton);

        // 創建日誌顯示區域的容器
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            const logContainer = document.createElement('div');
            logContainer.id = 'cart-log-container';
            logContainer.style.cssText = 'margin-top: 20px; padding: 10px; border-top: 1px solid #ddd;';

            const logTitle = document.createElement('h3');
            logTitle.textContent = '金額計算測試日誌';
            logTitle.style.cssText = 'margin: 0 0 10px 0;';

            logContainer.appendChild(logTitle);
            cartElement.appendChild(logContainer);
        }
    }
}

// 運行購物車測試
function runCartTest() {
    // 獲取 Vue 實例中的購物車數據
    const vueApp = window.app;
    if (!vueApp || !vueApp.cart) {
        alert('無法獲取購物車數據');
        return;
    }

    // 創建或清空日誌顯示區域
    let logDisplay = document.querySelector('.log-display');
    if (!logDisplay) {
        logDisplay = createLogDisplay('cart-log-container');
    } else {
        logDisplay.innerHTML = '';
    }

    // 顯示測試開始信息
    logToDisplay(logDisplay, '===== 購物車金額計算測試開始 =====', 'info');

    // 創建基本信息區段
    const { section: infoSection, content: infoContent } = logToDisplay(
        logDisplay,
        '基本測試信息 (點擊展開)',
        'info',
        { isSection: true }
    );

    // 添加基本信息
    logToDisplay(logDisplay, `測試時間: ${new Date().toLocaleString()}`, 'info', { sectionContent: infoContent });
    logToDisplay(logDisplay, `購物車商品數量: ${vueApp.cart.length}`, 'info', { sectionContent: infoContent });
    logToDisplay(logDisplay, `瀏覽器環境: ${navigator.userAgent.substring(0, 50)}...`, 'info', { sectionContent: infoContent });
    logToDisplay(logDisplay, `操作系統: ${navigator.platform}`, 'info', { sectionContent: infoContent });
    logToDisplay(logDisplay, `螢幕解析度: ${window.screen.width}x${window.screen.height}`, 'info', { sectionContent: infoContent });

    // 自動展開基本信息區段
    infoSection.classList.add('expanded');

    // 如果購物車為空，顯示提示信息
    if (vueApp.cart.length === 0) {
        logToDisplay(logDisplay, '購物車為空，無法進行測試', 'warning');
        logToDisplay(logDisplay, '===== 測試結束 =====', 'info');
        return;
    }

    // 顯示測試進行中信息
    const progressMsg = logToDisplay(logDisplay, '測試進行中...', 'info');

    // 使用 setTimeout 讓 UI 有時間更新
    setTimeout(() => {
        // 執行測試
        const testResult = testCartCalculation(vueApp.cart, calculateSubtotal, parsePrice);

        // 移除進行中信息
        if (progressMsg && progressMsg.parentNode) {
            progressMsg.parentNode.removeChild(progressMsg);
        }

        // 顯示測試結果
        if (testResult.success) {
            logToDisplay(logDisplay, '✅ 測試通過: 所有金額計算正確', 'success');

            // 創建詳細結果區段
            const { section: resultSection, content: resultContent } = logToDisplay(
                logDisplay,
                '詳細測試結果 (點擊展開)',
                'success',
                { isSection: true }
            );

            logToDisplay(logDisplay, `總計金額: $${testResult.calculatedTotal.toFixed(2)}`, 'info', { sectionContent: resultContent, isDetail: true });
            logToDisplay(logDisplay, `測試商品數量: ${vueApp.cart.length}`, 'info', { sectionContent: resultContent, isDetail: true });
            logToDisplay(logDisplay, `計算耗時: ${testResult.executionTime || 'N/A'} ms`, 'info', { sectionContent: resultContent, isDetail: true });

        } else {
            logToDisplay(logDisplay, `❌ 測試失敗: 總計金額不一致，差異: $${testResult.difference.toFixed(2)}`, 'error');

            // 創建錯誤詳情區段
            const { section: errorSection, content: errorContent } = logToDisplay(
                logDisplay,
                '錯誤詳情 (點擊展開)',
                'error',
                { isSection: true }
            );

            // 自動展開錯誤詳情區段
            errorSection.classList.add('expanded');

            // 顯示更詳細的錯誤信息
            if (testResult.errorCount > 0) {
                logToDisplay(logDisplay, `發現 ${testResult.errorCount} 個嚴重錯誤，需要立即修復`, 'error', { sectionContent: errorContent });
            }

            if (testResult.warningCount > 0) {
                logToDisplay(logDisplay, `發現 ${testResult.warningCount} 個警告，可能影響計算準確性`, 'warning', { sectionContent: errorContent });
            }

            // 添加具體錯誤信息
            logToDisplay(logDisplay, `系統計算總計: $${testResult.calculatedTotal.toFixed(2)}`, 'info', { sectionContent: errorContent, isDetail: true });
            logToDisplay(logDisplay, `手動計算總計: $${testResult.manualTotal.toFixed(2)}`, 'info', { sectionContent: errorContent, isDetail: true });
            logToDisplay(logDisplay, `差異金額: $${testResult.difference.toFixed(2)}`, 'error', { sectionContent: errorContent, isDetail: true });
            logToDisplay(logDisplay, `差異百分比: ${(testResult.difference / testResult.calculatedTotal * 100).toFixed(2)}%`, 'error', { sectionContent: errorContent, isDetail: true });

            // 創建修復建議區段
            const { section: fixSection, content: fixContent } = logToDisplay(
                logDisplay,
                '修復建議 (點擊展開)',
                'info',
                { isSection: true }
            );
            
            // 自動展開修復建議區段
            fixSection.classList.add('expanded');
            
            // 添加詳細的修復建議
            logToDisplay(logDisplay, '可能的問題原因:', 'warning', { sectionContent: fixContent });
            
            // 檢查是否有買一送一商品
            const buyOneGetOneItems = vueApp.cart.filter(item => 
                item.product.specialOffers && 
                Object.keys(item.product.specialOffers).length === 1 && 
                item.product.specialOffers["1"] !== undefined
            );
            
            if (buyOneGetOneItems.length > 0) {
                logToDisplay(logDisplay, '發現買一送一商品計算問題:', 'error', { sectionContent: fixContent });
                buyOneGetOneItems.forEach((item, index) => {
                    const price = parsePrice(item.product.price);
                    const quantity = item.quantity;
                    const expectedPrice = item.product.specialOffers["1"];
                    const pairCount = Math.floor(quantity / 2);
                    const remainingItems = quantity % 2;
                    const expectedTotal = (pairCount * expectedPrice) + (remainingItems * price);
                    
                    logToDisplay(logDisplay, `商品 ${item.product.name}:`, 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, `- 原價: $${price.toFixed(2)}`, 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, `- 特價: $${expectedPrice.toFixed(2)} (買一送一)`, 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, `- 數量: ${quantity}`, 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, `- 預期計算: ${pairCount}對 × $${expectedPrice.toFixed(2)} + ${remainingItems}件 × $${price.toFixed(2)} = $${expectedTotal.toFixed(2)}`, 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, `- 實際小計: $${item.subtotal.toFixed(2)}`, 'error', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, `- 差異: $${Math.abs(expectedTotal - item.subtotal).toFixed(2)}`, 'error', { sectionContent: fixContent, isDetail: true });
                });
                
                logToDisplay(logDisplay, '修復建議:', 'success', { sectionContent: fixContent });
                logToDisplay(logDisplay, '1. 檢查calculateSubtotal函數中買一送一的計算邏輯', 'info', { sectionContent: fixContent, isDetail: true });
                logToDisplay(logDisplay, '2. 確保特價商品的數量計算正確', 'info', { sectionContent: fixContent, isDetail: true });
                logToDisplay(logDisplay, '3. 驗證特價信息格式是否符合預期', 'info', { sectionContent: fixContent, isDetail: true });
            } else {
                // 一般特價商品問題
                const specialOfferItems = vueApp.cart.filter(item => item.product.specialOffers);
                if (specialOfferItems.length > 0) {
                    logToDisplay(logDisplay, '發現特價商品計算問題:', 'warning', { sectionContent: fixContent });
                    specialOfferItems.forEach((item, index) => {
                        const price = parsePrice(item.product.price);
                        const quantity = item.quantity;
                        
                        logToDisplay(logDisplay, `商品 ${item.product.name}:`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 原價: $${price.toFixed(2)}`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 特價信息: ${JSON.stringify(item.product.specialOffers)}`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 數量: ${quantity}`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 實際小計: $${item.subtotal.toFixed(2)}`, 'warning', { sectionContent: fixContent, isDetail: true });
                    });
                    
                    logToDisplay(logDisplay, '修復建議:', 'success', { sectionContent: fixContent });
                    logToDisplay(logDisplay, '1. 檢查特價商品的計算邏輯', 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, '2. 確保特價數量閾值正確應用', 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, '3. 檢查特價價格是否正確設置', 'info', { sectionContent: fixContent, isDetail: true });
                } else {
                    // 一般商品計算問題
                    logToDisplay(logDisplay, '發現一般商品計算問題:', 'warning', { sectionContent: fixContent });
                    vueApp.cart.forEach((item, index) => {
                        const price = parsePrice(item.product.price);
                        const quantity = item.quantity;
                        const expectedTotal = price * quantity;
                        
                        logToDisplay(logDisplay, `商品 ${item.product.name}:`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 單價: $${price.toFixed(2)}`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 數量: ${quantity}`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 預期小計: $${expectedTotal.toFixed(2)}`, 'info', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 實際小計: $${item.subtotal.toFixed(2)}`, 'warning', { sectionContent: fixContent, isDetail: true });
                        logToDisplay(logDisplay, `- 差異: $${Math.abs(expectedTotal - item.subtotal).toFixed(2)}`, 'warning', { sectionContent: fixContent, isDetail: true });
                    });
                    
                    logToDisplay(logDisplay, '修復建議:', 'success', { sectionContent: fixContent });
                    logToDisplay(logDisplay, '1. 檢查parsePrice函數是否正確解析價格', 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, '2. 確保數量轉換為數字類型', 'info', { sectionContent: fixContent, isDetail: true });
                    logToDisplay(logDisplay, '3. 檢查四捨五入或小數點處理邏輯', 'info', { sectionContent: fixContent, isDetail: true });
                }
            }
        }

        logToDisplay(logDisplay, '===== 測試結束 =====', 'info');
    }, 100);
}
