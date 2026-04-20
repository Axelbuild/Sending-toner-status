import Fastify from "fastify";
import cors from "@fastify/cors";
import { checkPrinters } from "./jobs/printer.job";
import { printerRoutes } from "./routes/printer.routes";
import { groupRoutes } from "./routes/group.routes";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.register(printerRoutes);
fastify.register(groupRoutes);

setInterval(async () => {
  try {
    await checkPrinters();
  } catch (error) {
    fastify.log.error(error);
  }
}, 300000);

fastify.get("/", async function handler() {
  return { online: true };
});

fastify
  .listen({ port: 3333, host: "0.0.0.0" })
  .then(() => console.log("Server is running"))
  .catch(console.error);