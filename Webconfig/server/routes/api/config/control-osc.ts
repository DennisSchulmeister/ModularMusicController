/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */
import type {Application} from "express";
import type {Request}     from "express";
import type {Response}    from "express";
import type {Format}      from "../../../../types/binary.js";
import type {ControlOSC}  from "../../../../types/control.js";
import type {OSCArgument} from "../../../../types/osc.js";
import type {OSCType}     from "../../../../types/osc.js";

import {formats}          from "../../../../types/binary.js";
import {oscTypes}         from "../../../../types/osc.js";
import {db}               from "../../../database.js";
import {getControlOr404}  from "../../../database.js";
import {throwError}       from "../../../utils.js";

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
                    type:   `${argument.type   || ""}`.trim() as OSCType,
                    format: `${argument.format || ""}`.trim() as Format,
                    value:  `${argument.value  || ""}`.trim(),
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