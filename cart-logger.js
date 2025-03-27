// cart-logger.js - 購物車日誌測試模塊

/**
 * 測試購物車金額計算並輸出日誌
 * @param {Array} cart - 購物車數據
 * @param {Function} calculateSubtotal - 計算小計的函數
 * @param {Function} parsePrice - 解析價格的函數
 */
export function testCartCalculation(cart, calculateSubtotal, parsePrice) {
    console.log('===== 購物車金額計算測試 =====');
    console.log('測試時間:', new Date().toLocaleString());
    console.log('購物車商品數量:', cart.length);
    console.log('測試環境:', navigator.userAgent);
    console.log('瀏覽器版本:', navigator.appVersion);
    console.log('操作系統:', navigator.platform);
    console.log('記憶體使用情況:', window.performance && window.performance.memory ? 
        JSON.stringify(window.performance.memory) : '不支援記憶體使用統計');
    console.log('網頁效能:', window.performance ? 
        `頁面載入時間: ${window.performance.timing.loadEventEnd - window.performance.timing.navigationStart}ms` : 
        '不支援效能統計');
    
    let manualTotal = 0;
    let calculatedTotal = 0;
    let errorCount = 0;
    let warningCount = 0;
    
    console.log('\n商品詳情:');
    cart.forEach((item, index) => {
        const product = item.product;
        const quantity = item.quantity;
        
        // 數據類型檢查
        console.log(`\n商品 ${index + 1}: ${product.name}`);
        console.log(`商品數據類型檢查:`);
        console.log(`  - 價格原始值: ${product.price} (類型: ${typeof product.price})`);
        console.log(`  - 數量值: ${quantity} (類型: ${typeof quantity})`);
        
        // 解析價格並檢查
        const price = parsePrice(product.price);
        if (isNaN(price)) {
            console.log(`❌ 錯誤: 價格解析失敗! 原始值: "${product.price}"`);
            errorCount++;
            return; // 跳過此商品的後續處理
        }
        
        console.log(`單價: $${price.toFixed(2)}`);
        console.log(`數量: ${quantity}`);
        
        // 檢查數量是否為有效數字
        if (isNaN(quantity) || quantity <= 0) {
            console.log(`❌ 錯誤: 商品數量無效! 值: ${quantity}`);
            errorCount++;
            return; // 跳過此商品的後續處理
        }
        
        const expectedSubtotal = price * quantity;
        const actualSubtotal = item.subtotal;
        
        // 檢查小計是否為有效數字
        if (isNaN(actualSubtotal)) {
            console.log(`❌ 錯誤: 系統計算小計無效! 值: ${item.subtotal}`);
            errorCount++;
            return; // 跳過此商品的後續處理
        }
        
        const hasSpecialOffers = product.specialOffers ? true : false;
        console.log(`是否有特價: ${hasSpecialOffers ? '是' : '否'}`);
        
        if (hasSpecialOffers) {
            // 檢查特價信息格式
            if (typeof product.specialOffers !== 'object') {
                console.log(`❌ 錯誤: 特價信息格式無效! 類型: ${typeof product.specialOffers}`);
                errorCount++;
                return; // 跳過此商品的後續處理
            }
            
            console.log('特價信息:', JSON.stringify(product.specialOffers));
            console.log(`特價類型: ${Object.keys(product.specialOffers).length === 1 && product.specialOffers["1"] !== undefined ? '買一送一' : '一般特價'}`);
            
            // 使用系統計算的小計
            console.log(`系統計算小計: $${actualSubtotal.toFixed(2)}`);
            
            // 手動計算特價小計
            let manualSubtotal = 0;
            let remainingQty = quantity;
            
            // 檢查特價鍵格式
            const offerKeysRaw = Object.keys(product.specialOffers);
            console.log(`特價鍵檢查: ${offerKeysRaw.join(', ')}`);
            
            // 嘗試將特價鍵轉換為數字並排序
            const offerKeys = [];
            for (let key of offerKeysRaw) {
                const numKey = Number(key);
                if (isNaN(numKey)) {
                    console.log(`⚠️ 警告: 特價鍵 "${key}" 不是有效數字`);
                    warningCount++;
                } else {
                    offerKeys.push(numKey);
                }
            }
            offerKeys.sort((a, b) => b - a);
            
            console.log('特價計算詳細過程:');
            for (let offerQty of offerKeys) {
                const offerPrice = product.specialOffers[offerQty];
                
                // 檢查特價價格是否為有效數字
                if (isNaN(offerPrice)) {
                    console.log(`⚠️ 警告: 特價 ${offerQty} 件的價格無效: ${offerPrice}`);
                    warningCount++;
                    continue; // 跳過此特價
                }
                
                const timesApplied = Math.floor(remainingQty / offerQty);
                if (timesApplied > 0) {
                    const offerSubtotal = offerPrice * timesApplied;
                    manualSubtotal += offerSubtotal;
                    
                    console.log(`  - ${offerQty}件特價: $${offerPrice.toFixed(2)} x ${timesApplied} = $${offerSubtotal.toFixed(2)}`);
                    console.log(`    • 剩餘數量更新: ${remainingQty} - (${offerQty} x ${timesApplied}) = ${remainingQty - offerQty * timesApplied}`);
                    
                    remainingQty -= offerQty * timesApplied;
                } else {
                    console.log(`  - ${offerQty}件特價: 不適用 (剩餘數量 ${remainingQty} < 特價數量 ${offerQty})`);
                }
            }
            
            if (remainingQty > 0) {
                const regularSubtotal = price * remainingQty;
                manualSubtotal += regularSubtotal;
                console.log(`  - 剩餘${remainingQty}件原價: $${price.toFixed(2)} x ${remainingQty} = $${regularSubtotal.toFixed(2)}`);
            }
            
            console.log(`手動計算小計: $${manualSubtotal.toFixed(2)}`);
            
            // 檢查差異
            const difference = Math.abs(manualSubtotal - actualSubtotal);
            if (difference > 0.01) { // 允許0.01的誤差
                console.log(`⚠️ 警告: 小計金額不一致! 差異: $${difference.toFixed(2)}`);
                console.log(`  • 系統計算: $${actualSubtotal.toFixed(2)}`);
                console.log(`  • 手動計算: $${manualSubtotal.toFixed(2)}`);
                console.log(`  • 可能原因: 特價計算邏輯不一致或數據類型問題`);
                warningCount++;
            } else {
                console.log('✓ 小計金額一致');
            }
            
            manualTotal += manualSubtotal;
        } else {
            // 無特價情況
            console.log(`系統計算小計: $${actualSubtotal.toFixed(2)}`);
            console.log(`預期小計: $${expectedSubtotal.toFixed(2)}`);
            console.log(`計算過程: $${price.toFixed(2)} x ${quantity} = $${expectedSubtotal.toFixed(2)}`);
            
            // 檢查差異
            const difference = Math.abs(expectedSubtotal - actualSubtotal);
            if (difference > 0.01) { // 允許0.01的誤差
                console.log(`⚠️ 警告: 小計金額不一致! 差異: $${difference.toFixed(2)}`);
                console.log(`  • 系統計算: $${actualSubtotal.toFixed(2)}`);
                console.log(`  • 預期計算: $${expectedSubtotal.toFixed(2)}`);
                console.log(`  • 可能原因: 四捨五入誤差或計算邏輯不一致`);
                warningCount++;
            } else {
                console.log('✓ 小計金額一致');
            }
            
            manualTotal += expectedSubtotal;
        }
        
        calculatedTotal += actualSubtotal;
    });
    
    console.log('\n===== 總計金額計算詳細過程 =====');
    console.log('系統計算總計過程:');
    cart.forEach((item, index) => {
        console.log(`  - 商品 ${index + 1}: ${item.product.name} = $${item.subtotal.toFixed(2)}`);
    });
    console.log(`系統計算總計: $${calculatedTotal.toFixed(2)}`);
    
    console.log('\n手動計算總計過程:');
    let manualTotalRunning = 0;
    cart.forEach((item, index) => {
        const product = item.product;
        const quantity = item.quantity;
        const price = parsePrice(product.price);
        
        let itemTotal = 0;
        if (product.specialOffers) {
            // 特價商品使用手動計算的小計
            let remainingQty = quantity;
            const offerKeys = Object.keys(product.specialOffers).map(Number).sort((a, b) => b - a);
            
            for (let offerQty of offerKeys) {
                const timesApplied = Math.floor(remainingQty / offerQty);
                if (timesApplied > 0) {
                    itemTotal += product.specialOffers[offerQty] * timesApplied;
                    remainingQty -= offerQty * timesApplied;
                }
            }
            
            if (remainingQty > 0) {
                itemTotal += price * remainingQty;
            }
        } else {
            // 無特價商品使用單價 * 數量
            itemTotal = price * quantity;
        }
        
        manualTotalRunning += itemTotal;
        console.log(`  - 商品 ${index + 1}: ${product.name} = $${itemTotal.toFixed(2)} (累計: $${manualTotalRunning.toFixed(2)})`);
    });
    console.log(`手動計算總計: $${manualTotal.toFixed(2)}`);
    
    // 檢查總計差異
    const totalDifference = Math.abs(manualTotal - calculatedTotal);
    if (totalDifference > 0.01) { // 允許0.01的誤差
        console.log(`\n⚠️ 警告: 總計金額不一致! 差異: $${totalDifference.toFixed(2)}`);
        console.log(`  • 系統計算總計: $${calculatedTotal.toFixed(2)}`);
        console.log(`  • 手動計算總計: $${manualTotal.toFixed(2)}`);
        console.log(`  • 差異百分比: ${((totalDifference / calculatedTotal) * 100).toFixed(2)}%`);
        console.log(`  • 可能原因: 小計計算誤差累積或四捨五入問題`);
        
        // 詳細分析差異來源
        console.log('\n差異來源分析:');
        cart.forEach((item, index) => {
            const product = item.product;
            const quantity = item.quantity;
            const price = parsePrice(product.price);
            
            let expectedSubtotal = 0;
            if (product.specialOffers) {
                // 使用手動計算特價小計的邏輯
                let remainingQty = quantity;
                const offerKeys = Object.keys(product.specialOffers).map(Number).sort((a, b) => b - a);
                
                for (let offerQty of offerKeys) {
                    const timesApplied = Math.floor(remainingQty / offerQty);
                    if (timesApplied > 0) {
                        expectedSubtotal += product.specialOffers[offerQty] * timesApplied;
                        remainingQty -= offerQty * timesApplied;
                    }
                }
                
                if (remainingQty > 0) {
                    expectedSubtotal += price * remainingQty;
                }
            } else {
                expectedSubtotal = price * quantity;
            }
            
            const itemDifference = Math.abs(expectedSubtotal - item.subtotal);
            if (itemDifference > 0.01) {
                console.log(`  • 商品 ${index + 1} (${product.name}) 差異: $${itemDifference.toFixed(2)}`);
                console.log(`    - 系統計算: $${item.subtotal.toFixed(2)}`);
                console.log(`    - 預期計算: $${expectedSubtotal.toFixed(2)}`);
                console.log(`    - 佔總差異比例: ${((itemDifference / totalDifference) * 100).toFixed(2)}%`);
            }
        });
        
        warningCount++;
    } else {
        console.log('\n✓ 總計金額一致');
    }
    
    console.log('\n===== 測試統計 =====');
    console.log(`錯誤數量: ${errorCount}`);
    console.log(`警告數量: ${warningCount}`);
    
    // 添加更詳細的測試結果摘要
    if (errorCount === 0 && warningCount === 0) {
        console.log('✅ 測試結果: 全部通過');
        console.log('所有商品價格計算正確，無誤差');
    } else if (warningCount > 0 && errorCount === 0) {
        console.log('⚠️ 測試結果: 有警告');
        console.log('存在計算誤差，但不影響基本功能');
        console.log('建議檢查:');
        console.log('1. 特價商品計算邏輯');
        console.log('2. 四捨五入方式');
        console.log('3. 數據類型轉換');
    } else {
        console.log('❌ 測試結果: 有錯誤');
        console.log('存在嚴重問題，需要修復:');
        console.log('1. 檢查價格格式和解析邏輯');
        console.log('2. 檢查數量驗證');
        console.log('3. 檢查特價信息格式');
    }
    
    console.log('\n===== 測試完成 =====');
    
    return {
        success: totalDifference <= 0.01 && errorCount === 0,
        calculatedTotal,
        manualTotal,
        difference: totalDifference,
        errorCount,
        warningCount
    };
}

