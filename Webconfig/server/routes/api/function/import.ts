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
import type {Control}          from "../../../../types/control.js";
import type {Format}           from "../../../../types/binary.js";
import type {InputParameters}  from "../../../../types/control.js";
import type {MIDIMessageType}  from "../../../../types/midi.js";
import type {MQTTProtocol}     from "../../../../types/mqtt.js";
import type {OSCArgument}      from "../../../../types/osc.js";
import type {OSCProtocol}      from "../../../../types/osc.js";
import type {OSCType}          from "../../../../types/osc.js";
import type {SerialParity}     from "../../../../types/serial.js";
import type {SerialStopBits}   from "../../../../types/serial.js";
import type {SerialWordLength} from "../../../../types/serial.js";
import type {WiFiMode}         from "../../../../types/wifi.js";
import type {AllData}          from "../../../database.js";

import {formats}               from "../../../../types/binary.js";
import {midiMessageTypes}      from "../../../../types/midi.js";
import {midiVersions}          from "../../../../types/midi.js";
import {mqttProtocols}         from "../../../../types/mqtt.js";
import {oscProtocols}          from "../../../../types/osc.js";
import {oscTypes}              from "../../../../types/osc.js";
import {serialParities}        from "../../../../types/serial.js";
import {serialStopBits}        from "../../../../types/serial.js";
import {serialWordLengths}     from "../../../../types/serial.js";
import {wiFiModes}             from "../../../../types/wifi.js";
import {db}                    from "../../../database.js";
import {throwError}            from "../../../utils.js";

/**
 * Add route handlers to the express application:
 * Import Settings
 *
 * @param {Express.Application} app Express application
 */
