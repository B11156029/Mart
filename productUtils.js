// productUtils.js

export function filterProducts(products, keyword, attribute) {
    const lowerKeyword = keyword.trim().toLowerCase();
    const lowerAttr = attribute.trim().toLowerCase();
  
    return products.filter(product => {
      const nameMatches = product.name.toLowerCase().includes(lowerKeyword);
      const barcodeMatches = product.barcode && product.barcode.includes(lowerKeyword);
      const attrMatches = lowerAttr === '' || (product.attributes && product.attributes.includes(lowerAttr));
      return (nameMatches || barcodeMatches) && attrMatches;
    });
  }
  
  export function addCleanPrice(products) {
    return products.map(p => ({
      ...p,
      _cleanPrice: Number(p.price.toString().replace(/[^0-9.]/g, ''))
    }));
  }