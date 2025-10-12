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
import type {ControlMQTT} from "../../../../types/control.js";
import type {Format}      from "../../../../types/binary.js";

import {formats}          from "../../../../types/binary.js";
import {db}               from "../../../database.js";
import {getControlOr404}  from "../../../database.js";
import {throwError}       from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Control – MQTT Messages
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/control/:board/:slot/mqtt", async (req: Request, res: Response) => {
        let control = getControlOr404(parseInt(req.params.board), parseInt(req.params.slot));
        res.status(200);
        res.send(control.mqtt);
    });

    // Update values
    app.post("/api/config/control/:board/:slot/mqtt", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);
        let new_data: ControlMQTT[] = [];
            
        let i = 0;
        for (let message of req.body || []) {
            i++;

            if (!db.data.mqttServers.find(e => e.id === message.server)) {
                throwError("invalid-value", "Invalid value for key 'server' - no such server");
            }

            if (!formats.includes(req.body.format)) throwError("invalid-value", `Invalid value for key '[${i}].format'`, 400);

            new_data.push({
                send:    message.id   ? true : false,
                receive: message.name ? true : false,
                server: `${message.server || ""}`.trim(),
                topic:  `${message.topic  || ""}`.trim(),
                format: `${message.format || ""}`.trim() as Format,
                data:   `${message.data   || ""}`.trim(),
            });
        }

        control.mqtt = new_data;
        await db.write();

        res.status(200);
        res.send(control.mqtt);
    });
};