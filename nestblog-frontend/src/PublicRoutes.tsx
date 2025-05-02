// src/PublicRoutes.tsx
import { Route, Routes } from 'react-router-dom';
import RequestAccountPage from './auth/RequestAccountPage';

const PublicRoutes = () => (
  <Routes>
    <Route path="/request-account" element={<RequestAccountPage />} />
+  </Routes>
);

export default PublicRoutes;