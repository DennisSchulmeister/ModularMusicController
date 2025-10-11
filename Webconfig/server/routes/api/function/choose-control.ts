import type { Application, Request, Response } from "express";

/**
 * Add route handlers to the express application:
 * Choose control
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    app.get("/api/function/choose-control", async (req: Request, res: Response) => {
        // Random timeout
        await new Promise(resolve => window.setTimeout(resolve, Math.random() * 3000));

        res.status(200);
        res.send({board: 2, slot: 7});
    });
};