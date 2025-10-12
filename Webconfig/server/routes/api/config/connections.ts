/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type { Application, Request, Response } from "express";
import type { Connections, SerialStopBits, SerialWordLength } from "../../../database.js";
import { db, midiVersions, serialWordLengths, serialParities, serialStopBits } from "../../../database.js";
import { throwError } from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Hardware Connections
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    // Read values
    app.get("/api/config/connections", async (req: Request, res: Response) => {
        res.status(200);
        res.send(db.data.connections);
    });

    // Update values
    app.post("/api/config/connections", async (req: Request, res: Response) => {
        if (req.body.usb?.serial?.speed && !serialWordLengths.includes(req.body.usb.serial.word_length)) {
            throwError("invalid-value", "Invalid value for key 'usb.serial.word_length'", 400);
        } else if (req.body.usb?.serial?.parity && !serialParities.includes(req.body.usb.serial.parity)) {
            throwError("invalid-value", "Invalid value for key 'usb.serial.parity'", 400);
        } else if (req.body.usb?.serial.stop_bits && !serialStopBits.includes(req.body.usb.serial.stop_bits)) {
            throwError("invalid-value", "Invalid value for key 'usb.serial.stop_bits'", 400);
        }

        let i = 0;
        for (let midi_version of req.body.midi?.versions || []) {
            i++;

            if (!midiVersions.includes(midi_version)) throwError("invalid-value", `Invalid value for key 'midi.versions[${i}]'`, 400);
        }

        let new_data: Connections = {
            usb: {
                serial: {
                    enabled:     req.body.usb?.serial?.enabled ? true : false,
                    speed:       parseInt(`${req.body.usb?.serial?.speed || "115200"}`),
                    word_length: parseInt(`${req.body.usb?.serial?.word_length || "8"}`) as SerialWordLength,
                    parity:      req.body.usb?.serial?.parity || "none",
                    stop_bits:   parseFloat(`${req.body.usb?.serial?.stop_bits || "1"}`) as SerialStopBits,
                },
                midi: {
                    enabled: req.body.usb?.midi?.enabled ? true : false,
                }
            },
            midi: {
                connectors: req.body.midi?.connectors ? true : false,
                versions:   req.body.midi?.versions || ["1.0", "2.0"],
            },
        };

        db.data.connections = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};