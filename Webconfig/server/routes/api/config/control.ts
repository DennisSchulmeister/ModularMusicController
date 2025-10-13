/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type {Application}     from "express";
import type {Request}         from "express";
import type {Response}        from "express";
import type {InputParameters} from "../../../../types/control.js";

import {db}                   from "../../../database.js";
import {getControlOr404}      from "../../../database.js";

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
        res.send(control.base);
    });

    // Update values
    app.post("/api/config/control/:board/:slot", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);

        function _input(src: any|undefined, placeholder: string): InputParameters {
            return {
                from:        parseFloat(`${src?.from    || "0.0"}`),
                to:          parseFloat(`${src?.to      || "0.0"}`),
                initial:     parseFloat(`${src?.initial || "0.0"}`),
                decimals:    parseInt(`${src?.decimals  || "0"}`),
                placeholder: `${src?.placeholder || placeholder}`.trim(),
                separator:   `${src?.separator   || "."}`.trim(),
            };
        }

        control.base = {
            general: {
                board: control.base.general.board,
                slot:  control.base.general.slot,
                type:  control.base.general.type,
                name: `${req.body.general?.name}`.trim(),
            },
            inputs: {
                a:  _input(req.body.inputs?.a,  "{A}"),
                b:  _input(req.body.inputs?.b,  "{B}"),
                c:  _input(req.body.inputs?.c,  "{C}"),
                a0: _input(req.body.inputs?.a0, "{A0}"),
                a1: _input(req.body.inputs?.a1, "{A1}"),
            },
        };
    
        await db.write();

        res.status(200);
        res.send(control.base);
    });
};