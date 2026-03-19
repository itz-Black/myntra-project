import { LOCAL_API, REMOTE_API } from "@/constants/api";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2, Bookmark, BookmarkCheck } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "../../theme/themeContext";


export default function Bag() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [bag, setbag] = useState<any>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchproduct = useCallback(async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(
          `${REMOTE_API}/bag/${user._id}`
        );
        setbag(bag.data);
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
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Please login to view your bag</Text>
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
  const activeItems = bag?.filter((item: any) => !item.isSaved) || [];
  const savedItems = bag?.filter((item: any) => item.isSaved) || [];

  const total = activeItems.reduce(
    (sum: any, item: any) => sum + item.productId.price * item.quantity,
    0
  );

  const handledelete=async(itemid:any)=>{
    try {
      await axios.delete(`${REMOTE_API}/bag/${itemid}`)
      fetchproduct();
    } catch (error) {
      console.log(error)
    }
  }

  const handleToggleSave = async (itemId: string, currentStatus: boolean) => {
    try {
      setTogglingId(itemId);
      await axios.put(`${REMOTE_API}/bag/status/${itemId}`, {
        isSaved: !currentStatus,
      });
      await fetchproduct();
    } catch (error) {
      console.log(error);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Shopping Bag</Text>
      </View>

      <ScrollView style={styles.content}>
        {activeItems.map((item: any) => (
          <View key={item._id} style={[styles.bagItem, { backgroundColor: theme.card, shadowColor: theme.shadow }, togglingId === item._id && { opacity: 0.5 }]}>
            <Image
              source={{ uri: item.productId.images[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={[styles.brandName, { color: theme.textSecondary }]}>{item.productId.brand}</Text>
              <Text style={[styles.itemName, { color: theme.text }]}>{item.productId.name}</Text>
              <Text style={[styles.itemSize, { color: theme.textSecondary }]}>Size: {item.size}</Text>
              <Text style={[styles.itemPrice, { color: theme.text }]}>₹{item.productId.price}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton}>
                  <Minus size={20} color={theme.icon} />
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: theme.text }]}>{item.quantity}</Text>
                <TouchableOpacity style={styles.quantityButton}>
                  <Plus size={20} color={theme.icon} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleSave(item._id, false)}>
                  <Bookmark size={20} color={theme.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={()=>handledelete(item._id)}>
                  <Trash2 size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {savedItems.length > 0 && (
          <View style={styles.savedSection}>
            <View style={[styles.savedHeader, { borderBottomColor: theme.border }]}>
               <BookmarkCheck size={20} color={theme.textSecondary} />
               <Text style={[styles.savedTitle, { color: theme.textSecondary }]}>Saved for Later ({savedItems.length} Items)</Text>
            </View>
            {savedItems.map((item: any) => (
              <View key={item._id} style={[styles.bagItem, styles.savedItem, { backgroundColor: theme.card, shadowColor: theme.shadow }, togglingId === item._id && { opacity: 0.5 }]}>
                <Image
                  source={{ uri: item.productId.images[0] }}
                  style={[styles.itemImage, styles.savedItemImage]}
                />
                <View style={styles.itemInfo}>
                  <Text style={[styles.brandName, { color: theme.textSecondary }]}>{item.productId.brand}</Text>
                  <Text style={[styles.itemName, { color: theme.text }]}>{item.productId.name}</Text>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>₹{item.productId.price}</Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={[styles.moveToCartButton, { borderColor: theme.primary }]}
                      onPress={() => handleToggleSave(item._id, true)}
                    >
                      <Text style={[styles.moveToCartText, { color: theme.primary }]}>MOVE TO CART</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={()=>handledelete(item._id)}>
                      <Trash2 size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{height: 40}} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>₹{total}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
        </TouchableOpacity>
      </View>
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
  bagItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
    marginBottom: 5,
  },
  itemSize: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f5f5f5", // Leaving light gray for button background shape
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  actionButton: {
    marginLeft: 15,
    padding: 10,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  savedSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    gap: 8,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  savedItem: {
    opacity: 0.85,
  },
  savedItemImage: {
    width: 80,
    height: 100,
  },
  moveToCartButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 'auto',
    minHeight: 44,
    justifyContent: "center",
  },
  moveToCartText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
