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
    },
    computed: {
      cartTotal() {
        return this.cart.reduce((total, item) => total + Number(item.subtotal || 0), 0);
      }
    },
    methods: {handleScroll() {
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
        if (newPrice !== null && !isNaN(newPrice) && newPrice >= 0) {
          import('./cart.js')
            .then(cartModule => {
              const result = cartModule.updatePrice(item.product.name, newPrice);
              if (result.success) {
                this.cart = cartModule.getCart();
                const productIndex = this.products.findIndex(p => p.name === item.product.name);
                if (productIndex !== -1) {
                  this.$set(this.products[productIndex], 'price', newPrice);
                  if (this.products[productIndex].specialOffers) {
                    this.$delete(this.products[productIndex], 'specialOffers');
                  }

                  fetch('http://localhost:3002/update-price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      productName: item.product.name,
                      newPrice: newPrice
                    })
                  })
                    .then(response => {
                      if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                      }
                      return response.json();
                    })
                    .then(() => {
                      Swal.fire('成功', '價格已更新', 'success');
                    })
                    .catch(error => {
                      console.error('請求失敗:', error);
                      if (error.message && error.message.includes('Failed to fetch')) {
                        Swal.fire('連接錯誤', '無法連接到服務器。價格已在購物車中更新，但未保存到數據庫。', 'warning');
                      } else {
                        Swal.fire('錯誤', error.toString(), 'error');
                      }
                    });
                }
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

          html2canvas(cartElement, {
            scale: 2,
            useCORS: true,
            windowWidth: cartElement.scrollWidth,
            windowHeight: cartElement.scrollHeight,
          }).then(canvas => {
            const link = document.createElement('a');
            link.download = '購物車.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            cartElement.setAttribute("style", originalStyle);
          }).catch(error => {
            console.error('截圖失敗:', error);
            alert('截圖過程中出現錯誤，請稍後再試');
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