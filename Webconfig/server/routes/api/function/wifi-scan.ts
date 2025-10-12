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
 * Scan WiFi Networks
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    app.get("/api/function/wifi-scan", async (req: Request, res: Response) => {
        // Random timeout
        await new Promise(resolve => window.setTimeout(resolve, Math.random() * 4500));

        res.status(200);
        res.send([
            {
                ssid: "GoldenHeart-1996",
                type: "wpa",
                strength: 820,
            },
            {
                ssid: "Sailing to Philadelphia",
                type: "wpa",
                strength: 670,
            },
            {
                ssid: "Ragpicker's Dream",
                type: "wpa",
                strength: 540,
            },
            {
                ssid: "Shangri-La",
                type: "open",
                strength: 410,
            },
            {
                ssid: "All-The-Roadrunning",
                type: "open",
                strength: 320,
            },
        ]);
    });
};