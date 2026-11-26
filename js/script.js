// TANGGAL HARI INI

const currentDate = document.getElementById("current-date");

if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// NAVIGASI HALAMAN

const navItems = document.querySelectorAll(".nav-item");

function navigateTo(page) {

    // Menghapus status aktif
    navItems.forEach(item => {
        item.classList.remove("active");
    });

    // Mengaktifkan menu yang dipilih
    const selectedMenu = document.querySelector(
        `.nav-item[data-page="${page}"]`
    );

    if (selectedMenu) {
        selectedMenu.classList.add("active");
    }

    // Menampilkan halaman
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const selectedPage = document.getElementById(page);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Mengubah judul halaman
    const title = selectedMenu
        ? selectedMenu.textContent.trim()
        : "Dashboard";

    document.getElementById("page-title").textContent = title;
    document.getElementById("breadcrumb").textContent = title;

    // Memuat data bahan baku
if (page === "stok") {
    loadBahanBaku();
    loadStockHistory();
}

if (page === "resep") {
    loadResep();
}

if (page === "hpp") {
    loadHPP();
}

if (page === "pengeluaran") {
    loadPengeluaran();
}

if (page === "laba-rugi") {
    renderLaporanLabaRugi();
}

}


// EVENT KLIK MENU

navItems.forEach(item => {

    item.addEventListener("click", function() {

        const page = this.dataset.page;

        navigateTo(page);

    });

});

// ======================================
// KOPIPOS - CASHIER SYSTEM
// ======================================


// DATA MENU SEMENTARA

const products = [
    {
        id: "M001",
        name: "Americano",
        category: "Coffee",
        price: 15000,
        icon: "☕"
    },
    {
        id: "M002",
        name: "Cafe Latte",
        category: "Coffee",
        price: 20000,
        icon: "🥛"
    },
    {
        id: "M003",
        name: "Cappuccino",
        category: "Coffee",
        price: 18000,
        icon: "☕"
    },
    {
        id: "M004",
        name: "Kopi Susu Aren",
        category: "Coffee",
        price: 18000,
        icon: "🧋"
    },
    {
        id: "M005",
        name: "Matcha Latte",
        category: "Non Coffee",
        price: 20000,
        icon: "🍵"
    },
    {
        id: "M006",
        name: "Chocolate",
        category: "Non Coffee",
        price: 18000,
        icon: "🍫"
    },
    {
        id: "M007",
        name: "Red Velvet",
        category: "Non Coffee",
        price: 20000,
        icon: "🥤"
    },
    {
        id: "M008",
        name: "Vanilla Latte",
        category: "Coffee",
        price: 22000,
        icon: "☕"
    },
    {
        id: "M009",
        name: "Caramel Latte",
        category: "Coffee",
        price: 23000,
        icon: "🥤"
    }
];
// ======================================
// KOPIPOS - LOAD MENU DARI GOOGLE SHEETS
// ======================================

const API_URL = "https://script.google.com/macros/s/AKfycby9YxjNwFzghc9OMkQ5LRM_qdmr0Z4F_FdQHqVn9krJK1L7YlrgJMWHUfdTgH9oOUs1uA/exec";

let dataExportAnalisisHPP = [];

async function loadMenuFromAPI() {
    try {
        console.log("Mengambil data menu dari Google Spreadsheet...");

        const response = await fetch(`${API_URL}?action=getMenu`);

        if (!response.ok) {
            throw new Error("Gagal menghubungi API.");
        }

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message || "Gagal mengambil data menu.");
        }

        const apiProducts = result.data
            .filter(item => item.status.toLowerCase() === "aktif")
            .map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: Number(item.price),
                icon: item.category.toLowerCase() === "coffee"
                    ? "☕"
                    : "🥤"
            }));

        // Perbarui daftar produk
        products.splice(0, products.length, ...apiProducts);

        // Tampilkan produk terbaru
        renderProducts();

        console.log("Menu berhasil dimuat:", apiProducts);

    } catch (error) {
        console.error("Gagal memuat menu:", error);

        alert(
            "Menu dari Google Spreadsheet gagal dimuat. " +
            "Silakan periksa koneksi API."
        );
    }
}


// KERANJANG

let cart = [];


// FORMAT RUPIAH

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}


// MENAMPILKAN TANGGAL KASIR

const cashierDate = document.getElementById("cashier-date");

if (cashierDate) {
    cashierDate.textContent = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// MENAMPILKAN PRODUK

function renderProducts() {

    const productGrid = document.getElementById("product-grid");

    if (!productGrid) return;

    const search = document.getElementById("search-product").value
        .toLowerCase();

    const category = document.getElementById("filter-category").value;

    const filteredProducts = products.filter(product => {

        const matchName = product.name.toLowerCase().includes(search);

        const matchCategory =
            category === "Semua" || product.category === category;

        return matchName && matchCategory;

    });


    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <div class="no-product">
                Menu tidak ditemukan.
            </div>
        `;

        return;
    }


    productGrid.innerHTML = filteredProducts.map(product => `

        <div class="product-card"
             onclick="addToCart('${product.id}')">

            <div class="product-image">
                ${product.icon}
            </div>

            <h4>${product.name}</h4>

            <p class="product-category">
                ${product.category}
            </p>

            <div class="product-bottom">

                <span class="product-price">
                    ${formatRupiah(product.price)}
                </span>

                <button class="add-product" type="button">
                    +
                </button>

            </div>

        </div>

    `).join("");

}


// MENAMBAHKAN PRODUK KE KERANJANG

function addToCart(productId) {

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {

        existingProduct.qty++;

    } else {

        cart.push({
            ...product,
            qty: 1
        });

    }

    renderCart();

}


// MENGHITUNG TOTAL

function calculateTotal() {

    return cart.reduce((total, item) => {

        return total + (item.price * item.qty);

    }, 0);

}


// MENGHITUNG JUMLAH ITEM

function calculateItems() {

    return cart.reduce((total, item) => {

        return total + item.qty;

    }, 0);

}


// MENAMPILKAN KERANJANG

function renderCart() {

    const cartItems = document.getElementById("cart-items");

    if (!cartItems) return;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Belum ada pesanan</p>
            </div>
        `;

    } else {

        cartItems.innerHTML = cart.map(item => `

            <div class="cart-item">

                <div class="cart-item-info">

                    <h4>${item.name}</h4>

                    <p>${formatRupiah(item.price * item.qty)}</p>

                </div>

                <div class="quantity-control">

                    <button onclick="changeQuantity('${item.id}', -1)">
                        -
                    </button>

                    <span>${item.qty}</span>

                    <button onclick="changeQuantity('${item.id}', 1)">
                        +
                    </button>

                </div>

            </div>

        `).join("");

    }


    document.getElementById("cart-total-items").textContent =
        calculateItems();

    document.getElementById("cart-total").textContent =
        formatRupiah(calculateTotal());

    calculateChange();

}


// MENGUBAH JUMLAH PRODUK

function changeQuantity(productId, change) {

    const item = cart.find(product => product.id === productId);

    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {

        cart = cart.filter(product => product.id !== productId);

    }

    renderCart();

}


// MENGHAPUS SEMUA KERANJANG

function clearCart() {

    if (cart.length === 0) return;

    const confirmClear = confirm(
        "Apakah kamu yakin ingin menghapus semua pesanan?"
    );

    if (!confirmClear) return;

    cart = [];

    document.getElementById("payment-amount").value = "";

    renderCart();

}


// MENGHITUNG KEMBALIAN

function calculateChange() {

    const total = calculateTotal();

    const paymentInput = document.getElementById("payment-amount");

    const payment = Number(paymentInput.value) || 0;

    const change = payment - total;

    document.getElementById("change-amount").textContent =
        formatRupiah(Math.max(0, change));

    const checkoutButton = document.getElementById("checkout-button");

    checkoutButton.disabled =
        cart.length === 0 || payment < total || total <= 0;

}


// EVENT INPUT PEMBAYARAN

const paymentInput = document.getElementById("payment-amount");

if (paymentInput) {

    paymentInput.addEventListener("input", calculateChange);

}


// PENCARIAN PRODUK

const searchProduct = document.getElementById("search-product");

if (searchProduct) {

    searchProduct.addEventListener("input", renderProducts);

}


// FILTER KATEGORI

const filterCategory = document.getElementById("filter-category");

if (filterCategory) {

    filterCategory.addEventListener("change", renderProducts);

}


// MENYELESAIKAN TRANSAKSI

// ======================================
// CHECKOUT KOPIPOS - GOOGLE SPREADSHEET
// ======================================

async function checkout() {

    const total = calculateTotal();

    const payment = Number(
        document.getElementById("payment-amount").value
    ) || 0;

    // Validasi keranjang
    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    // Validasi pembayaran
    if (payment < total) {
        alert("Uang pembayaran masih kurang!");
        return;
    }

    // Buat data transaksi
    const transaction = {

        id: "TRX" + Date.now(),

        date: new Date().toISOString(),

        items: cart.map(item => ({

            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            subtotal: item.price * item.qty

        })),

        total: total,

        payment: payment,

        change: payment - total,

        cashier: (
    JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    ).cashierName || "Admin"
)

    };

    // Ambil tombol checkout
    const checkoutButton = document.getElementById(
        "checkout-button"
    );

    try {

        // Nonaktifkan tombol selama proses
        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.textContent = "Menyimpan...";
        }

        console.log("Mengirim transaksi ke Google Spreadsheet...");

        // Kirim transaksi ke Google Apps Script
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({

                action: "saveTransaction",

                data: transaction

            })

        });

        const result = await response.json();

        // Periksa respons API
        if (
            !response.ok ||
            result.status !== "success"
        ) {

            throw new Error(
                result.message || "Transaksi gagal disimpan."
            );

        }

        // Simpan riwayat di browser setelah API berhasil
        const transactions = JSON.parse(
            localStorage.getItem("kopipos_transactions") || "[]"
        );

        transactions.push(transaction);

        localStorage.setItem(
            "kopipos_transactions",
            JSON.stringify(transactions)
        );

        // Tampilkan notifikasi
        alert(
            
            "TRANSAKSI BERHASIL!\n\n" +
            "ID: " + transaction.id + "\n" +
            "Total: " + formatRupiah(total) + "\n" +
            "Bayar: " + formatRupiah(payment) + "\n" +
            "Kembalian: " + formatRupiah(payment - total) +
            "\n\nData berhasil disimpan ke Google Spreadsheet."
        );

        // Cetak struk transaksi
        printReceipt(transaction);

        // Reset keranjang
        cart = [];

        document.getElementById("payment-amount").value = "";

        renderCart();

        console.log("Transaksi berhasil:", result);

    } catch (error) {

        console.error("Checkout error:", error);

        alert(
            "TRANSAKSI GAGAL DISIMPAN!\n\n" +
            error.message +
            "\n\nSilakan periksa koneksi API dan coba kembali."
        );

    } finally {

        // Aktifkan kembali tombol
        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Bayar";
        }

    }

}

// ======================================
// KOPIPOS - CETAK STRUK
// ======================================

function printReceipt(transaction) {

    const receiptContent = document.getElementById("receipt-content");

    if (!receiptContent) return;

    // Ambil pengaturan kedai
    const settings = JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    );

    const storeName = settings.storeName || "KOPIPOS COFFEE";
    const storeAddress = settings.storeAddress || "";
    const storePhone = settings.storePhone || "";
    const cashierName = settings.cashierName || "Admin";
    const receiptMessage = settings.receiptMessage || "Terima kasih telah berkunjung!";
    const storeLogo = localStorage.getItem("kopipos_logo") || "";

    // Daftar menu
    const itemsHTML = transaction.items.map(item => `

        <div class="receipt-item">

            <div>
                <strong>${item.name}</strong>
                <br>
                ${item.qty} x ${formatRupiah(item.price)}
            </div>

            <strong>${formatRupiah(item.subtotal)}</strong>

        </div>

    `).join("");

    // Isi struk
    receiptContent.innerHTML = `

        <div style="text-align:center;">

    ${storeLogo ? `
        <div style="margin-bottom:10px;">
            <img
                src="${storeLogo}"
                alt="Logo Kedai"
                style="
                    max-width:100px;
                    max-height:80px;
                    object-fit:contain;
                "
            >
        </div>
    ` : ""}

    <h2>${storeName}</h2>

            ${storeAddress ? `<p>${storeAddress}</p>` : ""}

            ${storePhone ? `<p>WhatsApp: ${storePhone}</p>` : ""}

        </div>

        <hr>

        <p>ID Transaksi: ${transaction.id}</p>

        <p>
            Tanggal:
            ${formatTransactionDate(transaction.date)}
        </p>

        <p>Kasir: ${cashierName}</p>

        <hr>

        ${itemsHTML}

        <hr>

        <div class="receipt-item">
            <strong>Total</strong>
            <strong>${formatRupiah(transaction.total)}</strong>
        </div>

        <div class="receipt-item">
            <span>Bayar</span>
            <span>${formatRupiah(transaction.payment)}</span>
        </div>

        <div class="receipt-item">
            <strong>Kembalian</strong>
            <strong>${formatRupiah(transaction.change)}</strong>
        </div>

        <hr>

        <p style="text-align:center;">
            ${receiptMessage}
        </p>

    `;

    const receiptContainer = document.getElementById("receipt-container");

    receiptContainer.style.display = "block";

    window.print();

    receiptContainer.style.display = "none";

}

// INISIALISASI KASIR

renderProducts();

renderCart();

// ======================================
// KOPIPOS - MENU MANAGEMENT
// GOOGLE SPREADSHEET API
// ======================================

const menuStorageKey = "kopipos_menu";

let menuData = [];

// GENERATE ID MENU OTOMATIS
function generateNextMenuId() {
    let highestNumber = 0;

    menuData.forEach(menu => {
        const match = String(menu.id).match(/^M(\d+)$/);

        if (match) {
            const number = parseInt(match[1], 10);

            if (number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    return "M" + String(highestNumber + 1).padStart(3, "0");
}


// ======================================
// FUNGSI SINKRONISASI PRODUK KASIR
// ======================================

function syncMenuToCashier() {

    const availableProducts = menuData
        .filter(menu => menu.status === "Tersedia")
        .map(menu => ({
            id: menu.id,
            name: menu.name,
            category: menu.category,
            price: Number(menu.price),
            icon: menu.icon || "☕"
        }));

    products.splice(
        0,
        products.length,
        ...availableProducts
    );

    if (typeof renderProducts === "function") {
        renderProducts();
    }
}


// ======================================
// SIMPAN MENU KE LOCAL STORAGE
// ======================================

function saveMenuData() {

    localStorage.setItem(
        menuStorageKey,
        JSON.stringify(menuData)
    );

    syncMenuToCashier();

    renderMenuTable();

    renderMenuStatistics();
}


// ======================================
// LOAD MENU DARI GOOGLE SPREADSHEET
// ======================================

async function loadMenuManagementFromAPI() {

    try {

        console.log("Mengambil data menu...");

        const response = await fetch(
            `${API_URL}?action=getMenu`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message);
        }

        menuData = result.data.map(menu => ({

            id: menu.id,

            name: menu.name,

            category: menu.category,

            price: Number(menu.price),

            status: menu.status.toLowerCase() === "aktif"
                ? "Tersedia"
                : "Tidak Tersedia",

            icon: menu.category.toLowerCase() === "coffee"
                ? "☕"
                : "🥤"

        }));

        saveMenuData();

        console.log("Menu berhasil dimuat:", menuData);

    } catch (error) {

        console.error("Gagal mengambil menu:", error);

        alert(
            "Gagal mengambil data menu dari Google Spreadsheet."
        );

    }

}


// ======================================
// KIRIM DATA MENU KE API
// ======================================

async function sendMenuToAPI(action, data) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify({

            action: action,

            data: data

        })

    });

    const result = await response.json();

    if (
        !response.ok ||
        result.status !== "success"
    ) {

        throw new Error(
            result.message || "Gagal menyimpan data menu."
        );

    }

    return result;

}


// ======================================
// MENCEGAH HTML INJECTION
// ======================================

function escapeMenuHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}


// ======================================
// STATISTIK MENU
// ======================================

function renderMenuStatistics() {

    const total = menuData.length;

    const available = menuData.filter(
        menu => menu.status === "Tersedia"
    ).length;

    const unavailable = total - available;

    document.getElementById("menu-total").textContent = total;

    document.getElementById("menu-available").textContent = available;

    document.getElementById("menu-unavailable").textContent = unavailable;

}


// ======================================
// TABEL MENU
// ======================================

