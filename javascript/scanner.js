// scanner.js（模組化）
// ✅ 使用全域 Swal（從 <script> 載入）
const Swal = window.Swal;

// 保存appInstance的引用，以便在closeScanner中使用
let currentAppInstance = null;

export function closeScanner() {
  // 停止Quagga掃描器
  if (window.Quagga) {
    window.Quagga.stop();
  }
  
  // 隱藏掃描器容器
  const scannerContainer = document.getElementById("scanner-container");
  if (scannerContainer) {
    scannerContainer.style.display = "none";
  }
  
  // 更新Vue實例中的狀態
  if (currentAppInstance) {
    currentAppInstance.scannerVisible = false;
  }
}

export function startScanner(appInstance) {
  currentAppInstance = appInstance;
  const scannerContainer = document.getElementById("scanner-container");
  if (!scannerContainer) return;

  scannerContainer.style.display = "block";

  let scanAttempts = 0;
  const maxScanAttempts = 4;
  const scanDelay = 1000;
  const scanInterval = 200; // 每次掃描最小間隔（節流）
  let lastScanTime = 0;
  let lastCode = null;
  let firstSeenTime = null;

  window.Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: scannerContainer,
      constraints: {
        facingMode: "environment",
        width: { ideal: 1080 },
        height: { ideal: 1080 }
      }
    },
    decoder: {
      readers: [
        "ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader",
        "code_128_reader", "code_39_reader", "code_39_vin_reader",
        "codabar_reader", "i2of5_reader", "2of5_reader", "code_93_reader"
      ]
    }
  }, function(err) {
    if (err) {
      console.error("Quagga 初始化失敗:", err);
      return;
    }
    window.Quagga.start();
  });

  window.Quagga.onDetected((result) => {
    const now = Date.now();
    if (now - lastScanTime < scanInterval) return;
    lastScanTime = now;

    const code = result.codeResult.code;
    if (!code) return;

    if (lastCode === code) {
      const duration = now - firstSeenTime;
      scanAttempts++;
      if (duration >= scanDelay || scanAttempts >= maxScanAttempts) {
        window.Quagga.stop();
        scannerContainer.style.display = "none";
        processBarcode(code);
      }
    } else {
      lastCode = code;
      firstSeenTime = now;
      scanAttempts = 1;
    }
  });

  function processBarcode(code) {
    const foundProduct = appInstance.products.find(product => product.barcode === code);

    if (foundProduct) {
      Swal.fire({
        title: foundProduct.name,
        text: foundProduct.description ? foundProduct.description : `價格: $${appInstance.parsePrice(foundProduct.price)}`,
        imageUrl: '新增資料夾/' + foundProduct.image,
        imageWidth: 150,
        imageHeight: 150,
        showCancelButton: true,
        confirmButtonText: '加入購物車',
        cancelButtonText: '取消',
      }).then((result) => {
        if (result.isConfirmed) {
          appInstance.addToCart(foundProduct);
          Swal.fire({
            title: '已加入購物車！',
            icon: 'success',
            showConfirmButton: false,
            timer: 1200
          });
        }
      });
    } else {
      Swal.fire('查無商品', '找不到條碼對應的商品。', 'error');
    }
  }
}
