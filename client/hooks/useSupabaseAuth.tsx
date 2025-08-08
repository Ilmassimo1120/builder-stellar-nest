import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '@/lib/supabase';
import { UserRole, rbacService } from '@/lib/rbac';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name: string;
  phone?: string;
  company?: string;
  department?: string;
  businessAddress?: string;
  website?: string;
  verified?: boolean;
  permissions?: string[];
  registrationDate?: string;
  loginTime?: string;
}

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  isSales: boolean;
  isPartner: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  businessType?: string;
  licenseNumber?: string;
  yearsExperience?: string;
  servicesOffered?: string[];
  businessAddress?: string;
  website?: string;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const profile = await getUserProfile(supabaseUser.id);
      
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: profile.role as UserRole,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        name: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : profile.email?.split('@')[0] || 'User',
        phone: profile.phone || '',
        company: profile.company || '',
        department: profile.department || '',
        businessAddress: profile.business_address || '',
        website: profile.website || '',
        verified: profile.verified || false,
        permissions: rbacService.getRolePermissions(profile.role as UserRole),
        registrationDate: profile.created_at,
        loginTime: new Date().toISOString()
      };

      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // If profile doesn't exist, create a basic one
      const basicUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: UserRole.USER,
        name: supabaseUser.email?.split('@')[0] || 'User',
        permissions: rbacService.getRolePermissions(UserRole.USER),
        loginTime: new Date().toISOString()
      };
      setUser(basicUser);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Session will be set automatically by the auth state change listener
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            company: userData.company,
            phone: userData.phone,
            business_address: userData.businessAddress,
            website: userData.website
          }
        }
      });

      if (error) throw error;

      // The user profile will be created automatically by the database trigger
      // Additional profile data can be updated after email verification

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      // Update Supabase user profile
      const { error } = await supabase
        .from('users')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          company: userData.company,
          department: userData.department,
          phone: userData.phone,
          business_address: userData.businessAddress,
          website: userData.website
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      const updatedUser = {
        ...user,
        ...userData,
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : user.name
      };
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
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
    return user ? rbacService.canAccessResource(user.role, resource, action) : false;
  };

  // Role checking convenience properties
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.GLOBAL_ADMIN;
  const isGlobalAdmin = user?.role === UserRole.GLOBAL_ADMIN;
  const isSales = user?.role === UserRole.SALES;
  const isPartner = user?.role === UserRole.PARTNER;

  const value: SupabaseAuthContextType = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    isAdmin,
    isGlobalAdmin,
    isSales,
    isPartner
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireSupabaseAuth() {
  const auth = useSupabaseAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [auth.isAuthenticated, auth.isLoading]);
  
  return auth;
}
