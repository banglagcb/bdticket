import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole, LoginRequest, LoginResponse } from "@shared/api";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
  loading: boolean;
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
  ],
  manager: [
    "view_tickets",
    "create_bookings",
    "confirm_sales",
    "view_all_bookings",
  ],
  staff: ["view_tickets", "create_bookings", "partial_payments"],
};

// Mock user data for development
const MOCK_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin" as UserRole,
    name: "Admin User",
    email: "admin@bdticketpro.com",
    phone: "+8801234567890",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "manager",
    password: "manager123",
    role: "manager" as UserRole,
    name: "Manager User",
    email: "manager@bdticketpro.com",
    phone: "+8801234567891",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    username: "staff",
    password: "staff123",
    role: "staff" as UserRole,
    name: "Staff User",
    email: "staff@bdticketpro.com",
    phone: "+8801234567892",
    createdAt: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("bd_ticket_pro_token");
    const userData = localStorage.getItem("bd_ticket_pro_user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("bd_ticket_pro_token");
        localStorage.removeItem("bd_ticket_pro_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      const mockUser = MOCK_USERS.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password,
      );

      if (mockUser) {
        const { password, ...userWithoutPassword } = mockUser;
        const token = `mock_token_${mockUser.id}_${Date.now()}`;

        localStorage.setItem("bd_ticket_pro_token", token);
        localStorage.setItem(
          "bd_ticket_pro_user",
          JSON.stringify(userWithoutPassword),
        );

        setUser(userWithoutPassword);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("bd_ticket_pro_token");
    localStorage.removeItem("bd_ticket_pro_user");
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isRole,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
