window.addEventListener("scroll", function() {
    let searchBox = document.getElementById("searchBox");
    let navbar = document.getElementById("navbar");

    if (window.scrollY > 100) { // 當滾動超過 100px 時
        searchBox.classList.add("search-fixed");
        navbar.appendChild(searchBox); // 把搜尋框移入導航列
    } else {
        searchBox.classList.remove("search-fixed");
        document.body.insertBefore(searchBox, document.body.firstChild); // 回到原位
    }
});