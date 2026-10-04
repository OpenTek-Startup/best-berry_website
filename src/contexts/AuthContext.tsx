import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { account, teams, TEAM_BACKOFFICE_ID } from '@/lib/appwrite';
import type { Models } from 'appwrite';

interface AuthContextValue {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  role: string | null;
  /** true une fois qu'on a confirmé que l'utilisateur connecté appartient bien
   * à l'équipe "backoffice". Reste `false` tant que ce n'est pas vérifié,
   * y compris pendant le chargement — ne jamais s'y fier avant `loading === false`. */
  isAuthorized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordRecovery: (email: string) => Promise<void>;
  completePasswordRecovery: (userId: string, secret: string, password: string) => Promise<void>;
  updateOwnPassword: (motDePasseActuel: string, nouveauMotDePasse: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Si le lien envoyé par email pour la réinitialisation du mot de passe doit
// pointer vers un autre domaine que celui en cours (rare), on peut le forcer
// via VITE_SITE_URL dans .env ; sinon on utilise l'origine actuelle.
const SITE_URL = (import.meta.env.VITE_SITE_URL as string) || window.location.origin;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const verifierAppartenanceEquipe = async () => {
    try {
      const res = await teams.list();
      return res.teams.some((equipe) => equipe.$id === TEAM_BACKOFFICE_ID);
    } catch {
      // Si l'appel échoue (ex: Appwrite pas encore configuré), on refuse
      // l'accès par défaut plutôt que de l'accorder.
      return false;
    }
  };

  const refresh = async () => {
    try {
      const current = await account.get();
      setUser(current);
      setIsAuthorized(await verifierAppartenanceEquipe());
    } catch {
      setUser(null);
      setIsAuthorized(false);
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
    try {
      await account.deleteSession('current');
    } finally {
      setUser(null);
      setIsAuthorized(false);
    }
  };

  const requestPasswordRecovery = async (email: string) => {
    await account.createRecovery(email, `${SITE_URL}/backoffice/reinitialiser-mot-de-passe`);
  };

  const completePasswordRecovery = async (userId: string, secret: string, password: string) => {
    await account.updateRecovery(userId, secret, password);
  };

  const updateOwnPassword = async (motDePasseActuel: string, nouveauMotDePasse: string) => {
    await account.updatePassword(nouveauMotDePasse, motDePasseActuel);
  };

  // Le rôle affiché dans l'interface est informatif (ex: "direction",
  // "secrétariat"), stocké en "label" Appwrite (recommandé, car modifiable
  // seulement côté serveur/console) ou à défaut dans les préférences du
  // compte. C'est l'appartenance à l'équipe "backoffice" (isAuthorized) qui
  // contrôle réellement l'accès — jamais ce champ. Voir SETUP.md.
  const prefs = user?.prefs as (Models.Preferences & { role?: string }) | undefined;
  const role = (user?.labels?.[0] as string | undefined) ?? prefs?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user, loading, role, isAuthorized,
        login, logout, requestPasswordRecovery, completePasswordRecovery, updateOwnPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
