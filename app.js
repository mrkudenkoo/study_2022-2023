// === Глобальные переменные ===
let shopData = null;
let cart = [];
let currentProduct = null;
let selectedOption = 0;
let quantity = 1;
let currentCategory = null;

// === Инициализация Telegram Web App ===
const tg = window.Telegram?.WebApp;

// === DOM элементы ===
const catalogScreen = document.getElementById('catalog-screen');
const productScreen = document.getElementById('product-screen');
const shopNameEl = document.getElementById('shop-name');
const categoriesEl = document.getElementById('categories');
const categoryTitleEl = document.getElementById('category-title');
const productsEl = document.getElementById('products');
const cartBtn = document.getElementById('cart-btn');
const cartCountEl = document.getElementById('cart-count');

// Product screen elements
const backBtn = document.getElementById('back-btn');
const productHeaderTitle = document.getElementById('product-header-title');
const imagesCarousel = document.getElementById('images-carousel');
const carouselDots = document.getElementById('carousel-dots');
const productNameEl = document.getElementById('product-name');
const productPriceEl = document.getElementById('product-price');
const optionsTitleEl = document.getElementById('options-title');
const optionsListEl = document.getElementById('options-list');
const productDescEl = document.getElementById('product-description');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const qtyValue = document.getElementById('qty-value');

// === Загрузка данных ===
async function loadData() {
    try {
        const response = await fetch(`products.json?t=${new Date().getTime()}`, { cache: 'no-store' });
        shopData = await response.json();
        initApp();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        shopNameEl.textContent = 'Ошибка загрузки';
    }
}

// === Инициализация приложения ===
function initApp() {
    // Telegram Web App setup
    if (tg) {
        tg.ready();
        tg.expand();
        
        // Применяем тему Telegram
        document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color || '#1c1c1e');
        document.documentElement.style.setProperty('--bg-secondary', tg.themeParams.secondary_bg_color || '#2c2c2e');
        document.documentElement.style.setProperty('--text-primary', tg.themeParams.text_color || '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', tg.themeParams.hint_color || '#a0a0a0');
    }

    // Устанавливаем название магазина
    shopNameEl.textContent = shopData.shopName;

    // Рендерим категории
    renderCategories();

    // Выбираем первую категорию
    if (shopData.categories.length > 0) {
        selectCategory(shopData.categories[0].id);
    }

    // Загружаем корзину из localStorage
    loadCart();

    // Устанавливаем обработчики
    setupEventListeners();
}

// === Рендер категорий ===
function renderCategories() {
    categoriesEl.innerHTML = shopData.categories.map(cat => `
        <button class="category-tab" data-id="${cat.id}">
            ${cat.name}
        </button>
    `).join('');
}

// === Выбор категории ===
function selectCategory(categoryId) {
    currentCategory = categoryId;
    
    // Обновляем активную вкладку
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.id === categoryId);
    });

    // Находим категорию
    const category = shopData.categories.find(c => c.id === categoryId);
    categoryTitleEl.textContent = category?.name || '';

    // Фильтруем и рендерим товары
    const products = shopData.products.filter(p => p.categoryId === categoryId);
    renderProducts(products);
}

// === Рендер товаров ===
function renderProducts(products) {
    if (products.length === 0) {
        productsEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Товары не найдены</p>';
        return;
    }

    productsEl.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${getProductImage(product.images[0], 'product-thumb')}
            <div class="product-card-info">
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-desc">${product.shortDescription}</div>
                <div class="product-card-price">${product.price} ₽</div>
                <button class="add-btn" data-id="${product.id}">Добавить в корзину</button>
            </div>
        </div>
    `).join('');
}

// === Получение изображения или placeholder ===
function getProductImage(src, className) {
    if (src && src.startsWith('http')) {
        return `<img src="${src}" class="${className}" alt="Товар" onerror="this.outerHTML='<div class=\\'${className} placeholder-image\\'>🍞</div>'">`;
    } else if (src) {
        return `<img src="${src}" class="${className}" alt="Товар" onerror="this.outerHTML='<div class=\\'${className} placeholder-image\\'>🍞</div>'">`;
    }
    return `<div class="${className} placeholder-image">🍞</div>`;
}

// === Открытие страницы товара ===
function openProduct(productId) {
    currentProduct = shopData.products.find(p => p.id === productId);
    if (!currentProduct) return;

    selectedOption = 0;
    quantity = 1;

    // Заполняем данные
    productHeaderTitle.textContent = shopData.shopName;
    productNameEl.textContent = currentProduct.name;
    updatePrice();

    // Карусель изображений
    renderCarousel();

    // Опции
    if (currentProduct.options) {
        optionsTitleEl.textContent = currentProduct.options.name;
        renderOptions();
    }

    // Описание
    productDescEl.textContent = currentProduct.fullDescription;

    // Количество
    qtyValue.textContent = `${quantity} шт.`;

    // Показываем экран
    catalogScreen.classList.remove('active');
    productScreen.classList.add('active', 'slide-in');

    // Telegram back button
    if (tg) {
        tg.BackButton.show();
        tg.BackButton.onClick(closeProduct);
    }
}

// === Рендер карусели ===
function renderCarousel() {
    const images = currentProduct.images.length > 0 ? currentProduct.images : [null];
    
    imagesCarousel.innerHTML = images.map((img, index) => `
        <div class="carousel-slide">
            ${img ? `<img src="${img}" alt="${currentProduct.name}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-image\\'>🍞</div>'">` : '<div class="placeholder-image">🍞</div>'}
        </div>
    `).join('');

    // Dots
    if (images.length > 1) {
        carouselDots.innerHTML = images.map((_, i) => `
            <div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');
        carouselDots.style.display = 'flex';
    } else {
        carouselDots.style.display = 'none';
    }

    // Scroll listener for dots
    imagesCarousel.addEventListener('scroll', updateCarouselDots);
}

