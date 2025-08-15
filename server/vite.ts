import path from "path";
import express, { Express } from "express";

/**
 * In development, attempt to start Vite in middleware mode.
 * Fail silently if Vite isn't available (dev-only).
 */
export async function setupVite(app: Express, server: any): Promise<void> {
  if (app.get("env") !== "development") return;
  try {
    // require at runtime so building for production doesn't pull ESM-only deps
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createServer } = require("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } catch (err: any) {
    // Dev-only: log and continue silently
    // eslint-disable-next-line no-console
    console.warn("Vite middleware unavailable:", err?.message ?? err);
  }
}

/**
 * Serve compiled static assets in production from dist/public.
 */
export function serveStatic(app: Express): void {
  const staticPath = path.resolve(process.cwd(), "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
}
