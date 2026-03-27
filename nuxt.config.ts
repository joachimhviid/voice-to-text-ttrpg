import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  icon: {
    clientBundle: {
      scan: true,
    },
  },
  modules: ['@nuxt/content', '@nuxt/eslint', '@vueuse/nuxt', 'nuxt-typed-router', '@nuxt/icon'],
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
    plugins: [tailwindcss()],
  },
})
