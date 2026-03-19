import { REMOTE_API } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { cancelAllScheduledNotifications, sendOrderPlacedNotification } from "../services/NotificationService";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../theme/themeContext";

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isPlacing, setIsPlacing] = useState(false);

  const [address, setAddress] = useState({
    fullName: "John Doe",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
  });

  const [payment, setPayment] = useState({
    cardNumber: "**** **** **** 4242",
    expiry: "12/25",
    cvv: "***",
  });

  const shippingAddress = `${address.fullName}, ${address.line1}, ${address.line2}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`;

  const handleplaceorder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      setIsPlacing(true);
      const res = await axios.post(`${REMOTE_API}/order/create/${user._id}`, {
        shippingAddress,
        paymentMethod: "Card",
      });
      const orderId = res.data?.order?._id || "";

      // ── Cancel any pending cart-abandonment reminders ──────────────────────
      try {
        await cancelAllScheduledNotifications();
        if (Platform.OS !== "web") {
          await AsyncStorage.removeItem("cart_abandon_notification_id");
        } else {
          localStorage.removeItem("cart_abandon_notification_id");
        }
      } catch (notifErr) {
        console.log("Error cancelling notification:", notifErr);
      }

      // ── Fire an immediate order-success local notification ─────────────────
      try {
        await sendOrderPlacedNotification(orderId);
      } catch (notifErr) {
        console.log("Order notification skipped:", notifErr);
      }

      Alert.alert("Order Placed! 🎉", "Your order has been placed successfully.", [
        { text: "View Orders", onPress: () => router.replace("/orders") },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Failed to place order", msg);
      console.log(error);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping Address</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Full Name"
              placeholderTextColor={theme.textSecondary}
              value={address.fullName}
              onChangeText={(t) => setAddress({ ...address, fullName: t })}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Address Line 1"
              placeholderTextColor={theme.textSecondary}
              value={address.line1}
              onChangeText={(t) => setAddress({ ...address, line1: t })}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Address Line 2"
              placeholderTextColor={theme.textSecondary}
              value={address.line2}
              onChangeText={(t) => setAddress({ ...address, line2: t })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="City"
                placeholderTextColor={theme.textSecondary}
                value={address.city}
                onChangeText={(t) => setAddress({ ...address, city: t })}
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="State"
                placeholderTextColor={theme.textSecondary}
                value={address.state}
                onChangeText={(t) => setAddress({ ...address, state: t })}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Postal Code"
                placeholderTextColor={theme.textSecondary}
                value={address.postalCode}
                onChangeText={(t) => setAddress({ ...address, postalCode: t })}
                keyboardType="number-pad"
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Country"
                placeholderTextColor={theme.textSecondary}
                value={address.country}
                onChangeText={(t) => setAddress({ ...address, country: t })}
              />
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Card Number"
              placeholderTextColor={theme.textSecondary}
              value={payment.cardNumber}
              onChangeText={(t) => setPayment({ ...payment, cardNumber: t })}
              keyboardType="number-pad"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Expiry Date (MM/YY)"
                placeholderTextColor={theme.textSecondary}
                value={payment.expiry}
                onChangeText={(t) => setPayment({ ...payment, expiry: t })}
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="CVV"
                placeholderTextColor={theme.textSecondary}
                value={payment.cvv}
                onChangeText={(t) => setPayment({ ...payment, cvv: t })}
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>₹3,798</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>FREE</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Tax (5%)</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>₹190</Text>
            </View>
            <View style={[styles.summaryRow, styles.total, { borderTopColor: theme.border }]}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: theme.primary }]}>₹3,988</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.placeOrderButton, { backgroundColor: theme.primary }, isPlacing && { opacity: 0.7 }]}
          onPress={handleplaceorder}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
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
  header: {
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
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  form: {
    gap: 10,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  summary: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  total: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
  },
  placeOrderButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
