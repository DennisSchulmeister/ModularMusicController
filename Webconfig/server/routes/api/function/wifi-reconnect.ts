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

/**
 * Add route handlers to the express application:
 * Reconnect WiFi
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    app.post("/api/function/wifi-reconnect", async (req: Request, res: Response) => {
        res.status(201);
        res.send();
    });
};