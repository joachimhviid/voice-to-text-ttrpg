import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint'],
  serverDir: 'app/server/',
  srcDir: 'app/',
  vite: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error untyped
    plugins: [tailwindcss()],
  },
})
