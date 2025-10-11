import type { Application, Request, Response } from "express";
import { db } from "../../../database.js";

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