import Fastify from "fastify";
import cors from "@fastify/cors";
import { groupRoutes } from "./routes/group.routes";
import { checkPrinters } from "./jobs/printer.job";
import { printerRoutes } from "./routes/printer.routes";


const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: true,
})

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
