import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { usePageContenu } from '@/hooks/usePageContenu';

interface DonneesContact {
  telephone?: string;
  email?: string;
  adresse?: string;
  horaires_fr?: string;
  horaires_en?: string;
}

export function Contact() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const { contenu } = usePageContenu('contact');

  // Les coordonnées sont éditables depuis le backoffice (clé "contact",
  // champ JSON "donnees_json"). Tant qu'elles ne sont pas configurées, on
  // retombe sur les variables d'environnement définies au déploiement.
  const donnees: DonneesContact = contenu?.donnees_json ? JSON.parse(contenu.donnees_json) : {};
  const phone = donnees.telephone || import.meta.env.VITE_SCHOOL_PHONE || '+237 6XX XXX XXX';
  const email = donnees.email || import.meta.env.VITE_SCHOOL_EMAIL || 'contact@bestberry.cm';
  const address = donnees.adresse || import.meta.env.VITE_SCHOOL_ADDRESS || 'Yaoundé, Cameroun';
  const horaires = (fr ? donnees.horaires_fr : donnees.horaires_en)
    || (fr ? 'Lun–Ven, 7h30–15h30' : 'Mon–Fri, 7:30am–3:30pm');

  const items = [
    { icon: MapPin, label: t('footer.adresse'), value: address },
    { icon: Phone, label: t('footer.telephone'), value: phone },
    { icon: Mail, label: t('footer.email'), value: email },
    { icon: Clock, label: fr ? 'Horaires du secrétariat' : 'Office hours', value: horaires },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-8">{t('nav.contact')}</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-leaf-100 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-500 font-semibold">{label}</p>
              <p className="text-ink-900 font-medium">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
