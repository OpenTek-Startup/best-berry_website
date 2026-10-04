import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Newspaper, Images, CalendarDays, Users, FileEdit, UserCog, LogOut } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const items = [
  { to: '/backoffice', icon: LayoutDashboard, key: 'tableau_de_bord', end: true },
  { to: '/backoffice/inscriptions', icon: FileText, key: 'inscriptions' },
  { to: '/backoffice/actualites', icon: Newspaper, key: 'gerer_actualites' },
  { to: '/backoffice/galerie', icon: Images, key: 'gerer_galerie' },
  { to: '/backoffice/calendrier', icon: CalendarDays, key: 'gerer_calendrier' },
  { to: '/backoffice/equipe', icon: Users, key: 'gerer_equipe' },
  { to: '/backoffice/contenu', icon: FileEdit, key: 'gerer_contenu' },
];

export function BackofficeLayout() {
  const { t } = useTranslation();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/backoffice/connexion');
  };

  return (
    <div className="min-h-screen flex bg-leaf-50">
      <aside className="w-64 bg-leaf-900 text-leaf-50 flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-leaf-700">
          <img src={logo} alt="Best Berry" className="h-10 w-10 rounded-full bg-white p-0.5" />
          <span className="font-display font-bold">Best Berry</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, icon: Icon, key, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-leaf-600 text-white' : 'text-leaf-100 hover:bg-leaf-700'
                }`
              }
            >
              <Icon size={18} /> {t(`backoffice.${key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-leaf-700 space-y-2">
          <NavLink
            to="/backoffice/mon-compte"
            className={({ isActive }) =>
              `flex items-center gap-2 text-xs truncate ${isActive ? 'text-white font-semibold' : 'text-leaf-300 hover:text-white'}`
            }
          >
            <UserCog size={14} className="shrink-0" />
            <span className="truncate">{user?.name || user?.email} {role && `· ${role}`}</span>
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-leaf-100 hover:text-white">
            <LogOut size={16} /> {t('backoffice.deconnexion')}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