function renderMenuTable() {

    const tableBody = document.getElementById("menu-table-body");

    if (!tableBody) return;

    const searchElement = document.getElementById("search-menu");

    const categoryElement = document.getElementById(
        "filter-menu-category"
    );

    const keyword = searchElement.value.toLowerCase();

    const category = categoryElement.value;

    const filteredMenus = menuData.filter(menu => {

        const matchName = menu.name
            .toLowerCase()
            .includes(keyword);

        const matchCategory =
            category === "Semua" ||
            menu.category === category;

        return matchName && matchCategory;

    });


    if (filteredMenus.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px;">
                    Tidak ada menu ditemukan.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = filteredMenus.map((menu, index) => {

        const statusClass = menu.status === "Tersedia"
            ? "status-available"
            : "status-unavailable";

        return `

            <tr>

                <td>${index + 1}</td>

                <td>${escapeMenuHTML(menu.name)}</td>

                <td>${escapeMenuHTML(menu.category)}</td>

                <td>${formatRupiah(Number(menu.price))}</td>

                <td>
                    <span class="menu-status ${statusClass}">
                        ${escapeMenuHTML(menu.status)}
                    </span>
                </td>

                <td>

                    <div class="menu-action">

                        <button
                            class="edit-menu-button"
                            onclick="editMenu('${escapeMenuHTML(menu.id)}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-menu-button"
                            onclick="deleteMenu('${escapeMenuHTML(menu.id)}')"
                        >
                            Hapus
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");

}


// ======================================
// BUKA MODAL TAMBAH MENU
// ======================================

function openMenuModal() {

    document.getElementById("menu-form").reset();

    document.getElementById("menu-id").value = generateNextMenuId();

    document.getElementById("menu-modal-title").textContent =
        "Tambah Menu";

    document.getElementById("menu-modal").classList.add("active");

}


// ======================================
// TUTUP MODAL
// ======================================

function closeMenuModal() {

    document.getElementById("menu-modal").classList.remove("active");

}


// ======================================
// TAMBAH DAN EDIT MENU
// ======================================

document.getElementById("menu-form").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const menuId = document.getElementById("menu-id")
    .value.trim() || generateNextMenuId();

        const name = document.getElementById("menu-name")
            .value.trim();

        const category = document.getElementById("menu-category")
            .value;

        const price = Number(
            document.getElementById("menu-price").value
        );

        const status = document.getElementById("menu-status")
            .value;


        if (!name || !Number.isFinite(price) || price <= 0) {

            alert("Nama dan harga menu harus diisi dengan benar.");

            return;

        }


        

        const menu = {

            id: menuId,

            name: name,

            category: category,

            price: price,

            // Sesuaikan status website dengan status API
            status: status === "Tersedia"
                ? "Aktif"
                : "Tidak Aktif"

        };


        const submitButton = event.submitter;

        try {

            if (submitButton) {
                submitButton.disabled = true;
            }

            // Simpan ke Google Spreadsheet
            await sendMenuToAPI("saveMenu", menu);

            // Perbarui data lokal
            const index = menuData.findIndex(
                item => item.id === menuId
            );

            const updatedMenu = {
                ...menu,
                status: status,
                icon: category.toLowerCase() === "coffee"
                    ? "☕"
                    : "🥤"
            };

            if (index !== -1) {

                menuData[index] = updatedMenu;

            } else {

                menuData.push(updatedMenu);

            }

            saveMenuData();

            closeMenuModal();

            alert("Menu berhasil disimpan ke Google Spreadsheet.");

        } catch (error) {

            console.error("Gagal menyimpan menu:", error);

            alert(
                "Gagal menyimpan menu!\n\n" +
                error.message
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    }
);


// ======================================
// EDIT MENU
// ======================================

function editMenu(id) {

    const menu = menuData.find(
        item => item.id === id
    );

    if (!menu) return;

    document.getElementById("menu-id").value = menu.id;

    document.getElementById("menu-name").value = menu.name;

    document.getElementById("menu-category").value = menu.category;

    document.getElementById("menu-price").value = menu.price;

    document.getElementById("menu-status").value = menu.status;

    document.getElementById("menu-modal-title").textContent =
        "Edit Menu";

    document.getElementById("menu-modal").classList.add("active");

}


// ======================================
// HAPUS MENU
// ======================================

async function deleteMenu(id) {

    const menu = menuData.find(
        item => item.id === id
    );

    if (!menu) return;

    const confirmation = confirm(
        `Apakah Anda yakin ingin menghapus menu ${menu.name}?`
    );

    if (!confirmation) return;


    try {

        // Hapus dari Google Spreadsheet
        await sendMenuToAPI("deleteMenu", {
            id: id
        });

        // Hapus dari data lokal
        menuData = menuData.filter(
            item => item.id !== id
        );

        saveMenuData();

        alert("Menu berhasil dihapus dari Google Spreadsheet.");

    } catch (error) {

        console.error("Gagal menghapus menu:", error);

        alert(
            "Gagal menghapus menu!\n\n" +
            error.message
        );

    }

}


// ======================================
// PENCARIAN MENU
// ======================================

document.getElementById("search-menu").addEventListener(
    "input",
    renderMenuTable
);


// ======================================
// FILTER KATEGORI
// ======================================

document.getElementById("filter-menu-category").addEventListener(
    "change",
    renderMenuTable
);


// ======================================
// INISIALISASI MENU
// ======================================

// Ambil menu langsung dari Google Spreadsheet
loadMenuManagementFromAPI();


// ======================================
// KOPIPOS - RIWAYAT TRANSAKSI
// ======================================

// Mengambil data transaksi dari localStorage
function getTransactionHistory() {

    try {
        const savedTransactions = localStorage.getItem(
            "kopipos_transactions"
        );

        const transactions = savedTransactions
            ? JSON.parse(savedTransactions)
            : [];

        return Array.isArray(transactions) ? transactions : [];

    } catch (error) {
        console.error("Gagal membaca riwayat transaksi:", error);
        return [];
    }
}


// Format tanggal Indonesia
function formatTransactionDate(dateValue) {

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// Mengubah tanggal menjadi YYYY-MM-DD
function getLocalDate(dateValue) {

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Mencegah teks dianggap sebagai HTML
function escapeHistoryHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}


// Menampilkan statistik transaksi
function renderHistoryStatistics() {

    const transactions = getTransactionHistory();

    const totalTransactions = transactions.length;

    const totalSales = transactions.reduce(
        (total, transaction) => total + Number(transaction.total || 0),
        0
    );

    const averageSales = totalTransactions > 0
        ? totalSales / totalTransactions
        : 0;

    document.getElementById(
        "history-total-transactions"
    ).textContent = totalTransactions;

    document.getElementById(
        "history-total-sales"
    ).textContent = formatRupiah(totalSales);

    document.getElementById(
        "history-average-sales"
    ).textContent = formatRupiah(averageSales);

}


// Menampilkan tabel transaksi
function renderTransactionHistory() {

    const tableBody = document.getElementById(
        "history-table-body"
    );

    if (!tableBody) return;

    const transactions = getTransactionHistory();

    const keyword = document.getElementById(
        "search-transaction"
    ).value.trim().toLowerCase();

    const selectedDate = document.getElementById(
        "filter-transaction-date"
    ).value;

    const filteredTransactions = transactions
        .filter(transaction => {

            const matchID = String(transaction.id || "")
                .toLowerCase()
                .includes(keyword);

            const matchDate = selectedDate === "" ||
                getLocalDate(transaction.date) === selectedDate;

            return matchID && matchDate;

        })
        .sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });


    if (filteredTransactions.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="history-empty">
                        Belum ada transaksi ditemukan.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = filteredTransactions.map(
        (transaction, index) => {

            const totalItems = (transaction.items || []).reduce(
                (total, item) => total + Number(item.qty || 0),
                0
            );

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${escapeHistoryHTML(transaction.id)}
                    </td>

                    <td>
                        ${escapeHistoryHTML(
                            formatTransactionDate(transaction.date)
                        )}
                    </td>

                    <td>${totalItems}</td>

                    <td>
                        ${formatRupiah(Number(transaction.total || 0))}
                    </td>

                    <td>
                        ${formatRupiah(Number(transaction.payment || 0))}
                    </td>

                    <td>
                        ${formatRupiah(Number(transaction.change || 0))}
                    </td>

                    <td>
                        ${escapeHistoryHTML(transaction.cashier || "Admin")}
                    </td>

                    <td>
                        <button
                            class="detail-transaction-button"
                            onclick="showTransactionDetail('${escapeHistoryHTML(transaction.id)}')"
                        >
                            Detail
                        </button>
                    </td>

                </tr>
            `;

        }
    ).join("");

}


// Membuka detail transaksi
function showTransactionDetail(id) {

    const transactions = getTransactionHistory();

    const transaction = transactions.find(
        item => String(item.id) === String(id)
    );

    if (!transaction) {
        alert("Transaksi tidak ditemukan.");
        return;
    }

    const detailContent = document.getElementById(
        "history-detail-content"
    );

    const items = transaction.items || [];

    const itemHTML = items.map(item => {

        const name = escapeHistoryHTML(item.name || "-");
        const qty = Number(item.qty || 0);
        const subtotal = Number(
            item.subtotal || Number(item.price || 0) * qty
        );

        return `
            <div class="history-item">

                <span>
                    ${name} × ${qty}
                </span>

                <strong>
                    ${formatRupiah(subtotal)}
                </strong>

            </div>
        `;

    }).join("");


    detailContent.innerHTML = `

        <div class="history-detail-row">
            <span>ID Transaksi</span>
            <strong>${escapeHistoryHTML(transaction.id)}</strong>
        </div>

        <div class="history-detail-row">
            <span>Tanggal</span>
            <strong>
                ${escapeHistoryHTML(
                    formatTransactionDate(transaction.date)
                )}
            </strong>
        </div>

        <div class="history-detail-row">
            <span>Nama Kasir</span>
            <strong>
                 ${escapeHistoryHTML(transaction.cashier || "Admin")}
             </strong>
        </div>

        <div class="history-detail-items">

            <h4>Daftar Pesanan</h4>

            ${itemHTML || '<p class="history-empty">Tidak ada detail pesanan.</p>'}

        </div>

        <br>

        <div class="history-detail-row">
            <span>Total Pembayaran</span>
            <strong>${formatRupiah(Number(transaction.total || 0))}</strong>
        </div>

        <div class="history-detail-row">
            <span>Uang Diterima</span>
            <strong>${formatRupiah(Number(transaction.payment || 0))}</strong>
        </div>

        <div class="history-detail-row">
            <span>Kembalian</span>
            <strong>${formatRupiah(Number(transaction.change || 0))}</strong>
        </div>

    `;

    document.getElementById(
        "history-modal"
    ).classList.add("active");

}


// Menutup detail transaksi
function closeHistoryModal() {

    document.getElementById(
        "history-modal"
    ).classList.remove("active");

}


// Reset pencarian dan filter
function resetHistoryFilter() {

    document.getElementById(
        "search-transaction"
    ).value = "";

    document.getElementById(
        "filter-transaction-date"
    ).value = "";

    renderTransactionHistory();

}


// Event pencarian transaksi
document.getElementById(
    "search-transaction"
).addEventListener("input", renderTransactionHistory);


// Event filter tanggal
document.getElementById(
    "filter-transaction-date"
).addEventListener("change", renderTransactionHistory);


// Memperbarui riwayat ketika halaman dibuka
const originalNavigateTo = navigateTo;

navigateTo = function(page) {

    originalNavigateTo(page);

    if (page === "riwayat") {
        renderHistoryStatistics();
        renderTransactionHistory();
    }

};


// Inisialisasi awal
renderHistoryStatistics();
renderTransactionHistory();

// ======================================
// KOPIPOS - LAPORAN PENJUALAN
// ======================================

let salesReportChart = null;


// Mengambil transaksi berdasarkan periode
function getFilteredReportTransactions() {

    const transactions = getTransactionHistory();

    const period = document.getElementById(
        "report-period"
    ).value;

    const now = new Date();

    return transactions.filter(transaction => {

        const transactionDate = new Date(transaction.date);

        if (isNaN(transactionDate.getTime())) {
            return false;
        }

        if (period === "semua") {
            return true;
        }

        if (period === "hari") {

            return getLocalDate(transactionDate) ===
                getLocalDate(now);

        }

        if (period === "minggu") {

            const startDate = new Date(now);

            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 6);

            return transactionDate >= startDate &&
                transactionDate <= now;

        }

        if (period === "bulan") {

            return transactionDate.getMonth() === now.getMonth() &&
                transactionDate.getFullYear() === now.getFullYear();

        }

        return true;

    });

}


// Menghitung ringkasan laporan
function renderReportStatistics(transactions) {

    const totalTransactions = transactions.length;

    const totalSales = transactions.reduce(
        (sum, transaction) => {
            return sum + Number(transaction.total || 0);
        },
        0
    );

    const totalItems = transactions.reduce(
        (sum, transaction) => {

            const items = transaction.items || [];

            return sum + items.reduce(
                (itemSum, item) => {
                    return itemSum + Number(item.qty || 0);
                },
                0
            );

        },
        0
    );

    const averageSales = totalTransactions > 0
        ? totalSales / totalTransactions
        : 0;


    document.getElementById(
        "report-total-sales"
    ).textContent = formatRupiah(totalSales);

    document.getElementById(
        "report-total-transactions"
    ).textContent = totalTransactions;

    document.getElementById(
        "report-average-sales"
    ).textContent = formatRupiah(averageSales);

    document.getElementById(
        "report-total-items"
    ).textContent = totalItems;

}


// Mengelompokkan penjualan berdasarkan tanggal
function getSalesByDate(transactions) {

    const salesMap = {};

    transactions.forEach(transaction => {

        const date = getLocalDate(transaction.date);

        if (!date) return;

        if (!salesMap[date]) {
            salesMap[date] = 0;
        }

        salesMap[date] += Number(transaction.total || 0);

    });

    return Object.entries(salesMap)
        .sort((a, b) => a[0].localeCompare(b[0]));

}


// Membuat grafik penjualan
function renderSalesChart(transactions) {

    const canvas = document.getElementById(
        "sales-report-chart"
    );

    if (!canvas) return;

    const salesData = getSalesByDate(transactions);

    const labels = salesData.map(item => {

        const date = new Date(item[0] + "T00:00:00");

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short"
        });

    });

    const values = salesData.map(item => item[1]);

    if (salesReportChart) {
        salesReportChart.destroy();
    }

    if (typeof Chart === "undefined") {

        console.error("Chart.js belum berhasil dimuat.");
        return;

    }

    salesReportChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{
                label: "Total Penjualan",

                data: values,

                borderColor: "#d6a75c",

                backgroundColor: "rgba(214, 167, 92, 0.12)",

                borderWidth: 3,

                fill: true,

                tension: 0.35,

                pointRadius: 4,

                pointBackgroundColor: "#d6a75c"
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    labels: {
                        color: "#e6d8c6"
                    }
                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#a99a88"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#a99a88",

                        callback: function(value) {
                            return "Rp" + Number(value).toLocaleString("id-ID");
                        }

                    },

                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }

                }

            }

        }

    });

}


// Menghitung menu terlaris
function renderBestSellingReport(transactions) {

    const tableBody = document.getElementById(
        "best-selling-report"
    );

    if (!tableBody) return;

    const productMap = {};

    transactions.forEach(transaction => {

        const items = transaction.items || [];

        items.forEach(item => {

            const name = item.name || "Menu tidak diketahui";

            if (!productMap[name]) {

                productMap[name] = {
                    name: name,
                    qty: 0,
                    total: 0
                };

            }

            productMap[name].qty += Number(item.qty || 0);

            productMap[name].total += Number(
                item.subtotal ||
                Number(item.price || 0) * Number(item.qty || 0)
            );

        });

    });


    const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.qty - a.qty);


    if (sortedProducts.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Belum ada data penjualan.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = sortedProducts.map(
        (product, index) => {

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>${escapeHistoryHTML(product.name)}</td>

                    <td>${product.qty}</td>

                    <td>${formatRupiah(product.total)}</td>

                </tr>
            `;

        }
    ).join("");

}


// Fungsi utama laporan
function renderSalesReport() {

    const transactions = getFilteredReportTransactions();

    renderReportStatistics(transactions);

    renderSalesChart(transactions);

    renderBestSellingReport(transactions);

}


// Memperbarui laporan ketika halaman dibuka
const previousNavigateTo = navigateTo;

navigateTo = function(page) {

    previousNavigateTo(page);

    if (page === "laporan") {
        renderSalesReport();
    }

};


// Event filter periode
document.getElementById(
    "report-period"
).addEventListener("change", renderSalesReport);


// Inisialisasi laporan
renderSalesReport();
// Muat menu dari Google Spreadsheet
loadMenuFromAPI();

// ======================================
// KOPIPOS - DASHBOARD
// ======================================

function renderDashboard() {

    const transactions = JSON.parse(
        localStorage.getItem("kopipos_transactions") || "[]"
    );

    const now = new Date();

    const today = now.toLocaleDateString("id-ID");

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // TRANSAKSI HARI INI
    const todayTransactions = transactions.filter(transaction => {

        const transactionDate = new Date(transaction.date);

        return transactionDate.toLocaleDateString("id-ID") === today;

    });

    // TOTAL PENJUALAN HARI INI
    const todaySales = todayTransactions.reduce(
        (total, transaction) => total + Number(transaction.total || 0),
        0
    );

    // TOTAL TRANSAKSI
    const totalTransactions = todayTransactions.length;

    // PRODUK TERJUAL
    const totalProducts = todayTransactions.reduce(
        (total, transaction) => {
            return total + (transaction.items || []).reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0
            );
        },
        0
    );

    // PENJUALAN BULAN INI
    const monthlySales = transactions
        .filter(transaction => {

            const date = new Date(transaction.date);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        })
        .reduce(
            (total, transaction) => total + Number(transaction.total || 0),
            0
        );

    // TAMPILKAN STATISTIK
    document.getElementById("total-sales").textContent =
        formatRupiah(todaySales);

    document.getElementById("total-transactions").textContent =
        totalTransactions;

    document.getElementById("total-products").textContent =
        totalProducts;

    document.getElementById("monthly-sales").textContent =
        formatRupiah(monthlySales);

// ======================================
// TRANSAKSI TERBARU
// ======================================

const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

const recentTable = document.getElementById("recent-transactions");

if (recentTable) {

    if (recentTransactions.length === 0) {

        recentTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

    } else {

        recentTable.innerHTML = recentTransactions.map(transaction => `

            <tr>
                <td>${transaction.id || "-"}</td>

                <td>${formatTransactionDate(transaction.date)}</td>

                <td>${formatRupiah(Number(transaction.total || 0))}</td>

                <td>
                    <span class="status-badge status-success">
                        Selesai
                    </span>
                </td>
            </tr>

        `).join("");

    }

}

// ======================================
// PRODUK TERLARIS
// ======================================

const productSales = {};

transactions.forEach(transaction => {

    (transaction.items || []).forEach(item => {

        const name = item.name || "Menu tidak diketahui";

        if (!productSales[name]) {
            productSales[name] = 0;
        }

        productSales[name] += Number(item.qty || 0);

    });

});

const bestSellingProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

// ======================================
// PRODUK TERLARIS - PREMIUM RANKING
// ======================================

// ======================================
// PRODUK TERLARIS - MINIMALIST PREMIUM
// ======================================

// ======================================
// PRODUK TERLARIS - TABEL PREMIUM
// ======================================

const bestSellingContainer = document.getElementById(
    "best-selling-products"
);

if (bestSellingContainer) {

    if (bestSellingProducts.length === 0) {

        bestSellingContainer.innerHTML = `
            <div class="best-selling-empty">
                Belum ada data penjualan produk.
            </div>
        `;

    } else {

        bestSellingContainer.innerHTML = `

            <div class="best-selling-table-wrapper">

                <table class="best-selling-table">

                    <thead>
                        <tr>
                            <th>Nama Produk</th>
                            <th>Terjual</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${bestSellingProducts.map((product, index) => `

                            <tr>
                                <td>
                                    <span class="product-number">
                                        ${index + 1}.
                                    </span>
                                    ${product[0]}
                                </td>

                                <td>
                                    <span class="product-sold">
                                        ${product[1]} terjual
                                    </span>
                                </td>
                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `;

    }

}

// ======================================
// GRAFIK PENJUALAN 7 HARI TERAKHIR
// ======================================

const chartCanvas = document.getElementById(
    "dashboard-sales-chart"
);

if (chartCanvas && typeof Chart !== "undefined") {

    const labels = [];
    const salesData = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(date.getDate() - i);

        const localDate = getLocalDate(date);

        labels.push(
            date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short"
            })
        );

        const dailySales = transactions
            .filter(transaction => {
                return getLocalDate(transaction.date) === localDate;
            })
            .reduce((total, transaction) => {
                return total + Number(transaction.total || 0);
            }, 0);

        salesData.push(dailySales);

    }

    // Hapus grafik lama jika sudah ada
    if (window.dashboardSalesChart) {
        window.dashboardSalesChart.destroy();
    }

    // Buat grafik baru
    window.dashboardSalesChart = new Chart(chartCanvas, {

    type: "line",

    data: {
        labels: labels,

        datasets: [{
            label: "Penjualan",
            data: salesData,

            borderColor: "#d6b16a",
            borderWidth: 3,

            backgroundColor: function(context) {

                const chart = context.chart;
                const {ctx, chartArea} = chart;

                if (!chartArea) {
                    return "rgba(214, 177, 106, 0.10)";
                }

                const gradient = ctx.createLinearGradient(
                    0,
                    chartArea.top,
                    0,
                    chartArea.bottom
                );

                gradient.addColorStop(
                    0,
                    "rgba(214, 177, 106, 0.30)"
                );

                gradient.addColorStop(
                    1,
                    "rgba(214, 177, 106, 0.01)"
                );

                return gradient;
            },

            fill: true,
            tension: 0.4,

            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: "#d6b16a",
            pointBorderColor: "#111111",
            pointBorderWidth: 2,

            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: "#d6b16a",
            pointHoverBorderWidth: 3
        }]
    },

    options: {

        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index"
        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {
                backgroundColor: "#1b1b1b",
                titleColor: "#d6b16a",
                bodyColor: "#ffffff",
                borderColor: "#55452a",
                borderWidth: 1,
                padding: 14,
                displayColors: false,

                callbacks: {
                    label: function(context) {
                        return "Penjualan: Rp " +
                            Number(context.raw).toLocaleString("id-ID");
                    }
                }
            }
        },

        scales: {

            x: {
                grid: {
                    display: false
                },

                ticks: {
                    color: "#999999",
                    font: {
                        size: 11
                    }
                },

                border: {
                    display: false
                }
            },

            y: {
                beginAtZero: true,

                grid: {
                    color: "rgba(255,255,255,0.06)",
                    drawBorder: false
                },

                ticks: {
                    color: "#999999",

                    callback: function(value) {
                        return "Rp " +
                            Number(value).toLocaleString("id-ID");
                    },

                    font: {
                        size: 11
                    }
                },

                border: {
                    display: false
                }
            }

        }

    }

});

}

