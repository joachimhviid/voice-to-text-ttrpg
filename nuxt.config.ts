// import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // css: ['./app/assets/css/main.css'],
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxtjs/tailwindcss'],
  // vite: {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-expect-error untyped
  //   plugins: [tailwindcss()],
  // },
})
