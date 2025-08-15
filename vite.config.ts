import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// runtime-safe helper (avoids TS parsing import.meta)
function getRuntimeDir() {
  try {
    const maybeDir = eval(
      "typeof import !== 'undefined' && import.meta && import.meta.dirname ? import.meta.dirname : undefined"
    );
    if (typeof maybeDir === "string") return maybeDir;
  } catch {}
  return process.cwd();
}

const runtimeDir = getRuntimeDir();

// build plugins array without using top-level await
const plugins: any[] = [react()];

if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
  try {
    // use require so it compiles cleanly to CJS
    // plugin may export a function or an object with cartographer()
    // try both shapes
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cartographerPkg = require("@replit/vite-plugin-cartographer");
    const cartographer = cartographerPkg?.cartographer ?? cartographerPkg;
    if (typeof cartographer === "function") {
      plugins.push(cartographer());
    }
  } catch (err) {
    // optional dev-only plugin missing — ignore
  }
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(runtimeDir, "client", "src"),
      "@shared": path.resolve(runtimeDir, "shared"),
      "@assets": path.resolve(runtimeDir, "attached_assets"),
    },
  },
  root: path.resolve(runtimeDir, "client"),
  build: {
    outDir: path.resolve(runtimeDir, "dist/public"),
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
