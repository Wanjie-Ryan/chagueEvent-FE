import { useState, useEffect } from "react";
import api from "@/lib/api";

export type User = {
  userId: string;
  role: "admin" | "provider" | "client";
  username: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse user from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      // Surgical: Cache identity and token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { data: null, error: error.response?.data?.msg || "Login failed" };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data } = await api.post("/auth/register", { email, password, username });
      return { data, error: null };
    } catch (error: any) {
      console.error("Register Error:", error);
      return { data: null, error: error.response?.data?.msg || "Registration failed" };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isProvider = user?.role === "provider";

  return { user, isAdmin, isProvider, loading, signIn, signUp, signOut };
};
