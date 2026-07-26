
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './global.css';
import '@fontsource/geist-sans';
import '@fontsource/geist-mono';
import '@fontsource/jetbrains-mono';

import wisp, { init } from "@renderdragonorg/wisp";
import { bindSupabase } from "@renderdragonorg/wisp/supabase";
import { supabase } from "@/integrations/supabase/client";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const wispSecret = import.meta.env.VITE_WISP_SECRET;

if (convexUrl) {
  init({ convexUrl, wispSecret: wispSecret || undefined });
  bindSupabase(supabase);
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
