import "./App.css"
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./src/context/AuthProvider";
import PrivateRoute from "./src/components/PrivateRoute";
import Navbar from "./src/components/Navbar";
import Sidebar from "./src/components/Sidebar";
import { Suspense, lazy } from "react";


const Login = lazy(() => import("./src/pages/Login"));
const Register = lazy(() => import("./src/pages/Register"));
const Dashboard = lazy(() => import("./src/pages/Dashboard"));
const ForgotPassword = lazy(() => import("./src/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./src/pages/ResetPassword"));
const PublicSharePage = lazy(() => import("./src/components/PublicSharePage"));
const StoragePage = lazy(() => import("./src/components/StoragePage"));
const ProfilePage = lazy(() => import("./src/pages/ProfilePage"));
const SettingsPage = lazy(() => import("./src/pages/SettingsPage"));
const ErrorPage = lazy(() => import("./src/components/ErrorPage"));



function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 ml-64">
            <Navbar />

            {/*  Suspense boundary for lazy-loaded routes */}
            <Suspense fallback={<div className="p-6">Loading...</div>}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <main className="flex flex-col items-center justify-center text-gray-800 p-6">
                      <h1 className="text-4xl font-bold mb-4">
                        Welcome to Your App
                      </h1>

                      <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <button
                          onClick={() => setCount((count) => count + 1)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Count is {count}
                        </button>
                        <p className="mt-4 text-sm text-gray-600">
                          Edit <code>src/App.tsx</code> and save to test HMR
                        </p>
                      </div>
                    </main>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/shared/:shareId" element={<PublicSharePage />} />
                <Route path="/settings/storage" element={<StoragePage />} />
                <Route path="/settings/profile" element={<ProfilePage />} />
                <Route path="/settings/general" element={<SettingsPage />} />
                <Route path="/error/404" element={<ErrorPage code={404} />} />
                <Route path="/error/500" element={<ErrorPage code={500} />} />
                <Route path="*" element={<ErrorPage code={404} />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
