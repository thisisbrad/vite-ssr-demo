import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { createServer } from "./server";

describe("Server", () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = await createServer();
    baseUrl = `http://localhost:${server.port}`;
  });

  afterAll(() => {
    server.stop();
  });

  test("should return 404 for non-existent routes", async () => {
    const res = await fetch(`${baseUrl}/non-existent-route-${Math.random()}`);
    expect(res.status).toBe(404);
  });

  test("should serve static files (e.g., README.md)", async () => {
    // In dev mode (which tests usually run in), it serves from root
    const res = await fetch(`${baseUrl}/README.md`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("#"); // Assuming README starts with a header
  });

  test("should return HTML for root route", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html");
    const html = await res.text();
    expect(html).toContain("<!doctype html>");
  });
});
