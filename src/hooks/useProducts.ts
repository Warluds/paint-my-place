import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  external_id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  brand_id: string | null;
  category_id: string | null;
  price: number;
  old_price: number | null;
  discount_percent: number | null;
  quantity: number;
  specifications: Record<string, unknown>;
  images: string[];
  main_image: string | null;
  status: "active" | "inactive" | "out_of_stock";
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface UseProductsOptions {
  limit?: number;
  categorySlug?: string;
  brandSlug?: string;
  discountOnly?: boolean;
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { limit = 12, categorySlug, brandSlug, discountOnly, search } = options;

  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          brand:brands(id, name, slug),
          category:categories(id, name, slug)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (discountOnly) {
        query = query.not("old_price", "is", null);
      }

      if (search) {
        query = query.textSearch("search_vector", search);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      // Filter by category/brand in memory if needed (since we joined the tables)
      let filtered = data || [];
      
      if (categorySlug && filtered.length > 0) {
        filtered = filtered.filter(p => p.category?.slug === categorySlug);
      }
      
      if (brandSlug && filtered.length > 0) {
        filtered = filtered.filter(p => p.brand?.slug === brandSlug);
      }

      return filtered as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brand:brands(id, name, slug, logo_url, description),
          category:categories(id, name, slug, parent_id)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      return data as Product | null;
    },
    enabled: !!slug,
  });
}
