import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@components/layout/Layout';
import { Home } from '@pages/Home';
import { SearchPage } from '@pages/Search';
import { History } from '@pages/History';
import { Recommendations } from '@pages/Recommendations';
import { MyDocuments } from '@pages/MyDocuments';
import { Settings } from '@pages/Settings';
import { Dashboard } from '@pages/Dashboard';
import { Analyze } from '@pages/Analyze';
import { Keywords } from '@pages/Keywords';
import { Welcome } from '@pages/Welcome';
import { ROUTES } from '@/utils/constants';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.WELCOME} element={<Welcome />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to={ROUTES.WELCOME} replace />} />
          <Route path="inicio"           element={<Home />} />
          <Route path="busqueda"         element={<SearchPage />} />
          <Route path="biblioteca"       element={<History />} />
          <Route path="recomendaciones"  element={<Recommendations />} />
          <Route path="mis-documentos"   element={<MyDocuments />} />
          <Route path="configuracion"    element={<Settings />} />
          <Route path="dashboard"        element={<Dashboard />} />
          <Route path="analyze"          element={<Analyze />} />
          <Route path="keywords"         element={<Keywords />} />
          {/* Legacy redirects */}
          <Route path="history"  element={<Navigate to={ROUTES.LIBRARY} replace />} />
          <Route path="*"        element={<Navigate to={ROUTES.WELCOME} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
