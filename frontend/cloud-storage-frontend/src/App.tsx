import "./App.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Suspense, lazy, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PublicSharePage = lazy(() => import("./components/PublicSharePage"));
const StoragePage = lazy(() => import("./components/StoragePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));

const AppContent = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show navbar only if user is logged in */}
      {user && <Navbar />}
      
      {/* Sidebar and content below */}
      <div className={`flex flex-1 ${user ? 'pt-16' : ''}`}>
        {user && <Sidebar />}
        
        <div className="flex-1">
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            <Routes>
              {/* Public routes - redirect to dashboard if already logged in */}
              <Route
                path="/register"
                element={user ? <Navigate to="/dashboard" /> : <Register />}
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" /> : <Login />}
              />

              {/* Home page - redirect to login if not authenticated */}
              <Route
                path="/"
                element={
                  user ? (
                    <main className="text-gray-800 p-6 pt-12">
                      <h1 className="text-5xl font-bold">Welcome to ShareHub!</h1>
                    </main>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Password recovery */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Public share */}
              <Route path="/shared/:shareId" element={<PublicSharePage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/storage"
                element={
                  <PrivateRoute>
                    <StoragePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/general"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />

              {/* Error pages */}
              <Route path="/error/404" element={<ErrorPage code={404} />} />
              <Route path="/error/500" element={<ErrorPage code={500} />} />
              <Route path="*" element={<ErrorPage code={404} />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;