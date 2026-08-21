import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: "./src/components/index.ts",
      formats: ["es"]
    },
    rollupOptions: {
      external: ["preact", "preact/hooks", "@ikas/component-utils"]
    }
  }
});
