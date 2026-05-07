import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import CollegeDetail from './pages/CollegeDetail.jsx';
import Colleges from './pages/Colleges.jsx';
import Compare from './pages/Compare.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import SavedColleges from './pages/SavedColleges.jsx';
import Signup from './pages/Signup.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="colleges" element={<Colleges />} />
        <Route path="colleges/:id" element={<CollegeDetail />} />
        <Route path="compare" element={<Compare />} />
        <Route path="saved" element={<SavedColleges />} />
      </Route>
      <Route path="auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
