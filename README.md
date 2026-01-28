# Telegram Mini App - Витрина товаров

Веб-приложение для Telegram с каталогом товаров.

## Структура файлов

```
webapp/
├── index.html      # Главная страница
├── styles.css      # Стили (тёмная тема)
├── app.js          # JavaScript логика
├── products.json   # Данные товаров (РЕДАКТИРУЙ ЗДЕСЬ!)
├── images/         # Папка для изображений товаров
└── README.md       # Этот файл
```

## Как добавить/изменить товары

Открой файл `products.json` и редактируй:

### Изменить название магазина:
```json
{
  "shopName": "Вкус Времени / Ремесленный хлеб",
  ...
}
```

### Добавить категорию:
```json
"categories": [
  {
    "id": "podoviy",     // Уникальный ID (латиницей)
    "name": "Хлеб Подовый"  // Отображаемое имя
  },
  // Добавь новую категорию сюда:
  {
    "id": "novaya",
    "name": "Новая категория"
  }
]
```

### Добавить товар:
```json
"products": [
  {
    "id": 1,                        // Уникальный числовой ID
    "categoryId": "podoviy",        // ID категории
    "name": "Название товара",
    "shortDescription": "Краткое описание для карточки",
    "fullDescription": "Полное описание товара...",
    "price": 270,                   // Цена в рублях
    "images": [                     // Массив изображений
      "images/product.jpg",         // Локальное изображение
      "https://example.com/img.jpg" // Или URL
    ],
    "options": {                    // Опции (например, вес)
      "name": "Вес буханки",
      "variants": [
        { "label": "550 гр.", "priceAdd": 0 },     // Базовый вариант
        { "label": "800 гр.", "priceAdd": 120 }    // +120₽ к цене
      ]
    }
  }
]
```

## Как добавить изображения

1. Положи картинки в папку `webapp/images/`
2. В `products.json` укажи путь: `"images/название.jpg"`

Или используй прямые ссылки:
```json
"images": ["https://example.com/bread.jpg"]
```

## Как запустить локально (для тестирования)

```bash
cd webapp
python3 -m http.server 8000
```

Открой в браузере: http://localhost:8000

## Как разместить в интернете

Telegram Mini Apps требуют HTTPS. Варианты:

### 1. GitHub Pages (бесплатно)
1. Создай репозиторий на GitHub
2. Загрузи папку `webapp`
3. Settings → Pages → Enable
4. Получишь URL: `https://username.github.io/repo/`

### 2. Vercel / Netlify (бесплатно)
1. Подключи репозиторий
2. Автоматически получишь HTTPS URL

### 3. Свой сервер с nginx + SSL
```nginx
server {
    listen 443 ssl;
    server_name yoursite.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /opt/chizho_bot/webapp;
    index index.html;
}
```

## Настройка бота

После размещения webapp укажи URL в файле `.env`:

```
WEBAPP_URL=https://yoursite.com/webapp/
```

И перезапусти бота. Кнопка "Открыть витрину" будет открывать Mini App.

## Особенности

- Тёмная тема (адаптируется под тему Telegram)
- Корзина сохраняется в localStorage
- Работает кнопка "Назад" в Telegram
- Haptic feedback при добавлении в корзину
- Адаптивный дизайн для мобильных

## Кастомизация

### Изменить цвета
В файле `styles.css` измени переменные:
```css
:root {
    --bg-primary: #1c1c1e;       /* Основной фон */
    --bg-secondary: #2c2c2e;     /* Вторичный фон */
    --accent: #f5a623;           /* Акцентный цвет (оранжевый) */
    --text-primary: #ffffff;     /* Основной текст */
}
```
