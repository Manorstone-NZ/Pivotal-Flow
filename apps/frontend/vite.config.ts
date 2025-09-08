import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Use treemap for better visualization
    }),
  ],
  server: { 
    port: 5173,
    sourcemapIgnoreList: false, // Include source maps in dev
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true, // Generate source maps for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // Router and state management
          'router-state': ['react-router-dom', 'zustand'],
          // UI libraries
          'ui-vendor': ['@tanstack/react-query', 'react-hook-form'],
          // Utility libraries
          'utils': ['axios', 'clsx'],
        },
        // Optimize chunk names
        chunkFileNames: () => {
          // const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || ['asset'];
          const ext = info[info.length - 1];
          if (assetInfo.name && /\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
      external: [], // No external dependencies
    },
    // Bundle size limits (from E0 requirements)
    chunkSizeWarningLimit: 200, // 200KB limit per chunk
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'react-hook-form',
      'axios',
    ],
  },
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env['npm_package_version'] || '1.0.0'),
  },
});
