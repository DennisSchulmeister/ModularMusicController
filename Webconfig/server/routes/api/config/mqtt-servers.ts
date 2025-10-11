/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type { Application, Request, Response } from "express";
import type { MQTTProtocol, MQTTServer } from "../../../database.js";
import { db, mqttProtocols } from "../../../database.js";
import { throwError } from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * MQTT Brokers
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/mqtt-servers", async (req: Request, res: Response) => {
        res.status(200);
        res.send(db.data.mqttServers);
    });

    // Update values
    app.post("/api/config/mqtt-servers", async (req: Request, res: Response) => {
        let new_data: MQTTServer[] = [];

        for (let mqttServer of req.body || []) {
            if (!mqttProtocols.includes(mqttServer.protocol)) throwError("invalid-value", "Invalid value for key 'protocol'", 400);

            new_data.push({
                id:       `${mqttServer.id       || ""}`.trim(),
                name:     `${mqttServer.name     || ""}`.trim(),
                protocol: `${mqttServer.protocol || ""}`.trim() as MQTTProtocol,
                ip:       `${mqttServer.ip       || ""}`.trim(),
                username: `${mqttServer.username || ""}`.trim(),
                password: `${mqttServer.password || ""}`.trim(),
                prefix:   `${mqttServer.prefix   || ""}`.trim(),
                port:     parseInt(`${mqttServer.port || "0"}`),
            });
        }

        db.data.mqttServers = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};