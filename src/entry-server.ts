import { createApp } from "./App";

export function render(url?: string): { html: string } {
  const app = createApp(false);
  const html = app.render();
  return { html };
}
