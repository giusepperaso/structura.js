import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "deep-merge-and-equal",
      fileName: (format) => `${format === "es" ? "index" : format}.js`,
    },
  },
});
