// scanner.js（模組化）
// 不使用 ESM 匯入 Quagga，因為 cdn 不支援 module
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11';

export function startScanner(appInstance) {
  const scannerContainer = document.getElementById("scanner-container");
  if (!scannerContainer) return;

  scannerContainer.style.display = "block";

  let scanAttempts = 0;
  const maxScanAttempts = 3;
  const scanDelay = 1000;
  let lastCode = null;

  // 使用全域 Quagga（需在 HTML 中 <script> 引入 Quagga）
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
    const code = result.codeResult.code;
    console.log("條碼識別成功:", code);

    if (lastCode === code) {
      window.Quagga.stop();
      scannerContainer.style.display = "none";
      processBarcode(code);
    } else {
      lastCode = code;
      scanAttempts++;
      if (scanAttempts >= maxScanAttempts) {
        window.Quagga.stop();
        scannerContainer.style.display = "none";
        processBarcode(code);
      } else {
        setTimeout(() => {
          window.Quagga.stop();
          window.Quagga.start();
        }, scanDelay);
      }
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
