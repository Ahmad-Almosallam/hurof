import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { HostDashboard } from './pages/host/HostDashboard';
import { PlayerBuzzerPage } from './pages/player/PlayerBuzzerPage';
import { TvDisplayPage } from './pages/tv/TvDisplayPage';
import { PhpSessionPage } from './pages/admin/PhpSessionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/host" element={<Navigate to="/host/dashboard" replace />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/play/:sessionId" element={<PlayerBuzzerPage />} />
        <Route path="/tv/:sessionId" element={<TvDisplayPage />} />
        <Route path="/php-session" element={<PhpSessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
