import { file } from "bun";
import path from "node:path";
import { createServer as createViteServer } from "vite";

const __dirname = import.meta.dir;
const isProduction = process.env.NODE_ENV === "production";

async function createServer() {
  let vite;

  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
  }

  Bun.serve({
    port: 3000,

    async fetch(req) {
      const url = new URL(req.url);

      try {
        let template;
        let render;

        if (!isProduction) {
          // Dev mode: load fresh on each request
          template = await file(path.join(__dirname, "index.html")).text();
          template = await vite.transformIndexHtml(url.pathname, template);
          render = (await vite.ssrLoadModule("/src/entry-server.js")).render;
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
    },
  });

  console.log("🚀 Server running at http://localhost:3000");
}

createServer();
