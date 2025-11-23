# SSR Architecture Explained

This document explains the Server-Side Rendering (SSR) architecture used in this project.

## Overview

The application uses **Vite** as the build tool and dev server middleware, and **Bun** as the runtime server. The architecture is split into three main parts:

1.  **Server Entry** (`src/entry-server.ts`)
2.  **Client Entry** (`src/entry-client.ts`)
3.  **Web Server / Orchestrator** (`server.ts`)

## 1. Server Entry (`src/entry-server.ts`)

**Purpose**: To render the application to an HTML string.

-   **Input**: A URL (optional).
-   **Output**: An object containing the rendered HTML string (and potentially state/head tags).
-   **Usage**: This file is imported by `server.ts` during a request. It runs *only* on the server.
-   **Key Function**: `render(url)` - Creates a fresh app instance and returns its HTML representation.

## 2. Client Entry (`src/entry-client.ts`)

**Purpose**: To "hydrate" the static HTML sent by the server.

-   **Input**: The DOM (specifically the `#app` element).
-   **Output**: A live, interactive application.
-   **Usage**: This file is included via a `<script type="module">` tag in `index.html`. It runs *only* in the browser.
-   **Key Function**: `hydrate()` - Attaches event listeners and state to the existing HTML markup.

## 3. Web Server (`server.ts`)

**Purpose**: To handle incoming HTTP requests and coordinate the rendering process.

-   **Role**: It acts as the bridge between the incoming request and the application logic.
-   **Workflow**:
    1.  **Receive Request**: Listens on port 3000.
    2.  **Match Route**: Checks if the request is for the root `/` or `index.html`.
    3.  **Load Template**: Reads `index.html`.
    4.  **Transform (Dev Mode)**: Uses Vite to apply HMR and transformations to the template.
    5.  **Render**: Calls the `render` function from `src/entry-server.ts`.
    6.  **Inject**: Replaces the `<!--app-html-->` placeholder in the template with the rendered HTML.
    7.  **Respond**: Sends the final HTML back to the browser.

### Development vs. Production

-   **Development**:
    -   Uses `vite.ssrLoadModule("/src/entry-server.ts")` to load the server entry point. This allows Vite to transpile TypeScript on the fly.
    -   Reads `index.html` from the root.

-   **Production**:
    -   Uses `import()` to load the built server bundle from `dist/server/entry-server.js`.
    -   Reads `index.html` from `dist/client/index.html`.
