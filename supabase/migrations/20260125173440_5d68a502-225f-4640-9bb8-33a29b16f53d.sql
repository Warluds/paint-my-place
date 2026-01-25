-- Enum для статуса товара
CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'out_of_stock');

-- Таблица брендов
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL, -- ID из 1С
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица категорий (иерархическая)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL, -- ID из 1С
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Основная таблица товаров
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL, -- ID из 1С (артикул или GUID)
  sku TEXT UNIQUE NOT NULL, -- Артикул
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- Цены
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  old_price DECIMAL(12,2),
  discount_percent INTEGER,
  
  -- Остатки
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 1,
  
  -- Характеристики
  specifications JSONB DEFAULT '{}',
  
  -- Медиа
  images TEXT[] DEFAULT '{}',
  main_image TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Статус
  status product_status NOT NULL DEFAULT 'active',
  
  -- Служебные
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_external_id ON public.products(external_id);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_external_id ON public.categories(external_id);

-- Полнотекстовый поиск
ALTER TABLE public.products ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(sku, '')), 'A')
  ) STORED;

CREATE INDEX idx_products_search ON public.products USING GIN(search_vector);

-- RLS - публичный доступ на чтение для товаров
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Все могут читать активные товары
CREATE POLICY "Public read access for active products"
ON public.products FOR SELECT
USING (status = 'active');

-- Все могут читать бренды
CREATE POLICY "Public read access for brands"
ON public.brands FOR SELECT
USING (true);

-- Все могут читать категории
CREATE POLICY "Public read access for categories"
ON public.categories FOR SELECT
USING (true);

-- Триггер обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();