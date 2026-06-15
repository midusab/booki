import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationToasts } from "./components/NotificationToast";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
        <NotificationToasts />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