export default function registerRoutes(app: Application): void {
    app.post("/api/function/import", async (req: Request, res: Response) => {
        let i = 0, j = 0;
        let new_data: AllData = {
            device: {
                name: "Modular Music Controller",
            },
            wifi: {
                mode:     "access_point",
                ssid:     "ModularMusicController",
                psk:      "ModularMusicController",
                username: "",
                password: "",
            },
            connections: {
                usb: {
                    serial: {
                        enabled:     false,
                        speed:       115200,
                        word_length: "8",
                        parity:      "none",
                        stop_bits:   "1",
                    },
                    midi: {
                        enabled: true,
                    },
                },
                midi: {
                    connectors: true,
                    versions: ["1.0", "2.0"],
                },
            },
            oscServers:  [],
            mqttServers: [],
            controls:    [],
        };

        if (req.body?.wifi?.mode && !wiFiModes.includes(req.body.wifi.mode)) {
            throwError("invalid-value", "Invalid value for key 'wifi.mode'", 400);
        } else if (req.body?.connections?.usb?.serial?.word_length && !serialWordLengths.includes(req.body.connections.usb.serial.word_length)) {
            throwError("invalid-value", "Invalid value for key 'connections.usb.serial.word_length'", 400);
        } else if (req.body?.connections?.usb?.serial?.parity && !serialParities.includes(req.body.connections.usb.serial.parity)) {
            throwError("invalid-value", "Invalid value for key 'connections.usb.serial.parity'", 400);
        } else if (req.body?.connections?.usb?.serial?.stop_bits && !serialStopBits.includes(req.body.connections.usb.serial.stop_bits)) {
            throwError("invalid-value", "Invalid value for key 'connections.midi.serial.stop_bits'", 400);
        }

        i = 0;
        for (let midiVersion of req.body?.connections?.midi?.versions || []) {
            i++;

            if (!midiVersions.includes(midiVersion)) {
                throwError("invalid-value", `Invalid value for key 'connections.midi.versions[${i}]'`, 400);
            }
        }

        if (req.body?.device?.name)                          new_data.device.name                        = `${req.body.device.name}`;
        if (req.body?.wifi?.mode)                            new_data.wifi.mode                          = `${req.body.wifi.mode}` as WiFiMode;
        if (req.body?.wifi?.ssid)                            new_data.wifi.ssid                          = `${req.body.wifi.ssid}`;
        if (req.body?.wifi?.psk)                             new_data.wifi.psk                           = `${req.body.wifi.psk}`;
        if (req.body?.wifi?.username)                        new_data.wifi.username                      = `${req.body.wifi.username}`;
        if (req.body?.wifi?.password)                        new_data.wifi.password                      = `${req.body.wifi.password}`;
        if (req.body?.connections?.usb?.serial?.speed)       new_data.connections.usb.serial.speed       = parseInt(`${req.body.connections.usb.serial.speed}`);
        if (req.body?.connections?.usb?.serial?.word_length) new_data.connections.usb.serial.word_length = `${req.body.connections.usb.serial.word_length}`.trim() as SerialWordLength;
        if (req.body?.connections?.usb?.serial?.parity)      new_data.connections.usb.serial.parity      = `${req.body.connections.usb.serial.parity}`.trim() as SerialParity;
        if (req.body?.connections?.usb?.serial?.stop_bits)   new_data.connections.usb.serial.stop_bits   = `${req.body.connections.usb.serial.stop_bits}`.trim() as SerialStopBits;
        if (req.body?.connections?.midi?.versions)           new_data.connections.midi.versions   = req.body.connections.midi.versions || [];

        new_data.connections.usb.serial.enabled = req.body?.connections?.usb?.serial?.enabled ? true : false;
        new_data.connections.usb.midi.enabled   = req.body?.connections?.usb?.midi?.enabled   ? true : false;
        new_data.connections.midi.connectors    = req.body?.connections?.midi?.connectors     ? true : false;

        i = 0;
        for (let oscServer of req.body?.oscServers || []) {
            i++;

            if (!oscProtocols.includes(oscServer.protocol)) {
                throwError("invalid-value", `Invalid value for key 'oscServers[${i}].protocol'`, 400);
            }

            new_data.oscServers.push({
                id:       `${oscServer.id       || ""}`.trim(),
                name:     `${oscServer.name     || ""}`.trim(),
                protocol: `${oscServer.protocol || ""}`.trim() as OSCProtocol,
                ip:       `${oscServer.ip       || ""}`.trim(),
                prefix:   `${oscServer.prefix   || ""}`.trim(),
                port:     parseInt(`${oscServer.port || "0"}`),
            });
        }

        i = 0;
        for (let mqttServer of req.body?.mqttServers || []) {
            i++;

            if (!mqttProtocols.includes(mqttServer.protocol)) {
                throwError("invalid-value", `Invalid value for key 'mqttServers[${i}].protocol'`, 400);
            }

            new_data.mqttServers.push({
                id:       `${mqttServer.id       || ""}`.trim(),
                name:     `${mqttServer.name     || ""}`.trim(),
                protocol: `${mqttServer.protocol || ""}`.trim() as MQTTProtocol,
                ip:       `${mqttServer.ip       || ""}`.trim(),
                username: `${mqttServer.username || ""}`.trim(),
                password: `${mqttServer.password || ""}`.trim(),
                prefix:   `${mqttServer.prefix   || ""}`.trim(),
                port:     parseInt(`${mqttServer.port || "0"}`),
            });
        }

        i = 0;
        for (let control of req.body?.controls || []) {
            i++;

            let board = parseInt(control.base?.general?.board);
            let slot  = parseInt(control.base?.general?.slot);

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

            let new_control: Control = {
                base: {
                    general: {
                        board: board,
                        slot:  slot,
                        type:  "generic",
                        name:  `Control ${board}-${slot}`,
                    },
                    inputs: {
                        a:  _input(control.base?.inputs?.a, "{A}"),
                        b:  _input(control.base?.inputs?.b, "{B}"),
                        c:  _input(control.base?.inputs?.c, "{C}"),
                        a0: _input(control.base?.inputs?.a0, "{A0}"),
                        a1: _input(control.base?.inputs?.a1, "{A1}"),
                    },
                },

                midi:   [],
                osc:    [],
                mqtt:   [],
                serial: [],
            };

            if (Number.isNaN(board)) {
                throwError("invalid-value", `Invalid value for key 'controls[${i}].general.board'`, 400);
            } else if (Number.isNaN(slot)) {
                throwError("invalid-value", `Invalid value for key 'controls[${i}].general.slot'`, 400);
            }

            if (control.base?.general?.name) new_control.base.general.name = `${control.base.general.name}`.trim();

            j = 0;
            for (let message of control.midi || []) {
                j++;
                if (!midiMessageTypes.includes(message.message)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].midi[${j}].message'`, 400);
                }

                new_control.midi.push({
                    send:     message.send    ? true : false,
                    receive:  message.receive ? true : false,
                    channel:  parseInt(`${message.channel|| "0"}`.trim()),
                    message:  `${message.message || ""}`.trim() as MIDIMessageType,
                    data:     `${message.data    || ""}`.trim(),
                });                
            }

            j = 0;
            for (let message of control.osc || []) {
                j++;
                let args: OSCArgument[] = [];

                let k = 0;
                for (let argument of message.arguments || []) {
                    k++;

                    if (!oscTypes.includes(argument.type))  throwError("invalid-value", `Invalid value for key 'controls[${i}].osc[${j}].arguments[${k}].type'`, 400);
                    if (!formats.includes(argument.format)) throwError("invalid-value", `Invalid value for key 'controls[${i}].osc[${j}].arguments[${k}].format'`, 400);

                    args.push({
                        type:   `${argument.type   || ""}`.trim() as OSCType,
                        format: `${argument.format || ""}`.trim() as Format,
                        value:  `${argument.value  || ""}`.trim(),
                    });
                }

                if (!new_data.oscServers.find(e => e.id === message.server)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].osc[${j}].server' - no such server`);
                }

                new_control.osc.push({
                    send:      message.send    ? true : false,
                    receive:   message.receive ? true : false,
                    server:    `${message.server  || ""}`.trim(),
                    address:   `${message.address || ""}`.trim(),
                    arguments: args,
                });
            }

            j = 0;
            for (let message of control.mqtt || []) {
                if (!new_data.mqttServers.find(e => e.id === message.server)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].mqtt[${j}].server' - no such server`);
                }

                if (!formats.includes(message.format)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].mqtt[${j}].format'`, 400);
                }

                new_control.mqtt.push({
                    send:    message.send    ? true : false,
                    receive: message.receive ? true : false,
                    server: `${message.server || ""}`.trim(),
                    topic:  `${message.topic  || ""}`.trim(),
                    format: `${message.format || ""}`.trim() as Format,
                    data:   `${message.data   || ""}`.trim(),
                });
            }

            j = 0;
            for (let message of control.serial || []) {
                if (!formats.includes(message.format)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].serial[${j}].format'`, 400);
                }

                new_control.serial.push({
                    send:    message.send    ? true : false,
                    receive: message.receive ? true : false,
                    format: `${message.format || ""}`.trim() as Format,
                    data:   `${message.data   || ""}`.trim(),
                });
            }

            new_data.controls.push(new_control);
        }

        db.data = new_data;
        await db.write();

        res.status(200);
        res.send(new_data);
    });
};