// UPDATE ANALISIS KEUNTUNGAN
renderDashboardProfit();

}

// ======================================
// ANALISIS KEUNTUNGAN BISNIS DASHBOARD
// ======================================

function renderDashboardProfit() {

    const transactions = JSON.parse(
        localStorage.getItem("kopipos_transactions") || "[]"
    );

    const hppData = JSON.parse(
        localStorage.getItem("kopipos_hpp") || "[]"
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // TRANSAKSI BULAN INI
    const monthlyTransactions = transactions.filter(transaction => {

        const date = new Date(transaction.date);

        return (
            !isNaN(date.getTime()) &&
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        );

    });

    let totalOmzet = 0;
    let totalBiayaHPP = 0;
    let omzetDenganHPP = 0;

    const menuTidakLengkap = new Set();
    const profitPerMenu = {};

    // HITUNG PENJUALAN DAN HPP PRODUK TERJUAL
    monthlyTransactions.forEach(transaction => {

        (transaction.items || []).forEach(item => {

            const namaMenu = String(item.name || "").trim();

            const qty = Number(item.qty) || 0;

            const subtotal = Number(item.subtotal) ||
                (Number(item.price) || 0) * qty;

            if (!namaMenu || qty <= 0) return;

            totalOmzet += subtotal;

            // CARI HPP BERDASARKAN NAMA MENU
            const dataHPP = hppData.find(hpp => {

                return String(hpp.namaMenu || "")
                    .trim()
                    .toLowerCase() === namaMenu.toLowerCase();

            });

            // MENU BELUM MEMILIKI RESEP
            if (
                !dataHPP ||
                !dataHPP.rincian ||
                dataHPP.rincian.length === 0
            ) {

                menuTidakLengkap.add(namaMenu);

                return;
            }

            const hppSatuan = Number(dataHPP.totalHPP) || 0;

            const biayaHPP = hppSatuan * qty;

            omzetDenganHPP += subtotal;
            totalBiayaHPP += biayaHPP;

            const labaMenu = subtotal - biayaHPP;

            if (!profitPerMenu[namaMenu]) {
                profitPerMenu[namaMenu] = 0;
            }

            profitPerMenu[namaMenu] += labaMenu;

        });

    });

    // LABA HANYA DARI MENU YANG SUDAH MEMILIKI HPP
    // LABA KOTOR
const labaKotor = omzetDenganHPP - totalBiayaHPP;

const margin = omzetDenganHPP > 0
    ? (labaKotor / omzetDenganHPP) * 100
    : 0;


// ======================================
// PERHITUNGAN PENGELUARAN OPERASIONAL
// ======================================

const pengeluaranData = JSON.parse(
    localStorage.getItem("kopipos_pengeluaran") || "[]"
);

// Ambil pengeluaran pada bulan dan tahun yang sedang dipilih
const pengeluaranBulanan = pengeluaranData.filter(item => {

    const tanggal = new Date(item.tanggal);

    return !isNaN(tanggal.getTime()) &&
        tanggal.getMonth() === currentMonth &&
        tanggal.getFullYear() === currentYear;

});

// Total pengeluaran operasional
const totalPengeluaran = pengeluaranBulanan.reduce(
    (total, item) => total + (Number(item.nominal) || 0),
    0
);

// LABA BERSIH
const labaBersih = labaKotor - totalPengeluaran;

// MARGIN LABA BERSIH
const marginBersih = omzetDenganHPP > 0
    ? (labaBersih / omzetDenganHPP) * 100
    : 0;

    // MENU PALING MENGUNTUNGKAN
    const menuTerbaik = Object.entries(profitPerMenu)
        .filter(item => item[1] > 0)
        .sort((a, b) => b[1] - a[1])[0];

    // FORMAT RUPIAH
    const formatProfitRupiah = angka => {

        return "Rp" + Math.round(angka).toLocaleString("id-ID");

    };

    // TAMPILKAN HASIL
    const omzetElement = document.getElementById(
        "dashboard-profit-omzet"
    );

    const hppElement = document.getElementById(
        "dashboard-profit-hpp"
    );

    const labaElement = document.getElementById(
        "dashboard-profit-laba"
    );

    const marginElement = document.getElementById(
        "dashboard-profit-margin"
    );

    // ELEMENT PENGELUARAN OPERASIONAL
    const pengeluaranElement = document.getElementById(
        "dashboard-profit-pengeluaran"
    );

    // ELEMENT LABA BERSIH
    const labaBersihElement = document.getElementById(
        "dashboard-profit-laba-bersih"
    );

    // ELEMENT MARGIN LABA BERSIH
    const marginBersihElement = document.getElementById(
        "dashboard-profit-margin-bersih"
    );

    const menuElement = document.getElementById(
        "dashboard-profit-best-menu"
    );

    const unavailableElement = document.getElementById(
        "dashboard-profit-unavailable"
    );

    if (omzetElement) {
        omzetElement.textContent = formatProfitRupiah(totalOmzet);
    }

    if (hppElement) {
        hppElement.textContent = formatProfitRupiah(totalBiayaHPP);
    }

    if (labaElement) {
        labaElement.textContent = formatProfitRupiah(labaKotor);
    }

    if (marginElement) {
        marginElement.textContent = margin.toFixed(1) + "%";
    }

    // TAMPILKAN TOTAL PENGELUARAN
    if (pengeluaranElement) {
        pengeluaranElement.textContent =
            formatProfitRupiah(totalPengeluaran);
    }

    // TAMPILKAN LABA BERSIH
    if (labaBersihElement) {
        labaBersihElement.textContent =
            formatProfitRupiah(labaBersih);
    }

    // ======================================
    // STATUS KARTU LABA BERSIH
    // ======================================

    const kartuLabaBersih = labaBersihElement.closest(".profit-card");

    if (kartuLabaBersih) {

        kartuLabaBersih.classList.remove("is-profit", "is-loss");

        if (labaBersih < 0) {
            kartuLabaBersih.classList.add("is-loss");
        } else {
            kartuLabaBersih.classList.add("is-profit");
        }

    }

        // TAMPILKAN MARGIN LABA BERSIH
        if (marginBersihElement) {
            marginBersihElement.textContent =
                marginBersih.toFixed(1) + "%";
        }

        if (menuElement) {
        menuElement.textContent = menuTerbaik
            ? menuTerbaik[0]
            : "Belum ada menu untung";
        }

        if (unavailableElement) {
            unavailableElement.textContent =
                menuTidakLengkap.size + " menu";
        }

        // ======================================
    // GRAFIK TREN KEUNTUNGAN BULANAN
    // ======================================

    const chartCanvas = document.getElementById(
        "dashboard-profit-chart"
    );

    if (chartCanvas && typeof Chart !== "undefined") {

    const labels = [
        "Jan", "Feb", "Mar", "Apr",
        "Mei", "Jun", "Jul", "Agu",
        "Sep", "Okt", "Nov", "Des"
    ];

    const omzetBulanan = Array(12).fill(0);
    const hppBulanan = Array(12).fill(0);
    const labaBulanan = Array(12).fill(0);

    // DATA PENGELUARAN DAN LABA BERSIH
    const pengeluaranBulanan = Array(12).fill(0);
    const labaBersihBulanan = Array(12).fill(0);
    const pengeluaranData = JSON.parse(
    localStorage.getItem("kopipos_pengeluaran") || "[]"
    );

    const tahunDipilih = Number(
        document.getElementById("filter-tahun-profit")?.value ||
        new Date().getFullYear()
    );

    const filterTahun = document.getElementById("filter-tahun-profit");

const tahunSekarang = new Date().getFullYear();

if (filterTahun) {
    const tahunTersedia = new Set([tahunSekarang]);

    transactions.forEach(transaction => {
        const tanggal = new Date(transaction.date);

        if (!isNaN(tanggal.getTime())) {
            tahunTersedia.add(tanggal.getFullYear());
        }
    });

    const tahunDipilih = filterTahun.value || String(tahunSekarang);

    filterTahun.innerHTML = [...tahunTersedia]
        .sort((a, b) => b - a)
        .map(tahun => `
            <option value="${tahun}">${tahun}</option>
        `).join("");

    filterTahun.value = tahunTersedia.has(Number(tahunDipilih))
        ? tahunDipilih
        : String(tahunSekarang);

        filterTahun.onchange = function () {
            renderDashboardProfit();
        };
}

    transactions.forEach(transaction => {

        const tanggal = new Date(transaction.date);

        const tahunDipilih = Number(
            document.getElementById("filter-tahun-profit")?.value ||
            tahunSekarang
        );

        if (
            isNaN(tanggal.getTime()) ||
            tanggal.getFullYear() !== tahunDipilih
        ) return;

        const bulan = tanggal.getMonth();

        (transaction.items || []).forEach(item => {

            const namaMenu = String(item.name || "")
                .trim()
                .toLowerCase();

            const qty = Number(item.qty) || 0;

            const subtotal = Number(item.subtotal) ||
                (Number(item.price) || 0) * qty;

            const dataHPP = hppData.find(hpp =>
                String(hpp.namaMenu || "")
                    .trim()
                    .toLowerCase() === namaMenu
            );

            if (
                !dataHPP ||
                !dataHPP.rincian ||
                dataHPP.rincian.length === 0 ||
                qty <= 0
            ) return;

            const biaya = (Number(dataHPP.totalHPP) || 0) * qty;

            omzetBulanan[bulan] += subtotal;
            hppBulanan[bulan] += biaya;
            labaBulanan[bulan] += subtotal - biaya;

        });

    });

// ======================================
// HITUNG PENGELUARAN OPERASIONAL BULANAN
// ======================================

pengeluaranData.forEach(item => {

    const tanggal = new Date(item.tanggal);

    if (
        isNaN(tanggal.getTime()) ||
        tanggal.getFullYear() !== tahunDipilih
    ) return;

    const bulan = tanggal.getMonth();

    pengeluaranBulanan[bulan] +=
        Number(item.nominal) || 0;

});

// ======================================
// HITUNG LABA BERSIH BULANAN
// ======================================

for (let i = 0; i < 12; i++) {

    labaBersihBulanan[i] =
        labaBulanan[i] - pengeluaranBulanan[i];

}

// ======================================
// PERBANDINGAN KEUNTUNGAN ANTARBULAN
// ======================================

const bulanSekarang = new Date().getMonth();
const bulanSebelumnya = bulanSekarang - 1;

const formatPerbandingan = angka =>
    "Rp" + Math.round(angka).toLocaleString("id-ID");

// Cari bulan dengan laba tertinggi
const labaTertinggi = Math.max(...labaBulanan);
const indexLabaTertinggi = labaBulanan.indexOf(labaTertinggi);

const namaBulan = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
];

const bulanTerbaik = document.getElementById(
    "profit-bulan-tertinggi"
);

const nilaiTerbaik = document.getElementById(
    "profit-nilai-tertinggi"
);

if (bulanTerbaik) {
    bulanTerbaik.textContent = labaTertinggi > 0
        ? namaBulan[indexLabaTertinggi]
        : "Belum tersedia";
}

if (nilaiTerbaik) {
    nilaiTerbaik.textContent = formatPerbandingan(labaTertinggi);
}

// Laba bulan ini
const labaBulanIni = labaBulanan[bulanSekarang];

// ======================================
// TARGET KEUNTUNGAN BULANAN
// ======================================

const filterTahunTarget = document.getElementById(
    "filter-tahun-profit"
);

const tahunTarget = Number(
    filterTahunTarget?.value || new Date().getFullYear()
);

const bulanTarget = bulanSekarang + 1;

const targetKey = `kopipos_target_profit_${tahunTarget}_${bulanTarget}`;

const inputTarget = document.getElementById("input-target-profit");
const tombolTarget = document.getElementById("btn-simpan-target-profit");

const targetTersimpan = Number(
    localStorage.getItem(targetKey)
) || 0;

if (inputTarget) {
    inputTarget.value = targetTersimpan || "";
}

function updateTampilanTarget() {

    const target = Number(localStorage.getItem(targetKey)) || 0;

    const tercapai = labaBulanIni;

    const persen = target > 0
        ? (tercapai / target) * 100
        : 0;

    const sisa = Math.max(target - tercapai, 0);

    // STATUS PENCAPAIAN TARGET

const statusTarget = document.getElementById(
    "profit-target-status"
);

if (statusTarget) {

    statusTarget.className = "target-status";

    if (target <= 0) {
        statusTarget.textContent = "Belum ada target";

    } else if (persen >= 100) {
        statusTarget.textContent = "Target Tercapai";
        statusTarget.classList.add("tercapai");

    } else if (persen >= 75) {
        statusTarget.textContent = "Hampir Tercapai";
        statusTarget.classList.add("hampir-tercapai");

    } else {
        statusTarget.textContent = "Belum Tercapai";
        statusTarget.classList.add("belum-tercapai");
    }
}

    const formatRupiah = angka =>
        "Rp" + Math.round(angka).toLocaleString("id-ID");

    document.getElementById("profit-target-persen").textContent =
        target > 0 ? Math.max(0, persen).toFixed(1) + "%" : "0%";

    document.getElementById("profit-target-tercapai").textContent =
        formatRupiah(tercapai);

    document.getElementById("profit-target-sisa").textContent =
        formatRupiah(sisa);

    document.getElementById("profit-target-fill").style.width =
        Math.min(Math.max(persen, 0), 100) + "%";
}

if (tombolTarget) {
    tombolTarget.onclick = function () {

        const nilaiTarget = Number(inputTarget.value);

        if (!nilaiTarget || nilaiTarget <= 0) {
            alert("Masukkan target keuntungan yang valid.");
            return;
        }

        localStorage.setItem(targetKey, nilaiTarget);

        updateTampilanTarget();

        alert("Target keuntungan berhasil disimpan!");
    };
}

updateTampilanTarget();

const elemenLabaBulanIni = document.getElementById(
    "profit-laba-bulan-ini"
);

if (elemenLabaBulanIni) {
    elemenLabaBulanIni.textContent =
        formatPerbandingan(labaBulanIni);
}

// Perbandingan dengan bulan sebelumnya
const elemenPerubahan = document.getElementById(
    "profit-perubahan-bulanan"
);

const elemenKeterangan = document.getElementById(
    "profit-keterangan-perubahan"
);

if (elemenPerubahan && elemenKeterangan) {

    if (bulanSebelumnya < 0) {
        elemenPerubahan.textContent = "-";
        elemenKeterangan.textContent =
            "Data bulan sebelumnya belum tersedia";

    } else {
        const labaBulanLalu = labaBulanan[bulanSebelumnya];

        if (labaBulanLalu > 0) {

            const perubahan =
                ((labaBulanIni - labaBulanLalu) / labaBulanLalu) * 100;

            elemenPerubahan.textContent =
                (perubahan > 0 ? "+" : "") +
                perubahan.toFixed(1) + "%";

            elemenPerubahan.className =
                perubahan >= 0 ? "positif" : "negatif";

            elemenKeterangan.textContent =
                perubahan >= 0
                    ? "Naik dibanding bulan lalu"
                    : "Turun dibanding bulan lalu";

        } else {
            elemenPerubahan.textContent = "-";
            elemenKeterangan.textContent =
                "Belum ada laba bulan sebelumnya";
        }
    }
}

    if (window.dashboardProfitChart) {
        window.dashboardProfitChart.destroy();
    }

    window.dashboardProfitChart = new Chart(chartCanvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [

                        {
                            label: "Omzet Menu dengan HPP",
                            data: omzetBulanan,
                            borderColor: "#d6a75c",
                            backgroundColor: "rgba(214,167,92,0.10)",
                            borderWidth: 3,
                            tension: 0.4
                        },

                        {
                            label: "Biaya HPP",
                            data: hppBulanan,
                            borderColor: "#e58b8b",
                            backgroundColor: "rgba(229,139,139,0.10)",
                            borderWidth: 3,
                            tension: 0.4
                        },

                        {
                            label: "Laba Kotor",
                            data: labaBulanan,
                            borderColor: "#6fd08c",
                            backgroundColor: "rgba(111,208,140,0.10)",
                            borderWidth: 3,
                            tension: 0.4
                        },

                        {
                            label: "Pengeluaran Operasional",
                            data: pengeluaranBulanan,
                            borderColor: "#ff8c42",
                            backgroundColor: "rgba(255,140,66,0.10)",
                            borderWidth: 3,
                            tension: 0.4
                        },

                        {
                            label: "Laba Bersih",
                            data: labaBersihBulanan,
                            borderColor: "#6daaff",
                            backgroundColor: "rgba(109,170,255,0.10)",
                            borderWidth: 3,
                            tension: 0.4
                        }

                    ]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    labels: {
                        color: "#cccccc"
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ": Rp " +
                                Number(context.raw).toLocaleString("id-ID");
                        }
                    }
                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#aaaaaa"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                },

                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#aaaaaa",
                        callback: function(value) {
                            return "Rp " +
                                Number(value).toLocaleString("id-ID");
                        }
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                }

            }

        }

    });

}

}

