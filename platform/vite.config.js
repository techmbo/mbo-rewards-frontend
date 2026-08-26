import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production builds are served under the main MBO Rewards site:
//   https://www.mborewards.com/mbointegratedPlatform
// Local `vite` / `vite preview` keep root `/` unless VITE_BASE_PATH is set.
const PLATFORM_BASE = '/mbointegratedPlatform/'

export default defineConfig(({ mode, command }) => {
  const fromEnv = process.env.VITE_BASE_PATH
  const base =
    fromEnv !== undefined
      ? fromEnv
      : mode === 'production' || command === 'build'
        ? PLATFORM_BASE
        : '/'

  return {
    plugins: [react()],
    base,
  }
})
