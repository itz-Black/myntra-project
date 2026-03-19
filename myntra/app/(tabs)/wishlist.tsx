import { LOCAL_API, REMOTE_API } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../theme/themeContext";

// const wishlistItems = [
//   {
//     id: 1,
//     name: "Premium Cotton T-Shirt",
//     brand: "H&M",
//     price: "₹799",
//     discount: "40% OFF",
//     image:
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Slim Fit Denim Jacket",
//     brand: "Levis",
//     price: "₹2999",
//     discount: "30% OFF",
//     image:
//       "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
//   },
// ];
export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [wishlist, setwishlist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchproduct = useCallback(async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(
          `${REMOTE_API}/wishlist/${user._id}`
        );
        setwishlist(bag.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchproduct();
  }, [fetchproduct]);
  const handledelete=async(itemid:any)=>{
    try {
      await axios.delete(`${REMOTE_API}/wishlist/${itemid}`)
      fetchproduct();
    } catch (error) {
      console.log(error)
    }
   
  }
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your wishlist
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Wishlist</Text>
      </View>

      <ScrollView style={styles.content}>
        {wishlist?.map((item:any) => (
          <View key={item._id} style={[styles.wishlistItem, { backgroundColor: theme.card, boxShadow: theme.shadow }]}>
            <Image  source={{ uri: item.productId.images[0] }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={[styles.brandName, { color: theme.textSecondary }]}>{item.productId.brand}</Text>
              <Text style={[styles.itemName, { color: theme.text }]}>{item.productId.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme.text }]}>{item.productId.price}</Text>
                <Text style={[styles.discount, { color: theme.primary }]}>{item.productId.discount}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={()=>handledelete(item._id)}>
              <Trash2 size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        ))}
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
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  wishlistItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
    overflow: "hidden",
  },
  itemImage: {
    width: 100,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    padding: 15,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  discount: {
    fontSize: 14,
  },
  removeButton: {
    padding: 15,
    justifyContent: "center",
  },
});
