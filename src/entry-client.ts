import { createApp } from "./App";

const app = createApp(true);

// Replace server-rendered HTML with client version (in production you'd be smarter about this)
const appElement = document.getElementById("app");

if (appElement) {
  appElement.innerHTML = app.render();

  // Hydrate to make it interactive
  app.hydrate();
} else {
  console.error("App root element not found");
}
