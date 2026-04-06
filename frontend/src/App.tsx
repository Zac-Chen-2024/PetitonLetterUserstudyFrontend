import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import VideoPage from './video/VideoPage';

function VideoAppShell() {
  return (
    <AppProvider projectIdOverride="dr_hu_eb1a">
      <VideoPage />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '13px',
            padding: '10px 16px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' }, duration: 4000 },
        }}
      />
    </AppProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mapping" replace />} />
      <Route path="/mapping" element={<VideoAppShell />} />
      <Route path="/video" element={<Navigate to="/mapping" replace />} />
      <Route path="*" element={<Navigate to="/mapping" replace />} />
    </Routes>
  );
}
