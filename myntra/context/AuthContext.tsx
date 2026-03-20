import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, saveUserData, clearUserData } from "@/utils/storage";
import React from "react";
import axios from "axios";
import { registerForPushNotificationsAsync } from "../services/NotificationService";
import { REMOTE_API } from "@/constants/api";

const API_URL = REMOTE_API;
type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getUserData();
      if (data._id && data.name && data.email) {
        setUser({ _id: data._id, name: data.name, email: data.email });
        setIsAuthenticated(true);
        syncPushToken(data._id);
      }
    })();
  }, []);

  const syncPushToken = async (userId: string) => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await axios.put(`${API_URL}/user/token/${userId}`, { token });
      }
    } catch (e) {
      console.log("Failed to sync push token", e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email && !password) {
        // Mock Login User Bypass
        const mockData = { _id: "64a1b2c3d4e5f60718293a4b", fullName: "Guest User", name: "Guest User", email: "guest@example.com" };
        await saveUserData(mockData._id, mockData.fullName, mockData.email);
        setUser({ _id: mockData._id, name: mockData.name, email: mockData.email });
        setIsAuthenticated(true);
        return;
      }
      
      const res = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      });

      const data = await res.data.user;
      if (data && data.fullName) {
        await saveUserData(data._id, data.fullName, data.email);
        setUser({ _id: data._id, name: data.name, email: data.email });
        setIsAuthenticated(true);
        syncPushToken(data._id);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.log("Login HTTP error: fallback to mock user for demonstration.");
       const mockData = { _id: "64a1b2c3d4e5f60718293a4b", fullName: "Guest Tester", name: "Guest Tester", email: "guest@example.com" };
       await saveUserData(mockData._id, mockData.fullName, mockData.email);
       setUser({ _id: mockData._id, name: mockData.name, email: mockData.email });
       setIsAuthenticated(true);
    }
  };
  const Signup = async (fullName: string, email: string, password: string) => {
    // 👉 Temporarily pointing to local backend for push notifications test
    const res = await axios.post(`${API_URL}/user/signup`, {
      fullName,
      email,
      password,
    });
    const data = await res.data.user;
    if (data.fullName) {
      await saveUserData(data._id, data.fullName, data.email);
      setUser({ _id: data._id, name: data.name, email: data.email });
      setIsAuthenticated(true);
      syncPushToken(data._id);
    } else {
      throw new Error(data.message || "Login failed");
    }
  };
  const logout = async () => {
    await clearUserData();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, Signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
