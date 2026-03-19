import { LOCAL_API, REMOTE_API } from "@/constants/api";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Package,
  Heart,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  ReceiptText,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  Menu,
} from "lucide-react-native";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../../theme/themeContext";
import axios from "axios";

const menuItems = [
  { icon: Package, label: "Orders", route: "/orders" },
  { icon: ReceiptText, label: "My Transactions", route: "/transactions" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: CreditCard, label: "Payment Methods", route: "/payments" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    offers: true,
    orderUpdates: true,
    cartReminders: true,
  });

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newPrefs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newPrefs);
    try {
      if (user) {
        await axios.put(`${LOCAL_API}/user/preferences/${user._id}`, { preferences: newPrefs });
      }
    } catch (error) {
      console.log("Failed to update preferences", error);
    }
  };

  const handleLogout = () => {
    logout()
    router.replace("/");
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        </View>
        <View style={styles.emptyState}>
          <User size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your profile
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity>
           <Menu size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.userInfo, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <User size={40} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.menuItemLeft}>
              {isDarkMode ? (
                <Moon size={24} color={theme.icon} />
              ) : (
                <Sun size={24} color={theme.icon} />
              )}
              <Text style={[styles.menuItemLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
            />
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={`menu-${index}`}
              style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={24} color={theme.icon} />
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <ChevronRight size={24} color={theme.iconInactive} />
            </TouchableOpacity>
          ))}
          
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: theme.textSecondary }]}>Notification Settings</Text>
          </View>
          
          <View style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.menuItemLeft}>
              <Bell size={24} color={theme.icon} />
              <Text style={[styles.menuItemLabel, { color: theme.text }]}>Promotional Offers</Text>
            </View>
            <Switch
              value={notifications.offers}
              onValueChange={() => toggleNotification('offers')}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={notifications.offers ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.menuItemLeft}>
              <Package size={24} color={theme.icon} />
              <Text style={[styles.menuItemLabel, { color: theme.text }]}>Order Updates</Text>
            </View>
            <Switch
              value={notifications.orderUpdates}
              onValueChange={() => toggleNotification('orderUpdates')}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={notifications.orderUpdates ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.menuItemLeft}>
              <Bell size={24} color={theme.icon} />
              <Text style={[styles.menuItemLabel, { color: theme.text }]}>Cart Reminders</Text>
            </View>
            <Switch
              value={notifications.cartReminders}
              onValueChange={() => toggleNotification('cartReminders')}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={notifications.cartReminders ? "#fff" : "#f4f3f4"}
            />
          </View>

        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: theme.primary }]} 
          onPress={handleLogout}
        >
          <LogOut size={24} color={theme.primary} />
          <Text style={[styles.logoutText, { color: theme.primary }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color removed to support theme overrides inline
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ff3f6c",
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
  },
  menuSection: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
