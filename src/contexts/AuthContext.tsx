import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserRole = 'owner' | 'manager' | 'sales_staff' | 'inventory_staff' | 'customer' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: UserRole;
  isOwner: boolean;
  isManager: boolean;
  isSalesStaff: boolean;
  isInventoryStaff: boolean;
  permissions: Record<string, boolean>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const isOwner = userRole === 'owner';
  const isManager = userRole === 'manager';
  const isSalesStaff = userRole === 'sales_staff';
  const isInventoryStaff = userRole === 'inventory_staff';

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        await fetchUserRole(initialSession.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        (async () => {
          await fetchUserRole(newSession.user.id);
        })();
      } else {
        setIsAdmin(false);
        setUserRole(null);
        setPermissions({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('roles(name, permissions)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        setIsAdmin(false);
        setUserRole(null);
        setPermissions({});
        return;
      }

      const roleName = data?.roles?.name as UserRole;
      const rolePermissions = (data?.roles?.permissions as Record<string, boolean>) || {};

      setUserRole(roleName);
      setPermissions(rolePermissions);
      setIsAdmin(['owner', 'manager', 'sales_staff', 'inventory_staff'].includes(roleName ?? ''));
    } catch {
      setIsAdmin(false);
      setUserRole(null);
      setPermissions({});
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'customer' },
        },
      });
      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setUserRole(null);
    setPermissions({});
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      session, user, loading, isAdmin, userRole,
      isOwner, isManager, isSalesStaff, isInventoryStaff,
      permissions, signIn, signUp, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
