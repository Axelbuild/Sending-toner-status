import Fastify from "fastify";
import { checkPrinters } from "./jobs/printer.job";
import { printerRoutes } from "./routes/printer.routes";


const fastify = Fastify({
  logger: true,
});

fastify.register(printerRoutes);

setInterval(async () => {
  try {
    await checkPrinters();
  } catch (error) {
    fastify.log.error(error);
  }
}, 60000);

fastify.get("/", async function handler() {
  return { online: true };
});

fastify
  .listen({ port: 3333, host: "0.0.0.0" })
  .then(() => console.log("Server is running"))
  .catch(console.error);
