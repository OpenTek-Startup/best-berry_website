import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import { ArcDivider } from '@/components/ui/ArcDivider';

function IconeFacebook() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function IconeInstagram() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const phone = import.meta.env.VITE_SCHOOL_PHONE || '+237 6XX XXX XXX';
  const email = import.meta.env.VITE_SCHOOL_EMAIL || 'contact@bestberry.cm';
  const address = import.meta.env.VITE_SCHOOL_ADDRESS || 'Yaoundé, Cameroun';

  return (
    <footer className="bg-leaf-900 text-leaf-50 relative">
      <ArcDivider color="var(--color-paper)" />
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-10 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src={logo} alt="Best Berry" className="h-12 w-12 object-contain rounded-full bg-white p-0.5" />
            <span className="font-display font-bold text-lg">Best Berry</span>
          </div>
          <p className="text-leaf-100 text-sm">
            Complexe Scolaire Bilingue Best Berry — Yaoundé, Cameroun.
          </p>
        </div>

        <div className="text-sm space-y-2">
          <p className="flex items-center gap-2"><MapPin size={16} className="text-sun-300 shrink-0" /> {address}</p>
          <p className="flex items-center gap-2"><Phone size={16} className="text-sun-300 shrink-0" /> {phone}</p>
          <p className="flex items-center gap-2"><Mail size={16} className="text-sun-300 shrink-0" /> {email}</p>
        </div>

        <div>
          <p className="font-display font-semibold mb-2">{t('footer.suivez_nous')}</p>
          <div className="flex gap-3">
            <a href="https://web.facebook.com/profile.php?id=61556749220904" target="_blank" rel="noreferrer"
              className="h-10 w-10 rounded-full bg-leaf-700 flex items-center justify-center hover:bg-sun-500 transition-colors">
              <IconeFacebook />
            </a>
            <a href="https://www.instagram.com/csbbestberry/" target="_blank" rel="noreferrer"
              className="h-10 w-10 rounded-full bg-leaf-700 flex items-center justify-center hover:bg-sun-500 transition-colors">
              <IconeInstagram />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-leaf-700 text-center text-xs text-leaf-300 py-4">
        © {new Date().getFullYear()} Best Berry. {t('footer.droits')}
      </div>
    </footer>
  );
}
