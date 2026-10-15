import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Assets gateway (workers/assets-gateway) is a same-origin Worker route in
        // production. In dev, proxy to the deployed gateway, or set ASSETS_GW_DEV_ORIGIN
        // to a local `wrangler dev` (e.g. http://localhost:8788).
        '/api/assets-gw': {
          target: process.env.ASSETS_GW_DEV_ORIGIN || 'https://renderdragon.org',
          changeOrigin: true,
          secure: true,
        },
        '/api/stats': {
          target: 'https://analytics.codersoft.xyz',
          changeOrigin: true,
          secure: true,
        },
        '/api/track': {
          target: 'https://analytics.codersoft.xyz',
          changeOrigin: true,
          secure: true,
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/mci-proxy': {
          target: 'https://hydrogenchloride.vercel.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mci-proxy/, '/api/assets'),
          secure: false,
        },
      },
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        'html2canvas',
        '@radix-ui/react-primitive',
        '@radix-ui/react-use-callback-ref',
        '@radix-ui/react-use-controllable-state',
        '@radix-ui/react-use-layout-effect',
        '@radix-ui/react-use-previous',
        '@radix-ui/react-visually-hidden',
        'aria-hidden',
        'react-remove-scroll',
        '@radix-ui/react-context',
        '@radix-ui/react-compose-refs'
      ]
    },
    build: {
      assetsDir: "static",
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-framer': ['framer-motion'],
            'vendor-icons': ['@tabler/icons-react'],
          },
        },
      },
    },
  };
});
