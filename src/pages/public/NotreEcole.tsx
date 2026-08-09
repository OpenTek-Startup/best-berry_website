import { useTranslation } from 'react-i18next';
import { usePageContenu } from '@/hooks/usePageContenu';
import { ArcDivider } from '@/components/ui/ArcDivider';
import { Loading } from '@/components/ui/StateBlocks';

const DEFAUT = {
  titre_fr: 'Notre école',
  titre_en: 'Our school',
  contenu_fr:
    "Le Complexe Scolaire Bilingue Best Berry accueille les enfants de la maternelle au primaire à Yaoundé. " +
    "Notre mission est d'offrir un apprentissage bilingue français-anglais de qualité, dans un cadre sécurisé et " +
    "bienveillant, où chaque enfant peut grandir avec confiance et curiosité.\n\n" +
    "Cette page est modifiable depuis l'espace administration par l'équipe de direction.",
  contenu_en:
    "Best Berry Bilingual School Complex welcomes children from nursery to primary school in Yaoundé. " +
    "Our mission is to offer quality French-English bilingual education in a safe and caring environment, " +
    "where every child can grow with confidence and curiosity.\n\n" +
    "This page can be edited from the admin area by the school's management team.",
};

export function NotreEcole() {
  const { i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const { contenu, loading } = usePageContenu('notre_ecole');

  if (loading) return <Loading label={fr ? 'Chargement...' : 'Loading...'} />;

  const donnees = contenu ?? DEFAUT;

  return (
    <div>
      <section className="bg-leaf-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="font-display text-4xl font-bold text-leaf-900 mb-6">
            {fr ? donnees.titre_fr : donnees.titre_en}
          </h1>
          <div className="prose prose-lg text-ink-700 whitespace-pre-line">
            {fr ? donnees.contenu_fr : donnees.contenu_en}
          </div>
        </div>
        <ArcDivider color="var(--color-paper)" />
      </section>
    </div>
  );
}
