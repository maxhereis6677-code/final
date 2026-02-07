import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_CREDENTIALS } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem("relieve-user");
    const savedAdmin = localStorage.getItem("relieve-admin");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedAdmin === "true") {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (error || !data) {
        return { success: false, error: "User not found" };
      }

      // In production, use proper password hashing
      if (data.password !== password) {
        return { success: false, error: "Invalid password" };
      }

      const userData: User = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        created_at: data.created_at,
      };

      setUser(userData);
      localStorage.setItem("relieve-user", JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (name: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (existing) {
        return { success: false, error: "Phone number already registered" };
      }

      const { data, error } = await supabase
        .from("users")
        .insert({ name, phone, password })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const userData: User = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        created_at: data.created_at,
      };

      setUser(userData);
      localStorage.setItem("relieve-user", JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("relieve-user");
  };

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Validate admin credentials from database
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      return { success: false, error: "Invalid admin credentials" };
    }

    setIsAdmin(true);
    localStorage.setItem("relieve-admin", "true");
    return { success: true };
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("relieve-admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
