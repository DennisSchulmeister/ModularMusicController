/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type { Application, Request, Response } from "express";
import type { OSCProtocol, OSCServer } from "../../../database.js";
import { db, oscProtocols } from "../../../database.js";
import { throwError } from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * OSC Applications
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/osc-servers", async (req: Request, res: Response) => {
        res.status(200);
        res.send(db.data.oscServers);
    });

    // Update values
    app.post("/api/config/osc-servers", async (req: Request, res: Response) => {
        let new_data: OSCServer[] = [];

        for (let oscServer of req.body || []) {
            if (!oscProtocols.includes(oscServer.protocol)) throwError("invalid-value", "Invalid value for key 'protocol'", 400);

            new_data.push({
                id:       `${oscServer.id       || ""}`.trim(),
                name:     `${oscServer.name     || ""}`.trim(),
                protocol: `${oscServer.protocol || ""}`.trim() as OSCProtocol,
                ip:       `${oscServer.ip       || ""}`.trim(),
                prefix:   `${oscServer.prefix   || ""}`.trim(),
                port:     parseInt(`${oscServer.port || "0"}`),
            });
        }

        db.data.oscServers = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};