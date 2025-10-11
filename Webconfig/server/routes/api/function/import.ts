import type { Application, Request, Response } from "express";
import type { AllData, Control, EnableStatus, Format, MIDIMessageType, MQTTProtocol, OSCArgument, OSCProtocol, OSCType, RangeParameters, WifiMode } from "../../../database.js";
import { controlTypes, enableStatus, formats, midiMessageTypes, midiVersions, mqttProtocols, oscTypes, oscProtocols, wifiModes } from "../../../database.js";
import { db } from "../../../database.js";
import { throwError } from "../../../utils.js";

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
                    serial: "enabled",
                    midi:   "enabled",
                },
                midi: {
                    connectors: "enabled",
                    versions: ["1.0", "2.0"],
                },
            },
            oscServers:  [],
            mqttServers: [],
            controls:    [],
        };

        if (req.body?.wifi?.mode && !wifiModes.includes(req.body.wifi.mode)) {
            throwError("invalid-value", "Invalid value for key 'wifi.mode'", 400);
        } else if (req.body?.connections?.usb?.serial && !enableStatus.includes(req.body.req.body.connections.usb.serial)) {
            throwError("invalid-value", "Invalid value for key 'connections.usb.serial'", 400);
        } else if (req.body?.connections?.usb?.midi && !enableStatus.includes(req.body.req.body.connections.usb.midi)) {
            throwError("invalid-value", "Invalid value for key 'connections.usb.midi'", 400);
        } else if (req.body?.connections?.midi?.connectors && !enableStatus.includes(req.body.req.body.connections.midi.connectors)) {
            throwError("invalid-value", "Invalid value for key 'connections.midi.connectors'", 400);
        }

        i = 0;
        for (let midiVersion of req.body?.connections?.midi?.versions || []) {
            i++;

            if (!midiVersions.includes(midiVersion)) {
                throwError("invalid-value", `Invalid value for key 'connections.midi.versions[${i}]'`, 400);
            }
        }

        if (req.body?.device?.name)                  new_data.device.name                 = `${req.body.device.name}`;
        if (req.body?.wifi?.mode)                    new_data.wifi.mode                   = `${req.body.wifi.mode}` as WifiMode;
        if (req.body?.wifi?.ssid)                    new_data.wifi.ssid                   = `${req.body.wifi.ssid}`;
        if (req.body?.wifi?.psk)                     new_data.wifi.psk                    = `${req.body.wifi.psk}`;
        if (req.body?.wifi?.username)                new_data.wifi.username               = `${req.body.wifi.username}`;
        if (req.body?.wifi?.password)                new_data.wifi.password               = `${req.body.wifi.password}`;
        if (req.body?.connections?.usb?.serial)      new_data.connections.usb.serial      = `${req.body.connections.usb.serial}` as EnableStatus;
        if (req.body?.connections?.usb?.midi)        new_data.connections.usb.midi        = `${req.body.connections.usb.midi}` as EnableStatus;
        if (req.body?.connections?.midi?.connectors) new_data.connections.midi.connectors = `${req.body.connections.midi.connectors}` as EnableStatus;
        if (req.body?.connections?.midi?.versions)   new_data.connections.midi.versions   = req.body.connections.midi.versions || [];

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

            let board = parseInt(control.general?.board);
            let slot  = parseInt(control.general?.slot);

            let new_control: Control = {
                general: {
                    board: board,
                    slot:  slot,
                    type:  "generic",
                    name:  `Control ${board}-${slot}`,
                },
                range: {
                    a:  {from: 0.0, to: 1.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, placeholder: "{A0}", decimals: 0, separator: ""},
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
            } else if (control.general.type && !controlTypes.includes(control.general.type)) {
                throwError("invalid-value", `Invalid value for key 'controls[${i}].general.type'`, 400);
            }

            if (control.general?.name) new_control.general.name = `${control.general.name}`.trim();

            function _move_range(src: any, dst: RangeParameters) {
                let keys = Object.keys(src);
    
                if (keys.includes("from"))        dst.from        = parseFloat(src.from || "0.0");
                if (keys.includes("to"))          dst.to          = parseFloat(src.to   || "0.0");
                if (keys.includes("decimals"))    dst.decimals    = parseInt(`${src.decimals} || "0"`);
                if (keys.includes("placeholder")) dst.placeholder = `${req.body.a.placeholder || ""}`.trim();
                if (keys.includes("separator"))   dst.placeholder = `${req.body.a.separator   || "."}`.trim();
            }

            if (control.range?.a)  _move_range(control.range.a,  new_control.range.a);
            if (control.range?.b)  _move_range(control.range.b,  new_control.range.b);
            if (control.range?.c)  _move_range(control.range.c,  new_control.range.c);
            if (control.range?.a0) _move_range(control.range.a0, new_control.range.a0);
            if (control.range?.a1) _move_range(control.range.a1, new_control.range.a1);

            j = 0;
            for (let message of control.midi || []) {
                j++;
                if (!midiMessageTypes.includes(message.message)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].midi[${j}].message'`, 400);
                }

                let k = 0;
                for (let version of message.versions || []) {
                    k++;
                    if (!midiVersions.includes(version)) {
                        throwError("invalid-value", `Invalid value for key 'controls[${i}].midi[${j}].version[${k}]'`, 400);
                    }
                }

                new_control.midi.push({
                    send:     message.id   ? true : false,
                    receive:  message.name ? true : false,
                    versions: message.versions || [],
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
                        type:   `${message.type   || ""}`.trim() as OSCType,
                        format: `${message.format || ""}`.trim() as Format,
                        value:  `${message.value  || ""}`.trim(),
                    });
                }

                if (!new_data.oscServers.find(e => e.id === message.server)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].osc[${j}].server' - no such server`);
                }

                new_control.osc.push({
                    send:      message.id   ? true : false,
                    receive:   message.name ? true : false,
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

                if (!formats.includes(req.body.format)) {
                    throwError("invalid-value", `Invalid value for key 'controls[${i}].mqtt[${j}].format'`, 400);
                }

                new_control.mqtt.push({
                    send:    message.id   ? true : false,
                    receive: message.name ? true : false,
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
                    send:    message.id   ? true : false,
                    receive: message.name ? true : false,
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