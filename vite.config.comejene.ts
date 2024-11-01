import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import { defineConfig } from "vite";
// import zipPack from "vite-plugin-zip-pack";

export default defineConfig({
  root: "./src/comejene",

  plugins: [
    svelte(),
    // zipPack({ outDir: ".", outFileName: "comejene.zip" }),
  ],

  build: {
    outDir: resolve(__dirname, "./dist-comejene"),
    // outDir: "./dist-comejene",
    rollupOptions: {
      input: {
        main: "./src/comejene/index.html"
      }
    },
  },
});
