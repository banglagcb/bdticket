import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
    // Performance optimizations
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: mode === "development",
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-toast',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-switch',
            '@radix-ui/react-label',
            '@radix-ui/react-avatar',
            '@radix-ui/react-separator',
          ],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Remove console logs in production
    ...(mode === "production" && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    }),
  },
  plugins: [react({
    // Enable Fast Refresh for better development experience
    fastRefresh: true,
    // Optimize JSX transform
    jsxImportSource: '@emotion/react',
    plugins: [
      // Add plugins for performance
      ["@swc/plugin-emotion", {}],
    ],
  }), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-popover",
      "@radix-ui/react-toast",
    ],
    exclude: ["@react-three/fiber", "@react-three/drei", "three"], // Exclude heavy 3D libs if not used
  },
  // CSS optimization
  css: {
    devSourcemap: mode === "development",
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // If using SCSS
      },
    },
  },
  // Enable gzip compression and other optimizations
  preview: {
    port: 8080,
    host: "::",
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
