import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['./assets/css/main.css'],
  devtools: { enabled: true },
  // experimental: {
  //   typedPages: true,
  // },
  modules: ['@nuxt/content', '@nuxt/eslint', '@vueuse/nuxt', 'nuxt-typed-router'],
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  vite: {
    optimizeDeps: {
      include: [],
    },
    plugins: [tailwindcss()],
  },
})
