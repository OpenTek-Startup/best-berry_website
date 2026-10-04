import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export function ReinitialiserMotDePasse() {
  const { completePasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lienInvalide = !userId || !secret;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setEnregistrement(true);
    try {
      await completePasswordRecovery(userId!, secret!, motDePasse);
      setSucces(true);
      setTimeout(() => navigate('/backoffice/connexion'), 2500);
    } catch {
      setErreur('Ce lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau.');
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="min-h-screen bg-leaf-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md border border-leaf-100 p-8">
        <img src={logo} alt="Best Berry" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold text-center text-leaf-900 mb-6">
          Réinitialiser le mot de passe
        </h1>

        {lienInvalide ? (
          <p className="text-sm text-berry-600 text-center">
            Ce lien est incomplet ou invalide. Repartez de{' '}
            <Link to="/backoffice/mot-de-passe-oublie" className="font-semibold underline">
              la demande de réinitialisation
            </Link>.
          </p>
        ) : succes ? (
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto text-leaf-600 mb-3" size={32} />
            <p className="text-sm text-ink-700">
              Mot de passe mis à jour. Redirection vers la connexion&hellip;
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Nouveau mot de passe</label>
              <input
                type="password" required minLength={8} value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Confirmer le mot de passe</label>
              <input
                type="password" required minLength={8} value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
              />
            </div>
            {erreur && <p className="text-berry-600 text-sm font-medium">{erreur}</p>}
            <button
              type="submit" disabled={enregistrement}
              className="w-full py-3 rounded-full bg-leaf-600 text-white font-bold hover:bg-leaf-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {enregistrement && <Loader2 className="animate-spin" size={18} />}
              Mettre à jour le mot de passe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
