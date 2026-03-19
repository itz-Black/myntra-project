import { REMOTE_API } from "@/constants/api";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { useTheme } from "../../theme/themeContext";

export default function TabTwoScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const cardWidth = width >= 768 ? "48%" : "100%";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any>(null);

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(`${REMOTE_API}/category`);
        setcategories(cat.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);

  useEffect(() => {
    if (category && categories && categories.length > 0) {
      setSelectedCategory(category as string);
    }
  }, [category, categories]);

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Categories</Text>
        </View>
        <Text style={[{ textAlign: "center", marginTop: 20, color: theme.textSecondary }]}>
          No Categories found
        </Text>
      </View>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
  };
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };

  const filtercategories = categories?.filter((cat: any) => {
    const query = searchQuery.toLowerCase();
    const matchName = cat.name.toLowerCase().includes(query);
    const matchSub = (cat.subcategory || []).some((sub: any) =>
      sub.toLowerCase().includes(query)
    );
    const matchProd = (cat.productId || []).some(
      (product: any) =>
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
    );
    return matchName || matchSub || matchProd;
  });

  const selectedcategorydata = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;

  const renderProducts = (products: any) => {
    return products?.map((product: any) => (
      <TouchableOpacity
        key={product._id}
        style={[styles.productCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={[styles.brandName, { color: theme.textSecondary }]}>
            {product.brand}
          </Text>
          <Text style={[styles.productName, { color: theme.text }]}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              ₹{product.price}
            </Text>
            <Text style={[styles.discount, { color: theme.primary }]}>
              {product.discount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Categories</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for products, brands and more"
            placeholderTextColor={theme.iconInactive}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Categories Grid */}
        {!selectedCategory && (
          <View style={styles.categoriesGrid}>
            {filtercategories?.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.categoryCard,
                  { width: cardWidth, backgroundColor: theme.card, shadowColor: theme.shadow },
                ]}
                onPress={() => handleCategorySelect(cat._id)}
              >
                <Image
                  source={{ uri: cat.image }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <View style={[styles.categoryInfo, { backgroundColor: theme.card }]}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {cat.name}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.subcategories}>
                      {(cat.subcategory || []).map((sub: any, index: any) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.subcategoryTag, { backgroundColor: theme.inputBackground }]}
                          onPress={() => handleSubcategorySelect(sub)}
                        >
                          <Text style={[styles.subcategoryText, { color: theme.textSecondary }]}>
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Detail View */}
        {selectedcategorydata && (
          <View style={styles.categoryDetail}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.backButtonText, { color: theme.primary }]}>
                  ← Back to Categories
                </Text>
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>
                {selectedcategorydata.name}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesScroll}
            >
              {(selectedcategorydata.subcategory || []).map(
                (sub: any, index: any) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.subcategoryButton,
                      { backgroundColor: theme.inputBackground },
                      selectedSubcategory === sub && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => handleSubcategorySelect(sub)}
                  >
                    <Text
                      style={[
                        styles.subcategoryButtonText,
                        { color: selectedSubcategory === sub ? "#fff" : theme.text },
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            <View style={styles.productsGrid}>
              {renderProducts(selectedcategorydata?.productId)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    padding: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    borderRadius: 10,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: 200,
  },
  categoryInfo: {
    padding: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subcategories: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subcategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  subcategoryText: {
    fontSize: 14,
  },
  categoryDetail: {
    flex: 1,
    padding: 15,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subcategoriesScroll: {
    marginBottom: 15,
  },
  subcategoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  subcategoryButtonText: {
    fontSize: 14,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 200,
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
  },
});
