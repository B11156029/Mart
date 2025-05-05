// cart.js - 購物車功能模塊

// 購物車數據存儲
let cartData = [];

// 初始化購物車
export function initCart() {
    // 嘗試從localStorage加載購物車數據
    const savedCart = localStorage.getItem('cartData');
    if (savedCart) {
        try {
            cartData = JSON.parse(savedCart);
        } catch (e) {
            console.error('購物車數據解析錯誤:', e);
            cartData = [];
        }
    }
    return cartData;
}

// 獲取購物車數據
export function getCart() {
    return cartData;
}

// 添加商品到購物車
export function addToCart(product, quantity = 1) {
    const cartItem = cartData.find(item => item.product.name === product.name);
    if (cartItem) {
        cartItem.quantity += quantity;
        // 更新 subtotal，根據最新的數量重新計算
        cartItem.subtotal = calculateSubtotal(cartItem.product, cartItem.quantity);
    } else {
        // 創建購物車項目的深拷貝，避免引用原始商品對象
        const productCopy = JSON.parse(JSON.stringify(product));
        cartData.push({
            product: productCopy,
            quantity: quantity,
            subtotal: calculateSubtotal(productCopy, quantity)
        });
    }
    saveCart();
    return cartData;
}

// 從購物車移除商品
export function removeFromCart(itemName) {
    cartData = cartData.filter(item => item.product.name !== itemName);
    saveCart();
    return cartData;
}

// 更新購物車中商品數量
export function updateQuantity(productName, quantity) {
    const cartItem = cartData.find(item => item.product.name === productName);
    if (cartItem) {
        if (quantity > 0) {
            cartItem.quantity = quantity;
            cartItem.subtotal = calculateSubtotal(cartItem.product, quantity);
        } else {
            // 如果數量為0或負數，從購物車中移除
            return removeFromCart(productName);
        }
    }
    saveCart();
    return cartData;
}

// 更新購物車中商品價格
export function updatePrice(productName, newPrice) {
    const cartItem = cartData.find(item => item.product.name === productName);
    if (cartItem) {
        // 保存原始價格，以便在更新失敗時恢復
        const originalPrice = cartItem.product.price;
        
        // 更新購物車中的價格
        cartItem.product.price = newPrice;
        
        // 如果商品有特價信息，在修改單價後應該清除特價信息
        if (cartItem.product.specialOffers) {
            delete cartItem.product.specialOffers;
        }
        
        // 重新計算小計金額
        cartItem.subtotal = calculateSubtotal(cartItem.product, cartItem.quantity);
        
        saveCart();
        return { success: true, cart: cartData, originalPrice };
    }
    return { success: false, message: '找不到指定商品' };
}

// 更新購物車中商品小計
export function updateSubtotal(productName, newSubtotal) {
    const cartItem = cartData.find(item => item.product.name === productName);
    if (cartItem) {
        cartItem.subtotal = parseFloat(newSubtotal);
        saveCart();
        return true;
    }
    return false;
}

// 計算小計金額
export function calculateSubtotal(product, quantity) {
    // 如果沒有 specialOffers，就用原價乘數量
    if (!product.specialOffers) {
        return parsePrice(product.price) * quantity;
    }

    let subtotal = 0;
    let remainingQuantity = quantity;

    // 取得所有特價數量，從大到小排序
    const offerKeys = Object.keys(product.specialOffers)
        .map(Number)
        .sort((a, b) => b - a);

    // 依據特價規則，計算可套用特價的金額
    for (let offerQty of offerKeys) {
        while (remainingQuantity >= offerQty) {
            subtotal += product.specialOffers[offerQty];
            remainingQuantity -= offerQty;
        }
    }

    // 剩餘不足以套用特價的部分，仍以原價計算
    if (remainingQuantity > 0) {
        subtotal += parsePrice(product.price) * remainingQuantity;
    }

    return subtotal;
}

export function parsePrice(input) {
    if (input === null || input === undefined) return 0;
    return parseFloat(String(input).replace(/[^\d.-]/g, '')) || 0;
  }
  

// 獲取購物車總計
export function getCartTotal() {
    return cartData.reduce((total, item) => total + item.subtotal, 0);
}

// 清空購物車
export function clearCart() {
    cartData = [];
    saveCart();
    return cartData;
}

// 保存購物車到localStorage
function saveCart() {
    try {
        localStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (e) {
        console.error('保存購物車數據失敗:', e);
    }
}



export function setCart(externalCart) {
    // 做深拷貝，避免共享參考
    cartData = JSON.parse(JSON.stringify(externalCart));
    saveCart();
}
