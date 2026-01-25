import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface Brand {
  external_id: string
  name: string
  slug?: string
  logo_url?: string
  description?: string
}

interface Category {
  external_id: string
  parent_external_id?: string
  name: string
  slug?: string
  icon?: string
  sort_order?: number
}

interface Product {
  external_id: string
  sku: string
  name: string
  slug?: string
  description?: string
  brand_external_id?: string
  category_external_id?: string
  price: number
  old_price?: number
  discount_percent?: number
  quantity: number
  min_quantity?: number
  specifications?: Record<string, unknown>
  images?: string[]
  main_image?: string
  meta_title?: string
  meta_description?: string
  status?: 'active' | 'inactive' | 'out_of_stock'
}

interface SyncPayload {
  action: 'sync_brands' | 'sync_categories' | 'sync_products' | 'sync_all' | 'delete_product'
  brands?: Brand[]
  categories?: Category[]
  products?: Product[]
  external_id?: string // для удаления
}

function generateSlug(name: string, suffix?: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }
  
  let slug = name.toLowerCase()
  for (const [ru, en] of Object.entries(translitMap)) {
    slug = slug.replace(new RegExp(ru, 'g'), en)
  }
  slug = slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
  
  if (suffix) {
    slug = `${slug}-${suffix}`
  }
  
  return slug || 'item'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Проверка API ключа
    const apiKey = req.headers.get('x-api-key')
    const expectedKey = Deno.env.get('SYNC_API_KEY')
    
    if (!apiKey || apiKey !== expectedKey) {
      console.error('Invalid or missing API key')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload: SyncPayload = await req.json()
    console.log(`Processing ${payload.action} action`)

    const results: Record<string, unknown> = { action: payload.action }

    // Синхронизация брендов
    if (payload.action === 'sync_brands' || payload.action === 'sync_all') {
      if (payload.brands && payload.brands.length > 0) {
        const brandsToUpsert = payload.brands.map(b => ({
          external_id: b.external_id,
          name: b.name,
          slug: b.slug || generateSlug(b.name, b.external_id.slice(-6)),
          logo_url: b.logo_url,
          description: b.description,
        }))

        const { data, error } = await supabase
          .from('brands')
          .upsert(brandsToUpsert, { onConflict: 'external_id' })
          .select()

        if (error) {
          console.error('Error syncing brands:', error)
          results.brands_error = error.message
        } else {
          console.log(`Synced ${data?.length || 0} brands`)
          results.brands_synced = data?.length || 0
        }
      }
    }

    // Синхронизация категорий
    if (payload.action === 'sync_categories' || payload.action === 'sync_all') {
      if (payload.categories && payload.categories.length > 0) {
        // Сначала вставляем все категории без parent_id
        const categoriesToUpsert = payload.categories.map(c => ({
          external_id: c.external_id,
          name: c.name,
          slug: c.slug || generateSlug(c.name, c.external_id.slice(-6)),
          icon: c.icon,
          sort_order: c.sort_order || 0,
        }))

        const { error: insertError } = await supabase
          .from('categories')
          .upsert(categoriesToUpsert, { onConflict: 'external_id' })

        if (insertError) {
          console.error('Error syncing categories:', insertError)
          results.categories_error = insertError.message
        } else {
          // Затем обновляем parent_id для тех, у кого есть родитель
          const categoriesWithParent = payload.categories.filter(c => c.parent_external_id)
          
          for (const cat of categoriesWithParent) {
            // Находим родительскую категорию по external_id
            const { data: parentData } = await supabase
              .from('categories')
              .select('id')
              .eq('external_id', cat.parent_external_id)
              .maybeSingle()

            if (parentData) {
              await supabase
                .from('categories')
                .update({ parent_id: parentData.id })
                .eq('external_id', cat.external_id)
            }
          }

          console.log(`Synced ${payload.categories.length} categories`)
          results.categories_synced = payload.categories.length
        }
      }
    }

    // Синхронизация товаров
    if (payload.action === 'sync_products' || payload.action === 'sync_all') {
      if (payload.products && payload.products.length > 0) {
        let syncedCount = 0
        const errors: string[] = []

        for (const product of payload.products) {
          let brandId = null
          let categoryId = null

          // Находим brand_id
          if (product.brand_external_id) {
            const { data: brandData } = await supabase
              .from('brands')
              .select('id')
              .eq('external_id', product.brand_external_id)
              .maybeSingle()
            brandId = brandData?.id
          }

          // Находим category_id
          if (product.category_external_id) {
            const { data: catData } = await supabase
              .from('categories')
              .select('id')
              .eq('external_id', product.category_external_id)
              .maybeSingle()
            categoryId = catData?.id
          }

          const productData = {
            external_id: product.external_id,
            sku: product.sku,
            name: product.name,
            slug: product.slug || generateSlug(product.name, product.sku),
            description: product.description,
            brand_id: brandId,
            category_id: categoryId,
            price: product.price,
            old_price: product.old_price,
            discount_percent: product.discount_percent,
            quantity: product.quantity,
            min_quantity: product.min_quantity || 1,
            specifications: product.specifications || {},
            images: product.images || [],
            main_image: product.main_image || (product.images?.[0] ?? null),
            meta_title: product.meta_title,
            meta_description: product.meta_description,
            status: product.status || (product.quantity > 0 ? 'active' : 'out_of_stock'),
            synced_at: new Date().toISOString(),
          }

          const { error } = await supabase
            .from('products')
            .upsert(productData, { onConflict: 'external_id' })

          if (error) {
            console.error(`Error syncing product ${product.sku}:`, error)
            errors.push(`${product.sku}: ${error.message}`)
          } else {
            syncedCount++
          }
        }

        console.log(`Synced ${syncedCount}/${payload.products.length} products`)
        results.products_synced = syncedCount
        if (errors.length > 0) {
          results.products_errors = errors
        }
      }
    }

    // Удаление товара
    if (payload.action === 'delete_product' && payload.external_id) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('external_id', payload.external_id)

      if (error) {
        console.error('Error deleting product:', error)
        results.delete_error = error.message
      } else {
        console.log(`Deleted product: ${payload.external_id}`)
        results.deleted = true
      }
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
