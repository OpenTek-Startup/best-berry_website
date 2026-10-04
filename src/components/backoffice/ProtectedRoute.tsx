import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/StateBlocks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized } = useAuth();

  if (loading) return <Loading label="Chargement..." />;

  // Pas connecté du tout -> vers la page de connexion.
  if (!user) return <Navigate to="/backoffice/connexion" replace />;

  // Connecté mais pas membre de l'équipe "backoffice" -> accès refusé.
  // Ce cas peut survenir si un compte Appwrite existe sans avoir été ajouté
  // à l'équipe (voir SETUP.md, section 1.4).
  if (!isAuthorized) return <Navigate to="/backoffice/connexion?acces_refuse=1" replace />;

  return <>{children}</>;
}
