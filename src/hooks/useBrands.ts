import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Brand {
  id: string;
  external_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching brands:", error);
        throw error;
      }

      return data as Brand[];
    },
  });
}