// ======================================
// KOPIPOS - LOAD TRANSAKSI DARI SPREADSHEET
// ======================================

async function loadTransactionsFromAPI() {

    try {

        console.log("Mengambil riwayat transaksi...");

        const response = await fetch(
            `${API_URL}?action=getTransactions`
        );

        if (!response.ok) {
            throw new Error("Gagal menghubungi API transaksi.");
        }

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(
                result.message || "Gagal mengambil transaksi."
            );
        }

        // Simpan data terbaru ke localStorage
        localStorage.setItem(
            "kopipos_transactions",
            JSON.stringify(result.data)
        );

        // Status koneksi database
        const databaseStatus = document.getElementById("database-status");

        if (databaseStatus) {
             databaseStatus.textContent = "Terhubung";
             databaseStatus.style.color = "#6fd08c";
        }

        // Perbarui Dashboard
        if (typeof renderDashboard === "function") {
          renderDashboard();
        }

        // Perbarui tampilan riwayat
        if (typeof renderHistoryStatistics === "function") {
            renderHistoryStatistics();
        }

        if (typeof renderTransactionHistory === "function") {
            renderTransactionHistory();
        }

        // Perbarui tampilan laporan
        if (typeof renderSalesReport === "function") {
            renderSalesReport();
        }

        console.log(
            "Riwayat transaksi berhasil dimuat:",
            result.data
        );

    } catch (error) {

        const databaseStatus = document.getElementById("database-status");

        if (databaseStatus) {
            databaseStatus.textContent = "Tidak Terhubung";
            databaseStatus.style.color = "#e58b8b";
            }

        console.error(
            "Gagal memuat transaksi dari Spreadsheet:",
            error
        );

    }

}


// Muat transaksi saat website dibuka
loadTransactionsFromAPI();

// Muat pengeluaran saat website dibuka
loadPengeluaran();


// Perbarui data setiap 30 detik
setInterval(function() {

    loadTransactionsFromAPI();

    loadPengeluaran();

}, 30000);

// ======================================
// KOPIPOS - PENGATURAN KEDAI
// ======================================

// Mengambil pengaturan dari Local Storage
function loadStoreSettings() {

    const settings = JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    );

    document.getElementById("store-name").value =
        settings.storeName || "";

    document.getElementById("store-address").value =
        settings.storeAddress || "";

    document.getElementById("store-phone").value =
        settings.storePhone || "";

    document.getElementById("cashier-name").value =
        settings.cashierName || "Admin";

    document.getElementById("receipt-message").value =
        settings.receiptMessage || "Terima kasih telah berkunjung!";
}


// Menyimpan pengaturan
document.getElementById("settings-form").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const settings = {

            storeName: document.getElementById("store-name").value,

            storeAddress: document.getElementById("store-address").value,

            storePhone: document.getElementById("store-phone").value,

            cashierName: document.getElementById("cashier-name").value,

            receiptMessage: document.getElementById("receipt-message").value

        };

        localStorage.setItem(
            "kopipos_settings",
            JSON.stringify(settings)
        );

        alert("Pengaturan kedai berhasil disimpan!");

    }
);


// Memuat pengaturan saat website dibuka
loadStoreSettings();

// ======================================
// KOPIPOS - UPLOAD LOGO KEDAI
// ======================================

function loadStoreLogo() {

    const savedLogo = localStorage.getItem("kopipos_logo");

    const preview = document.getElementById("logo-preview");

    if (savedLogo && preview) {

    preview.src = savedLogo;
    preview.style.display = "block";

    document.getElementById("remove-logo-button").style.display = "inline-block";

}

}


// Ketika pengguna memilih logo
document.getElementById("store-logo").addEventListener(
    "change",
    function(event) {

        const file = event.target.files[0];

        if (!file) return;

        // Validasi ukuran file maksimal 5 MB
        if (file.size > 5 * 1024 * 1024) {

            alert("Ukuran logo maksimal 5 MB!");

            event.target.value = "";

            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {

            const image = new Image();

            image.onload = function() {

                // Kompres dan ubah ukuran logo
                const canvas = document.createElement("canvas");

                const maxSize = 400;

                let width = image.width;
                let height = image.height;

                if (width > height && width > maxSize) {

                    height = Math.round(height * maxSize / width);
                    width = maxSize;

                } else if (height > maxSize) {

                    width = Math.round(width * maxSize / height);
                    height = maxSize;

                }

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                context.drawImage(image, 0, 0, width, height);

                const compressedLogo = canvas.toDataURL(
                    "image/jpeg",
                    0.8
                );

                try {

                    localStorage.setItem(
                        "kopipos_logo",
                        compressedLogo
                    );

                    const preview = document.getElementById("logo-preview");

                    preview.src = compressedLogo;
                    preview.style.display = "block";
                    document.getElementById("remove-logo-button").style.display = "inline-block";

                    alert("Logo kedai berhasil disimpan!");

                } catch (error) {

                    alert("Logo gagal disimpan. Ruang penyimpanan browser mungkin penuh.");

                }

            };

            image.src = e.target.result;

        };

        reader.readAsDataURL(file);

    }
);


// Tampilkan logo yang sudah tersimpan
loadStoreLogo();

// ======================================
// KOPIPOS - HAPUS LOGO KEDAI
// ======================================

const removeLogoButton = document.getElementById("remove-logo-button");

if (removeLogoButton) {

    removeLogoButton.addEventListener("click", function() {

        const confirmation = confirm(
            "Apakah Anda yakin ingin menghapus logo kedai?"
        );

        if (!confirmation) return;

        // Hapus logo dari Local Storage
        localStorage.removeItem("kopipos_logo");

        // Sembunyikan preview
        const preview = document.getElementById("logo-preview");

        preview.src = "";
        preview.style.display = "none";

        // Kosongkan input file
        document.getElementById("store-logo").value = "";

        // Sembunyikan tombol hapus
        removeLogoButton.style.display = "none";

        alert("Logo kedai berhasil dihapus!");

    });

}

// ======================================
// KOPIPOS - RESET PENGATURAN
// ======================================

const resetSettingsButton = document.getElementById(
    "reset-settings-button"
);

if (resetSettingsButton) {

    resetSettingsButton.addEventListener("click", function() {

        const confirmation = confirm(
            "Apakah Anda yakin ingin mengembalikan pengaturan kedai ke kondisi awal?"
        );

        if (!confirmation) return;

        // Hapus pengaturan kedai
        localStorage.removeItem("kopipos_settings");

        // Muat kembali nilai default
        loadStoreSettings();

        alert("Pengaturan kedai berhasil direset!");

    });

}

// ======================================
// KOPIPOS - EXPORT LAPORAN EXCEL
// ======================================

async function exportSalesReportExcel() {

    if (typeof ExcelJS === "undefined") {
        alert("Library ExcelJS belum berhasil dimuat.");
        return;
    }

    const transactions = getFilteredReportTransactions();

    if (transactions.length === 0) {
        alert("Tidak ada transaksi untuk diekspor.");
        return;
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "KopiPOS";
    workbook.subject = "Laporan Penjualan Kedai Kopi";
    workbook.title = "Laporan Penjualan KopiPOS";

    const worksheet = workbook.addWorksheet("Laporan Penjualan", {
        views: [
            { state: "frozen", ySplit: 8 }
        ]
    });

    // WARNA TEMA
    const black = "111111";
    const dark = "1C1C1C";
    const gold = "D6B16A";
    const white = "FFFFFF";
    const gray = "E5E5E5";

    // LEBAR KOLOM
    worksheet.columns = [
        { width: 8 },
        { width: 25 },
        { width: 23 },
        { width: 20 },
        { width: 14 },
        { width: 22 },
        { width: 20 },
        { width: 20 }
    ];

    // JUDUL LAPORAN
    worksheet.mergeCells("A1:H2");

    const title = worksheet.getCell("A1");

    title.value = "KOPIPOS | LAPORAN PENJUALAN";

    title.font = {
        name: "Arial",
        size: 18,
        bold: true,
        color: { argb: gold }
    };

    title.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: black }
    };

    title.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 18;

    // INFORMASI LAPORAN
    const settings = JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    );

    worksheet.mergeCells("A3:H3");

    worksheet.getCell("A3").value =
        settings.storeName || "Laporan Penjualan Kedai Kopi";

    worksheet.getCell("A3").font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: black }
    };

    worksheet.mergeCells("A4:H4");

    worksheet.getCell("A4").value =
        "Periode: " +
        document.getElementById("report-period")
            .selectedOptions[0].text;

    worksheet.getCell("A4").font = {
        name: "Arial",
        size: 10,
        color: { argb: "666666" }
    };

    worksheet.mergeCells("A5:H5");

    worksheet.getCell("A5").value =
        "Tanggal Export: " +
        new Date().toLocaleString("id-ID");

    worksheet.getCell("A5").font = {
        name: "Arial",
        size: 10,
        color: { argb: "666666" }
    };

    // RINGKASAN
    const totalSales = transactions.reduce(
        (total, item) => total + Number(item.total || 0),
        0
    );

    worksheet.mergeCells("A6:B6");
    worksheet.mergeCells("C6:D6");
    worksheet.mergeCells("E6:F6");
    worksheet.mergeCells("G6:H6");

    worksheet.getCell("A6").value =
        "TOTAL OMZET: Rp " +
        totalSales.toLocaleString("id-ID");

    worksheet.getCell("C6").value =
        "TRANSAKSI: " + transactions.length;

    worksheet.getCell("E6").value =
        "TOTAL ITEM: " +
        transactions.reduce((total, item) => {
            return total + (item.items || []).reduce(
                (sum, product) => sum + Number(product.qty || 0),
                0
            );
        }, 0);

    // MENENTUKAN NAMA KASIR BERDASARKAN TRANSAKSI
const cashierNames = [
    ...new Set(
        transactions.map(transaction =>
            String(transaction.cashier || "Admin").trim()
        )
    )
];

let cashierSummary = "Admin";

if (cashierNames.length === 1) {
    cashierSummary = cashierNames[0];
} else if (cashierNames.length > 1) {
    cashierSummary = "Semua Kasir";
}

worksheet.getCell("G6").value =
    "KASIR: " + cashierSummary;

    ["A6", "C6", "E6", "G6"].forEach(cell => {

        const target = worksheet.getCell(cell);

        target.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: gold }
        };

        target.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: dark }
        };

        target.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

    });

    worksheet.getRow(6).height = 28;

    // HEADER TABEL
    const headers = [
        "No",
        "ID Transaksi",
        "Tanggal",
        "Nama Kasir",
        "Total Item",
        "Total Pembayaran",
        "Uang Diterima",
        "Kembalian"
    ];

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(headers);

    headerRow.height = 30;

    headerRow.eachCell(cell => {

        cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: gold }
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: black }
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        cell.border = {
            bottom: {
                style: "medium",
                color: { argb: gold }
            }
        };

    });

    // DATA TRANSAKSI
    transactions.forEach((transaction, index) => {

        const totalItems = (transaction.items || []).reduce(
            (total, item) => total + Number(item.qty || 0),
            0
        );

        const row = worksheet.addRow([

            index + 1,
            transaction.id || "-",
            formatTransactionDate(transaction.date),
            transaction.cashier || "Admin",
            totalItems,
            Number(transaction.total || 0),
            Number(transaction.payment || 0),
            Number(transaction.change || 0)

        ]);

        row.height = 24;

        row.eachCell(cell => {

            cell.font = {
                name: "Arial",
                size: 10,
                color: { argb: black }
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };

            cell.border = {
                bottom: {
                    style: "thin",
                    color: { argb: gray }
                }
            };

        });

        if (index % 2 === 1) {

            row.eachCell(cell => {

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "F5F2EB" }
                };

            });

        }

        [6, 7, 8].forEach(column => {

            row.getCell(column).numFmt =
                '"Rp" #,##0';

            row.getCell(column).alignment = {
                horizontal: "right",
                vertical: "middle"
            };

        });

    });

    // PENGATURAN CETAK
    worksheet.pageSetup = {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
    };

    worksheet.pageSetup.margins = {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2
    };

    // DOWNLOAD FILE
    const period = document.getElementById("report-period").value;

    const periodNames = {
        hari: "Hari_Ini",
        minggu: "7_Hari_Terakhir",
        bulan: "Bulan_Ini",
        semua: "Semua_Transaksi"
    };

    const fileName =
        "KopiPOS_Laporan_" +
        (periodNames[period] || "Penjualan") +
        ".xlsx";

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob(
        [buffer],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("Laporan Excel profesional berhasil dibuat!");

}

// ======================================
// KOPIPOS - TOMBOL EXPORT EXCEL
// ======================================

const exportReportButton = document.getElementById(
    "export-report-excel"
);

if (exportReportButton) {

    exportReportButton.addEventListener("click", function() {

        exportSalesReportExcel();

    });

}

// ======================================
// MANAJEMEN STOK BAHAN BAKU
// ======================================

async function loadBahanBaku() {

    const tbody = document.getElementById("tabel-bahan-baku");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="8">Memuat data bahan baku...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}?action=getBahanBaku`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data bahan baku.");
        }

        const data = result.data;

        // Menampilkan notifikasi stok menipis
tampilkanNotifikasiStok(data);

        // Mengisi pilihan bahan baku pada modal
const selectBahan = document.getElementById("stok-bahan");

if (selectBahan) {

    selectBahan.innerHTML = `
        <option value="">Pilih bahan baku</option>
    `;

    data.forEach(item => {

        selectBahan.innerHTML += `
            <option value="${item.id}">
                ${item.name} (${item.unit})
            </option>
        `;

    });

}

        document.getElementById("total-bahan").textContent =
            data.length;

        document.getElementById("stok-tersedia").textContent =
            data.filter(item =>
                item.currentStock > item.minimumStock
            ).length;

        document.getElementById("stok-menipis").textContent =
            data.filter(item =>
                item.currentStock <= item.minimumStock
            ).length;

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8">Belum ada data bahan baku.</td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = data.map(item => {

            const stokMenipis =
                item.currentStock <= item.minimumStock;

            return `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.unit}</td>
                    <td>${Number(item.initialStock).toLocaleString("id-ID")}</td>
                    <td>${Number(item.currentStock).toLocaleString("id-ID")}</td>
                    <td>${Number(item.minimumStock).toLocaleString("id-ID")}</td>
                    <td>Rp ${Number(item.price).toLocaleString("id-ID")}</td>
                    <td>
    <span class="${stokMenipis ? 'status-warning' : 'status-success'}">
        ${stokMenipis ? 'Stok Menipis' : 'Tersedia'}
    </span>
</td>

<td>
    <div class="action-buttons">
        <button
            class="btn-edit"
            onclick="editBahan('${item.id}')">
            Edit
        </button>

        <button
            class="btn-delete"
            onclick="hapusBahan('${item.id}')">
            Hapus
        </button>
    </div>
</td>
                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Error stok:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="8">Gagal memuat data bahan baku.</td>
            </tr>
        `;

    }

}

function tampilkanNotifikasiStok(data) {

    const container = document.getElementById("daftar-notifikasi-stok");

    if (!container) return;

    const stokMenipis = data.filter(item =>
        Number(item.currentStock) <= Number(item.minimumStock)
    );

    if (stokMenipis.length === 0) {

        container.innerHTML = `
            <div class="notifikasi-aman">
                <i class="fas fa-circle-check"></i>
                Semua stok bahan baku dalam kondisi aman.
            </div>
        `;

        return;
    }

    container.innerHTML = stokMenipis.map(item => `
        <div class="notifikasi-item">

            <div>
                <strong>${item.name}</strong>
                <br>
                <span>
                    Stok tersisa: ${item.currentStock} ${item.unit}
                </span>
            </div>

            <span>
                Minimum: ${item.minimumStock} ${item.unit}
            </span>

        </div>
    `).join("");
}

// ======================================
// MODAL KELOLA STOK
// ======================================

function openModalStok() {

    const modal = document.getElementById("modal-stok");

    if (!modal) return;

    modal.style.display = "flex";

    // Perbarui pilihan bahan baku
    loadBahanBaku();

}


function closeModalStok() {

    const modal = document.getElementById("modal-stok");

    if (!modal) return;

    modal.style.display = "none";

}

// ======================================
// SIMPAN PERUBAHAN STOK
// ======================================

document.getElementById("form-stok")?.addEventListener("submit", async function(e) {

    e.preventDefault();

    const materialId = document.getElementById("stok-bahan").value;
    const type = document.getElementById("stok-jenis").value;
    const quantity = Number(document.getElementById("stok-jumlah").value);
    const notes = document.getElementById("stok-keterangan").value;

    if (!materialId || !type || !Number.isFinite(quantity) || quantity <= 0) {
        alert("Mohon lengkapi data stok dengan benar.");
        return;
    }

    const button = this.querySelector('button[type="submit"]');

    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "updateStock",

                data: {
                    materialId: materialId,
                    type: type,
                    quantity: quantity,
                    notes: notes,
                    user: "Admin"
                }

            })

        });

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message || "Gagal memperbarui stok.");
        }

        alert(result.message);

        document.getElementById("form-stok").reset();

        closeModalStok();

        await loadBahanBaku();

    } catch (error) {

        console.error("Simpan stok:", error);

        alert(error.message);

    } finally {

        button.disabled = false;
        button.textContent = "Simpan Perubahan";

    }

});

// ======================================
// RIWAYAT STOK
// ======================================

async function loadStockHistory() {

    const tbody = document.getElementById("tabel-riwayat-stok");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6">Memuat riwayat stok...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}?action=getStockHistory`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil riwayat stok.");
        }

        const history = result.data;

        if (history.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">Belum ada riwayat stok.</td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = history.map(item => {

            const isMasuk = item.type.toUpperCase() === "MASUK";

            return `
                <tr>

                    <td>${item.id}</td>

                    <td>
                        <span class="${isMasuk ? 'status-success' : 'status-warning'}">
                            ${isMasuk ? 'Stok Masuk' : 'Stok Keluar'}
                        </span>
                    </td>

                    <td>${item.materialName}</td>

                    <td>
                        ${Number(item.quantity).toLocaleString("id-ID")}
                    </td>

                    <td>
                        ${Number(item.previousStock).toLocaleString("id-ID")}
                    </td>

                    <td>
                        ${Number(item.currentStock).toLocaleString("id-ID")}
                    </td>

                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Riwayat stok:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6">Gagal memuat riwayat stok.</td>
            </tr>
        `;

    }

}

// ======================================
// MODAL TAMBAH / EDIT BAHAN BAKU
// ======================================

function openModalBahan() {

    document.getElementById("form-bahan").reset();

    document.getElementById("bahan-id").value = "";

    document.getElementById("judul-modal-bahan").textContent =
        "Tambah Bahan Baku";

    document.getElementById("modal-bahan").style.display = "flex";

}


function closeModalBahan() {

    document.getElementById("modal-bahan").style.display = "none";

}

