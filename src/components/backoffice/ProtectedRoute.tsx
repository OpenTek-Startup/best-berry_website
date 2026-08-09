import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/StateBlocks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Chargement..." />;
  if (!user) return <Navigate to="/backoffice/connexion" replace />;

  return <>{children}</>;
}
