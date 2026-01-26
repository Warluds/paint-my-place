# Paint My Place - Визуализатор цвета краски

AI-визуализатор для подбора цветов краски с калькулятором расхода и палитрами колеровки.

## 🛠 Технологии

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage)
- **AI**: Google Gemini для анализа изображений и перекраски

---

## 🚀 Развёртывание на своём хостинге

### Предварительные требования

- Node.js 18+ и npm
- Аккаунт [Supabase](https://supabase.com)
- API ключ [Google AI Studio](https://aistudio.google.com/app/apikey) (для Gemini)

---

### Шаг 1: Клонирование репозитория

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

---

### Шаг 2: Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com) и создайте новый проект
2. Дождитесь инициализации (1-2 минуты)
3. Сохраните данные из **Settings → API**:
   - `Project URL` (например: `https://xxxxx.supabase.co`)
   - `anon public` ключ
   - `service_role` ключ (для Edge Functions)

---

### Шаг 3: Настройка базы данных

Выполните SQL миграции в **SQL Editor** вашего Supabase проекта:

#### 3.1 Создание таблиц

```sql
-- Таблица брендов
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица категорий
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id),
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Статус товара
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');

-- Таблица товаров
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand_id UUID REFERENCES public.brands(id),
  category_id UUID REFERENCES public.categories(id),
  price NUMERIC NOT NULL DEFAULT 0,
  old_price NUMERIC,
  discount_percent INTEGER,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 1,
  main_image TEXT,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  status product_status NOT NULL DEFAULT 'active',
  search_vector TSVECTOR,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица колеровочных цветов
CREATE TABLE public.tints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hex_color TEXT NOT NULL,
  name TEXT NOT NULL,
  series TEXT,
  palette TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы
CREATE INDEX idx_tints_palette ON public.tints(palette);
CREATE INDEX idx_tints_hex_color ON public.tints(hex_color);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand_id);
```

#### 3.2 Настройка Row Level Security (RLS)

```sql
-- Включение RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tints ENABLE ROW LEVEL SECURITY;

-- Политики публичного чтения
CREATE POLICY "Public read access for brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access for active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read access for tints" ON public.tints FOR SELECT USING (true);
```

#### 3.3 Функция для получения палитр

```sql
CREATE OR REPLACE FUNCTION public.get_unique_palettes()
RETURNS TABLE (palette text, color_count bigint) 
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT palette, COUNT(*) as color_count
  FROM public.tints
  GROUP BY palette
  ORDER BY palette;
$$;

GRANT EXECUTE ON FUNCTION public.get_unique_palettes() TO anon;
```

---

### Шаг 4: Настройка Storage

В Supabase Dashboard → Storage:

1. Создайте bucket `product-images`
2. Сделайте его публичным (Public bucket)

---

### Шаг 5: Развёртывание Edge Functions

#### 5.1 Установка Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

#### 5.2 Настройка секретов

```bash
# API ключ Google Gemini (получите на https://aistudio.google.com/app/apikey)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key

# Или используйте Lovable API (если есть доступ)
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key
```

#### 5.3 Деплой функций

```bash
supabase functions deploy recolor-room
supabase functions deploy suggest-colors
supabase functions deploy import-tints
supabase functions deploy sync-1c
```

---

### Шаг 6: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

---

### Шаг 7: Сборка и деплой

#### Локальная разработка

```bash
npm run dev
```

#### Production сборка

```bash
npm run build
```

Папка `dist/` содержит статические файлы для деплоя.

#### Варианты хостинга

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Шаг 8: Импорт палитр колеровки

1. Откройте `/admin/tints` на вашем сайте
2. Загрузите JSON файлы с палитрами в формате:

```json
[
  {
    "COLOR": "#FFFFFF",
    "NAME": "Код цвета",
    "SERIES": "Серия (опционально)",
    "PALETTE": "Название палитры"
  }
]
```

---

## 📁 Структура проекта

```
├── src/
│   ├── components/       # React компоненты
│   │   ├── admin/        # Админ-панель
│   │   ├── ui/           # shadcn/ui компоненты
│   │   └── visualizer/   # Компоненты визуализатора
│   ├── hooks/            # React хуки
│   ├── integrations/     # Supabase клиент
│   ├── pages/            # Страницы
│   └── data/             # Статические данные
├── supabase/
│   ├── functions/        # Edge Functions
│   │   ├── recolor-room/ # AI перекраска комнаты
│   │   ├── suggest-colors/ # AI подбор цветов
│   │   └── import-tints/ # Импорт палитр
│   └── config.toml       # Конфигурация Supabase
└── public/               # Статические ассеты
```

---

## 🔧 Edge Functions

### recolor-room
Принимает изображение комнаты и желаемые цвета (стены, потолок, пол), возвращает перекрашенное изображение с помощью AI.

**Параметры:**
- `image` - base64 изображение
- `wallColor` - HEX цвет стен
- `ceilingColor` - HEX цвет потолка
- `floorColor` - HEX цвет пола

### suggest-colors  
Анализирует фото комнаты и предлагает цветовые палитры на основе выбранного стиля.

**Параметры:**
- `image` - base64 изображение
- `style` - стиль интерьера (modern, scandinavian, classic, cozy, bold, natural)

### import-tints
Импортирует JSON палитры колеровки в таблицу `tints`.

**Параметры:**
- `tints` - массив объектов с цветами
- `clearPalette` - название палитры для очистки перед импортом

### sync-1c
Синхронизация товаров, категорий и брендов с 1С.

---

## 🔐 Переменные окружения

| Переменная | Описание | Где используется |
|------------|----------|------------------|
| `VITE_SUPABASE_URL` | URL проекта Supabase | Frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon ключ Supabase | Frontend |
| `GEMINI_API_KEY` | API ключ Google Gemini | Edge Functions |
| `LOVABLE_API_KEY` | API ключ Lovable (опционально) | Edge Functions |
| `SYNC_API_KEY` | Ключ для синхронизации с 1С | Edge Functions |

---

## 📝 Лицензия

MIT License

---

## 🆘 Поддержка

При возникновении проблем создайте Issue в репозитории.
