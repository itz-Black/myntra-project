/**
 * RecommendationCarousel.tsx
 *
 * "You May Also Like" horizontal carousel for the Product Detail Page.
 *
 * Layout:
 *  - Desktop (≥768 px): 5 visible cards + Prev/Next arrow buttons
 *  - Mobile (<768 px): 2.5-card peek effect with snap scroll
 *
 * Per card:
 *  - "Similar" / "Recommended" / "Trending" badge
 *  - Quick heart (Add to Wishlist) icon
 *  - Skeleton shimmer while loading
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { useTheme } from "../theme/themeContext";
import { REMOTE_API } from "@/constants/api";
import {
  useRecommendations,
  RecommendedProduct,
} from "../hooks/useRecommendations";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  currentProduct: {
    _id?: string;
    category?: string;
    tags?: string[];
    color?: string;
  } | null;
  userId?: string | null;
  onWishlistChange?: () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  Similar: "#FF6B35",
  Recommended: "#ff3f6c",
  Trending: "#7B61FF",
};

const CARD_GAP = 12;

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard({ cardWidth }: { cardWidth: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { width: cardWidth, backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={[styles.cardImage, { backgroundColor: theme.border }]} />
      <View style={styles.cardBody}>
        <View style={[styles.skeletonLine, { width: "55%", backgroundColor: theme.border }]} />
        <View style={[styles.skeletonLine, { width: "80%", backgroundColor: theme.border, marginTop: 7 }]} />
        <View style={[styles.skeletonLine, { width: "40%", backgroundColor: theme.border, marginTop: 7 }]} />
      </View>
    </View>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  item,
  cardWidth,
  userId,
  onWishlistChange,
}: {
  item: RecommendedProduct;
  cardWidth: number;
  userId?: string | null;
  onWishlistChange?: () => void;
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);

  const handleWishlist = useCallback(async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setAddingWishlist(true);
    try {
      // Wishlist posts to whichever backend has it (Render is primary)
      await axios.post(`${REMOTE_API}/wishlist`, {
        userId,
        productId: item._id,
      });
      setWishlisted(true);
      onWishlistChange?.();
    } catch {
      // Wishlist error – silently swallow so card doesn't crash
    } finally {
      setAddingWishlist(false);
    }
  }, [userId, item._id, onWishlistChange, router]);

  const badgeColor = BADGE_COLORS[item.badgeType] ?? BADGE_COLORS.Trending;
  const imageUri = item.images?.[0] ?? "";
  const discountNum = item.discount
    ? parseInt(item.discount.replace(/[^0-9]/g, ""), 10)
    : 0;
  const originalPrice =
    discountNum > 0 ? Math.round(item.price / (1 - discountNum / 100)) : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth, backgroundColor: theme.card, borderColor: theme.border },
      ]}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${item._id}`)}
    >
      {/* ── Image + overlays ────────────────────────────────────────── */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />

        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{item.badgeType}</Text>
        </View>

        {/* Heart */}
        <TouchableOpacity
          style={[styles.heartBtn, { backgroundColor: theme.background }]}
          onPress={handleWishlist}
          disabled={addingWishlist}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {addingWishlist ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Heart
              size={15}
              color={wishlisted ? theme.primary : theme.iconInactive}
              fill={wishlisted ? theme.primary : "none"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Text info ───────────────────────────────────────────────── */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardBrand, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.cardPrice, { color: theme.text }]}>₹{item.price}</Text>
          {originalPrice ? (
            <Text style={[styles.cardOriginal, { color: theme.textSecondary }]}>
              ₹{originalPrice}
            </Text>
          ) : null}
          {item.discount ? (
            <Text style={[styles.cardDiscount, { color: theme.primary }]}>
              {item.discount}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export default function RecommendationCarousel({
  currentProduct,
  userId,
  onWishlistChange,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const HORIZONTAL_PADDING = isDesktop ? 0 : 16;
  const CARDS_VISIBLE = isDesktop ? 5 : 2.5;
  const cardWidth =
    (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (Math.floor(CARDS_VISIBLE) - 1)) /
    CARDS_VISIBLE;

  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);

  const { recommendations, isLoading, refetch } = useRecommendations({
    currentProduct,
    userId,
  });

  const handleWishlistChange = useCallback(() => {
    refetch();
    onWishlistChange?.();
  }, [refetch, onWishlistChange]);

  // Arrow navigation (desktop only)
  const scrollLeft = () => {
    const next = Math.max(0, currentIndex.current - 1);
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    currentIndex.current = next;
  };
  const scrollRight = () => {
    const next = Math.min(recommendations.length - 1, currentIndex.current + 1);
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    currentIndex.current = next;
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  const renderSkeleton = () => (
    <View style={[styles.skeletonRow, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      {Array.from({ length: isDesktop ? 5 : 3 }).map((_, i) => (
        <SkeletonCard key={i} cardWidth={cardWidth} />
      ))}
    </View>
  );

  // ── Card renderer ─────────────────────────────────────────────────────────
  const renderCard = ({ item }: { item: RecommendedProduct }) => (
    <View style={{ marginRight: CARD_GAP }}>
      <ProductCard
        item={item}
        cardWidth={cardWidth}
        userId={userId}
        onWishlistChange={handleWishlistChange}
      />
    </View>
  );

  // ── Empty / error (render nothing rather than a crash) ────────────────────
  if (!isLoading && recommendations.length === 0) return null;

  return (
    <View style={[styles.section, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          You May Also Like
        </Text>
        {isDesktop && recommendations.length > 0 && (
          <View style={styles.arrowRow}>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={scrollLeft}
            >
              <ChevronLeft size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={scrollRight}
            >
              <ChevronRight size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          ref={flatListRef}
          data={recommendations}
          renderItem={renderCard}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: 8 }}
          snapToInterval={cardWidth + CARD_GAP}
          decelerationRate="fast"
          onScrollToIndexFailed={() => {}}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  arrowRow: {
    flexDirection: "row",
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // ── Card ───────────────────────────────────────────────────────────────────
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardBody: {
    padding: 10,
    gap: 3,
  },
  cardBrand: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    flexWrap: "wrap",
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardOriginal: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  cardDiscount: {
    fontSize: 12,
    fontWeight: "600",
  },
  // ── Skeleton ───────────────────────────────────────────────────────────────
  skeletonRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },
  skeletonLine: {
    height: 11,
    borderRadius: 6,
  },
});
