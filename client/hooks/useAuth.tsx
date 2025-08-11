import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserRole, rbacService } from "@/lib/rbac";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  businessType?: string;
  licenseNumber?: string;
  yearsExperience?: string;
  servicesOffered?: string[];
  businessAddress?: string;
  website?: string;
  role: UserRole;
  registrationDate?: string;
  loginTime?: string;
  verified?: boolean;
  department?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  isSales: boolean;
  isPartner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem("chargeSourceUser");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user session:", error);
        localStorage.removeItem("chargeSourceUser");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password combination
      // In a real app, this would validate against a backend
      let role: UserRole = UserRole.USER;
      let company = "Demo Electrical Services";
      let department = "General";

      // Determine role based on email patterns
      if (
        email.includes("globaladmin") ||
        email === "globaladmin@chargesource.com.au"
      ) {
        role = UserRole.GLOBAL_ADMIN;
        company = "ChargeSource Global";
        department = "Global Administration";
      } else if (
        email.includes("admin") ||
        email === "admin@chargesource.com.au"
      ) {
        role = UserRole.ADMIN;
        company = "ChargeSource Administration";
        department = "Administration";
      } else if (email.includes("sales") || email.includes("sale")) {
        role = UserRole.SALES;
        company = "ChargeSource Sales";
        department = "Sales & Marketing";
      } else if (email.includes("partner")) {
        role = UserRole.PARTNER;
        company = "Partner Organization";
        department = "Partnership";
      }

      // Generate a proper UUID for compatibility with database
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const userData: User = {
        id: generateUUID(),
        email,
        name: email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        company,
        department,
        role,
        loginTime: new Date().toISOString(),
        permissions: rbacService.getRolePermissions(role),
        verified: true,
      };

      setUser(userData);
      localStorage.setItem("chargeSourceUser", JSON.stringify(userData));

      if (rememberMe) {
        localStorage.setItem("chargeSourceRememberMe", "true");
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // Generate a proper UUID for compatibility with database
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        company: userData.companyName,
        businessType: userData.businessType,
        licenseNumber: userData.licenseNumber,
        yearsExperience: userData.yearsExperience,
        servicesOffered: userData.servicesOffered,
        businessAddress: userData.businessAddress,
        website: userData.website,
        role: UserRole.USER,
        permissions: rbacService.getRolePermissions(UserRole.USER),
        registrationDate: new Date().toISOString(),
        verified: false,
      };

      setUser(newUser);
      localStorage.setItem("chargeSourceUser", JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chargeSourceUser");
    localStorage.removeItem("chargeSourceRememberMe");
    // Also clear any project data if desired
    // localStorage.removeItem('chargeSourceProjects');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("chargeSourceUser", JSON.stringify(updatedUser));
    }
  };

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    return user ? rbacService.hasPermission(user.role, permission) : false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return user ? rbacService.hasAnyPermission(user.role, permissions) : false;
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return user ? rbacService.hasAllPermissions(user.role, permissions) : false;
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    return user
      ? rbacService.canAccessResource(user.role, resource, action)
      : false;
  };

  // Role checking convenience properties
  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.GLOBAL_ADMIN;
  const isGlobalAdmin = user?.role === UserRole.GLOBAL_ADMIN;
  const isSales = user?.role === UserRole.SALES;
  const isPartner = user?.role === UserRole.PARTNER;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    isAdmin,
    isGlobalAdmin,
    isSales,
    isPartner,
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

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return auth;
}
