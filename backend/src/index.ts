import { createBackendApp } from "./app";
import { env } from "./config/env";

const app = createBackendApp();

const server = app.listen(env.port, env.host, () => {
  console.log(
    `[AXIOM STUDIO BACKEND] Listening on http://${env.host}:${env.port} (env: ${env.nodeEnv})`
  );
});

const shutdown = (signal: string) => {
  console.log(`[AXIOM STUDIO BACKEND] Received ${signal}. Closing server...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