// ======================================
// EDIT BAHAN BAKU
// ======================================

async function editBahan(id) {

    try {

        const response = await fetch(
            `${API_URL}?action=getBahanBaku`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data bahan baku.");
        }

        const bahan = result.data.find(
            item => String(item.id) === String(id)
        );

        if (!bahan) {
            alert("Data bahan baku tidak ditemukan.");
            return;
        }

        // Mengisi data ke modal
        document.getElementById("bahan-id").value = bahan.id;

        document.getElementById("bahan-nama").value =
            bahan.name;

        document.getElementById("bahan-satuan").value =
            bahan.unit;

        document.getElementById("bahan-stok-awal").value =
            bahan.initialStock;

        document.getElementById("bahan-stok-minimum").value =
            bahan.minimumStock;

        document.getElementById("bahan-harga").value =
            bahan.price;

        // Mengubah judul modal
        document.getElementById("judul-modal-bahan").textContent =
            "Edit Bahan Baku";

        // Menampilkan modal
        document.getElementById("modal-bahan").style.display =
            "flex";

    } catch (error) {

        console.error("Edit bahan:", error);

        alert(error.message);

    }

}

// ======================================
// HAPUS BAHAN BAKU
// ======================================

async function hapusBahan(id) {

    const konfirmasi = confirm(
        "Apakah Anda yakin ingin menghapus bahan baku ini?"
    );

    if (!konfirmasi) return;

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: "deleteBahanBaku",
                data: {
                    id: id
                }
            })

        });

        const result = await response.json();

        console.log("Respons hapus bahan:", result);

        if (
            !response.ok ||
            result.status !== "success"
        ) {
            throw new Error(
                result.message || "Gagal menghapus bahan baku."
            );
        }

        alert(result.message);

        await loadBahanBaku();

    } catch (error) {

        console.error("Hapus bahan:", error);

        alert(error.message);

    }

}

// ======================================
// SIMPAN TAMBAH / EDIT BAHAN BAKU
// ======================================

document.getElementById("form-bahan").addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        const id = document.getElementById("bahan-id").value;

        const data = {
            id: id || "BB" + Date.now(),
            name: document.getElementById("bahan-nama").value.trim(),
            unit: document.getElementById("bahan-satuan").value,
            initialStock: Number(document.getElementById("bahan-stok-awal").value),
            minimumStock: Number(document.getElementById("bahan-stok-minimum").value),
            price: Number(document.getElementById("bahan-harga").value)
        };

        if (!data.name || !data.unit) {
            alert("Lengkapi data bahan baku.");
            return;
        }

        const button = e.submitter;

        try {

            if (button) {
                button.disabled = true;
                button.textContent = "Menyimpan...";
            }

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    action: "saveBahanBaku",
                    data: data
                })

            });

            const result = await response.json();

            console.log("Respons simpan bahan baku:", result);

            if (
                !response.ok ||
                result.status !== "success"
            ) {
                throw new Error(
                    result.message || "Gagal menyimpan bahan baku."
                );
            }

            alert(result.message);

            closeModalBahan();

            await loadBahanBaku();

            document.getElementById("form-bahan").reset();

        } catch (error) {

            console.error("Simpan bahan baku:", error);

            alert(error.message);

        } finally {

            if (button) {
                button.disabled = false;
                button.textContent = "Simpan Bahan";
            }

        }

    }
);

// ======================================
// MODAL MANAJEMEN RESEP
// ======================================

function openModalResep() {

    document.getElementById("form-resep").reset();

    document.getElementById("resep-id").value = "";

    document.getElementById("modal-resep").style.display = "flex";

    loadPilihanResep();

}


function closeModalResep() {

    document.getElementById("modal-resep").style.display = "none";

}

// ======================================
// LOAD PILIHAN MENU DAN BAHAN BAKU
// ======================================

async function loadPilihanResep() {

    try {

        // Ambil data menu
        const responseMenu = await fetch(
            `${API_URL}?action=getMenu`
        );

        const resultMenu = await responseMenu.json();

        // Ambil data bahan baku
        const responseBahan = await fetch(
            `${API_URL}?action=getBahanBaku`
        );

        const resultBahan = await responseBahan.json();

        if (
            resultMenu.status !== "success" ||
            resultBahan.status !== "success"
        ) {
            throw new Error("Gagal mengambil data menu atau bahan baku.");
        }

        const selectMenu = document.getElementById("resep-menu");
        const selectBahan = document.getElementById("resep-bahan");

        // Dropdown menu
        selectMenu.innerHTML = `
            <option value="">Pilih Menu</option>
        `;

        resultMenu.data.forEach(item => {

            selectMenu.innerHTML += `
                <option value="${item.id}">
                    ${item.name}
                </option>
            `;

        });

        // Dropdown bahan baku
        selectBahan.innerHTML = `
            <option value="">Pilih Bahan Baku</option>
        `;

        resultBahan.data.forEach(item => {

            selectBahan.innerHTML += `
                <option value="${item.id}" data-unit="${item.unit}">
                    ${item.name}
                </option>
            `;

        });

    } catch (error) {

        console.error("Load pilihan resep:", error);

        alert(error.message);

    }

}

// ======================================
// SATUAN OTOMATIS RESEP
// ======================================

document.getElementById("resep-bahan").addEventListener(
    "change",
    function() {

        const selectedOption =
            this.options[this.selectedIndex];

        const unit = selectedOption.dataset.unit || "";

        document.getElementById("resep-satuan").value = unit;

    }
);

// ======================================
// SIMPAN RESEP MENU
// ======================================

document.getElementById("form-resep").addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        const data = {

            menuId: document.getElementById("resep-menu").value,

            bahanId: document.getElementById("resep-bahan").value,

            jumlah: Number(
                document.getElementById("resep-jumlah").value
            )

        };

        if (!data.menuId || !data.bahanId || data.jumlah <= 0) {

            alert("Lengkapi data resep terlebih dahulu.");

            return;

        }

        const button = e.submitter;

        try {

            if (button) {
                button.disabled = true;
                button.textContent = "Menyimpan...";
            }

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action: "saveResep",

                    data: data

                })

            });

            const result = await response.json();

            console.log("Respons simpan resep:", result);

            if (
                !response.ok ||
                result.status !== "success"
            ) {

                throw new Error(
                    result.message || "Gagal menyimpan resep."
                );

            }

            alert(result.message);

            closeModalResep();

            await loadResep();

        } catch (error) {

            console.error("Simpan resep:", error);

            alert(error.message);

        } finally {

            if (button) {

                button.disabled = false;

                button.textContent = "Simpan Resep";

            }

        }

    }
);

// ======================================
// LOAD DATA RESEP MENU
// ======================================

async function loadResep() {

    const tbody = document.getElementById("tabel-resep");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7">Memuat data resep...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}?action=getResep`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data resep.");
        }

        const data = result.data || [];

        // UPDATE RINGKASAN RESEP

        const totalResep = document.getElementById("resep-total");
        const totalMenu = document.getElementById("resep-menu-ada");
        const totalBahan = document.getElementById("resep-total-bahan");

        if (totalResep) {
            totalResep.textContent = data.length;
        }

        if (totalMenu) {
            const menuUnik = new Set(data.map(item => item.menuId));
            totalMenu.textContent = menuUnik.size;
        }

        if (totalBahan) {
            totalBahan.textContent = new Set(
                data.map(item => item.bahanId)
            ).size;
        }

        // JIKA DATA KOSONG

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Belum ada data resep.
                    </td>
                </tr>
            `;

            return;
        }

        // FUNGSI MENAMPILKAN DATA

        function tampilkanResep(dataResep) {

    if (dataResep.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Data resep tidak ditemukan.
                </td>
            </tr>
        `;

        return;
    }

    const jumlahBahanPerMenu = {};

    data.forEach(item => {

        jumlahBahanPerMenu[item.menuId] =
            (jumlahBahanPerMenu[item.menuId] || 0) + 1;

    });

    tbody.innerHTML = dataResep.map((item, index) => {

        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    <span class="resep-id">${item.id}</span>
                </td>

                <td>
                    <div class="resep-menu-info">
                        <strong>${item.menuName}</strong>
                        <span>
                            ${jumlahBahanPerMenu[item.menuId] || 0} bahan
                        </span>
                    </div>
                </td>

                <td>${item.bahanName}</td>

                <td>
                    <strong class="resep-quantity">
                        ${Number(item.quantity).toLocaleString("id-ID")}
                    </strong>
                </td>

                <td>
                    <span class="resep-unit">${item.unit}</span>
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn-edit"
                            onclick="editResep('${item.id}')">
                            Edit
                        </button>

                        <button
                            class="btn-delete"
                            onclick="hapusResep('${item.id}')">
                            Hapus
                        </button>

                    </div>
                </td>

            </tr>
        `;

    }).join("");

}

        // TAMPILKAN SEMUA DATA

        tampilkanResep(data);

        // FITUR PENCARIAN

        const searchInput = document.getElementById("search-resep");

        if (searchInput) {

            searchInput.oninput = function () {

                const keyword = this.value.toLowerCase();

                const hasilFilter = data.filter(item => {

                    return (
                        String(item.id).toLowerCase().includes(keyword) ||
                        String(item.menuName).toLowerCase().includes(keyword) ||
                        String(item.bahanName).toLowerCase().includes(keyword)
                    );

                });

                tampilkanResep(hasilFilter);

            };

        }

    } catch (error) {

        console.error("Load resep:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Gagal memuat data resep.
                </td>
            </tr>
        `;

    }

}

async function editResep(id) {
    try {
        const response = await fetch(`${API_URL}?action=getResep`);
        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data resep.");
        }

        const resep = result.data.find(item => item.id === id);

        if (!resep) {
            alert("Data resep tidak ditemukan.");
            return;
        }

        const jumlahBaru = prompt(
            `Edit jumlah bahan\n\nMenu: ${resep.menuName}\nBahan: ${resep.bahanName}\nSatuan: ${resep.unit}`,
            resep.quantity
        );

        if (jumlahBaru === null) return;

        const jumlah = Number(jumlahBaru);

        if (!Number.isFinite(jumlah) || jumlah <= 0) {
            alert("Jumlah harus berupa angka lebih dari 0.");
            return;
        }

        const updateResponse = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "updateResep",
                data: {
                    id: resep.id,
                    jumlah: jumlah
                }
            })
        });

        const updateResult = await updateResponse.json();

        if (updateResult.status !== "success") {
            throw new Error(updateResult.message || "Gagal memperbarui resep.");
        }

        alert("Resep berhasil diperbarui!");

        await loadResep();

    } catch (error) {
        console.error("Edit resep:", error);
        alert(error.message || "Terjadi kesalahan saat mengedit resep.");
    }
}

async function hapusResep(id) {
    const konfirmasi = confirm(
        "Apakah Anda yakin ingin menghapus resep ini?"
    );

    if (!konfirmasi) return;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "deleteResep",
                data: {
                    id: id
                }
            })
        });

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(
                result.message || "Gagal menghapus resep."
            );
        }

        alert("Resep berhasil dihapus!");

        await loadResep();

    } catch (error) {
        console.error("Hapus resep:", error);
        alert(error.message || "Terjadi kesalahan saat menghapus resep.");
    }
}

// ======================================
// LOAD DATA HPP
// ======================================


async function loadHPP() {

    const tbody = document.getElementById("tabel-hpp");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7">Memuat data HPP...</td>
        </tr>
    `;

    try {

        const response = await fetch(`${API_URL}?action=getHPP`);
        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data HPP.");
        }

        const data = result.data || [];

        // SIMPAN DATA HPP UNTUK ANALISIS DASHBOARD
            localStorage.setItem(
                "kopipos_hpp",
                JSON.stringify(data)
            );

            // PERBARUI ANALISIS DASHBOARD
            if (typeof renderDashboard === "function") {
                renderDashboard();
            }

        // SIMPAN DATA UNTUK EXPORT EXCEL
        dataExportAnalisisHPP = data.filter(item =>
            item.rincian && item.rincian.length > 0
        );

        // UPDATE SIMULATOR KEUNTUNGAN

        loadSimulatorHPP(data);

        // UPDATE GRAFIK HPP

        renderHPPChart(data);

        // UPDATE REKOMENDASI HARGA 

        renderRekomendasiHPP(data);

        // UPDATE ANALISIS HPP

        renderAnalisisHPP(data);

        // UPDATE DISTRIUSI HPP

        renderDistribusiHPP(data);

        // UPDATE SARAN HPP

        renderSaranHPP(data);

        // RINGKASAN

        const totalMenu = data.length;

        const menuResep = data.filter(item =>
            item.rincian && item.rincian.length > 0
        ).length;

        const menuKosong = totalMenu - menuResep;

        document.getElementById("hpp-total-menu").textContent = totalMenu;
        document.getElementById("hpp-menu-resep").textContent = menuResep;
        document.getElementById("hpp-menu-kosong").textContent = menuKosong;

        
// =====================================
// ANALISIS PROFITABILITAS HPP
// =====================================

const menuDenganResep = data.filter(item =>
    item.rincian && item.rincian.length > 0
);

const rataHPP = menuDenganResep.length
    ? menuDenganResep.reduce((total, item) => {
        const harga = Number(item.hargaJual) || 0;
        const hpp = Number(item.totalHPP) || 0;

        return total + (harga > 0 ? (hpp / harga) * 100 : 0);
    }, 0) / menuDenganResep.length
    : 0;

const rataMargin = menuDenganResep.length
    ? menuDenganResep.reduce((total, item) => {
        const harga = Number(item.hargaJual) || 0;
        const laba = Number(item.labaKotor) || 0;

        return total + (harga > 0 ? (laba / harga) * 100 : 0);
    }, 0) / menuDenganResep.length
    : 0;

// MENU DENGAN LABA KOTOR TERBESAR

const menuTerbaik = [...menuDenganResep].sort(
    (a, b) => Number(b.labaKotor) - Number(a.labaKotor)
)[0];

// UPDATE KARTU

const elemenRataHPP = document.getElementById("hpp-rata-rata");
const elemenRataMargin = document.getElementById("hpp-rata-margin");
const elemenMenuTerbaik = document.getElementById("hpp-menu-terbaik");

if (elemenRataHPP) {
    elemenRataHPP.textContent = rataHPP.toFixed(1) + "%";
}

if (elemenRataMargin) {
    elemenRataMargin.textContent = rataMargin.toFixed(1) + "%";
}

if (elemenMenuTerbaik) {
    elemenMenuTerbaik.textContent = menuTerbaik
        ? menuTerbaik.namaMenu
        : "-";
}

// MENU DENGAN HPP NOMINAL TERENDAH

const menuHPPTerendah = [...menuDenganResep]
    .sort((a, b) => Number(a.totalHPP) - Number(b.totalHPP))[0];

const elemenHPPTerendah = document.getElementById("hpp-menu-terendah");

if (elemenHPPTerendah) {
    elemenHPPTerendah.textContent = menuHPPTerendah
        ? menuHPPTerendah.namaMenu
        : "-";
}


// MENU DENGAN MARGIN PERSENTASE TERTINGGI

const menuMarginTertinggi = [...menuDenganResep]
    .filter(item => Number(item.hargaJual) > 0)
    .sort((a, b) => {

        const marginA =
            (Number(a.labaKotor) / Number(a.hargaJual)) * 100;

        const marginB =
            (Number(b.labaKotor) / Number(b.hargaJual)) * 100;

        return marginB - marginA;

    })[0];

const elemenMarginTertinggi = document.getElementById("hpp-margin-tertinggi");

if (elemenMarginTertinggi) {
    elemenMarginTertinggi.textContent = menuMarginTertinggi
        ? menuMarginTertinggi.namaMenu
        : "-";
}

// ANALISIS MENU PERLU EVALUASI

const menuPerluEvaluasi = menuDenganResep.filter(item => {

    const harga = Number(item.hargaJual) || 0;
    const hpp = Number(item.totalHPP) || 0;

    if (harga <= 0) return true;

    const persentaseHPP = (hpp / harga) * 100;

    return persentaseHPP > 30;

});

const elemenMenuEvaluasi = document.getElementById("hpp-menu-evaluasi");

if (elemenMenuEvaluasi) {
    elemenMenuEvaluasi.textContent = menuPerluEvaluasi.length;
}

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">Belum ada data menu.</td>
                </tr>
            `;

            return;
        }

        // FORMAT RUPIAH

        function formatRupiah(angka) {
            return "Rp " + Number(angka || 0).toLocaleString("id-ID");
        }

        // TAMPILKAN TABEL

        tbody.innerHTML = data.map(item => {

            const hargaJual = Number(item.hargaJual) || 0;
            const totalHPP = Number(item.totalHPP) || 0;
            const labaKotor = Number(item.labaKotor) || 0;

            const memilikiResep =
                item.rincian && item.rincian.length > 0;

            const persentaseHPP = memilikiResep && hargaJual > 0
                ? (totalHPP / hargaJual) * 100
                : 0;

            const margin = memilikiResep && hargaJual > 0
                ? (labaKotor / hargaJual) * 100
                : 0;

            // STATUS HPP

            let statusHPP = "-";
            let classHPP = "";

            if (memilikiResep) {

                if (persentaseHPP <= 30) {
                    statusHPP = "HPP Sehat";
                    classHPP = "hpp-sehat";
                } 
                else if (persentaseHPP <= 40) {
                    statusHPP = "Perlu Evaluasi";
                    classHPP = "hpp-warning";
                } 
                else {
                    statusHPP = "HPP Tinggi";
                    classHPP = "hpp-tinggi";
                }

            } else {

                statusHPP = "Belum Ada Resep";
                classHPP = "hpp-kosong";

            }

            return `
                <tr>

                    <td>
                        <strong>${item.namaMenu}</strong>
                    </td>

                    <td>${formatRupiah(hargaJual)}</td>

                    <td>
                        ${memilikiResep
                            ? formatRupiah(totalHPP)
                            : "-"
                        }
                    </td>

                    <td>
                        ${memilikiResep
                            ? formatRupiah(labaKotor)
                            : "-"
                        }
                    </td>

                    <td>
                        ${memilikiResep
                            ? `
                                <div class="hpp-margin-info">
                                    <strong>${margin.toFixed(1)}%</strong>
                                    <small>HPP ${persentaseHPP.toFixed(1)}%</small>
                                </div>
                            `
                            : "-"
                        }
                    </td>

                    <td>
                        <span class="hpp-status ${classHPP}">
                            ${statusHPP}
                        </span>
                    </td>

                    <td>
                        ${memilikiResep
                            ? `
                                <button
                                    class="btn-edit"
                                    onclick="detailHPP('${item.menuId}')">
                                    Detail
                                </button>
                            `
                            : "-"
                        }
                    </td>

                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Load HPP:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7">Gagal memuat data HPP.</td>
            </tr>
        `;

    }

}


// ======================================
// DETAIL HPP
// ======================================

