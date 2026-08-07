import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// Plugin to handle Lovable .asset.json imports
function lovableAssetPlugin() {
  const LOVABLE = "https://fontevita-vitality-hub.lovable.app";
  return {
    name: "lovable-asset",
    enforce: "pre" as const,
    resolveId(source: string, importer: string) {
      if (source.includes(".asset.json")) {
        const resolved = path.resolve(
          path.dirname(importer || process.cwd()),
          source
        );
        return resolved + "?lovable-asset";
      }
      return null;
    },
    load(id: string) {
      if (id.endsWith("?lovable-asset")) {
        const filePath = id.replace("?lovable-asset", "");
        try {
          const raw = fs.readFileSync(filePath, "utf-8");
          const json = JSON.parse(raw);
          return `export default ${JSON.stringify({
            url: LOVABLE + json.url,
          })}`;
        } catch {
          return `export default { url: "" }`;
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  base: "/fontevita-vitality-hub/",
  plugins: [react(), tsconfigPaths(), tailwindcss(), lovableAssetPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tanstack/react-router": path.resolve(
        __dirname,
        "./src/__mocks__/tanstack-router"
      ),
      "@tanstack/react-start": path.resolve(
        __dirname,
        "./src/__mocks__/tanstack-router"
      ),
    },
  },
  build: {
    outDir: "dist-ghpages",
    rollupOptions: {
      input: "index.html",
      treeshake: {
        moduleSideEffects: true,
      },
    },
  },
});
