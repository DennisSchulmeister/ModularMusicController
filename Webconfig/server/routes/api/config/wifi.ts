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
import type {WiFi}        from "../../../../types/wifi.js";
import type {WiFiMode}    from "../../../../types/wifi.js";

import {wiFiModes}        from "../../../../types/wifi.js";
import {db}               from "../../../database.js";
import {throwError}       from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * WiFi settings
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/wifi", async (req: Request, res: Response) => {
        res.status(200);
        res.send(db.data.wifi);
    });

    // Update values
    app.post("/api/config/wifi", async (req: Request, res: Response) => {
        if (!wiFiModes.includes(req.body.mode)) throwError("invalid-value", "Invalid value for key 'mode'", 400);

        let new_data: WiFi = {
            mode:     `${req.body.mode     || "disabled"}`.trim() as WiFiMode,
            ssid:     `${req.body.ssid     || ""}`.trim(),
            psk:      `${req.body.psk      || ""}`.trim(),
            username: `${req.body.username || ""}`.trim(),
            password: `${req.body.password || ""}`.trim(),
        };

        db.data.wifi = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};