import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Groups } from './pages/Groups.tsx';
import { Expenses } from './pages/Expenses.tsx';
import { Profile } from './pages/Profile.tsx';
import { Invitations } from './pages/Invitations.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" />}
      />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups"
          element={user ? <Groups /> : <Navigate to="/login" />}
        />
        <Route
          path="/expenses"
          element={user ? <Expenses /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/invitations"
          element={user ? <Invitations /> : <Navigate to="/login" />}
        />
      </Route>
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
