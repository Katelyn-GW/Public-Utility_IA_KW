import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** Runs before import analysis so `TITLE.png` / `submark.png` etc. exist (see `scripts/ensure-splash.mjs`). */
function ensureSplashPlugin() {
  return {
    name: 'ensure-splash-plugin',
    enforce: 'pre' as const,
    config() {
      const script = path.join(rootDir, 'scripts', 'ensure-splash.mjs')
      spawnSync(process.execPath, [script], {
        cwd: rootDir,
        stdio: 'inherit',
      })
    },
  }
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(rootDir, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    ensureSplashPlugin(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(rootDir, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow external tunnel domains for phone testing.
    allowedHosts: ['.loca.lt', '.localhost.run', '.ngrok-free.app'],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
