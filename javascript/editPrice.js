/**
 * 商品價格編輯功能
 * 允許用戶修改購物車中商品的單價
 */

/**
 * 編輯商品價格
 * @param {Object} item - 購物車中的商品項目，包含product和quantity屬性
 */
export function editPrice(item) {
    try {
        // 獲取當前價格並顯示提示框
        const currentPrice = parsePrice(item.product.price);
        const newPrice = prompt(`請輸入新的單價 (目前為 $${currentPrice}):`);

        // 用戶取消操作
        if (newPrice === null) {
            alert('已取消價格修改');
            return;
        }

        // 驗證輸入是否為有效數字
        const parsedPrice = parseFloat(parsePrice(newPrice));
        if (isNaN(parsedPrice)) {
            alert('❌ 請輸入有效的數字價格');
            return;
        }

        // 價格過高限制
        if (parsedPrice > 99999) {
            alert('🚫 價格過高，請輸入合理的金額（上限 $99999）');
            return;
        }

        // 更新商品價格（四捨五入兩位小數）
        const finalPrice = parsedPrice.toFixed(2);
        item.product.price = finalPrice;

        console.log(`✅ 商品 ${item.product.name} 價格已更新為 $${finalPrice}`);
        alert(`✅ 價格已更新為 $${finalPrice}`);
        return true;

    } catch (error) {
        console.error('❗ 編輯價格時發生錯誤:', error);
        alert('⚠️ 價格更新失敗，請稍後再試');
        return false;
    }
}

/**
 * 解析價格字符串，移除非數字字符（如 $, , 等）
 * @param {string|number} price - 價格字符串或數字
 * @returns {string} - 處理後的純數字字符串
 */
function parsePrice(price) {
    if (typeof price !== 'string') {
        price = String(price); // 確保是字符串
    }
    // 移除 $, 逗號, 空格和非數字符號，只保留數字、小數點與負號
    return price.replace(/[^\d.-]/g, '');
}
