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
        let prev_data = db.data.device;

        let new_data: Device = {
            name: `${req.body.name || prev_data.name}`.trim(),
        };

        db.data.device = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};