import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveUserData = async (
  _id: string,
  name: string,
  email: string
) => {
  if (Platform.OS === "web") {
    localStorage.setItem("userid", _id);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
  } else {
    await SecureStore.setItemAsync("userid", _id);
    await SecureStore.setItemAsync("userName", name);
    await SecureStore.setItemAsync("userEmail", email);
  }
};

export const getUserData = async () => {
  if (Platform.OS === "web") {
    const _id = localStorage.getItem("userid");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    return { _id, name, email };
  } else {
    const _id = await SecureStore.getItemAsync("userid");
    const name = await SecureStore.getItemAsync("userName");
    const email = await SecureStore.getItemAsync("userEmail");
    return { _id, name, email };
  }
};

export const clearUserData = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  } else {
    await SecureStore.deleteItemAsync("userid");
    await SecureStore.deleteItemAsync("userName");
    await SecureStore.deleteItemAsync("userEmail");
  }
};

export interface RecentlyViewedProduct {
  _id: string; // Product ID
  name: string;
  brand: string;
  price: string | number;
  discount?: string;
  image: string; // The primary image
}

const RECENTLY_VIEWED_KEY = "recently_viewed_products";
const MAX_RECENT_ITEMS = 10;

/**
 * Gets the list of recently viewed products from local storage.
 */
export const getRecentlyViewed = async (): Promise<RecentlyViewedProduct[]> => {
  try {
    let item = null;
    if (Platform.OS === "web") {
      item = localStorage.getItem(RECENTLY_VIEWED_KEY);
    } else {
      item = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    }
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error reading recently viewed products:", error);
    return [];
  }
};

/**
 * Adds a product to the recently viewed list.
 * Prevents duplicates by moving existing to the top.
 * Enforces a maximum of MAX_RECENT_ITEMS.
 */
export const addRecentlyViewed = async (product: RecentlyViewedProduct): Promise<void> => {
  try {
    const currentList = await getRecentlyViewed();
    
    // Filter out the product if it already exists (to avoid duplicates)
    const filteredList = currentList.filter((p) => p._id !== product._id);
    
    // Add the new product to the beginning (most recent first)
    filteredList.unshift(product);
    
    // Limit to the maximum allowed items
    const limitedList = filteredList.slice(0, MAX_RECENT_ITEMS);
    
    const stringifiedList = JSON.stringify(limitedList);
    
    if (Platform.OS === "web") {
      localStorage.setItem(RECENTLY_VIEWED_KEY, stringifiedList);
    } else {
      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, stringifiedList);
    }
  } catch (error) {
    console.error("Error saving recently viewed product:", error);
  }
};