/**
 * 創建一個簡單的視覺化日誌顯示區域
 * @param {string} containerId - 容器元素的ID
 */
export function createLogDisplay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // 先檢查是否已存在日誌顯示區域
    let existingLogDisplay = container.querySelector('.log-display');
    if (existingLogDisplay) {
        existingLogDisplay.innerHTML = '';
        return existingLogDisplay;
    }
    
    // 創建控制按鈕區域
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'log-controls';
    controlsDiv.style.cssText = 'margin-bottom: 10px; display: flex; gap: 10px; flex-wrap: wrap;';
    
    // 創建清空按鈕
    const clearButton = document.createElement('button');
    clearButton.textContent = '清空日誌';
    clearButton.style.cssText = 'background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;';
    clearButton.onclick = function() {
        const logDisplay = container.querySelector('.log-display');
        if (logDisplay) logDisplay.innerHTML = '';
    };
    
    // 創建下載按鈕
    const downloadButton = document.createElement('button');
    downloadButton.textContent = '下載日誌';
    downloadButton.style.cssText = 'background-color: #2196f3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;';
    downloadButton.onclick = function() {
        const logDisplay = container.querySelector('.log-display');
        if (!logDisplay) return;
        
        const logText = logDisplay.innerText;
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `購物車測試日誌_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // 創建篩選按鈕
    const filterDiv = document.createElement('div');
    filterDiv.style.cssText = 'display: flex; gap: 5px; margin-left: auto;';
    
    const createFilterButton = (text, type, color) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.dataset.type = type;
        button.style.cssText = `background-color: ${color}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; opacity: 0.7;`;
        button.onclick = function() {
            // 切換按鈕狀態
            this.style.opacity = this.style.opacity === '1' ? '0.7' : '1';
            
            // 篩選日誌
            const logDisplay = container.querySelector('.log-display');
            if (!logDisplay) return;
            
            const entries = logDisplay.querySelectorAll('div');
            entries.forEach(entry => {
                if (entry.dataset.type === type || this.style.opacity === '0.7') {
                    entry.style.display = '';
                } else {
                    entry.style.display = 'none';
                }
            });
        };
        return button;
    };
    
    filterDiv.appendChild(createFilterButton('錯誤', 'error', '#f44336'));
    filterDiv.appendChild(createFilterButton('警告', 'warning', '#ff9800'));
    filterDiv.appendChild(createFilterButton('成功', 'success', '#4caf50'));
    filterDiv.appendChild(createFilterButton('信息', 'info', '#2196f3'));
    
    controlsDiv.appendChild(clearButton);
    controlsDiv.appendChild(downloadButton);
    controlsDiv.appendChild(filterDiv);
    container.appendChild(controlsDiv);
    
    // 創建日誌顯示區域
    const logDisplay = document.createElement('div');
    logDisplay.className = 'log-display';
    logDisplay.style.cssText = 'max-height: 400px; overflow-y: auto; background-color: #f5f5f5; border: 1px solid #ddd; padding: 10px; margin-top: 10px; font-family: monospace; white-space: pre-wrap; font-size: 14px; line-height: 1.5;';
    
    // 添加日誌摺疊功能的樣式
    const style = document.createElement('style');
    style.textContent = `
        .log-section {
            margin: 5px 0;
            border-left: 3px solid #ccc;
            padding-left: 10px;
        }
        .log-section-header {
            cursor: pointer;
            font-weight: bold;
        }
        .log-section-content {
            margin-left: 15px;
            display: none;
        }
        .log-section.expanded .log-section-content {
            display: block;
        }
        .log-section-header:before {
            content: '▶';
            display: inline-block;
            margin-right: 5px;
            transition: transform 0.2s;
        }
        .log-section.expanded .log-section-header:before {
            transform: rotate(90deg);
        }
    `;
    document.head.appendChild(style);
    
    container.appendChild(logDisplay);
    
    return logDisplay;
}

/**
 * 將日誌輸出到顯示區域
 * @param {HTMLElement} logDisplay - 日誌顯示元素
 * @param {string} message - 日誌消息
 * @param {string} type - 日誌類型 (info, warning, error, success)
 */
/**
 * 將日誌輸出到顯示區域
 * @param {HTMLElement} logDisplay - 日誌顯示元素
 * @param {string} message - 日誌消息
 * @param {string} type - 日誌類型 (info, warning, error, success)
 * @param {Object} options - 額外選項
 * @param {boolean} options.isSection - 是否為可折疊的區段標題
 * @param {boolean} options.isDetail - 是否為詳細信息（會縮進顯示）
 * @param {string} options.sectionId - 區段ID，用於折疊功能
 */
export function logToDisplay(logDisplay, message, type = 'info', options = {}) {
    if (!logDisplay) return;
    
    // 處理區段標題
    if (options.isSection) {
        const sectionId = options.sectionId || `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const section = document.createElement('div');
        section.className = 'log-section';
        section.id = sectionId;
        
        const header = document.createElement('div');
        header.className = 'log-section-header';
        header.dataset.type = type;
        
        // 設置標題顏色
        switch (type) {
            case 'warning':
                header.style.color = '#ff9800';
                break;
            case 'error':
                header.style.color = '#f44336';
                break;
            case 'success':
                header.style.color = '#4caf50';
                break;
            default:
                header.style.color = '#2196f3';
        }
        
        // 添加時間戳
        const timestamp = new Date().toLocaleTimeString();
        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = `[${timestamp}] `;
        timestampSpan.style.color = '#888';
        timestampSpan.style.fontSize = '0.85em';
        
        // 添加圖標
        let icon = '';
        switch (type) {
            case 'warning': icon = '⚠️ '; break;
            case 'error': icon = '❌ '; break;
            case 'success': icon = '✅ '; break;
            default: icon = 'ℹ️ ';
        }
        
        // 如果消息已經包含圖標，則不添加
        if (!message.includes('✅') && !message.includes('❌') && !message.includes('⚠️') && !message.startsWith('===')) {
            header.textContent = icon + message;
        } else {
            header.textContent = message;
        }
        
        header.prepend(timestampSpan);
        
        // 添加點擊事件以展開/折疊內容
        header.onclick = function() {
            section.classList.toggle('expanded');
        };
        
        const content = document.createElement('div');
        content.className = 'log-section-content';
        
        section.appendChild(header);
        section.appendChild(content);
        logDisplay.appendChild(section);
        
        // 同時輸出到控制台
        console.log(`[${timestamp}] ${message} (區段開始)`);
        
        return { section, content };
    }
    
    // 處理普通日誌條目
    const logEntry = document.createElement('div');
    logEntry.dataset.type = type;
    
    // 如果是詳細信息，添加縮進
    if (options.isDetail) {
        logEntry.style.marginLeft = '20px';
        logEntry.style.fontSize = '0.9em';
        logEntry.style.borderLeft = '2px solid #ddd';
        logEntry.style.paddingLeft = '10px';
    }
    
    // 添加時間戳
    const timestamp = new Date().toLocaleTimeString();
    const timestampSpan = document.createElement('span');
    timestampSpan.textContent = `[${timestamp}] `;
    timestampSpan.style.color = '#888';
    timestampSpan.style.fontSize = '0.85em';
    
    // 創建消息元素
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    // 根據類型設置樣式
    let icon = '';
    switch (type) {
        case 'warning':
            messageSpan.style.color = '#ff9800';
            messageSpan.style.fontWeight = options.isDetail ? 'normal' : 'bold';
            icon = '⚠️ ';
            break;
        case 'error':
            messageSpan.style.color = '#f44336';
            messageSpan.style.fontWeight = options.isDetail ? 'normal' : 'bold';
            icon = '❌ ';
            break;
        case 'success':
            messageSpan.style.color = '#4caf50';
            messageSpan.style.fontWeight = options.isDetail ? 'normal' : 'bold';
            icon = '✅ ';
            break;
        default:
            messageSpan.style.color = '#2196f3';
            icon = options.isDetail ? '' : 'ℹ️ ';
    }
    
    // 如果消息已經包含圖標，則不添加
    if (!message.includes('✅') && !message.includes('❌') && !message.includes('⚠️') && !message.startsWith('===')) {
        messageSpan.textContent = icon + message;
    }
    
    // 組合時間戳和消息
    logEntry.appendChild(timestampSpan);
    logEntry.appendChild(messageSpan);
    
    // 添加到日誌顯示區域或指定的區段內容
    if (options.sectionContent) {
        options.sectionContent.appendChild(logEntry);
    } else {
        logDisplay.appendChild(logEntry);
    }
    
    logDisplay.scrollTop = logDisplay.scrollHeight;
    
    // 同時輸出到控制台
    console.log(`[${timestamp}] ${message}`);
    
    return logEntry;
}