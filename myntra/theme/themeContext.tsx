import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, ThemeType } from "./lightTheme";
import { darkTheme } from "./darkTheme";

type ThemeContextType = {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === "dark");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load saved theme from storage on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("appTheme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          // If no saved theme, default to system preference
          setIsDarkMode(systemColorScheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load theme from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // Listen for system theme changes ONLY IF user hasn't manually overridden it
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const checkOverride = async () => {
        const savedTheme = await AsyncStorage.getItem("appTheme");
        if (!savedTheme) {
          setIsDarkMode(colorScheme === "dark");
        }
      };
      checkOverride();
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem("appTheme", newMode ? "dark" : "light");
    } catch (error) {
      console.error("Failed to save theme to storage:", error);
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDarkMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
