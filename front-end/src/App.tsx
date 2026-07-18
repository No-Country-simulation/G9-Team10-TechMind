import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@components/layout/Layout';
import { Dashboard } from '@pages/Dashboard';
import { Analyze } from '@pages/Analyze';
import { History } from '@pages/History';
import { Keywords } from '@pages/Keywords';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Redirect root → dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analyze"   element={<Analyze />} />
          <Route path="history"   element={<History />} />
          <Route path="keywords"  element={<Keywords />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
