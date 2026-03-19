import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getRecentlyViewed, RecentlyViewedProduct } from "@/utils/storage";

export default function RecentlyViewedCarousel() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [recentProducts, setRecentProducts] = useState<RecentlyViewedProduct[]>([]);

  // Refresh the list every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchRecent = async () => {
        const products = await getRecentlyViewed();
        setRecentProducts(products);
      };
      
      fetchRecent();
      
      return () => {};
    }, [])
  );

  // Responsive design calculations
  let visibleItems = 1.5; // Default for mobile
  if (width >= 1024) {
    visibleItems = 4.5;   // Desktop
  } else if (width >= 768) {
    visibleItems = 2.5;   // Tablet
  }

  // Calculate card width based on screen size (accounting for padding/margins)
  const containerPadding = 30; // 15px padding on each side of the parent container
  const cardMargin = 16; // 8px margin horizontal on each card
  const availableWidth = width - containerPadding;
  const cardWidth = Math.floor(availableWidth / visibleItems) - cardMargin;

  if (recentProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recently viewed products yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentProducts.map((product) => (
          <TouchableOpacity
            key={product._id}
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push(`/product/${product._id}`)}
          >
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.brand} numberOfLines={1}>
                {product.brand}
              </Text>
              <Text style={styles.name} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{product.price}</Text>
                {product.discount ? (
                  <Text style={styles.discount}>{product.discount}</Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -15, // Reverses the parent section padding so scroll reaches edges
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  card: {
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
    elevation: 3,
    marginBottom: 5, // space for shadow
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0",
  },
  info: {
    padding: 10,
  },
  brand: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    fontWeight: "600",
  },
  name: {
    fontSize: 14,
    color: "#3e3e3e",
    marginBottom: 6,
    height: 40, // consistent height for 2 lines
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginRight: 8,
  },
  discount: {
    fontSize: 12,
    color: "#ff3f6c",
  },
});
