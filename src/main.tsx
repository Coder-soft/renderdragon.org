
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
  if (wispSecret) {
    const endpoint = convexUrl
      .replace(".convex.cloud", ".convex.site")
      .replace(/\/$/, "") + "/ingest";
    init({
      transport: {
        async send(events, opts) {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-wisp-token": wispSecret,
            },
            body: JSON.stringify({ events }),
            keepalive: opts.beacon,
          });
        },
      },
    });
  } else {
    init({ convexUrl });
  }
}

// expose for console debugging
if (import.meta.env.DEV) {
  (window as any).__wisp = wisp;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
