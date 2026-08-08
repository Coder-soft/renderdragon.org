
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './global.css';
import '@fontsource/geist-sans';
import '@fontsource/geist-mono';
import '@fontsource/jetbrains-mono';

import wisp, { init } from "@renderdragonorg/wisp";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const wispSecret = import.meta.env.VITE_WISP_SECRET;

if (convexUrl) {
  init({ convexUrl, wispSecret: wispSecret || undefined });
}

// expose for console debugging
if (import.meta.env.DEV) {
  (window as Window & { __wisp?: typeof wisp }).__wisp = wisp;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
