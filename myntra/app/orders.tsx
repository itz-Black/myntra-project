import { REMOTE_API } from "@/constants/api";
import { useEffect, useState } from "react";
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
import {
  Package,
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
} from "lucide-react-native";
import React from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../theme/themeContext";

export default function Orders() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await axios.get(`${REMOTE_API}/order/user/${user._id}`);
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimestamp = (ts: string) => {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleString("en-IN");
    } catch {
      return ts;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Loading your orders...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <ShoppingBag size={64} color={theme.iconInactive} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Please login to view orders</Text>
        <TouchableOpacity style={[styles.loginButton, { backgroundColor: theme.primary }]} onPress={() => router.push("/login")}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
        </View>
        <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
          <Package size={64} color={theme.iconInactive} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Your placed orders will appear here.</Text>
          <TouchableOpacity style={[styles.shopButton, { backgroundColor: theme.primary }]} onPress={() => router.push("/(tabs)")}>
            <Text style={styles.shopButtonText}>START SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
      </View>

      <ScrollView style={styles.content}>
        {orders.map((order: any) => (
          <View key={order._id} style={[styles.orderCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            {/* Order Header */}
            <TouchableOpacity
              style={[styles.orderHeader, { borderBottomColor: theme.border }]}
              onPress={() => toggleOrderDetails(order._id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.orderId, { color: theme.text }]} numberOfLines={1}>
                  Order #{(order._id || "").slice(-10).toUpperCase()}
                </Text>
                <Text style={[styles.orderDate, { color: theme.textSecondary }]}>{formatDate(order.date)}</Text>
              </View>
              <View style={[styles.statusContainer, { backgroundColor: theme.success + '20' }]}>
                <Package size={14} color={theme.success} />
                <Text style={[styles.orderStatus, { color: theme.success }]}>{order.status || "Processing"}</Text>
              </View>
            </TouchableOpacity>

            {/* Items */}
            <View style={styles.itemsContainer}>
              {(order.items || []).map((item: any, idx: number) => {
                const product = item.productId || {};
                const image = Array.isArray(product.images)
                  ? product.images[0]
                  : product.images;
                return (
                  <View key={item._id || idx} style={styles.orderItem}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, styles.imagePlaceholder, { backgroundColor: theme.inputBackground }]}>
                        <Package size={24} color={theme.iconInactive} />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={[styles.brandName, { color: theme.textSecondary }]}>{product.brand || "Brand"}</Text>
                      <Text style={[styles.itemName, { color: theme.text }]}>{product.name || "Product"}</Text>
                      {item.size ? (
                        <Text style={[styles.itemSize, { color: theme.textSecondary }]}>Size: {item.size}</Text>
                      ) : null}
                      <Text style={[styles.itemPrice, { color: theme.text }]}>
                        ₹{product.price ?? item.price ?? 0}{" "}
                        {item.quantity > 1 ? `× ${item.quantity}` : ""}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Expanded Details */}
            {expandedOrder === order._id && (
              <View style={[styles.orderDetails, { borderTopColor: theme.border, backgroundColor: theme.inputBackground }]}>
                {/* Shipping Address */}
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <MapPin size={20} color={theme.text} />
                    <Text style={[styles.detailTitle, { color: theme.text }]}>Shipping Address</Text>
                  </View>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {order.shippingAddress || "N/A"}
                  </Text>
                </View>

                {/* Payment Method */}
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <CreditCard size={20} color={theme.text} />
                    <Text style={[styles.detailTitle, { color: theme.text }]}>Payment Method</Text>
                  </View>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {order.paymentMethod || "N/A"}
                  </Text>
                </View>

                {/* Tracking */}
                {order.tracking && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Truck size={20} color={theme.text} />
                      <Text style={[styles.detailTitle, { color: theme.text }]}>Tracking Information</Text>
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text style={[styles.trackingNumber, { color: theme.textSecondary }]}>
                        Tracking Number: {order.tracking.number || "N/A"}
                      </Text>
                      <Text style={[styles.trackingCarrier, { color: theme.textSecondary }]}>
                        Carrier: {order.tracking.carrier || "N/A"}
                      </Text>
                    </View>

                    {Array.isArray(order.tracking.timeline) &&
                      order.tracking.timeline.length > 0 && (
                        <View style={styles.timeline}>
                          {order.tracking.timeline.map(
                            (event: any, index: number) => (
                              <View key={index} style={styles.timelineEvent}>
                                <View style={[styles.timelinePoint, { backgroundColor: theme.primary }]} />
                                <View style={styles.timelineContent}>
                                  <Text style={[styles.timelineStatus, { color: theme.text }]}>
                                    {event.status}
                                  </Text>
                                  <Text style={[styles.timelineLocation, { color: theme.textSecondary }]}>
                                    {event.location}
                                  </Text>
                                  <Text style={[styles.timelineTimestamp, { color: theme.iconInactive }]}>
                                    {formatTimestamp(event.timestamp)}
                                  </Text>
                                </View>
                                {index !==
                                  order.tracking.timeline.length - 1 && (
                                  <View style={[styles.timelineLine, { backgroundColor: theme.primary + '20' }]} />
                                )}
                              </View>
                            )
                          )}
                        </View>
                      )}
                  </View>
                )}
              </View>
            )}

            {/* Order Footer */}
            <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Order Total</Text>
                <Text style={[styles.totalAmount, { color: theme.text }]}>₹{order.total ?? 0}</Text>
              </View>
              <TouchableOpacity
                style={[styles.detailsButton, { borderTopColor: theme.border }]}
                onPress={() => toggleOrderDetails(order._id)}
              >
                <Text style={[styles.detailsButtonText, { color: theme.primary }]}>
                  {expandedOrder === order._id ? "Hide Details" : "View Details"}
                </Text>
                <ChevronRight size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  shopButton: {
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  loginButton: {
    marginTop: 10,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
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
  orderCard: {
    borderRadius: 12,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 13,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
    marginLeft: 8,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemsContainer: {
    padding: 15,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  itemImage: {
    width: 75,
    height: 95,
    borderRadius: 6,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  brandName: {
    fontSize: 13,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 13,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
  },
  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
  },
  detailSection: {
    marginBottom: 18,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  trackingInfo: {
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 14,
    marginBottom: 4,
  },
  trackingCarrier: {
    fontSize: 14,
  },
  timeline: {
    marginTop: 10,
  },
  timelineEvent: {
    flexDirection: "row",
    marginBottom: 18,
    position: "relative",
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 16,
    width: 2,
    height: "100%",
  },
  timelineContent: {
    marginLeft: 12,
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 13,
    marginBottom: 2,
  },
  timelineTimestamp: {
    fontSize: 12,
  },
  orderFooter: {
    padding: 15,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 15,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  detailsButtonText: {
    fontSize: 15,
    marginRight: 4,
    fontWeight: "600",
  },
});
