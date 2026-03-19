import { LOCAL_API, REMOTE_API } from "@/constants/api";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../../theme/themeContext";
import axios from "axios";
import RecentlyViewedCarousel from "@/components/RecentlyViewedCarousel";

const MOCK_CATEGORIES = [
  {
    _id: "1",
    name: "Men",
    image:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop",
  },
  {
    _id: "2",
    name: "Women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
  {
    _id: "3",
    name: "Kids",
    image:
      "https://images.unsplash.com/photo-1519702202685-64d603a11689?w=500&auto=format&fit=crop",
  },
  {
    _id: "4",
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
  },
];

// const products = [
//   {
//     id: 1,
//     name: "Casual White T-Shirt",
//     brand: "Roadster",
//     price: "₹499",
//     discount: "60% OFF",
//     image:
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Denim Jacket",
//     brand: "Levis",
//     price: "₹2499",
//     discount: "40% OFF",
//     image:
//       "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     name: "Summer Dress",
//     brand: "ONLY",
//     price: "₹1299",
//     discount: "50% OFF",
//     image:
//       "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     name: "Classic Sneakers",
//     brand: "Nike",
//     price: "₹3499",
//     discount: "30% OFF",
//     image:
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
//   },
// ];

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>(null);
  const [categories, setcategories] = useState<any>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // ── Responsive grid: pixel-based width so mobile browser doesn't stretch ──
  const SECTION_PADDING = 30; // 15px each side
  const CARD_GAP = 10;        // gap between columns
  let columnCount = 2;        // mobile default
  if (width >= 1024) columnCount = 4;
  else if (width >= 768) columnCount = 3;

  // Available width minus outer padding minus total inner gaps
  const totalGap = CARD_GAP * (columnCount - 1);
  const cardWidth = Math.floor((width - SECTION_PADDING - totalGap) / columnCount);

  const handleProductPress = (productId: number) => {
    router.push(`/product/${productId}`);
  };
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(`${REMOTE_API}/category`);
        const product = await axios.get(`${REMOTE_API}/product`);
        setcategories(cat.data);
        setproduct(product.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.logo, { color: theme.text }]}>MYNTRA</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80",
          }}
          style={styles.banner}
          resizeMode="cover"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.categoryHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>SHOP BY CATEGORY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={styles.loader}
            />
          ) : (
            (categories && categories.length > 0 ? categories : MOCK_CATEGORIES).map((category: any) => (
              <TouchableOpacity 
                key={category._id} 
                style={styles.categoryCard}
                onPress={() => router.push({ pathname: "/categories", params: { category: category._id } })}
              >
                <View style={styles.categoryImageContainer}>
                  {category.image ? (
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage} />
                  )}
                </View>
                <Text style={[styles.categoryName, { color: theme.textSecondary }]}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>DEALS OF THE DAY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dealsScroll}
        >
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <Image source={{ uri: deal.image }} style={styles.dealImage} />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>TRENDING NOW</Text>
        </View>
        <View style={styles.productsGrid}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={styles.loader}
            />
          ) : !product || product.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No Product available</Text>
          ) : ( 
            <View style={styles.productsGrid}>
              {product.map((product: any, i: number) => (
                <TouchableOpacity
                  key={product._id}
                  style={[
                    styles.productCard,
                    {
                      width: cardWidth,
                      backgroundColor: theme.card,
                      marginLeft: i % columnCount === 0 ? 0 : CARD_GAP,
                    },
                  ]}
                  onPress={() => handleProductPress(product._id)}
                >
                  <Image
                    source={{ uri: product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={[styles.brandName, { color: theme.textSecondary }]}>{product.brand}</Text>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.productPrice, { color: theme.text }]}>₹{product.price}</Text>
                      <Text style={[styles.discount, { color: theme.primary }]}>{product.discount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>RECENTLY VIEWED</Text>
        </View>
        <RecentlyViewedCarousel />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color removed for theme sync
  },
  scrollContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchButton: {
    padding: 8,
  },
  bannerContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  banner: {
    width: "100%",
    aspectRatio: 2.2,
    borderRadius: 12,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    marginRight: 5,
  },
  categoriesScroll: {
    marginHorizontal: -15,
  },
  categoryScrollContent: {
    paddingHorizontal: 15,
    paddingRight: 15,
  },
  categoryCard: {
    alignItems: "center",
    width: 90,
    marginRight: 15,
  },
  categoryImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ff3f6c",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  dealsScroll: {
    marginHorizontal: -15,
  },
  dealCard: {
    width: 280,
    height: 150,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 15,
  },
  dealTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  productCard: {
    marginBottom: 0,
    borderRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    aspectRatio: 0.75,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    fontWeight: "500",
  },
  loader: {
    marginTop: 50,
  },
});
