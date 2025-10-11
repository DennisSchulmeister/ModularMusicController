/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type { Application, Request, Response } from "express";
import type { RangeParameters } from "../../../database.js";
import { db, getControlOr404 } from "../../../database.js";


/**
 * Add route handlers to the express application:
 * Control – Value Ranges
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/control/:board/:slot/range", async (req: Request, res: Response) => {
        let control = getControlOr404(parseInt(req.params.board), parseInt(req.params.slot));
        res.status(200);
        res.send(control.range);
    });

    // Update values
    app.post("/api/config/control/:board/:slot/range", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);
    
        function _move(src: any, dst: RangeParameters) {
            let keys = Object.keys(src);

            if (keys.includes("from"))        dst.from        = parseFloat(src.from || "0.0");
            if (keys.includes("to"))          dst.to          = parseFloat(src.to   || "0.0");
            if (keys.includes("decimals"))    dst.decimals    = parseInt(`${src.decimals} || "0"`);
            if (keys.includes("placeholder")) dst.placeholder = `${req.body.a.placeholder || ""}`.trim();
            if (keys.includes("separator"))   dst.placeholder = `${req.body.a.separator   || "."}`.trim();
        }

        if (req.body.a)  _move(req.body.a, control.range.a);
        if (req.body.b)  _move(req.body.b, control.range.b);
        if (req.body.c)  _move(req.body.c, control.range.c);
        if (req.body.a0) _move(req.body.c, control.range.a0);
        if (req.body.a1) _move(req.body.c, control.range.a1);

        await db.write();

        res.status(200);
        res.send(control.range);
    });
};