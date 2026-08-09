import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GraduationCap, Globe2, HeartHandshake, Sparkles } from 'lucide-react';
import { ArcDivider } from '@/components/ui/ArcDivider';
import { usePageContenu } from '@/hooks/usePageContenu';
import logo from '@/assets/logo.jpg';

const atouts = [
  { icon: Globe2, key: 'bilinguisme', fr: 'Enseignement bilingue FR/EN', en: 'Bilingual FR/EN teaching', desc_fr: 'Un apprentissage équilibré dans les deux langues, dès la maternelle.', desc_en: 'Balanced learning in both languages, starting from nursery.' },
  { icon: GraduationCap, key: 'pedagogie', fr: 'Pédagogie active', en: 'Hands-on pedagogy', desc_fr: 'Des méthodes qui donnent envie d\u2019apprendre et de comprendre.', desc_en: 'Methods that make children want to learn and understand.' },
  { icon: HeartHandshake, key: 'encadrement', fr: 'Encadrement bienveillant', en: 'Caring supervision', desc_fr: 'Une équipe attentive à l\u2019épanouissement de chaque enfant.', desc_en: 'A team attentive to every child\u2019s wellbeing.' },
  { icon: Sparkles, key: 'epanouissement', fr: 'Activités d\u2019éveil', en: 'Enrichment activities', desc_fr: 'Sport, arts et culture pour grandir en confiance.', desc_en: 'Sports, arts and culture to grow with confidence.' },
];

export function Home() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  // Le titre et le sous-titre du hero sont éditables depuis le backoffice
  // (clé "accueil_hero"). Tant qu'ils ne sont pas configurés, on garde les
  // textes par défaut des fichiers de traduction.
  const { contenu: hero } = usePageContenu('accueil_hero');
  const heroTitre = hero ? (fr ? hero.titre_fr : hero.titre_en) : t('hero.titre');
  const heroSousTitre = hero ? (fr ? hero.contenu_fr : hero.contenu_en) : t('hero.sous_titre');

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-leaf-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-sun-100 text-sun-700 font-bold text-xs tracking-wide uppercase px-3 py-1 rounded-full mb-4">
              Complexe Scolaire Bilingue
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-leaf-900 leading-tight mb-5">
              {heroTitre}
            </h1>
            <p className="text-ink-700 text-lg mb-8 max-w-xl">{heroSousTitre}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admissions" className="px-6 py-3 rounded-full bg-berry-600 text-white font-bold shadow hover:bg-berry-700 transition-colors">
                {t('hero.cta_admission')}
              </Link>
              <Link to="/ecole" className="px-6 py-3 rounded-full border-2 border-leaf-600 text-leaf-700 font-bold hover:bg-leaf-100 transition-colors">
                {t('hero.cta_ecole')}
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-sun-300 rounded-full blur-3xl opacity-30 scale-90" aria-hidden="true" />
              <img src={logo} alt="Best Berry" className="relative w-64 sm:w-80 drop-shadow-xl" />
            </div>
          </div>
        </div>
        <ArcDivider color="var(--color-paper)" />
      </section>

      {/* Atouts */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-leaf-900 text-center mb-12">
          {fr ? 'Pourquoi choisir Best Berry ?' : 'Why choose Best Berry?'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {atouts.map(({ icon: Icon, key, fr: titreFr, en: titreEn, desc_fr, desc_en }) => (
            <div key={key} className="p-6 rounded-3xl bg-white border border-leaf-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-leaf-100 text-leaf-700 flex items-center justify-center mb-4">
                <Icon size={24} />
              </div>
              <h3 className="font-display font-bold text-ink-900 mb-1.5">{fr ? titreFr : titreEn}</h3>
              <p className="text-sm text-ink-500">{fr ? desc_fr : desc_en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA admission */}
      <section className="relative bg-leaf-700">
        <ArcDivider color="var(--color-paper)" flip />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            {fr ? 'Inscrivez votre enfant dès aujourd\u2019hui' : 'Enroll your child today'}
          </h2>
          <p className="text-leaf-100 mb-8">
            {fr
              ? 'Le formulaire d\u2019admission en ligne prend quelques minutes. Notre équipe étudie chaque dossier avec attention.'
              : 'The online admission form takes just a few minutes. Our team reviews every file with care.'}
          </p>
          <Link to="/admissions" className="inline-block px-8 py-3.5 rounded-full bg-sun-500 text-leaf-900 font-bold hover:bg-sun-300 transition-colors">
            {t('hero.cta_admission')}
          </Link>
        </div>
      </section>
    </div>
  );
}
