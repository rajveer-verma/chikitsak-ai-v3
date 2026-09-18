import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Tell the SWC React plugin to also process .jsx files as TSX
      // This handles any leftover TypeScript syntax in .jsx files
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Use tsx loader for jsx files so esbuild strips any remaining TS syntax
  esbuild: {
    include: /src\/.*\.jsx$/,
    loader: "tsx",
  },
});
