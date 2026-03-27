import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// Automatically pick up new deployments without requiring a hard refresh.
// - visibilitychange: every time the tab/PWA comes to the foreground, ask the SW
//   to check for a new version.
// - controllerchange: fires when the new SW takes over; reload so the page uses
//   the freshly cached assets.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update();
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
