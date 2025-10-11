import type { Application, Request, Response } from "express";
import type { ControlOSC, OSCArgument, OSCType, Format } from "../../../database.js";
import { db, getControlOr404, oscTypes, formats } from "../../../database.js";
import { throwError } from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Control – OSC Messages
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/control/:board/:slot/osc", async (req: Request, res: Response) => {
        let control = getControlOr404(parseInt(req.params.board), parseInt(req.params.slot));
        res.status(200);
        res.send(control.osc);
    });

    // Update values
    app.post("/api/config/control/:board/:slot/osc", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);
        let new_data: ControlOSC[] = [];
    
        let i = 0;
        for (let message of req.body || []) {
            i++;
            let args: OSCArgument[] = [];

            let j = 0;
            for (let argument of message.arguments || []) {
                j++;

                if (!oscTypes.includes(argument.type))  throwError("invalid-value", `Invalid value for key '[${i}].arguments[${j}].type'`, 400);
                if (!formats.includes(argument.format)) throwError("invalid-value", `Invalid value for key '[${i}].arguments[${j}].format'`, 400);

                args.push({
                    type:   `${message.type   || ""}`.trim() as OSCType,
                    format: `${message.format || ""}`.trim() as Format,
                    value:  `${message.value  || ""}`.trim(),
                });
            }

            if (!db.data.oscServers.find(e => e.id === message.server)) {
                throwError("invalid-value", "Invalid value for key 'server' - no such server");
            }

            new_data.push({
                send:      message.id   ? true : false,
                receive:   message.name ? true : false,
                server:    `${message.server  || ""}`.trim(),
                address:   `${message.address || ""}`.trim(),
                arguments: args,
            });
        }

        control.osc = new_data;    
        await db.write();

        res.status(200);
        res.send(control.osc);
    });
};