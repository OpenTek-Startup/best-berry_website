import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { databases, DB_ID, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Newspaper, Images, CalendarDays, Users, ArrowRight } from 'lucide-react';

interface Stat {
  label: string;
  value: number | null;
  icon: typeof FileText;
  to: string;
  accent: string;
}

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Nouvelles demandes', value: null, icon: FileText, to: '/backoffice/inscriptions', accent: 'bg-berry-100 text-berry-700' },
    { label: 'Actualités publiées', value: null, icon: Newspaper, to: '/backoffice/actualites', accent: 'bg-leaf-100 text-leaf-700' },
    { label: 'Albums galerie', value: null, icon: Images, to: '/backoffice/galerie', accent: 'bg-sun-100 text-sun-700' },
    { label: "Membres de l'équipe", value: null, icon: Users, to: '/backoffice/equipe', accent: 'bg-blue-100 text-blue-700' },
  ]);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      databases.listDocuments(DB_ID, COLLECTIONS.inscriptions, [Query.equal('statut', 'nouveau'), Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.actualites, [Query.equal('publie', true), Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.galerie, [Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.staff, [Query.limit(1)]),
    ]).then((results) => {
      if (!active) return;
      setStats((prev) =>
        prev.map((s, i) => {
          const r = results[i];
          return { ...s, value: r.status === 'fulfilled' ? r.value.total : 0 };
        }),
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-leaf-900 mb-1">
        {t('backoffice.tableau_de_bord')}
      </h1>
      <p className="text-ink-500 mb-8">
        {user?.name ? `Bienvenue, ${user.name}.` : 'Bienvenue.'} Voici un aperçu du site Best Berry.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(({ label, value, icon: Icon, to, accent }) => (
          <Link
            key={label}
            to={to}
            className="p-5 rounded-3xl bg-white border border-leaf-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
          >
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${accent}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-3xl font-display font-extrabold text-ink-900">
                {value === null ? '—' : value}
              </p>
              <p className="text-sm text-ink-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-leaf-50 border border-leaf-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-leaf-700" size={22} />
          <p className="text-sm text-ink-700">
            Pensez à tenir le calendrier scolaire et les actualités à jour pour les familles.
          </p>
        </div>
        <Link to="/backoffice/calendrier" className="flex items-center gap-1 text-sm font-bold text-leaf-700 hover:underline">
          Gérer le calendrier <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
