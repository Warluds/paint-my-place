-- Создаём bucket для изображений товаров
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Политики для чтения изображений
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');