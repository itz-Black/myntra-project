import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag, ChevronLeft } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../../theme/themeContext";
import axios from "axios";
import { addRecentlyViewed } from "@/utils/storage";
import { LOCAL_API, REMOTE_API } from "@/constants/api";
import RecommendationCarousel from "@/components/RecommendationCarousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleCartAbandonmentReminder } from "../../services/NotificationService";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [product, setproduct] = useState<any>(null);
  const [iswishlist, setiswishlist] = useState(false);

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const product = await axios.get(`${REMOTE_API}/product/${id}`);
        setproduct(product.data);
        if (product.data) {
          // 1. Update local recently-viewed list (for carousel)
          await addRecentlyViewed({
            _id: product.data._id || id,
            name: product.data.name,
            brand: product.data.brand,
            price: product.data.price,
            discount: product.data.discount,
            image: product.data.images?.[0] || "",
          });

          // 2. Update server-side browsing history
          if (user?._id) {
            try {
              await axios.post(`${REMOTE_API}/user/history`, {
                userId: user._id,
                productId: product.data._id || id,
              });
            } catch (histErr) {
              console.log("History sync skipped:", histErr);
            }
          }
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, [id, user?._id]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [product]);

  const startAutoScroll = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      if (product && product.images && product.images.length > 1 && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000);
  };

  const handleAddwishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await axios.post(`${REMOTE_API}/wishlist`, {
        userId: user._id,
        productId: id,
      });
      setiswishlist(true);
      router.push("/wishlist");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToBag = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${REMOTE_API}/bag`, {
        userId: user._id,
        productId: id,
        size: selectedSize,
        quantity: 1,
      });

      // ── Schedule cart abandonment reminder ─────────────────────
      try {
        const notifId = await scheduleCartAbandonmentReminder(product?.name || "your item");
        if (Platform.OS !== "web") {
          await AsyncStorage.setItem("cart_abandon_notification_id", notifId);
        } else {
          localStorage.setItem("cart_abandon_notification_id", notifId);
        }
      } catch (notifErr) {
        console.log("Cart abandonment notification skipped:", notifErr);
      }

      router.push("/bag");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);

    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerNav, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <ChevronLeft size={24} color={theme.text} />
         </TouchableOpacity>
         <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{product.brand}</Text>
         <TouchableOpacity onPress={() => router.push("/bag")}>
           <ShoppingBag size={24} color={theme.text} />
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainLayout, width >= 768 && styles.mainLayoutWide]}>
          {/* ── Image Carousel ─────────────────────────────────────── */}
          <View style={[styles.carouselContainer, width >= 768 && styles.carouselContainerWide]}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {(product.images || []).map((image: any, index: any) => (
                <View key={index}>
                  <Image
                    source={{ uri: image }}
                    style={[styles.productImage, { width: width >= 768 ? width * 0.4 : width }]}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.pagination}>
              {(product.images || []).map((_: any, index: any) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index ? { backgroundColor: theme.primary, width: 12 } : { backgroundColor: theme.iconInactive }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Product Details ────────────────────────────────────── */}
          <View style={[styles.content, width >= 768 && styles.contentWide]}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.brand, { color: theme.textSecondary }]}>{product.brand}</Text>
                <Text style={[styles.name, { color: theme.text }]}>{product.name}</Text>
              </View>
              <TouchableOpacity style={styles.wishlistButton} onPress={handleAddwishlist}>
                <Heart
                  size={24}
                  color={iswishlist ? theme.primary : theme.iconInactive}
                  fill={iswishlist ? theme.primary : "none"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.text }]}>₹{product.price}</Text>
              <Text style={[styles.discount, { color: theme.primary }]}>{product.discount}</Text>
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]}>{product.description}</Text>

            <View style={styles.sizeSection}>
              <Text style={[styles.sizeTitle, { color: theme.text }]}>Select Size</Text>
              <View style={styles.sizeGrid}>
                {(product.sizes || []).map((size: any) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      { borderColor: theme.border },
                      selectedSize === size && { borderColor: theme.primary, backgroundColor: theme.primary + "1A" }
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeText, { color: theme.text }, selectedSize === size && { color: theme.primary, fontWeight: 'bold' }]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <RecommendationCarousel
          currentProduct={{ _id: product._id, category: product.category, tags: product.tags, color: product.color }}
          userId={user?._id ?? null}
          onWishlistChange={undefined}
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.addToBagButton, { backgroundColor: theme.primary }]}
          onPress={handleAddToBag}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <ShoppingBag size={20} color="#fff" />
              <Text style={styles.addToBagText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainLayout: {
    flexDirection: "column",
  },
  mainLayoutWide: {
    flexDirection: "row",
    padding: 20,
    gap: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    position: "relative",
  },
  carouselContainerWide: {
    flex: 1,
    maxWidth: "50%",
    borderRadius: 12,
    overflow: "hidden",
  },
  productImage: {
    height: 450,
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 20,
  },
  contentWide: {
    flex: 1,
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  brand: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  wishlistButton: {
    padding: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 10,
  },
  discount: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  sizeSection: {
    marginBottom: 20,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sizeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  sizeText: {
    fontSize: 15,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
  },
  addToBagButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    gap: 10,
  },
  addToBagText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