function detailHPP(menuId) {

    fetch(`${API_URL}?action=getHPP`)
        .then(response => response.json())
        .then(result => {

            if (result.status !== "success") {
                throw new Error("Gagal mengambil detail HPP.");
            }

            const menu = result.data.find(item =>
                item.menuId === menuId
            );

            if (!menu) {
                alert("Data menu tidak ditemukan.");
                return;
            }

            if (!menu.rincian || menu.rincian.length === 0) {
                alert("Menu ini belum memiliki resep.");
                return;
            }

            const formatRupiah = angka =>
                "Rp " + Number(angka).toLocaleString("id-ID");

            document.getElementById("detail-hpp-menu").textContent =
                menu.namaMenu;

            document.getElementById("detail-hpp-harga").textContent =
                formatRupiah(menu.hargaJual);

            document.getElementById("detail-hpp-total").textContent =
                formatRupiah(menu.totalHPP);

            document.getElementById("detail-hpp-laba").textContent =
                formatRupiah(menu.labaKotor);

            const tbody = document.getElementById("detail-hpp-tbody");

            tbody.innerHTML = menu.rincian.map(item => `
                <tr>
                    <td>${item.namaBahan}</td>

                    <td>
                        ${Number(item.jumlahPakai).toLocaleString("id-ID")}
                        ${item.satuan}
                    </td>

                    <td>${formatRupiah(item.hargaSatuan)}</td>

                    <td>${formatRupiah(item.subtotal)}</td>
                </tr>
            `).join("");

            document.getElementById("modal-detail-hpp").style.display =
                "flex";

        })
        .catch(error => {

            console.error("Detail HPP:", error);

            alert("Gagal memuat detail HPP.");

        });

}


// ======================================
// TUTUP MODAL DETAIL HPP
// ======================================

function closeDetailHPP() {

    document.getElementById("modal-detail-hpp").style.display =
        "none";

}

// =====================================
// KOPIPOS - GRAFIK ANALISIS HPP
// =====================================

let hppChart = null;

function renderHPPChart(data) {

    const canvas = document.getElementById("hpp-chart");

    if (!canvas || typeof Chart === "undefined") return;

    // Hanya menu yang sudah memiliki resep

    const menuDenganResep = data.filter(item =>
        item.rincian && item.rincian.length > 0
    );

    // Hapus grafik sebelumnya

    if (hppChart) {
        hppChart.destroy();
        hppChart = null;
    }

    // Jika belum ada resep

    if (menuDenganResep.length === 0) {
        return;
    }

    const labels = menuDenganResep.map(item => item.namaMenu);

    const hargaJual = menuDenganResep.map(item =>
        Number(item.hargaJual) || 0
    );

    const totalHPP = menuDenganResep.map(item =>
        Number(item.totalHPP) || 0
    );

    const labaKotor = menuDenganResep.map(item =>
        Number(item.labaKotor) || 0
    );

    hppChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [

                {
                    label: "Harga Jual",
                    data: hargaJual,
                    backgroundColor: "#d6b16a",
                    borderRadius: 5
                },

                {
                    label: "Total HPP",
                    data: totalHPP,
                    backgroundColor: "#e58b8b",
                    borderRadius: 5
                },

                {
                    label: "Laba Kotor",
                    data: labaKotor,
                    backgroundColor: "#6fd08c",
                    borderRadius: 5
                }

            ]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {
                    position: "top",

                    labels: {
                        color: "#ddd",
                        usePointStyle: true,
                        padding: 20
                    }
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return context.dataset.label + ": Rp " +
                                Number(context.raw).toLocaleString("id-ID");

                        }

                    }

                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#bbb"
                    },

                    grid: {
                        display: false
                    }
                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#bbb",

                        callback: function(value) {
                            return "Rp " + Number(value).toLocaleString("id-ID");
                        }

                    },

                    grid: {
                        color: "rgba(255,255,255,0.08)"
                    }

                }

            }

        }

    });

}

// =====================================
// REKOMENDASI HARGA JUAL KOPIPOS
// =====================================

function renderRekomendasiHPP(data) {

    const tbody = document.getElementById("tabel-rekomendasi-hpp");
    const inputTarget = document.getElementById("target-hpp");

    if (!tbody || !inputTarget) return;

    function formatRupiah(angka) {
        return "Rp " + Number(angka).toLocaleString("id-ID");
    }

    function tampilkanRekomendasi() {

        const target = Number(inputTarget.value);

        if (!target || target <= 0 || target > 100) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Masukkan target HPP antara 1 sampai 100%.
                    </td>
                </tr>
            `;

            return;
        }

        const menuDenganResep = data.filter(item =>
            item.rincian && item.rincian.length > 0
        );

        if (menuDenganResep.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Belum ada menu yang memiliki resep.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = menuDenganResep.map(item => {

            const hpp = Number(item.totalHPP) || 0;
            const hargaJual = Number(item.hargaJual) || 0;

            const hargaDasar = hpp / (target / 100);

            // Pembulatan ke atas kelipatan Rp500

            const hargaRekomendasi =
                Math.ceil(hargaDasar / 500) * 500;

            const selisih = hargaRekomendasi - hargaJual;

            return `
                <tr>

                    <td>
                        <strong>${item.namaMenu}</strong>
                    </td>

                    <td>${formatRupiah(hpp)}</td>

                    <td>${formatRupiah(hargaJual)}</td>

                    <td>
                        <strong style="color:#dfbd70">
                            ${formatRupiah(hargaRekomendasi)}
                        </strong>
                    </td>

                    <td>
                        <span class="${selisih > 0
                            ? 'hpp-warning'
                            : selisih < 0
                                ? 'hpp-tinggi'
                                : 'hpp-sehat'
                        }">
                            ${selisih > 0 ? "+" : ""}
                            ${formatRupiah(selisih)}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

    }

    // PERUBAHAN TARGET HPP

    inputTarget.oninput = tampilkanRekomendasi;

    tampilkanRekomendasi();

}

// =====================================
// KOPIPOS - SIMULATOR KEUNTUNGAN
// =====================================

let dataSimulasiHPP = [];

function loadSimulatorHPP(data) {

    dataSimulasiHPP = data.filter(item =>
        item.rincian && item.rincian.length > 0
    );

    const select = document.getElementById("simulasi-menu");

    if (!select) return;

    select.innerHTML = `
        <option value="">Pilih menu...</option>

        ${dataSimulasiHPP.map(item => `
            <option value="${item.menuId}">
                ${item.namaMenu}
            </option>
        `).join("")}
    `;

}

// HITUNG SIMULASI

function hitungSimulasiKeuntungan() {

    const menuId = document.getElementById("simulasi-menu").value;

    const jumlah = Number(
        document.getElementById("simulasi-qty").value
    );

    if (!menuId) {
        alert("Silakan pilih menu terlebih dahulu.");
        return;
    }

    if (!Number.isInteger(jumlah) || jumlah <= 0) {
        alert("Masukkan jumlah penjualan berupa bilangan bulat lebih dari 0.");
        return;
    }

    const menu = dataSimulasiHPP.find(item =>
        item.menuId === menuId
    );

    if (!menu) {
        alert("Data menu tidak ditemukan.");
        return;
    }

    const hargaJual = Number(menu.hargaJual) || 0;
    const hpp = Number(menu.totalHPP) || 0;

    const omzet = hargaJual * jumlah;
    const biaya = hpp * jumlah;
    const laba = (hargaJual - hpp) * jumlah;

    function rupiah(angka) {
        return "Rp" + angka.toLocaleString("id-ID");
    }

    document.getElementById("simulasi-omzet").textContent =
        rupiah(omzet);

    document.getElementById("simulasi-biaya").textContent =
        rupiah(biaya);

    document.getElementById("simulasi-laba").textContent =
        rupiah(laba);

}

// EVENT TOMBOL

document.addEventListener("DOMContentLoaded", function() {

    const tombol = document.getElementById("btn-hitung-simulasi");

    if (tombol) {
        tombol.addEventListener("click", hitungSimulasiKeuntungan);
    }

});

function hitungTargetLaba() {

    const menuId = document.getElementById("simulasi-menu").value;
    const targetLaba = Number(document.getElementById("target-laba").value);

    if (!menuId) {
        alert("Silakan pilih menu terlebih dahulu.");
        return;
    }

    if (!Number.isFinite(targetLaba) || targetLaba <= 0) {
        alert("Masukkan target keuntungan yang valid.");
        return;
    }

    const menu = dataSimulasiHPP.find(item => item.menuId === menuId);

    if (!menu) {
        alert("Data menu tidak ditemukan.");
        return;
    }

    const hargaJual = Number(menu.hargaJual) || 0;
    const hpp = Number(menu.totalHPP) || 0;
    const labaPerCup = hargaJual - hpp;

    if (labaPerCup <= 0) {
        alert("Menu ini belum menghasilkan laba kotor positif.");
        return;
    }

    const jumlahCup = Math.ceil(targetLaba / labaPerCup);

    document.getElementById("hasil-target-cup").textContent =
        jumlahCup.toLocaleString("id-ID") + " Cup";
}


// EVENT TOMBOL TARGET LABA

document.addEventListener("DOMContentLoaded", function () {

    // TOMBOL HITUNG TARGET LABA
    const tombolTarget = document.getElementById("btn-hitung-target-laba");

    if (tombolTarget) {
        tombolTarget.addEventListener("click", hitungTargetLaba);
    }

    // TOMBOL EXPORT ANALISIS HPP
    const tombolExport = document.getElementById("btn-export-analisis-hpp");

    if (tombolExport) {
        tombolExport.addEventListener("click", exportAnalisisHPP);
    }

});

function renderAnalisisHPP(data) {

    const tbody = document.getElementById("tabel-analisis-hpp");

    if (!tbody) return;

    const menuDenganResep = data.filter(item =>
        item.rincian && item.rincian.length > 0
    );

    if (menuDenganResep.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Belum ada menu yang memiliki resep.</td>
            </tr>
        `;
        return;
    }

    function rupiah(angka) {
        return "Rp " + Number(angka).toLocaleString("id-ID");
    }

    tbody.innerHTML = menuDenganResep.map(item => {

        const harga = Number(item.hargaJual) || 0;
        const hpp = Number(item.totalHPP) || 0;

        const persentase = harga > 0
            ? (hpp / harga) * 100
            : 0;

        let status = "";
        let warna = "";

        if (harga <= 0) {

            status = "Harga Belum Valid";
            warna = "#e58b8b";

        } else if (hpp >= harga) {

            status = "RUGI";
            warna = "#ff4d4d";

        } else if (persentase <= 25) {

            status = "Sangat Baik";
            warna = "#6fd08c";

        } else if (persentase <= 30) {

            status = "Baik";
            warna = "#dfbd70";

        } else if (persentase <= 40) {

            status = "Perlu Evaluasi";
            warna = "#e5a45b";

        } else {

            status = "Tidak Sehat";
            warna = "#e58b8b";

        }

        return `
            <tr>
                <td><strong>${item.namaMenu}</strong></td>
                <td>${rupiah(harga)}</td>
                <td>${rupiah(hpp)}</td>
                <td>${persentase.toFixed(2)}%</td>
                <td>
                    <span style="
                        color:${warna};
                        font-weight:700;
                    ">
                        ${status}
                    </span>
                </td>
            </tr>
        `;

    }).join("");

    // FILTER STATUS HPP

    const filterStatus = document.getElementById("filter-status-hpp");

    if (filterStatus) {

        filterStatus.onchange = function () {

            const statusDipilih = this.value;

            const semuaBaris = tbody.querySelectorAll("tr");

            semuaBaris.forEach(baris => {

                const kolomStatus = baris.querySelector("td:last-child");

                if (!kolomStatus) return;

                const statusBaris = kolomStatus.textContent.trim();

                baris.style.display =
                    statusDipilih === "SEMUA" ||
                    statusBaris === statusDipilih
                        ? ""
                        : "none";

            });

        };

    }

}

// =====================================
// EXPORT ANALISIS HPP KE EXCEL
// =====================================


async function exportAnalisisHPP() {

    if (typeof ExcelJS === "undefined") {
        alert("Library ExcelJS belum tersedia.");
        return;
    }

    const data = dataExportAnalisisHPP || [];

    if (data.length === 0) {
        alert("Belum ada data analisis HPP untuk diekspor.");
        return;
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "KopiPOS";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Analisis HPP");

    sheet.columns = [
        { width: 25 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 23 }
    ];

    sheet.mergeCells("A1:F1");

    sheet.getCell("A1").value = "KOPIPOS - LAPORAN ANALISIS HPP";

    sheet.getCell("A1").font = {
        bold: true,
        size: 16,
        color: { argb: "FFD6B16A" }
    };

    sheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    sheet.getRow(1).height = 35;

    sheet.mergeCells("A2:F2");

    sheet.getCell("A2").value =
        "Tanggal Export: " +
        new Date().toLocaleDateString("id-ID");

    sheet.getCell("A2").alignment = {
        horizontal: "center"
    };

    sheet.addRow([]);

    const header = sheet.addRow([
        "Nama Menu",
        "Harga Jual",
        "Total HPP",
        "Laba Kotor",
        "Persentase HPP",
        "Status"
    ]);

    header.height = 30;

    header.eachCell(cell => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF171717" }
        };

        cell.font = {
            bold: true,
            color: { argb: "FFD6B16A" }
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle"
        };
    });

    data.forEach(item => {

        const harga = Number(item.hargaJual) || 0;
        const hpp = Number(item.totalHPP) || 0;
        const laba = harga - hpp;

        const persentase = harga > 0 ? hpp / harga : 0;

        let status = "";
        let warnaStatus = "FFFFFFFF";

        if (harga <= 0) {
            status = "Harga Belum Valid";
            warnaStatus = "FFE58B8B";
        } else if (hpp >= harga) {
            status = "RUGI";
            warnaStatus = "FFFF3333";
        } else if (persentase * 100 <= 25) {
            status = "Sangat Baik";
            warnaStatus = "FF6FD08C";
        } else if (persentase * 100 <= 30) {
            status = "Baik";
            warnaStatus = "FFDFBD70";
        } else if (persentase * 100 <= 40) {
            status = "Perlu Evaluasi";
            warnaStatus = "FFE5A45B";
        } else {
            status = "Tidak Sehat";
            warnaStatus = "FFE58B8B";
        }

        const row = sheet.addRow([
            item.namaMenu,
            harga,
            hpp,
            laba,
            persentase,
            status
        ]);

        row.getCell(2).numFmt = '"Rp" #,##0';
        row.getCell(3).numFmt = '"Rp" #,##0';
        row.getCell(4).numFmt = '"Rp" #,##0';
        row.getCell(5).numFmt = "0.00%";

        row.eachCell(cell => {
            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };
        });

        row.getCell(6).font = {
            bold: true,
            color: { argb: warnaStatus }
        };

    });

    sheet.views = [
        { state: "frozen", ySplit: 4 }
    ];

    sheet.autoFilter = {
        from: "A4",
        to: "F4"
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Laporan_Analisis_HPP_KopiPOS.xlsx";

    link.click();

    URL.revokeObjectURL(url);

    alert("Laporan Analisis HPP berhasil diekspor!");

}

// =====================================
// GRAFIK DISTRIBUSI KESEHATAN MENU
// =====================================

let hppDistribusiChart = null;

function renderDistribusiHPP(data) {

    const canvas = document.getElementById("hpp-distribusi-chart");

    if (!canvas || typeof Chart === "undefined") return;

    const menuDenganResep = data.filter(item =>
        item.rincian &&
        item.rincian.length > 0 &&
        Number(item.hargaJual) > 0
    );

    const jumlahStatus = {
        "Sangat Baik": 0,
        "Baik": 0,
        "Perlu Evaluasi": 0,
        "Tidak Sehat": 0,
        "RUGI": 0
    };

    menuDenganResep.forEach(item => {

        const harga = Number(item.hargaJual) || 0;
        const hpp = Number(item.totalHPP) || 0;

        const persentase = (hpp / harga) * 100;

        if (hpp >= harga) {
            jumlahStatus["RUGI"]++;
        } else if (persentase <= 25) {
            jumlahStatus["Sangat Baik"]++;
        } else if (persentase <= 30) {
            jumlahStatus["Baik"]++;
        } else if (persentase <= 40) {
            jumlahStatus["Perlu Evaluasi"]++;
        } else {
            jumlahStatus["Tidak Sehat"]++;
        }

    });

    if (hppDistribusiChart) {
        hppDistribusiChart.destroy();
    }

    hppDistribusiChart = new Chart(canvas, {

        type: "doughnut",

        data: {
            labels: Object.keys(jumlahStatus),

            datasets: [{
                data: Object.values(jumlahStatus),

                backgroundColor: [
                    "#6fd08c",
                    "#dfbd70",
                    "#e5a45b",
                    "#e58b8b",
                    "#ff3333"
                ],

                borderColor: "#111111",
                borderWidth: 3,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom",

                    labels: {
                        color: "#ddd",
                        padding: 20,
                        usePointStyle: true
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ": " +
                                context.raw + " menu";
                        }
                    }
                }
            }
        }

    });

}


// =====================================
// REKOMENDASI OTOMATIS PERBAIKAN HPP
// =====================================


function renderSaranHPP(data) {

    const container = document.getElementById("hpp-daftar-saran");

    if (!container) return;

    const menuDenganResep = data.filter(item =>
        item.rincian &&
        item.rincian.length > 0
    );

    if (menuDenganResep.length === 0) {
        container.innerHTML = `
            <div class="hpp-saran-item">
                <p>Belum ada menu yang memiliki resep.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = menuDenganResep.map(item => {

        const harga = Number(item.hargaJual) || 0;
        const hpp = Number(item.totalHPP) || 0;

        let status = "";
        let saran = "";
        let warna = "";

        if (harga <= 0) {

            status = "Harga Belum Valid";
            saran = "Periksa kembali harga jual menu sebelum melakukan penjualan.";
            warna = "#e58b8b";

        } else if (hpp >= harga) {

            status = "RUGI";
            saran = "PERINGATAN: Biaya produksi sudah menyamai atau melebihi harga jual. Evaluasi harga bahan baku, takaran resep, dan harga jual sebelum menetapkan kembali harga menu.";
            warna = "#ff3333";

        } else {

            const persentase = (hpp / harga) * 100;

            if (persentase <= 25) {

                status = "Sangat Baik";
                saran = "Pertahankan komposisi resep dan efisiensi biaya produksi.";
                warna = "#6fd08c";

            } else if (persentase <= 30) {

                status = "Baik";
                saran = "Pertahankan harga bahan baku dan pantau biaya produksi secara berkala.";
                warna = "#dfbd70";

            } else if (persentase <= 40) {

                status = "Perlu Evaluasi";
                saran = "Evaluasi harga pembelian bahan baku, takaran resep, dan biaya kemasan.";
                warna = "#e5a45b";

            } else {

                status = "Tidak Sehat";
                saran = "Prioritaskan evaluasi biaya bahan baku, pemasok, dan harga jual menu.";
                warna = "#e58b8b";

            }
        }

        return `
            <div class="hpp-saran-item"
                 style="border-left:4px solid ${warna};">

                <div class="hpp-saran-info">

                    <h3>${item.namaMenu}</h3>

                    <span style="color:${warna};font-weight:700;">
                        ${status}
                    </span>

                </div>

                <p>${saran}</p>

            </div>
        `;

    }).join("");

}

// ======================================
// LOAD PENGELUARAN OPERASIONAL
// ======================================

async function loadPengeluaran() {

    const tbody = document.getElementById("tabel-pengeluaran");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5">Memuat data pengeluaran...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}?action=getPengeluaran`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data pengeluaran.");
        }

        const data = result.data || [];

        // SIMPAN DATA PENGELUARAN KE LOCAL STORAGE
