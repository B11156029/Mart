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
            return;
        }
        
        // 驗證輸入是否為有效數字
        const parsedPrice = parseFloat(newPrice);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            alert('請輸入有效的價格（必須為正數）');
            return;
        }
        
        // 更新商品價格
        item.product.price = parsedPrice.toString();
        console.log(`商品 ${item.product.name} 價格已更新為 $${parsedPrice}`);
        
        // 成功提示
        alert(`價格已更新為 $${parsedPrice}`);
        
        return true;
    } catch (error) {
        console.error('編輯價格時發生錯誤:', error);
        alert('價格更新失敗，請稍後再試');
        return false;
    }
}

/**
 * 解析價格字符串，移除非數字字符
 * @param {string|number} price - 價格字符串或數字
 * @returns {string} - 處理後的價格字符串
 */
function parsePrice(price) {
    if (typeof price !== 'string') {
        price = String(price); // 確保是字符串
    }
    return price.replace(/[^\d.-]/g, ''); // 移除非數字字符
}