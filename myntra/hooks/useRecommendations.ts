/**
 * useRecommendations.ts
 *
 * Custom hook for the "You May Also Like" recommendation carousel.
 * - Fetches from local backend's /product/recommendations endpoint
 * - Falls back to the remote Render API's /product list if local is down
 * - If completely offline, returns an empty array gracefully (no crash)
 * - POSTs browsing history fire-and-forget on mount
 * - Exposes refetch() so wishlist changes can re-trigger the carousel
 */

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { LOCAL_API, REMOTE_API } from "@/constants/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecommendedProduct {
  _id: string;
  name: string;
  brand: string;
  price: number;
  discount?: string;
  images: string[];
  category?: string;
  tags?: string[];
  color?: string;
  badgeType: "Similar" | "Recommended" | "Trending";
}

export interface UseRecommendationsOptions {
  currentProduct: {
    _id?: string;
    category?: string;
    tags?: string[];
    color?: string;
  } | null;
  userId?: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRecommendations({
  currentProduct,
  userId,
}: UseRecommendationsOptions) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // ── Post browsing history (fire-and-forget) ───────────────────────────────
  const postHistory = useCallback(
    (productId: string) => {
      if (!productId) return;
      axios
        .post(`${LOCAL_API}/user/history`, {
          userId: userId || null,
          productId,
        })
        .catch(() => {
          /* silently ignore – non-critical */
        });
    },
    [userId]
  );

  // ── Trending fallback (tries local first, then remote) ────────────────────
  const fetchTrending = useCallback(async () => {
    const currentId = currentProduct?._id;

    // Try local backend first
    try {
      const res = await axios.get<any[]>(`${LOCAL_API}/product`, {
        timeout: 4000,
      });
      if (res.data?.length) {
        const trending = res.data
          .filter((p) => p._id !== currentId)
          .slice(0, 10)
          .map((p) => ({ ...p, badgeType: "Trending" as const }));
        setRecommendations(trending);
        return;
      }
    } catch {
      /* local backend down – try remote */
    }

    // Try remote (Render) backend
    try {
      const res = await axios.get<any[]>(`${REMOTE_API}/product`, {
        timeout: 6000,
      });
      if (res.data?.length) {
        const trending = res.data
          .filter((p) => p._id !== currentId)
          .slice(0, 10)
          .map((p) => ({ ...p, badgeType: "Trending" as const }));
        setRecommendations(trending);
        return;
      }
    } catch {
      /* both backends down */
    }

    // Completely offline – leave recommendations empty (carousel shows nothing, no crash)
    setRecommendations([]);
  }, [currentProduct]);

  // ── Core fetch logic ──────────────────────────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    if (!currentProduct) return;
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        currentProductId: currentProduct._id || "",
        category: currentProduct.category || "",
        tags: (currentProduct.tags || []).join(","),
        color: currentProduct.color || "",
      };
      if (userId) params.userId = userId;

      const res = await axios.get<RecommendedProduct[]>(
        `${LOCAL_API}/product/recommendations`,
        { params, timeout: 5000 }
      );

      if (res.data?.length > 0) {
        setRecommendations(res.data);
      } else {
        await fetchTrending();
      }
    } catch {
      // Local recommendations endpoint down – fall back gracefully
      await fetchTrending();
    } finally {
      setIsLoading(false);
    }
  }, [currentProduct, userId, fetchTrending]);

  // ── Fetch once when currentProduct is available ───────────────────────────
  useEffect(() => {
    if (!currentProduct || hasFetched.current) return;
    hasFetched.current = true;
    fetchRecommendations();
    if (currentProduct._id) postHistory(currentProduct._id);
  }, [currentProduct, fetchRecommendations, postHistory]);

  // ── Public refetch (called after wishlist toggle) ─────────────────────────
  const refetch = useCallback(() => {
    hasFetched.current = false;
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, isLoading, error, refetch };
}
