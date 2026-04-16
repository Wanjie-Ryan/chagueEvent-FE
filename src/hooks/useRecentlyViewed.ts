import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 5;

export const useRecentlyViewed = () => {
  const [viewedIds, setViewedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const addProduct = useCallback((productId: string) => {
    setViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { viewedIds, addProduct };
};
