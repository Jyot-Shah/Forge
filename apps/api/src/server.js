import "./dns-fix.js";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { environment } from "./config/environment.js";

await connectDatabase();
const server = createApp().listen(environment.API_PORT, () =>
  console.log(`Forge API listening on ${environment.API_PORT}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  });
