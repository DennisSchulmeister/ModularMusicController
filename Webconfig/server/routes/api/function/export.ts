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

import {db}               from "../../../database.js";

/**
 * Add route handlers to the express application:
 * Export Settings
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    app.get("/api/function/export", async (req: Request, res: Response) => {
        res.status(200);
        res.set("content-disposition", 'attachment; filename="settings.mmc.json"');
        res.send(db.data);
    });
};