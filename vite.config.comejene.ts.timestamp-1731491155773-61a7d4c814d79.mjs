// vite.config.comejene.ts
import { svelte } from "file:///D:/Programing/1.lang-TypeScript/nicolive-comeview-extension/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { resolve } from "path";
import { defineConfig } from "file:///D:/Programing/1.lang-TypeScript/nicolive-comeview-extension/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "D:\\Programing\\1.lang-TypeScript\\nicolive-comeview-extension";
var vite_config_comejene_default = defineConfig({
  root: "./src/comejene",
  plugins: [
    svelte()
    // zipPack({ outDir: ".", outFileName: "comejene.zip" }),
  ],
  build: {
    outDir: resolve(__vite_injected_original_dirname, "./dist-comejene"),
    // outDir: "./dist-comejene",
    rollupOptions: {
      input: {
        main: "./src/comejene/index.html"
      }
    }
  }
});
export {
  vite_config_comejene_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuY29tZWplbmUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9ncmFtaW5nXFxcXDEubGFuZy1UeXBlU2NyaXB0XFxcXG5pY29saXZlLWNvbWV2aWV3LWV4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvZ3JhbWluZ1xcXFwxLmxhbmctVHlwZVNjcmlwdFxcXFxuaWNvbGl2ZS1jb21ldmlldy1leHRlbnNpb25cXFxcdml0ZS5jb25maWcuY29tZWplbmUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2dyYW1pbmcvMS5sYW5nLVR5cGVTY3JpcHQvbmljb2xpdmUtY29tZXZpZXctZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLmNvbWVqZW5lLnRzXCI7aW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbi8vIGltcG9ydCB6aXBQYWNrIGZyb20gXCJ2aXRlLXBsdWdpbi16aXAtcGFja1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiBcIi4vc3JjL2NvbWVqZW5lXCIsXG5cbiAgcGx1Z2luczogW1xuICAgIHN2ZWx0ZSgpLFxuICAgIC8vIHppcFBhY2soeyBvdXREaXI6IFwiLlwiLCBvdXRGaWxlTmFtZTogXCJjb21lamVuZS56aXBcIiB9KSxcbiAgXSxcblxuICBidWlsZDoge1xuICAgIG91dERpcjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9kaXN0LWNvbWVqZW5lXCIpLFxuICAgIC8vIG91dERpcjogXCIuL2Rpc3QtY29tZWplbmVcIixcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiBcIi4vc3JjL2NvbWVqZW5lL2luZGV4Lmh0bWxcIlxuICAgICAgfVxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlgsU0FBUyxjQUFjO0FBQ3BaLFNBQVMsZUFBZTtBQUN4QixTQUFTLG9CQUFvQjtBQUY3QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLCtCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFFTixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxFQUVUO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxRQUFRLFFBQVEsa0NBQVcsaUJBQWlCO0FBQUE7QUFBQSxJQUU1QyxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
