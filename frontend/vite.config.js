import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(frontendRoot, "index.html"),
        events: resolve(frontendRoot, "events/index.html"),
        hackathons: resolve(frontendRoot, "hackathons/index.html"),
        workshops: resolve(frontendRoot, "workshops/index.html"),
        competitions: resolve(frontendRoot, "competitions/index.html"),
        clubs: resolve(frontendRoot, "clubs/index.html"),
        blog: resolve(frontendRoot, "blog/index.html"),
        about: resolve(frontendRoot, "about/index.html"),
        contact: resolve(frontendRoot, "contact/index.html"),
        faq: resolve(frontendRoot, "faq/index.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
});
