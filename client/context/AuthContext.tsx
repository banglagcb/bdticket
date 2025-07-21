import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole, LoginRequest } from "@shared/api";
import { apiClient } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERMISSIONS = {
  admin: [
    "view_buying_price",
    "edit_batches",
    "delete_batches",
    "create_batches",
    "view_profit",
    "override_locks",
    "manage_users",
    "view_all_bookings",
    "confirm_sales",
    "system_settings",
  ],
  manager: [
    "view_tickets",
    "create_bookings",
    "confirm_sales",
    "view_all_bookings",
  ],
  staff: ["view_tickets", "create_bookings", "partial_payments"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle HMR properly
  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept();
    }
  }, []);

  useEffect(() => {
    // Check for stored auth data
    const token = localStorage.getItem("bd_ticket_pro_token");
    const userData = localStorage.getItem("bd_ticket_pro_user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Optionally verify token with server
        // apiClient.getCurrentUser().then(setUser).catch(() => {
        //   localStorage.removeItem('bd_ticket_pro_token');
        //   localStorage.removeItem('bd_ticket_pro_user');
        // });
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("bd_ticket_pro_token");
        localStorage.removeItem("bd_ticket_pro_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await apiClient.login(credentials);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    apiClient.logout().catch(console.error);
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("bd_ticket_pro_user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isRole,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During HMR, context might be temporarily undefined
    if (import.meta.hot) {
      console.warn("AuthContext undefined during hot reload, returning default values");
      return {
        user: null,
        login: async () => false,
        logout: () => {},
        hasPermission: () => false,
        isRole: () => false,
        loading: true,
        updateUser: () => {},
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
