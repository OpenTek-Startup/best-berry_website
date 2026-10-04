import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export function MotDePasseOublie() {
  const { requestPasswordRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await requestPasswordRecovery(email);
      // On affiche toujours le même message de succès, que l'email existe ou
      // non côté Appwrite, pour ne jamais révéler si une adresse a un compte.
      setEnvoye(true);
    } catch {
      setErreur("Impossible d'envoyer l'email pour le moment. Réessayez plus tard.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-leaf-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md border border-leaf-100 p-8">
        <img src={logo} alt="Best Berry" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold text-center text-leaf-900 mb-2">
          Mot de passe oublié
        </h1>

        {envoye ? (
          <div className="text-center py-4">
            <MailCheck className="mx-auto text-leaf-600 mb-3" size={32} />
            <p className="text-sm text-ink-700">
              Si un compte existe pour <strong>{email}</strong>, un email avec un lien de
              réinitialisation vient d&rsquo;être envoyé. Pensez à vérifier vos spams.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-500 text-center mb-6">
              Indiquez l&rsquo;adresse email de votre compte backoffice pour recevoir un lien
              de réinitialisation.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
                />
              </div>
              {erreur && <p className="text-berry-600 text-sm font-medium">{erreur}</p>}
              <button
                type="submit" disabled={envoi}
                className="w-full py-3 rounded-full bg-leaf-600 text-white font-bold hover:bg-leaf-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {envoi && <Loader2 className="animate-spin" size={18} />}
                Envoyer le lien
              </button>
            </form>
          </>
        )}

        <Link to="/backoffice/connexion" className="flex items-center justify-center gap-1 text-sm text-ink-500 hover:text-leaf-700 mt-6">
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
