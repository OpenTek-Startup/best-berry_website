import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { BackofficeLayout } from '@/components/backoffice/BackofficeLayout';
import { ProtectedRoute } from '@/components/backoffice/ProtectedRoute';

import { Home } from '@/pages/public/Home';
import { NotreEcole } from '@/pages/public/NotreEcole';
import { Actualites } from '@/pages/public/Actualites';
import { Galerie } from '@/pages/public/Galerie';
import { Equipe } from '@/pages/public/Equipe';
import { Calendrier } from '@/pages/public/Calendrier';
import { Admissions } from '@/pages/public/Admissions';
import { Contact } from '@/pages/public/Contact';

import { Login } from '@/pages/backoffice/Login';
import { Dashboard } from '@/pages/backoffice/Dashboard';
import { Inscriptions } from '@/pages/backoffice/Inscriptions';
import { GererActualites } from '@/pages/backoffice/GererActualites';
import { GererGalerie } from '@/pages/backoffice/GererGalerie';
import { GererCalendrier } from '@/pages/backoffice/GererCalendrier';
import { GererEquipe } from '@/pages/backoffice/GererEquipe';
import { PagesAdmin } from '@/pages/backoffice/PagesAdmin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Front office */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ecole" element={<NotreEcole />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/galerie" element={<Galerie />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/calendrier" element={<Calendrier />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Backoffice */}
          <Route path="/backoffice/connexion" element={<Login />} />
          <Route
            path="/backoffice"
            element={
              <ProtectedRoute>
                <BackofficeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inscriptions" element={<Inscriptions />} />
            <Route path="actualites" element={<GererActualites />} />
            <Route path="galerie" element={<GererGalerie />} />
            <Route path="calendrier" element={<GererCalendrier />} />
            <Route path="equipe" element={<GererEquipe />} />
            <Route path="contenu" element={<PagesAdmin />} />
          </Route>

          {/* 404 -> retour à l'accueil */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
