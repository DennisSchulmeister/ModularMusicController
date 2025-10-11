/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type { Application, Request, Response } from "express";
import type { ControlType } from "../../../database.js";
import { db } from "../../../database.js";

/**
 * Add route handlers to the express application:
 * Controls Overview
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    app.get("/api/config/control", async (req: Request, res: Response) => {
        let result: {
            board:  number;
            slot:   number;
            type:   ControlType;
            name:   string;
            midi:   {send: boolean, receive: boolean};
            osc:    {send: boolean, receive: boolean};
            mqtt:   {send: boolean, receive: boolean};
            serial: {send: boolean, receive: boolean};
        }[] = [];

        for (let control of db.data.controls) {
            result.push({
                board: control.general.board,
                slot:  control.general.slot,
                type:  control.general.type,
                name:  control.general.name,

                midi: {
                    send:    control.midi.find(e => e.send)    ? true : false,
                    receive: control.midi.find(e => e.receive) ? true : false,
                },
                osc: {
                    send:    control.osc.find(e => e.send)    ? true : false,
                    receive: control.osc.find(e => e.receive) ? true : false,
                },
                mqtt: {
                    send:    control.mqtt.find(e => e.send)    ? true : false,
                    receive: control.mqtt.find(e => e.receive) ? true : false,
                },
                serial: {
                    send:    control.serial.find(e => e.send)    ? true : false,
                    receive: control.serial.find(e => e.receive) ? true : false,
                },
            });
        }

        res.status(200);
        res.send(result);
    });
};