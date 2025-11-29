import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthProvider';
import PrivateRoute from './src/components/PrivateRoute';
import Navbar from './src/components/Navbar';
import Sidebar from './src/components/Sidebar';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import PublicSharePage from './src/components/PublicSharePage';
import StoragePage from "./src/components/StoragePage";


function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 ml-64">
            <Navbar />

            <Routes>
              <Route
                path="/"
                element={
                  <main className="flex flex-col items-center justify-center text-gray-800 p-6">
                    <div className="flex gap-6 mb-6">
                      <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                        <img src={viteLogo} className="h-16 hover:scale-110 transition-transform" alt="Vite logo" />
                      </a>
                      <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                        <img src={reactLogo} className="h-16 hover:scale-110 transition-transform" alt="React logo" />
                      </a>
                    </div>

                    <h1 className="text-4xl font-bold mb-4">Vite + React + Tailwind</h1>

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

                    <p className="mt-6 text-sm text-gray-500">
                      Click on the Vite and React logos to learn more
                    </p>
                  </main>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/shared/:shareId" element={<PublicSharePage />} />
              <Route path="/settings/storage" element={<StoragePage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
