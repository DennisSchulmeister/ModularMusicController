import type { Application, Request, Response } from "express";
import type { Wifi, WifiMode } from "../../../database.js";
import { db, wifiModes } from "../../../database.js";
import { throwError } from "../../../utils.js";

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
        if (!wifiModes.includes(req.body.mode)) throwError("invalid-value", "Invalid value for key 'mode'", 400);

        let prev_data = db.data.wifi;

        let new_data: Wifi = {
            mode:     `${req.body.mode     || prev_data.mode}`.trim() as WifiMode,
            ssid:     `${req.body.ssid     || prev_data.ssid}`.trim(),
            psk:      `${req.body.psk      || prev_data.psk}`.trim(),
            username: `${req.body.username || prev_data.username}`.trim(),
            password: `${req.body.password || prev_data.password}`.trim(),
        };

        db.data.wifi = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};