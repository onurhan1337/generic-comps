import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "path";

/**
 * generic-comps vitrin sitesi.
 * Demo sayfaları bileşenlerin GERÇEK kaynak kodunu kullanır — böylece
 * vitrindeki örnek ile mağazadaki bileşen arasında sürüm farkı oluşmaz.
 * ikas SDK'ları tarayıcıda mevcut olmadığı için hafif taklitlerle değiştirilir.
 */
export default defineConfig({
  root: __dirname,
  base: "/generic-comps/",
  plugins: [preact()],
  resolve: {
    alias: {
      "@ikas/component-utils": resolve(__dirname, "src/ikas-taklit/component-utils.ts"),
      "@ikas/bp-storefront": resolve(__dirname, "src/ikas-taklit/bp-storefront.tsx"),
    },
  },
  build: {
    outDir: resolve(__dirname, "../docs"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        anasayfa: resolve(__dirname, "index.html"),
        hafta01: resolve(__dirname, "hafta-01/index.html"),
      },
    },
  },
});
