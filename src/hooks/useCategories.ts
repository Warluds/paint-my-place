import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  external_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      return data as Category[];
    },
  });
}

export function useCategoryTree() {
  const { data: categories, ...rest } = useCategories();

  const tree = categories?.reduce((acc, cat) => {
    if (!cat.parent_id) {
      acc.push({
        ...cat,
        children: categories.filter(c => c.parent_id === cat.id),
      });
    }
    return acc;
  }, [] as (Category & { children: Category[] })[]);

  return { data: tree, ...rest };
}
