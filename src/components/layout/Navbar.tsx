import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const links = [
  { to: '/', key: 'accueil' },
  { to: '/ecole', key: 'ecole' },
  { to: '/actualites', key: 'actualites' },
  { to: '/galerie', key: 'galerie' },
  { to: '/equipe', key: 'equipe' },
  { to: '/calendrier', key: 'calendrier' },
  { to: '/contact', key: 'contact' },
];

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleLang = () => {
    const next = i18n.language.startsWith('fr') ? 'en' : 'fr';
    i18n.changeLanguage(next);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
      isActive ? 'bg-leaf-600 text-white' : 'text-ink-700 hover:bg-leaf-50'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-leaf-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        <NavLink to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Best Berry" className="h-14 w-14 object-contain" />
          <span className="hidden sm:block font-display text-lg font-bold text-leaf-700 leading-tight">
            Best Berry
          </span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-full border-2 border-sun-500 text-sun-700 font-bold text-sm hover:bg-sun-50 transition-colors"
            aria-label="Changer de langue"
          >
            {i18n.language.startsWith('fr') ? 'EN' : 'FR'}
          </button>
          <NavLink
            to="/admissions"
            className="px-4 py-2 rounded-full bg-berry-600 text-white text-sm font-bold hover:bg-berry-700 transition-colors shadow-sm"
          >
            {t('nav.admissions')}
          </NavLink>
          <NavLink
            to="/backoffice"
            className="text-ink-500 hover:text-leaf-700 transition-colors"
            aria-label={t('nav.espace_admin')}
            title={t('nav.espace_admin')}
          >
            <ShieldCheck size={20} />
          </NavLink>
        </div>

        <button className="lg:hidden text-ink-900" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-leaf-100 px-4 py-4 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'} onClick={() => setOpen(false)}>
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
          <NavLink
            to="/admissions"
            onClick={() => setOpen(false)}
            className="block mt-2 px-4 py-2.5 rounded-full bg-berry-600 text-white text-sm font-bold text-center"
          >
            {t('nav.admissions')}
          </NavLink>
          <div className="flex items-center justify-between pt-2">
            <button onClick={toggleLang} className="px-3 py-1.5 rounded-full border-2 border-sun-500 text-sun-700 font-bold text-sm">
              {i18n.language.startsWith('fr') ? 'English' : 'Français'}
            </button>
            <NavLink to="/backoffice" onClick={() => setOpen(false)} className="text-ink-500 flex items-center gap-1 text-sm">
              <ShieldCheck size={18} /> {t('nav.espace_admin')}
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
