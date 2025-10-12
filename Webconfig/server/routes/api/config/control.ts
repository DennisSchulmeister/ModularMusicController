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
import type {ControlType} from "../../../../types/control.js";

import {controlTypes}     from "../../../../types/control.js";
import {db}               from "../../../database.js";
import {getControlOr404}  from "../../../database.js";
import {throwError}       from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Control – General Data
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/control/:board/:slot", async (req: Request, res: Response) => {
        let control = getControlOr404(parseInt(req.params.board), parseInt(req.params.slot));
        res.status(200);
        res.send(control.general);
    });

    // Update values
    app.post("/api/config/control/:board/:slot", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);
    
        if (!controlTypes.includes(control.general.type)) throwError("invalid-value", "Invalid value for key 'type'", 400);

        control.general = {
            board: control.general.board,
            slot:  control.general.slot,
            type: `${req.body.type}`.trim() as ControlType,
            name: `${req.body.name}`.trim(),
        }

        await db.write();

        res.status(200);
        res.send(control.general);
    });
};