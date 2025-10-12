/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type { Application, Request, Response } from "express";
import type { Device } from "../../../database.js";
import { db } from "../../../database.js";

/**
 * Add route handlers to the express application:
 * General Device Settings
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/device", async (req: Request, res: Response) => {
        res.status(200);
        res.send(db.data.device);
    });

    // Update values
    app.post("/api/config/device", async (req: Request, res: Response) => {
        let new_data: Device = {
            name: `${req.body.name || ""}`.trim(),
        };

        db.data.device = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};