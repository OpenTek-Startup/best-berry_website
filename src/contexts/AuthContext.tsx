import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import type { Models } from 'appwrite';

interface AuthContextValue {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const current = await account.get();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    await refresh();
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  // Le rôle est stocké dans les préférences du compte Appwrite (ex: { role: "direction" })
  // ou dans un "label" Appwrite (recommandé côté serveur pour éviter toute modification côté client.
  // Voir SETUP.md — section "Rôles et permissions").
  const prefs = user?.prefs as (Models.Preferences & { role?: string }) | undefined;
  const role = (user?.labels?.[0] as string | undefined) ?? prefs?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, loading, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
