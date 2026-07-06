
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './global.css';
import '@fontsource/geist-sans';
import '@fontsource/geist-mono';
import '@fontsource/jetbrains-mono';

import { PostHogProvider } from 'posthog-js/react'
import wisp, { init } from "@renderdragonorg/wisp";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
}

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (convexUrl) {
  init({ convexUrl });
}

// expose for console debugging
if (import.meta.env.DEV) {
  (window as any).__wisp = wisp;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);
