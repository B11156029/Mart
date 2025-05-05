const app = new Vue({
    el: '#app',
    data: {
      searchKeyword: '',
      selectedAttribute: '',
      products: [],
      visibleProducts: [],
      cart: [],
      isCartVisible: false,
      itemsPerLoad: 30,
      currentIndex: 0,
      customProduct: {
        name: '',
        price: '',
        image: 'default.png',
        barcode: null,
        attributes: [],
        specialOffers: null,
        file: null,
      },
      isAddingCustomProduct: false,
      cartModule: null,
      // ✅ ⬇⬇⬇ 加在這邊
      scannerVisible: false,
      scanResult: "", // 如果你之後要顯示掃描結果也可以留這個
      isProfileVisible: false, // 控制會員資料div的顯示狀態
    },
    computed: {
      cartTotal() {
        return this.cart.reduce((total, item) => total + Number(item.subtotal || 0), 0);
      }
    },
    methods: {
      
      startScanner() {
        this.scannerVisible = true;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
          .then((stream) => {
            const video = document.getElementById('scanner-video');
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
          })
          .catch(err => {
            console.error("無法啟用攝影機", err);
          });
      },
      closeScanner() {
        import('./scanner.js').then(({ closeScanner }) => {
          closeScanner();
        });
      },
      
      navigateToProfile() {
        // 切換會員資料div的顯示狀態
        this.isProfileVisible = !this.isProfileVisible;
        // 如果購物車是開啟的，則關閉購物車
        if (this.isCartVisible && this.isProfileVisible) {
          this.isCartVisible = false;
        }
      },
      
      handleScroll() {
      const scrollPosition = window.scrollY + window.innerHeight;
      const bottomPosition = document.documentElement.scrollHeight;
    
      // 如果已接近底部，載入更多商品
      if (scrollPosition >= bottomPosition - 100) {
        this.loadMoreProducts();
      }
    },
      refreshVisibleProducts() {
        const keyword = this.searchKeyword.trim().toLowerCase();
        const attribute = this.selectedAttribute.trim().toLowerCase();

        const filtered = this.products.filter(product => {
          const nameMatches = product.name.toLowerCase().includes(keyword);
          const barcodeMatches = product.barcode && product.barcode.includes(keyword);
          const attributeMatches = attribute === '' ||
            (product.attributes && product.attributes.includes(attribute));
          return (nameMatches || barcodeMatches) && attributeMatches;
        });

        this.currentIndex = this.itemsPerLoad;
        const preparedProducts = filtered.map(p => ({
          ...p,
          _cleanPrice: Number(p.price.toString().replace(/[^0-9.]/g, ''))
        }));

        this.visibleProducts = preparedProducts.slice(0, this.currentIndex);
      },

      loadMoreProducts() {
        const keyword = this.searchKeyword.trim().toLowerCase();
        const attribute = this.selectedAttribute.trim().toLowerCase();

        const filtered = this.products.filter(product => {
          const nameMatches = product.name.toLowerCase().includes(keyword);
          const barcodeMatches = product.barcode && product.barcode.includes(keyword);
          const attributeMatches = attribute === '' ||
            (product.attributes && product.attributes.includes(attribute));
          return (nameMatches || barcodeMatches) && attributeMatches;
        });

        if (this.currentIndex >= filtered.length) return;

        const nextIndex = this.currentIndex + this.itemsPerLoad;
        const newItems = filtered.slice(this.currentIndex, nextIndex).map(p => ({
          ...p,
          _cleanPrice: Number(p.price.toString().replace(/[^0-9.]/g, ''))
        }));

        this.visibleProducts.push(...newItems);
        this.currentIndex = nextIndex;
      },

      calculateSubtotal(product, quantity) {
        if (!product.specialOffers) {
          return this.parsePrice(product.price) * quantity;
        }

        let subtotal = 0;
        let remainingQuantity = quantity;
        const offerKeys = Object.keys(product.specialOffers).map(Number).sort((a, b) => b - a);

        for (let offerQty of offerKeys) {
          while (remainingQuantity >= offerQty) {
            subtotal += product.specialOffers[offerQty];
            remainingQuantity -= offerQty;
          }
        }

        if (remainingQuantity > 0) {
          subtotal += this.parsePrice(product.price) * remainingQuantity;
        }

        return subtotal;
      },

      startScanner() {
        import('./scanner.js').then(({ startScanner }) => {
          startScanner(this);
        });
      },

      parsePrice(priceString) {
        priceString = String(priceString);
        return priceString.replace(/[^0-9.]/g, '');
      },

      addToCart(product) {
        const cartItem = this.cart.find(item => item.product.name === product.name);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          this.cart.push({ product, quantity: 1 });
        }
        this.updateCartTotals();
        this.saveCart();
      },

      increaseQuantity(product) {
        this.addToCart(product);
      },

      decreaseQuantity(product) {
        const cartItem = this.cart.find(item => item.product.name === product.name);
        if (cartItem && cartItem.quantity > 1) {
          cartItem.quantity--;
        } else {
          this.cart = this.cart.filter(item => item.product.name !== product.name);
        }
        this.updateCartTotals();
        this.saveCart();
      },

      updateCartTotals() {
        this.cart.forEach(item => {
          this.$set(item, 'subtotal', this.calculateSubtotal(item.product, item.quantity));
        });
      },

      removeFromCart(item) {
        this.cart = this.cart.filter(cartItem => cartItem !== item);
        this.updateCartTotals();
        this.saveCart();
      },

      saveCart() {
        try {
          localStorage.setItem('cartData', JSON.stringify(this.cart));
        } catch (e) {
          console.error('保存購物車數據失敗:', e);
        }
      },

      toggleCart() {
        this.isCartVisible = !this.isCartVisible;
      },

      getProductQuantity(product) {
        const cartItem = this.cart.find(item => item.product.name === product.name);
        return cartItem ? cartItem.quantity : 0;
      },

      editSubtotal(item) {
        const newSubtotal = prompt(`請輸入新的小計金額 (目前為 $${(Number(item.subtotal) || 0).toFixed(2)}):`);
        if (newSubtotal !== null && !isNaN(newSubtotal) && newSubtotal >= 0) {
          if (this.cartModule) {
            if (this.cartModule.updateSubtotal(item.product.name, parseFloat(newSubtotal))) {
              this.cart = this.cartModule.getCart();
            }
          } else {
            this.$set(item, 'subtotal', parseFloat(newSubtotal));
          }
        } else {
          alert('請輸入有效的小計金額');
        }
      },

      editPrice(item) {
        const newPrice = prompt(`請輸入新的單價 (目前為 $${this.parsePrice(item.product.price)}):`);
      
        if (newPrice !== null && newPrice.trim() !== '' && !isNaN(newPrice)) {
          import('./cart.js')
            .then(cartModule => {
              const result = cartModule.updatePrice(item.product.name, Number(newPrice));
      
              if (result.success) {
                this.cart = cartModule.getCart();
      
                const productIndex = this.products.findIndex(p => p.name === item.product.name);
                if (productIndex !== -1) {
                  this.$set(this.products[productIndex], 'price', Number(newPrice));
                  if (this.products[productIndex].specialOffers) {
                    this.$delete(this.products[productIndex], 'specialOffers');
                  }
                }
      
                Swal.fire('成功', '價格已更新（僅更新購物車商品的價格，下次加入購物車還是以前的價格）', 'success');
              } else {
                Swal.fire('錯誤', result.message || '更新價格失敗', 'error');
              }
            })
            .catch(error => {
              console.error('載入購物車模塊失敗:', error);
              Swal.fire('錯誤', '載入購物車模塊失敗', 'error');
            });
        } else {
          alert('請輸入有效的價格');
        }
      },
      

      captureCart() {
        const cartElement = document.querySelector('#cart');
        if (cartElement) {
          const originalStyle = cartElement.getAttribute("style") || "";
          cartElement.style.height = "auto";
          cartElement.style.overflow = "visible";
          
          // 顯示加載提示
          Swal.fire({
            title: '正在生成截圖...',
            text: '請稍候',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // 改善 html2canvas 配置
          html2canvas(cartElement, {
            scale: 2, // 提高解析度
            useCORS: true, // 允許跨域圖片
            allowTaint: true, // 允許污染畫布
            backgroundColor: '#ffffff', // 設置白色背景
            logging: false, // 關閉日誌以提高性能
            windowWidth: cartElement.scrollWidth,
            windowHeight: cartElement.scrollHeight,
            onclone: (documentClone) => {
              // 在克隆的文檔中處理可能的 SVG 元素
              const clonedCart = documentClone.querySelector('#cart');
              if (clonedCart) {
                // 可以在這裡對克隆的元素進行預處理
                // 例如將 SVG 轉換為 img 等
              }
            }
          }).then(canvas => {
            // 關閉加載提示
            Swal.close();
            
            try {
              // 嘗試使用更高質量的輸出
              const link = document.createElement('a');
              link.download = '購物車.png';
              link.href = canvas.toDataURL('image/png', 1.0); // 使用最高質量
              link.click();
              
              // 成功提示
              Swal.fire({
                icon: 'success',
                title: '截圖成功',
                text: '購物車截圖已保存',
                timer: 1500
              });
            } catch (e) {
              console.error('保存截圖失敗:', e);
              Swal.fire('錯誤', '保存截圖時出現問題', 'error');
            }
            
            cartElement.setAttribute("style", originalStyle);
          }).catch(error => {
            console.error('截圖失敗:', error);
            Swal.fire('錯誤', '截圖過程中出現錯誤，請稍後再試', 'error');
            cartElement.setAttribute("style", originalStyle);
          });
        } else {
          alert('無法找到購物車元素');
        }
      },

      onFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          this.customProduct.file = file;
          this.customProduct.image = URL.createObjectURL(file);
        }
      },

      addCustomProduct() {
        if (!this.customProduct.name || !this.customProduct.price) {
          alert('請輸入商品名稱和價格');
          return;
        }

        const newProduct = {...this.customProduct};

        if (this.cartModule) {
          this.cart = this.cartModule.addToCart(newProduct);
        } else {
          this.addToCart(newProduct);
        }

        this.customProduct = {
          name: '',
          price: '',
          image: 'default.png',
          barcode: null,
          attributes: [],
          specialOffers: null,
          file: null
        };
        this.isAddingCustomProduct = false;
      },
    },

    mounted() {
      fetch('main.json')
        .then(response => response.json())
        .then(data => {
          this.products = data;
          this.refreshVisibleProducts();
        })
        .catch(error => {
          console.error('載入 main.json 時發生錯誤：', error);
          alert('無法載入商品資料，請檢查 main.json 路徑');
        });

      setTimeout(() => {
        import('./cart.js')
          .then(module => {
            this.cartModule = module;
            this.cart = module.initCart();
          })
          .catch(error => console.error('加載購物車模塊時出錯：', error));
      }, 300);

      window.addEventListener('scroll', this.handleScroll);
    },

    watch: {
      searchKeyword() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.refreshVisibleProducts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      },

      selectedAttribute() {
        this.refreshVisibleProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });

  window.app = app;