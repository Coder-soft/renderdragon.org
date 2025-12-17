// vite.config.ts
import { defineConfig, loadEnv } from "file:///F:/reddragon/renderdragon.org/node_modules/vite/dist/node/index.js";
import sitemap from "file:///F:/reddragon/renderdragon.org/node_modules/vite-plugin-sitemap/dist/index.js";
import react from "file:///F:/reddragon/renderdragon.org/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "F:\\reddragon\\renderdragon.org";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins: [
      sitemap({
        hostname: "https://renderdragon.org"
      }),
      react()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    optimizeDeps: {
      include: [
        "html2canvas",
        "@radix-ui/react-primitive",
        "@radix-ui/react-use-callback-ref",
        "@radix-ui/react-use-controllable-state",
        "@radix-ui/react-use-layout-effect",
        "@radix-ui/react-use-previous",
        "@radix-ui/react-visually-hidden",
        "aria-hidden",
        "react-remove-scroll",
        "@radix-ui/react-context",
        "@radix-ui/react-compose-refs"
      ]
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    },
    // Vite env configuration
    define: {
      "process.env": env
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxyZWRkcmFnb25cXFxccmVuZGVyZHJhZ29uLm9yZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxccmVkZHJhZ29uXFxcXHJlbmRlcmRyYWdvbi5vcmdcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3JlZGRyYWdvbi9yZW5kZXJkcmFnb24ub3JnL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHNpdGVtYXAgZnJvbSAndml0ZS1wbHVnaW4tc2l0ZW1hcCc7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgLy8gTG9hZCBlbnYgZmlsZSBiYXNlZCBvbiBgbW9kZWAgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXHJcbiAgLy8gU2V0IHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gJycgdG8gbG9hZCBhbGwgZW52IHJlZ2FyZGxlc3Mgb2YgdGhlIGBWSVRFX2AgcHJlZml4LlxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6IFwiOjpcIixcclxuICAgICAgcG9ydDogODA4MCxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICBzaXRlbWFwKHtcclxuICAgICAgICBob3N0bmFtZTogJ2h0dHBzOi8vcmVuZGVyZHJhZ29uLm9yZycsXHJcbiAgICAgIH0pLFxyXG4gICAgICByZWFjdCgpLFxyXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAnaHRtbDJjYW52YXMnLFxyXG4gICAgICAgICdAcmFkaXgtdWkvcmVhY3QtcHJpbWl0aXZlJyxcclxuICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXVzZS1jYWxsYmFjay1yZWYnLFxyXG4gICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdXNlLWNvbnRyb2xsYWJsZS1zdGF0ZScsXHJcbiAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC11c2UtbGF5b3V0LWVmZmVjdCcsXHJcbiAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC11c2UtcHJldmlvdXMnLFxyXG4gICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdmlzdWFsbHktaGlkZGVuJyxcclxuICAgICAgICAnYXJpYS1oaWRkZW4nLFxyXG4gICAgICAgICdyZWFjdC1yZW1vdmUtc2Nyb2xsJyxcclxuICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNvbnRleHQnLFxyXG4gICAgICAgICdAcmFkaXgtdWkvcmVhY3QtY29tcG9zZS1yZWZzJ1xyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XHJcbiAgICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXSxcclxuICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gVml0ZSBlbnYgY29uZmlndXJhdGlvblxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdwcm9jZXNzLmVudic6IGVudlxyXG4gICAgfVxyXG4gIH07XHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1EsU0FBUyxjQUFjLGVBQWU7QUFDclQsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFHeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxNQUNELE1BQU07QUFBQSxJQUNSLEVBQUUsT0FBTyxPQUFPO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGlCQUFpQjtBQUFBLFFBQ2YsU0FBUyxDQUFDLGNBQWM7QUFBQSxRQUN4Qix5QkFBeUI7QUFBQSxNQUMzQjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sZUFBZTtBQUFBLElBQ2pCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
