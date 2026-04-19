import { FastifyInstance } from "fastify";
import { postCreatePrinterController, getPrinterController, getPrinterByIdController, updatePrinterController, deletePrinterController} from "../controllers/printer.controllers"

export async function printerRoutes(app: FastifyInstance){
    app.post("/printer", postCreatePrinterController);
    app.get("/printer", getPrinterController);
    app.get("/printer/:id", getPrinterByIdController);
    app.put("/printer/:id", updatePrinterController)
    app.delete("/printer/:id", deletePrinterController)
}