localStorage.setItem(
    "kopipos_pengeluaran",
    JSON.stringify(data)
);

// PERBARUI DASHBOARD KEUNTUNGAN
if (typeof renderDashboardProfit === "function") {
    renderDashboardProfit();
}

        // Menghitung total pengeluaran
        const total = data.reduce((sum, item) => {
            return sum + Number(item.nominal || 0);
        }, 0);

        // Menampilkan ringkasan
        document.getElementById("total-pengeluaran").textContent =
            "Rp " + total.toLocaleString("id-ID");

        document.getElementById("jumlah-pengeluaran").textContent =
            data.length.toLocaleString("id-ID");

        // Jika belum ada data
        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Belum ada data pengeluaran.
                    </td>
                </tr>
            `;

            return;
        }

        // Menampilkan tabel pengeluaran
        tbody.innerHTML = data.map(item => {

            const tanggal = item.tanggal
                ? new Date(item.tanggal).toLocaleDateString("id-ID")
                : "-";

            return `
                <tr>
                    <td>${tanggal}</td>
                    <td>${item.kategori || "-"}</td>
                    <td>${item.keterangan || "-"}</td>
                    <td>
                        Rp ${Number(item.nominal || 0).toLocaleString("id-ID")}
                    </td>
                    <td>${item.kasir || "-"}</td>
                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Error pengeluaran:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Gagal memuat data pengeluaran.
                </td>
            </tr>
        `;

    }

}

// ======================================
// SIMPAN PENGELUARAN OPERASIONAL
// ======================================

async function savePengeluaran(event) {

    event.preventDefault();

    const tanggal = document.getElementById("pengeluaran-tanggal").value;
    const kategori = document.getElementById("pengeluaran-kategori").value;
    const nominal = Number(document.getElementById("pengeluaran-nominal").value);
    const keterangan = document.getElementById("pengeluaran-keterangan").value;

    if (!tanggal || !kategori || !nominal || nominal <= 0) {
        alert("Mohon lengkapi data pengeluaran.");
        return;
    }

    const tombol = document.querySelector(
        "#form-pengeluaran button[type='submit']"
    );

    tombol.disabled = true;
    tombol.textContent = "Menyimpan...";

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "savePengeluaran",

                data: {
                    tanggal: tanggal,
                    kategori: kategori,
                    keterangan: keterangan,
                    nominal: nominal,
                    kasir: "Admin"
                }

            })

        });

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message || "Gagal menyimpan pengeluaran.");
        }

        alert("Pengeluaran berhasil disimpan!");

        document.getElementById("form-pengeluaran").reset();

        // Mengisi kembali tanggal hari ini
        document.getElementById("pengeluaran-tanggal").value =
            new Date().toLocaleDateString("en-CA");

        // Memuat ulang data
        await loadPengeluaran();

    } catch (error) {

        console.error("Error simpan pengeluaran:", error);

        alert(error.message || "Terjadi kesalahan saat menyimpan pengeluaran.");

    } finally {

        tombol.disabled = false;
        tombol.textContent = "Simpan Pengeluaran";

    }

}

// ======================================
// EVENT FORM PENGELUARAN
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    const formPengeluaran = document.getElementById("form-pengeluaran");

    if (formPengeluaran) {
        formPengeluaran.addEventListener("submit", savePengeluaran);
    }

    const inputTanggal = document.getElementById("pengeluaran-tanggal");

    if (inputTanggal) {
        inputTanggal.value = new Date().toLocaleDateString("en-CA");
    }

});

// ======================================
// KOPIPOS - LAPORAN LABA RUGI
// ======================================

function renderLaporanLabaRugi() {

    // AMBIL DATA
    const transactions = JSON.parse(
        localStorage.getItem("kopipos_transactions") || "[]"
    );

    const hppData = JSON.parse(
        localStorage.getItem("kopipos_hpp") || "[]"
    );

    const pengeluaranData = JSON.parse(
        localStorage.getItem("kopipos_pengeluaran") || "[]"
    );

    // FILTER PERIODE
    const filter = document.getElementById("filter-laba-rugi")?.value || "bulan";

    const tanggalMulai = document.getElementById(
        "tanggal-mulai-laba-rugi"
    )?.value;

    const tanggalAkhir = document.getElementById(
        "tanggal-akhir-laba-rugi"
    )?.value;

    const sekarang = new Date();

    function cekPeriode(tanggalInput) {

        const tanggal = new Date(tanggalInput);

        if (isNaN(tanggal.getTime())) return false;

        if (filter === "hari") {
            return tanggal.toDateString() === sekarang.toDateString();
        }

        if (filter === "bulan") {
            return tanggal.getMonth() === sekarang.getMonth() &&
                tanggal.getFullYear() === sekarang.getFullYear();
        }

        if (filter === "tahun") {
            return tanggal.getFullYear() === sekarang.getFullYear();
        }

        if (filter === "custom") {

            if (!tanggalMulai || !tanggalAkhir) return false;

            const mulai = new Date(tanggalMulai + "T00:00:00");
            const akhir = new Date(tanggalAkhir + "T23:59:59");

            return tanggal >= mulai && tanggal <= akhir;
        }

        return true;
    }

    // FILTER TRANSAKSI
    const transaksiTerpilih = transactions.filter(transaction =>
        cekPeriode(transaction.date)
    );

    // FILTER PENGELUARAN
    const pengeluaranTerpilih = pengeluaranData.filter(item =>
        cekPeriode(item.tanggal)
    );

    // PERHITUNGAN
    let totalOmzet = 0;
    let omzetDenganHPP = 0;
    let totalHPP = 0;

    const menuTidakLengkap = new Set();

    transaksiTerpilih.forEach(transaction => {

        (transaction.items || []).forEach(item => {

            const namaMenu = String(item.name || "")
                .trim();

            const namaMenuLower = namaMenu.toLowerCase();

            const qty = Number(item.qty) || 0;

            const subtotal = Number(item.subtotal) ||
                (Number(item.price) || 0) * qty;

            totalOmzet += subtotal;

            const dataHPP = hppData.find(hpp =>
                String(hpp.namaMenu || "")
                    .trim()
                    .toLowerCase() === namaMenuLower
            );

            if (
                !dataHPP ||
                !dataHPP.rincian ||
                dataHPP.rincian.length === 0
            ) {
                menuTidakLengkap.add(namaMenu);
                return;
            }

            const biaya = (Number(dataHPP.totalHPP) || 0) * qty;

            omzetDenganHPP += subtotal;
            totalHPP += biaya;

        });

    });

    const totalPengeluaran = pengeluaranTerpilih.reduce(
        (total, item) => total + (Number(item.nominal) || 0),
        0
    );

    // LABA KOTOR DIHITUNG DARI MENU DENGAN HPP LENGKAP
    const labaKotor = omzetDenganHPP - totalHPP;

    const labaBersih = labaKotor - totalPengeluaran;

    const marginBersih = omzetDenganHPP > 0
        ? (labaBersih / omzetDenganHPP) * 100
        : 0;

    // FORMAT RUPIAH
    const rupiah = angka =>
        "Rp" + Math.round(angka).toLocaleString("id-ID");

    // TAMPILKAN KARTU RINGKASAN
    document.getElementById("report-total-omzet").textContent =
        rupiah(totalOmzet);

    document.getElementById("report-total-hpp").textContent =
        rupiah(totalHPP);

    document.getElementById("report-laba-kotor").textContent =
        rupiah(labaKotor);

    document.getElementById("report-total-pengeluaran").textContent =
        rupiah(totalPengeluaran);

    document.getElementById("report-laba-bersih").textContent =
        rupiah(labaBersih);

    document.getElementById("report-margin-bersih").textContent =
        marginBersih.toFixed(1) + "%";

    // RINCIAN LAPORAN
    const detail = document.getElementById(
        "profit-report-detail-content"
    );

    if (detail) {

        detail.innerHTML = `

            <div class="profit-report-row">
                <span>Total Pendapatan Penjualan</span>
                <strong>${rupiah(totalOmzet)}</strong>
            </div>

            <div class="profit-report-row">
                <span>Pendapatan dengan HPP Lengkap</span>
                <strong>${rupiah(omzetDenganHPP)}</strong>
            </div>

            <div class="profit-report-row">
                <span>Total Biaya HPP</span>
                <strong>${rupiah(totalHPP)}</strong>
            </div>

            <div class="profit-report-row">
                <span>Laba Kotor Terhitung</span>
                <strong>${rupiah(labaKotor)}</strong>
            </div>

            <div class="profit-report-row">
                <span>Pengeluaran Operasional</span>
                <strong>${rupiah(totalPengeluaran)}</strong>
            </div>

            <div class="profit-report-row">
                <span>Laba Bersih Terhitung</span>
                <strong>${rupiah(labaBersih)}</strong>
            </div>

            <div class="profit-report-row">
                <span>Margin Laba Bersih</span>
                <strong>${marginBersih.toFixed(1)}%</strong>
            </div>

            <div class="profit-report-row">
                <span>Menu dengan HPP belum lengkap</span>
                <strong>${menuTidakLengkap.size} menu</strong>
            </div>

        `;

    }

    // ======================================
// INDIKATOR LABA ATAU RUGI
// ======================================

const barisLabaBersih = document.querySelectorAll(
    "#profit-report-detail-content .profit-report-row"
);

barisLabaBersih.forEach(row => {

    const label = row.querySelector("span")?.textContent.trim();

    const nilai = row.querySelector("strong");

    if (label === "Laba Bersih Terhitung" && nilai) {

        const angka = Number(
            nilai.textContent.replace(/[^\d-]/g, "")
        );

        row.classList.remove("is-profit", "is-loss");

        if (angka < 0) {
            row.classList.add("is-loss");
        } else {
            row.classList.add("is-profit");
        }

    }

});

renderChartLabaRugi();

}

// ======================================
// GRAFIK ANALISIS LABA RUGI
// ======================================

let chartLabaRugi = null;

function renderChartLabaRugi() {

    const canvas = document.getElementById("chart-laba-rugi");
    const filterTahun = document.getElementById("filter-tahun-laba-rugi");

    if (!canvas || !filterTahun) return;

    const transactions = JSON.parse(
        localStorage.getItem("kopipos_transactions") || "[]"
    );

    const hppData = JSON.parse(
        localStorage.getItem("kopipos_hpp") || "[]"
    );

    const expenses = JSON.parse(
        localStorage.getItem("kopipos_pengeluaran") || "[]"
    );

    const tahunSekarang = new Date().getFullYear();

    const tahunTersedia = new Set([tahunSekarang]);

    transactions.forEach(item => {
        if (item.tanggal || item.date) {
            const tanggal = new Date(item.tanggal || item.date);

            if (!isNaN(tanggal.getTime())) {
                tahunTersedia.add(tanggal.getFullYear());
            }
        }
    });

    expenses.forEach(item => {
        if (item.tanggal) {
            const tanggal = new Date(item.tanggal);

            if (!isNaN(tanggal.getTime())) {
                tahunTersedia.add(tanggal.getFullYear());
            }
        }
    });

    const tahunTerpilih = Number(filterTahun.value) || tahunSekarang;

    filterTahun.innerHTML = [...tahunTersedia]
        .sort((a, b) => b - a)
        .map(tahun => `
            <option value="${tahun}">${tahun}</option>
        `).join("");

    filterTahun.value = tahunTersedia.has(tahunTerpilih)
        ? tahunTerpilih
        : tahunSekarang;

    const tahunAktif = Number(filterTahun.value);

    const omzet = Array(12).fill(0);
    const totalHPP = Array(12).fill(0);
    const labaKotor = Array(12).fill(0);
    const pengeluaran = Array(12).fill(0);
    const labaBersih = Array(12).fill(0);

    const daftarHPP = new Map(
        hppData.map(item => [String(item.id), item])
    );

    transactions.forEach(transaksi => {

        const tanggal = new Date(transaksi.tanggal || transaksi.date);

        if (isNaN(tanggal.getTime()) || tanggal.getFullYear() !== tahunAktif) {
            return;
        }

        const bulan = tanggal.getMonth();

        (transaksi.items || []).forEach(item => {

            const dataHPP = daftarHPP.get(String(item.id_menu || item.id));

            if (!dataHPP || !dataHPP.rincian) return;

            const qty = Number(item.qty || 0);
            const biaya = Number(dataHPP.totalHPP || 0) * qty;
            const pendapatan = Number(item.subtotal || (item.harga * qty) || 0);

            omzet[bulan] += pendapatan;
            totalHPP[bulan] += biaya;

        });

    });

    expenses.forEach(item => {

        const tanggal = new Date(item.tanggal);

        if (isNaN(tanggal.getTime()) || tanggal.getFullYear() !== tahunAktif) {
            return;
        }

        pengeluaran[tanggal.getMonth()] += Number(item.nominal || 0);

    });

    for (let i = 0; i < 12; i++) {
        labaKotor[i] = omzet[i] - totalHPP[i];
        labaBersih[i] = labaKotor[i] - pengeluaran[i];
    }

    // ======================================
    // RINGKASAN PERFORMA LABA RUGI
    // ======================================

    const namaBulan = [
        "Januari", "Februari", "Maret",
        "April", "Mei", "Juni",
        "Juli", "Agustus", "September",
        "Oktober", "November", "Desember"
    ];

    const formatRupiahChart = angka => {
        return "Rp " + Math.round(angka).toLocaleString("id-ID");
    };

    // Total laba bersih setahun
    const totalLabaTahunan = labaBersih.reduce(
        (total, angka) => total + angka, 0
    );

    // Rata-rata laba bersih per bulan
    const rataLabaBulanan = totalLabaTahunan / 12;

    // ======================================
    // STATUS KONDISI KEUANGAN
    // ======================================

    const statusKeuangan = document.getElementById(
        "profit-financial-status"
    );

    const iconKeuangan = document.getElementById(
        "financial-status-icon"
    );

    const judulKeuangan = document.getElementById(
        "financial-status-title"
    );

    const deskripsiKeuangan = document.getElementById(
        "financial-status-description"
    );

    if (statusKeuangan && iconKeuangan && judulKeuangan && deskripsiKeuangan) {

        statusKeuangan.classList.remove("is-profit", "is-loss");

        if (totalLabaTahunan > 0) {

            statusKeuangan.classList.add("is-profit");

            iconKeuangan.textContent = "✓";
            judulKeuangan.textContent = "Usaha Menghasilkan Keuntungan";

            deskripsiKeuangan.textContent =
                "Total laba bersih tahun " + tahunAktif +
                " sebesar " + formatRupiahChart(totalLabaTahunan) + ".";

        } else if (totalLabaTahunan < 0) {

            statusKeuangan.classList.add("is-loss");

            iconKeuangan.textContent = "!";
            judulKeuangan.textContent = "Usaha Mengalami Kerugian";

            deskripsiKeuangan.textContent =
                "Total kerugian tahun " + tahunAktif +
                " sebesar " + formatRupiahChart(Math.abs(totalLabaTahunan)) + ".";

        } else {

            iconKeuangan.textContent = "–";
            judulKeuangan.textContent = "Belum Menghasilkan Laba";

            deskripsiKeuangan.textContent =
                "Total laba bersih tahun " + tahunAktif + " masih Rp 0.";

        }

    }

    // Cari bulan dengan laba bersih tertinggi
    const bulanMemilikiData = labaBersih.some((angka, index) => {
        return omzet[index] > 0 || pengeluaran[index] > 0;
    });

    const labaTertinggi = Math.max(...labaBersih);
    const indexBulanTerbaik = labaBersih.indexOf(labaTertinggi);

    document.getElementById("chart-bulan-terbaik").textContent =
        bulanMemilikiData ? namaBulan[indexBulanTerbaik] : "-";

    document.getElementById("chart-nilai-terbaik").textContent =
        bulanMemilikiData ? formatRupiahChart(labaTertinggi) : "Belum ada data";

    document.getElementById("chart-total-laba").textContent =
        formatRupiahChart(totalLabaTahunan);

    document.getElementById("chart-rata-laba").textContent =
        formatRupiahChart(rataLabaBulanan);

    // ======================================
    // TABEL ANALISIS KEUANGAN BULANAN
    // ======================================

    const tbodyAnalisis = document.getElementById(
        "tabel-analisis-bulanan"
    );

    if (tbodyAnalisis) {

        tbodyAnalisis.innerHTML = labaBersih.map((nilai, index) => {

            let status = "NETRAL";
            let classStatus = "status-netral";

            if (nilai > 0) {
                status = "UNTUNG";
                classStatus = "status-untung";
            } else if (nilai < 0) {
                status = "RUGI";
                classStatus = "status-rugi";
            }

            return `
                <tr>
                    <td>${namaBulan[index]}</td>

                    <td>${formatRupiahChart(omzet[index])}</td>

                    <td>${formatRupiahChart(totalHPP[index])}</td>

                    <td>${formatRupiahChart(pengeluaran[index])}</td>

                    <td>${formatRupiahChart(labaBersih[index])}</td>

                    <td>
                        <span class="${classStatus}">
                            ${status}
                        </span>
                    </td>
                </tr>
            `;

        }).join("");

        // ======================================
        // BARIS TOTAL TAHUNAN
        // ======================================

        const totalPendapatanTahunan = omzet.reduce(
            (total, nilai) => total + nilai, 0
        );

        const totalHPPTahunan = totalHPP.reduce(
            (total, nilai) => total + nilai, 0
        );

        const totalPengeluaranTahunan = pengeluaran.reduce(
            (total, nilai) => total + nilai, 0
        );

        const totalLabaBersihTahunan = labaBersih.reduce(
            (total, nilai) => total + nilai, 0
        );

        let statusTahunan = "NETRAL";
        let classStatusTahunan = "status-netral";

        if (totalLabaBersihTahunan > 0) {
            statusTahunan = "UNTUNG";
            classStatusTahunan = "status-untung";
        } else if (totalLabaBersihTahunan < 0) {
            statusTahunan = "RUGI";
            classStatusTahunan = "status-rugi";
        }

        tbodyAnalisis.innerHTML += `
            <tr class="profit-year-total">
                <td><strong>TOTAL ${tahunAktif}</strong></td>
                <td><strong>${formatRupiahChart(totalPendapatanTahunan)}</strong></td>
                <td><strong>${formatRupiahChart(totalHPPTahunan)}</strong></td>
                <td><strong>${formatRupiahChart(totalPengeluaranTahunan)}</strong></td>
                <td><strong>${formatRupiahChart(totalLabaBersihTahunan)}</strong></td>
                <td>
                    <span class="${classStatusTahunan}">
                        ${statusTahunan}
                    </span>
                </td>
            </tr>
        `;

    }

        if (chartLabaRugi) {
            chartLabaRugi.destroy();
        }

    chartLabaRugi = new Chart(canvas, {

        type: "line",

        data: {
            labels: [
                "Jan", "Feb", "Mar", "Apr",
                "Mei", "Jun", "Jul", "Agu",
                "Sep", "Okt", "Nov", "Des"
            ],

            datasets: [

                {
                    label: "Pendapatan",
                    data: omzet,
                    borderColor: "#d6b16a",
                    backgroundColor: "rgba(214,177,106,0.10)",
                    borderWidth: 2,
                    tension: 0.35
                },

                {
                    label: "Biaya HPP",
                    data: totalHPP,
                    borderColor: "#e58b8b",
                    backgroundColor: "rgba(229,139,139,0.10)",
                    borderWidth: 2,
                    tension: 0.35
                },

                {
                    label: "Laba Kotor",
                    data: labaKotor,
                    borderColor: "#6fd08c",
                    borderWidth: 2,
                    tension: 0.35
                },

                {
                    label: "Pengeluaran",
                    data: pengeluaran,
                    borderColor: "#ffad70",
                    borderWidth: 2,
                    tension: 0.35
                },

                {
                    label: "Laba Bersih",
                    data: labaBersih,
                    borderColor: "#70a9e8",
                    borderWidth: 3,
                    tension: 0.35
                }

            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    labels: {
                        color: "#cccccc",
                        usePointStyle: true,
                        padding: 18
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ": Rp " +
                                Number(context.raw).toLocaleString("id-ID");
                        }
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#aaaaaa"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                },

                y: {
                    ticks: {
                        color: "#aaaaaa",
                        callback: function(value) {

                            const angka = Number(value);

                            if (angka >= 1000000000) {
                                return "Rp " + (angka / 1000000000).toFixed(1) + " M";
                            }

                            if (angka >= 1000000) {
                                return "Rp " + (angka / 1000000).toFixed(1) + " Jt";
                            }

                            if (angka >= 1000) {
                                return "Rp " + (angka / 1000).toFixed(0) + " Rb";
                            }

                            return "Rp " + angka.toLocaleString("id-ID");
                        }
                    },
                    grid: {
                        color: "rgba(255,255,255,0.07)"
                    }
                }
            }
        }

    });

}

// ======================================
// FILTER LAPORAN LABA RUGI
// ======================================

const filterLabaRugi = document.getElementById(
    "filter-laba-rugi"
);

const tanggalMulaiLabaRugi = document.getElementById(
    "tanggal-mulai-laba-rugi"
);

const tanggalAkhirLabaRugi = document.getElementById(
    "tanggal-akhir-laba-rugi"
);

const tombolFilterLabaRugi = document.getElementById(
    "btn-filter-laba-rugi"
);

// TOMBOL EKSPOR LAPORAN LABA RUGI
const tombolExportLabaRugi = document.getElementById(
    "btn-export-laba-rugi"
);

if (tombolExportLabaRugi) {
    tombolExportLabaRugi.addEventListener("click", function() {
        exportLaporanLabaRugi();
    });
}


// TAMPILKAN INPUT TANGGAL KHUSUS
if (filterLabaRugi) {

    filterLabaRugi.addEventListener("change", function() {

        const custom = this.value === "custom";

        tanggalMulaiLabaRugi.style.display =
            custom ? "block" : "none";

        tanggalAkhirLabaRugi.style.display =
            custom ? "block" : "none";

    });

}


// TOMBOL TAMPILKAN LAPORAN
if (tombolFilterLabaRugi) {

    tombolFilterLabaRugi.addEventListener("click", function() {

        if (
            filterLabaRugi.value === "custom" &&
            (
                !tanggalMulaiLabaRugi.value ||
                !tanggalAkhirLabaRugi.value
            )
        ) {

            alert("Silakan pilih tanggal mulai dan tanggal akhir.");

            return;

        }

        if (
            filterLabaRugi.value === "custom" &&
            tanggalMulaiLabaRugi.value > tanggalAkhirLabaRugi.value
        ) {

            alert("Tanggal mulai tidak boleh melebihi tanggal akhir.");

            return;

        }

        renderLaporanLabaRugi();

    });

}

// ==========================================
// KOPIPOS - EXPORT LAPORAN LABA RUGI
// PROFESSIONAL EXCEL EDITION
// ==========================================

async function exportLaporanLabaRugi() {

    try {

        if (typeof ExcelJS === "undefined") {
            alert("Library ExcelJS belum berhasil dimuat.");
            return;
        }

        const transactions = JSON.parse(
            localStorage.getItem("kopipos_transactions") || "[]"
        );

        const hppData = JSON.parse(
            localStorage.getItem("kopipos_hpp") || "[]"
        );

        const pengeluaranData = JSON.parse(
            localStorage.getItem("kopipos_pengeluaran") || "[]"
        );

        const filter = document.getElementById("filter-laba-rugi").value;

        const tanggalMulai = document.getElementById(
            "tanggal-mulai-laba-rugi"
        ).value;

        const tanggalAkhir = document.getElementById(
            "tanggal-akhir-laba-rugi"
        ).value;

        const sekarang = new Date();

        const periodeNama = {
            hari: "Hari Ini",
            bulan: "Bulan Ini",
            tahun: "Tahun Ini",
            semua: "Semua Data",
            custom: "Tanggal Khusus"
        };

        // ==================================
        // FILTER TANGGAL
        // ==================================

        function cekPeriode(tanggalInput) {

            const tanggal = new Date(tanggalInput);

            if (isNaN(tanggal.getTime())) return false;

            if (filter === "hari") {
                return tanggal.toDateString() === sekarang.toDateString();
            }

            if (filter === "bulan") {
                return (
                    tanggal.getMonth() === sekarang.getMonth() &&
                    tanggal.getFullYear() === sekarang.getFullYear()
                );
            }

            if (filter === "tahun") {
                return tanggal.getFullYear() === sekarang.getFullYear();
            }

            if (filter === "custom") {

                if (!tanggalMulai || !tanggalAkhir) return false;

                const mulai = new Date(tanggalMulai + "T00:00:00");
                const akhir = new Date(tanggalAkhir + "T23:59:59");

                return tanggal >= mulai && tanggal <= akhir;
            }

            return true;
        }

        const transaksiTerpilih = transactions.filter(
            item => cekPeriode(item.date)
        );

        const pengeluaranTerpilih = pengeluaranData.filter(
            item => cekPeriode(item.tanggal)
        );

        if (
            transaksiTerpilih.length === 0 &&
            pengeluaranTerpilih.length === 0
        ) {
            alert("Tidak ada data pada periode yang dipilih.");
            return;
        }

        // ==================================
        // PERHITUNGAN KEUANGAN
        // ==================================

        let totalOmzet = 0;
        let omzetDenganHPP = 0;
        let totalHPP = 0;

        const menuTidakLengkap = new Set();

        transaksiTerpilih.forEach(transaction => {

            (transaction.items || []).forEach(item => {

                const namaMenu = String(item.name || "").trim();

                const qty = Number(item.qty) || 0;

                const subtotal =
                    Number(item.subtotal) ||
                    (Number(item.price) || 0) * qty;

                totalOmzet += subtotal;

                const dataHPP = hppData.find(hpp =>
                    String(hpp.namaMenu || "")
                        .trim()
                        .toLowerCase() === namaMenu.toLowerCase()
                );

                if (
                    !dataHPP ||
                    !dataHPP.rincian ||
                    dataHPP.rincian.length === 0
                ) {

                    menuTidakLengkap.add(namaMenu);

                    return;
                }

                omzetDenganHPP += subtotal;

                totalHPP +=
                    (Number(dataHPP.totalHPP) || 0) * qty;

            });

        });

        const totalPengeluaran = pengeluaranTerpilih.reduce(
            (total, item) =>
                total + (Number(item.nominal) || 0),
            0
        );

        const labaKotor = omzetDenganHPP - totalHPP;

        const labaBersih = labaKotor - totalPengeluaran;

        const marginBersih = omzetDenganHPP > 0
            ? labaBersih / omzetDenganHPP
            : 0;

        // ==================================
        // WORKBOOK
        // ==================================

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "KopiPOS";
        workbook.subject = "Laporan Laba Rugi";
        workbook.title = "Laporan Keuangan KopiPOS";
        workbook.company = "KopiPOS";

        workbook.created = new Date();

        const worksheet = workbook.addWorksheet("Laporan Laba Rugi", {

            views: [
                {
                    state: "frozen",
                    ySplit: 7
                }
            ],

            properties: {
                tabColor: {
                    argb: "D6B16A"
                }
            }

        });

        // ==================================
        // WARNA TEMA
        // ==================================

        const warna = {

            hitam: "111111",
            gelap: "1C1C1C",
            emas: "D6B16A",
            putih: "FFFFFF",
            abu: "E8E8E8",
            abuMuda: "F5F5F5",
            hijau: "E5F3E9",
            merah: "FCE8E8",
            teks: "333333",
            abuTeks: "777777"

        };

        // ==================================
        // LEBAR KOLOM
        // ==================================

        worksheet.columns = [

            {
                header: "KETERANGAN",
                key: "keterangan",
                width: 42
            },

            {
                header: "NOMINAL",
                key: "nominal",
                width: 25
            }

        ];

        // ==================================
        // JUDUL UTAMA
        // ==================================

        worksheet.mergeCells("A1:B2");

        const judul = worksheet.getCell("A1");

        judul.value = "KOPIPOS";

        judul.font = {
            name: "Arial",
            size: 24,
            bold: true,
            color: {
                argb: warna.emas
            }
        };

        judul.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: warna.hitam
            }
        };

        judul.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        worksheet.getRow(1).height = 32;
        worksheet.getRow(2).height = 24;

        // ==================================
        // SUBJUDUL
        // ==================================

        worksheet.mergeCells("A3:B3");

        const subjudul = worksheet.getCell("A3");

        subjudul.value = "LAPORAN LABA RUGI";

        subjudul.font = {
            name: "Arial",
            size: 13,
            bold: true,
            color: {
                argb: warna.emas
            }
        };

        subjudul.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: warna.gelap
            }
        };

        subjudul.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        worksheet.getRow(3).height = 27;

        // ==================================
        // IDENTITAS LAPORAN
        // ==================================

        const settings = JSON.parse(
            localStorage.getItem("kopipos_settings") || "{}"
        );

        worksheet.mergeCells("A4:B4");

        worksheet.getCell("A4").value =
            settings.storeName || "Laporan Keuangan Kedai Kopi";

        worksheet.getCell("A4").font = {
            name: "Arial",
            size: 12,
            bold: true,
            color: {
                argb: warna.teks
            }
        };

        worksheet.getCell("A4").alignment = {
            horizontal: "center"
        };

        worksheet.mergeCells("A5:B5");

        worksheet.getCell("A5").value =
            "Periode: " +
            (periodeNama[filter] || filter) +
            (
                filter === "custom"
                    ? " (" + tanggalMulai + " s/d " + tanggalAkhir + ")"
                    : ""
            );

        worksheet.getCell("A5").font = {
            name: "Arial",
            size: 10,
            color: {
                argb: warna.abuTeks
            }
        };

        worksheet.getCell("A5").alignment = {
            horizontal: "center"
        };

        worksheet.mergeCells("A6:B6");

        worksheet.getCell("A6").value =
            "Dicetak pada: " +
            new Date().toLocaleString("id-ID");

        worksheet.getCell("A6").font = {
            name: "Arial",
            size: 9,
            italic: true,
            color: {
                argb: warna.abuTeks
            }
        };

        worksheet.getCell("A6").alignment = {
            horizontal: "center"
        };

        // ==================================
        // HEADER TABEL
        // ==================================

        const header = worksheet.addRow([
            "RINCIAN KEUANGAN",
            "NOMINAL"
        ]);

        header.height = 32;

        header.eachCell(cell => {

            cell.font = {
                name: "Arial",
                size: 11,
                bold: true,
                color: {
                    argb: warna.emas
                }
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: warna.hitam
                }
            };

            cell.alignment = {
                horizontal: "center",
                vertical: "middle"
            };

            cell.border = {
                bottom: {
                    style: "medium",
                    color: {
                        argb: warna.emas
                    }
                }
            };

        });

        // ==================================
        // DATA LAPORAN
        // ==================================

        const daftarData = [

            {
                nama: "Total Pendapatan Penjualan",
                nilai: totalOmzet,
                tipe: "normal"
            },

            {
                nama: "Pendapatan dengan HPP Lengkap",
                nilai: omzetDenganHPP,
                tipe: "normal"
            },

            {
                nama: "Total Biaya HPP",
                nilai: totalHPP,
                tipe: "normal"
            },

            {
                nama: "LABA KOTOR",
                nilai: labaKotor,
                tipe: "subtotal"
            },

            {
                nama: "Pengeluaran Operasional",
                nilai: totalPengeluaran,
                tipe: "normal"
            },

            {
                nama: "LABA BERSIH",
                nilai: labaBersih,
                tipe: "total"
            },

            {
                nama: "Margin Laba Bersih",
                nilai: marginBersih,
                tipe: "persen"
            }

        ];

        daftarData.forEach(data => {

            const row = worksheet.addRow([
                data.nama,
                data.nilai
            ]);

            row.height = 30;

            row.eachCell(cell => {

                cell.font = {
                    name: "Arial",
                    size: 11,
                    color: {
                        argb: warna.teks
                    },
                    bold: data.tipe !== "normal"
                };

                cell.border = {
                    bottom: {
                        style: "thin",
                        color: {
                            argb: warna.abu
                        }
                    }
                };

                cell.alignment = {
                    vertical: "middle"
                };

            });

            row.getCell(2).alignment = {
                horizontal: "right",
                vertical: "middle"
            };

            if (data.tipe === "normal") {

                row.getCell(2).numFmt = '"Rp" #,##0';

            }

            if (data.tipe === "persen") {

                row.getCell(2).numFmt = "0.00%";

            }

            if (data.tipe === "subtotal") {

                row.eachCell(cell => {

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: "FFF3D6"
                        }
                    };

                    cell.font = {
                        name: "Arial",
                        size: 11,
                        bold: true,
                        color: {
                            argb: "8A641F"
                        }
                    };

                });

                row.getCell(2).numFmt = '"Rp" #,##0';

            }

            if (data.tipe === "total") {

                row.eachCell(cell => {

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: warna.gelap
                    };

                    cell.font = {
                        name: "Arial",
                        size: 12,
                        bold: true,
                        color: {
                            argb: warna.emas
                        }
                    };

                });

                row.getCell(2).numFmt = '"Rp" #,##0';

            }

            if (data.tipe === "persen") {

                row.eachCell(cell => {

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: warna.abuMuda
                    };

                });

            }

        });

        // ==================================
        // INFORMASI TAMBAHAN
        // ==================================

        worksheet.addRow([]);

        const infoHeader = worksheet.addRow([
            "INFORMASI TAMBAHAN",
            "JUMLAH"
        ]);

        infoHeader.height = 28;

        infoHeader.eachCell(cell => {

            cell.font = {
                name: "Arial",
                size: 10,
                bold: true,
                color: {
                    argb: warna.emas
                }
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: warna.gelap
            };

            cell.alignment = {
                horizontal: "center",
                vertical: "middle"
            };

        });

        const informasi = [

            [
                "Jumlah Transaksi",
                transaksiTerpilih.length
            ],

            [
                "Jumlah Pengeluaran",
                pengeluaranTerpilih.length
            ],

            [
                "Menu dengan HPP Belum Lengkap",
                menuTidakLengkap.size
            ]

        ];

        informasi.forEach((data, index) => {

            const row = worksheet.addRow(data);

            row.height = 25;

            row.eachCell(cell => {

                cell.font = {
                    name: "Arial",
                    size: 10,
                    color: {
                        argb: warna.teks
                    }
                };

                cell.border = {
                    bottom: {
                        style: "thin",
                        color: {
                            argb: warna.abu
                        }
                    }
                };

                if (index % 2 === 1) {

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: warna.abuMuda
                    };

                }

            });

            row.getCell(2).alignment = {
                horizontal: "center",
                vertical: "middle"
            };

        });

        // ==================================
        // CATATAN LAPORAN
        // ==================================

        worksheet.addRow([]);

        const barisCatatan = worksheet.lastRow.number + 1;

        worksheet.mergeCells(
            `A${barisCatatan}:B${barisCatatan}`
        );

        const catatan = worksheet.getCell(`A${barisCatatan}`);

        catatan.value =
            "CATATAN: Laba dihitung berdasarkan menu yang memiliki data HPP lengkap. " +
            "Menu tanpa HPP tidak dimasukkan dalam perhitungan laba.";

        catatan.font = {
            name: "Arial",
            size: 9,
            italic: true,
            color: {
                argb: warna.abuTeks
            }
        };

        catatan.alignment = {
            wrapText: true,
            vertical: "middle"
        };

        worksheet.getRow(barisCatatan).height = 38;

        // ==================================
        // PENGATURAN HALAMAN
        // ==================================

        worksheet.pageSetup = {

            paperSize: 9,

            orientation: "portrait",

            fitToPage: true,

            fitToWidth: 1,

            fitToHeight: 1,

            horizontalCentered: true

        };

        worksheet.pageSetup.margins = {

            left: 0.35,
            right: 0.35,
            top: 0.5,
            bottom: 0.5,
            header: 0.2,
            footer: 0.2

        };

        worksheet.pageSetup.printArea =
            `A1:B${worksheet.lastRow.number}`;

        // ==================================
        // DOWNLOAD EXCEL
        // ==================================

        const namaFile =
            "KopiPOS_Laporan_Laba_Rugi_" +
            (periodeNama[filter] || "Laporan")
                .replace(/\s/g, "_") +
            ".xlsx";

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob(
            [buffer],
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = namaFile;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        alert("Laporan Laba Rugi profesional berhasil diekspor!");

    } catch (error) {

        console.error("Error export laporan laba rugi:", error);

        alert("Gagal mengekspor laporan. Periksa Console browser.");

    }

}

// Filter tahun grafik laporan laba rugi
const filterTahunLabaRugi = document.getElementById(
    "filter-tahun-laba-rugi"
);

if (filterTahunLabaRugi) {
    filterTahunLabaRugi.addEventListener("change", function() {
        renderChartLabaRugi();
    });
}