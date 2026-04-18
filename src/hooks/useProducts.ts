import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image_url: string;
  category: string;
  sizes: string[];
  description: string;
  created_at: string;
  providerEmail?: string;
  providerPhone?: string;
};

export const useProducts = (filters: any = {}) => {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "All") params.append("category", filters.category.toLowerCase());
      if (filters.search) params.append("search", filters.search);
      if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.sort && filters.sort !== "default") {
          if (filters.sort === 'price-asc') params.append('sort', 'price-low');
          else if (filters.sort === 'price-desc') params.append('sort', 'price-high');
          else if (filters.sort === 'newest') params.append('sort', 'latest');
      }

      const { data } = await api.get(`/filter?${params.toString()}`);
      
      // Map listing items to UI product expectations
      return (data.data || []).map((l: any) => ({
        id: l._id,
        name: l.title,
        subtitle: l.providerId?.username || l.location || "Service Provider",
        price: l.price,
        image_url: (l.images && l.images.length > 0) ? l.images[0] : "",
        category: l.category,
        sizes: [],
        description: l.description,
        created_at: l.createdAt,
        providerEmail: l.providerId?.email,
        providerPhone: l.providerId?.phone
      })) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/listings/single/${id}`);
      const l = data.data;
      return {
        id: l._id,
        name: l.title,
        subtitle: l.providerId?.username || l.location || "Service Provider",
        price: l.price,
        image_url: (l.images && l.images.length > 0) ? l.images[0] : "",
        category: l.category,
        sizes: [],
        description: l.description,
        created_at: l.createdAt,
        providerEmail: l.providerId?.email,
        providerPhone: l.providerId?.phone
      } as Product;
    },
    enabled: !!id,
  });
};
