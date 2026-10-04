import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export function Login() {
  const { t } = useTranslation();
  const { login, logout, user, isAuthorized, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accesRefuse = searchParams.get('acces_refuse') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && user && isAuthorized) return <Navigate to="/backoffice" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/backoffice');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-leaf-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md border border-leaf-100 p-8">
        <img src={logo} alt="Best Berry" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold text-center text-leaf-900 mb-6">
          {t('backoffice.connexion')}
        </h1>

        {accesRefuse && (
          <div className="mb-5 p-3 rounded-xl bg-sun-50 border border-sun-200 text-sun-800 text-sm flex items-start gap-2">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>
              Ce compte n&rsquo;a pas encore accès au backoffice. Contactez la direction pour
              être ajouté à l&rsquo;équipe autorisée.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">{t('backoffice.email')}</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-ink-700">{t('backoffice.mot_de_passe')}</label>
              <Link to="/backoffice/mot-de-passe-oublie" className="text-xs font-semibold text-leaf-700 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
            />
          </div>
          {error && <p className="text-berry-600 text-sm font-medium">{error}</p>}
          <button
            type="submit" disabled={submitting}
            className="w-full py-3 rounded-full bg-leaf-600 text-white font-bold hover:bg-leaf-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={18} />}
            {t('backoffice.se_connecter')}
          </button>
        </form>

        {user && !isAuthorized && !authLoading && (
          <button
            onClick={() => logout()}
            className="w-full mt-4 text-xs text-ink-500 hover:text-ink-700 text-center"
          >
            Se déconnecter du compte actuel
          </button>
        )}
      </div>
    </div>
  );
}
