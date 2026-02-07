import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  category?: string;
  searchQuery?: string;
  featured?: boolean;
  limit?: number;
}

export function ProductGrid({ category, searchQuery, featured, limit }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*");

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      if (featured) {
        query = query.eq("featured", true);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (limit) {
        query = query.limit(limit);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [category, searchQuery, featured, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No perfumes found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
