// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Netlify sets NETLIFY=true during its builds. Only there do we swap Nitro (Cloudflare output)
// for the official Netlify adapter, loaded lazily so other environments never need the package.
const isNetlifyBuild = process.env["NETLIFY"] === "true";

const netlifyOptions = isNetlifyBuild
  ? {
      nitro: false as const,
      vite: {
        plugins: [(await import("@netlify/vite-plugin-tanstack-start")).default()],
      },
    }
  : {};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...netlifyOptions,
});
