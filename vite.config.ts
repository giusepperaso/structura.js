import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "structurajs",
      fileName: (format) => `${format === "es" ? "index" : format}.js`,
      formats: ["es", "cjs", "umd"],
    },
  },
});
