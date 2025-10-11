import type { Application, Request, Response } from "express";
import type { ControlSerial, Format } from "../../../database.js";
import { db, getControlOr404, formats } from "../../../database.js";
import { throwError } from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Control – Serial Messages
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/control/:board/:slot/serial", async (req: Request, res: Response) => {
        let control = getControlOr404(parseInt(req.params.board), parseInt(req.params.slot));
        res.status(200);
        res.send(control.serial);
    });

    // Update values
    app.post("/api/config/control/:board/:slot/serial", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);
        let new_data: ControlSerial[] = [];
    
        for (let message of req.body || []) {
            if (!formats.includes(req.body.format)) throwError("invalid-value", "Invalid value for key 'format'", 400);

            new_data.push({
                send:    message.id   ? true : false,
                receive: message.name ? true : false,
                format: `${message.format || ""}`.trim() as Format,
                data:   `${message.data   || ""}`.trim(),
            });
        }

        control.serial = new_data;
        await db.write();

        res.status(200);
        res.send(control.serial);
    });
};