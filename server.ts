import { file } from "bun";
import path from "node:path";
import { createServer as createViteServer } from "vite";

const __dirname = import.meta.dir;
const isProduction = process.env.NODE_ENV === "production";

export async function createServer() {
  let vite;

  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
  }

  const server = Bun.serve({
    port: 3000,

    async fetch(req) {
      const url = new URL(req.url);

      // Handle SSR for root/index
      if (url.pathname === "/" || url.pathname === "/index.html") {
        try {
          let template;
          let render;

          if (!isProduction) {
            // Dev mode: load fresh on each request
            template = await file(path.join(__dirname, "index.html")).text();
            template = await vite.transformIndexHtml(url.pathname, template);
            // Load the server entry. We use .ts here so Vite transforms it on the fly.
            // This corresponds to src/entry-server.ts
            render = (await vite.ssrLoadModule("/src/entry-server.ts")).render;
          } else {
            // Production mode: use built files
            template = await file(
              path.join(__dirname, "dist/client/index.html"),
            ).text();
            render = (await import("./dist/server/entry-server.js")).render;
          }

          const { html: appHtml } = render(url.pathname);
          const html = template.replace("<!--app-html-->", appHtml);

          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        } catch (e) {
          !isProduction && vite?.ssrFixStacktrace(e);
          console.error(e.stack);
          return new Response(e.stack, { status: 500 });
        }
      }

      // Handle assets in dev mode
      if (!isProduction) {
        try {
          const result = await vite.transformRequest(url.pathname);
          if (result) {
            return new Response(result.code, {
              headers: { "Content-Type": "application/javascript" },
            });
          }
        } catch (e) {
          console.error(`Failed to transform ${url.pathname}:`, e);
        }
      }

      // Fallback for static assets or 404
      let filePath = path.join(__dirname, url.pathname);
      if (isProduction) {
        filePath = path.join(__dirname, "dist/client", url.pathname);
      }
      const fileRef = file(filePath);
      if (await fileRef.exists()) {
        return new Response(fileRef);
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log("🚀 Server running at http://localhost:3000");
  return server;
}

if (import.meta.main) {
  createServer();
}
