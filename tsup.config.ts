import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@tanstack/react-query",
    "@tanstack/react-table",
    "react-hook-form",
    "zod",
    "zustand",
    "sonner",
    "lucide-react",
  ],
  treeshake: true,
  minify: false,
});
