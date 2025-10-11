import type { Application, Request, Response } from "express";
import type { Connections, EnableStatus } from "../../../database.js";
import { db, enableStatus, midiVersions } from "../../../database.js";
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
        if (!enableStatus.includes(req.body.usb?.serial))      throwError("invalid-value", "Invalid value for key 'usb.serial'", 400);
        if (!enableStatus.includes(req.body.usb?.midi))        throwError("invalid-value", "Invalid value for key 'usb.midi'", 400);
        if (!enableStatus.includes(req.body.midi?.connectors)) throwError("invalid-value", "Invalid value for key 'midi.connectors'", 400);

        let i = 0;
        for (let midi_version of req.body.midi?.versions || []) {
            i++;

            if (!midiVersions.includes(midi_version)) throwError("invalid-value", `Invalid value for key 'midi.versions[${i}]'`, 400);
        }

        let prev_data = db.data.connections;

        let new_data: Connections = {
            usb: {
                serial: `${req.body.usb?.serial || prev_data.usb.serial}`.trim() as EnableStatus,
                midi:   `${req.body.usb?.midi   || prev_data.usb.midi}`.trim() as EnableStatus,
            },
            midi: {
                connectors: `${req.body.midi?.connectors || prev_data.midi.connectors}`.trim() as EnableStatus,
                versions:   req.body.midi?.versions || [],
            },
        };

        db.data.connections = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};