// Import the server using dynamic import for ES modules
let app;

export default async function handler(req, res) {
  if (!app) {
    const { createServer } = await import("../dist/server/node-build.mjs");
    app = createServer();
  }

  return app(req, res);
}
