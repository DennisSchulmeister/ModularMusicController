/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type {Application}      from "express";
import type {Request}          from "express";
import type {Response}         from "express";
import type {ControlMIDI}      from "../../../../types/control.js";
import type {MIDIMessageType } from "../../../../types/midi.js";

import {db}                    from "../../../database.js";
import {getControlOr404}       from "../../../database.js";
import {midiMessageTypes}      from "../../../../types/midi.js";
import {throwError}            from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Control – MIDI Messages
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/control/:board/:slot/midi", async (req: Request, res: Response) => {
        let control = getControlOr404(parseInt(req.params.board), parseInt(req.params.slot));
        res.status(200);
        res.send(control.midi);
    });

    // Update values
    app.post("/api/config/control/:board/:slot/midi", async (req: Request, res: Response) => {
        let board   = parseInt(req.params.board);
        let slot    = parseInt(req.params.slot);
        let control = getControlOr404(board, slot);
        let new_data: ControlMIDI[] = [];
    
        let i = 0;
        for (let message of req.body || []) {
            i++;
            if (!midiMessageTypes.includes(message.message)) throwError("invalid-value", `Invalid value for key '[${i}].message'`, 400);

            new_data.push({
                send:     message.id   ? true : false,
                receive:  message.name ? true : false,
                channel:  parseInt(`${message.channel || "0"}`.trim()),
                message:  `${message.message || ""}`.trim() as MIDIMessageType,
                data:     `${message.data    || ""}`.trim(),
            });
        }

        control.midi = new_data;
        await db.write();

        res.status(200);
        res.send(control.midi);
    });
};