// === Обновление точек карусели ===
function updateCarouselDots() {
    const slideWidth = imagesCarousel.offsetWidth;
    const currentIndex = Math.round(imagesCarousel.scrollLeft / slideWidth);
    
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

// === Рендер опций ===
function renderOptions() {
    optionsListEl.innerHTML = currentProduct.options.variants.map((variant, index) => `
        <div class="option-item ${index === selectedOption ? 'selected' : ''}" data-index="${index}">
            <div class="option-radio"></div>
            <span class="option-label">${variant.label}</span>
            <span class="option-price">${variant.priceAdd > 0 ? '+' + variant.priceAdd + ' ₽' : '+0 ₽'}</span>
        </div>
    `).join('');
}

// === Выбор опции ===
function selectOption(index) {
    selectedOption = index;
    renderOptions();
    updatePrice();
}

// === Обновление цены ===
function updatePrice() {
    const basePrice = currentProduct.price;
    const optionPrice = currentProduct.options?.variants[selectedOption]?.priceAdd || 0;
    productPriceEl.textContent = `${basePrice + optionPrice} ₽`;
}

// === Закрытие страницы товара ===
function closeProduct() {
    productScreen.classList.remove('active', 'slide-in');
    catalogScreen.classList.add('active');
    currentProduct = null;

    if (tg) {
        tg.BackButton.hide();
        tg.BackButton.offClick(closeProduct);
    }
}

// === Добавление в корзину ===
function addToCart(product, optionIndex = 0, qty = 1) {
    const option = product.options?.variants[optionIndex];
    const cartItem = {
        productId: product.id,
        name: product.name,
        option: option?.label || null,
        price: product.price + (option?.priceAdd || 0),
        quantity: qty
    };

    // Проверяем, есть ли уже такой товар
    const existingIndex = cart.findIndex(
        item => item.productId === cartItem.productId && item.option === cartItem.option
    );

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    updateCartButton();
    
    // Haptic feedback
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// === Быстрое добавление в корзину (с карточки) ===
function quickAddToCart(productId) {
    const product = shopData.products.find(p => p.id === productId);
    if (product) {
        addToCart(product, 0, 1);
    }
}

// === Сохранение корзины ===
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// === Загрузка корзины ===
function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        cart = [];
    }
    updateCartButton();
}

// === Обновление кнопки корзины ===
function updateCartButton() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
    cartBtn.classList.toggle('hidden', totalItems === 0);
}

// === Обработчики событий ===
function setupEventListeners() {
    // Клик по категории
    categoriesEl.addEventListener('click', (e) => {
        const tab = e.target.closest('.category-tab');
        if (tab) {
            selectCategory(tab.dataset.id);
        }
    });

    // Клик по карточке товара
    productsEl.addEventListener('click', (e) => {
        // Если кликнули на кнопку "Добавить"
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            e.stopPropagation();
            quickAddToCart(parseInt(addBtn.dataset.id));
            return;
        }

        // Если кликнули на карточку
        const card = e.target.closest('.product-card');
        if (card) {
            openProduct(parseInt(card.dataset.id));
        }
    });

    // Кнопка назад
    backBtn.addEventListener('click', closeProduct);

    // Выбор опции
    optionsListEl.addEventListener('click', (e) => {
        const option = e.target.closest('.option-item');
        if (option) {
            selectOption(parseInt(option.dataset.index));
        }
    });

    // Количество
    qtyMinus.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            qtyValue.textContent = `${quantity} шт.`;
        }
    });

    qtyPlus.addEventListener('click', () => {
        quantity++;
        qtyValue.textContent = `${quantity} шт.`;
    });

    // Добавить в корзину со страницы товара
    addToCartBtn.addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct, selectedOption, quantity);
            closeProduct();
        }
    });

    // Клик по корзине
    cartBtn.addEventListener('click', () => {
        // Можно отправить данные в бот или показать корзину
        if (tg) {
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            tg.showPopup({
                title: 'Корзина',
                message: `Товаров: ${cart.reduce((s, i) => s + i.quantity, 0)}\nИтого: ${total} ₽`,
                buttons: [
                    { id: 'checkout', type: 'default', text: 'Оформить заказ' },
                    { id: 'clear', type: 'destructive', text: 'Очистить' },
                    { type: 'cancel' }
                ]
            }, (buttonId) => {
                if (buttonId === 'checkout') {
                    // Отправляем данные в бот
                    tg.sendData(JSON.stringify({ action: 'checkout', cart: cart }));
                } else if (buttonId === 'clear') {
                    cart = [];
                    saveCart();
                    updateCartButton();
                }
            });
        } else {
            alert(`Корзина: ${cart.length} товаров`);
        }
    });

    // Клик по точкам карусели
    carouselDots.addEventListener('click', (e) => {
        const dot = e.target.closest('.dot');
        if (dot) {
            const index = parseInt(dot.dataset.index);
            imagesCarousel.scrollTo({
                left: index * imagesCarousel.offsetWidth,
                behavior: 'smooth'
            });
        }
    });
}

// === Запуск приложения ===
document.addEventListener('DOMContentLoaded', loadData);
