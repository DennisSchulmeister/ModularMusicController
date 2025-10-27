/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type {Control}     from "../types/control.js";
import type {Connections} from "../types/device.js";
import type {Device}      from "../types/device.js";
import type {MQTTServer}  from "../types/mqtt.js";
import type {OSCServer}   from "../types/osc.js";
import type {WiFi}        from "../types/wifi.js";

import {JSONFilePreset}   from "lowdb/node";
import {throwNotFound}    from "./utils.js";

// Default data for the mock database
export type AllData = {
    device:      Device,
    wifi:        WiFi,
    connections: Connections,
    oscServers:  OSCServer[],
    mqttServers: MQTTServer[],
    controls:    Control[],
}

const defaultData: AllData = {
    device: {
        name: "Basic Analog Synth",
    },
    wifi: {
        mode:     "station",
        ssid:     "WiFi-Name",
        psk:      "trustno1",
        username: "",
        password: "",
    },
    connections: {
        usb: {
            serial: {
                enabled:     true,
                speed:       115200,
                word_length: "8",
                parity:      "none",
                stop_bits:   "1.5",
            },
            midi: {
                enabled: true,
            },
        },
        midi: {
            connectors: true,
            versions:   ["1.0", "2.0"],
        }
    },
    oscServers: [{
        id:       "synth-osc",
        name:     "Analog Synth @ Raspberry",
        protocol: "udp",
        ip:       "192.168.178.54",
        port:     3819,
        prefix:   "",
    }],
    mqttServers: [{
        id:       "broker1",
        name:     "MQTT Broker Test",
        protocol: "mqtt",
        ip:       "192.168.178.10",
        port:     8883,
        username: "MQTT User",
        password: "Top Secret!",
        prefix:   "/daw",
    }],
    controls: [
        // Board 1: 2 Oscillators – Volume, Detune, Cutoff, Resonance
        {
            base: {
                general: {board: 0, slot: 0, type: "knob", name: "OSC1 Volume"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x00 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/volume", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/volume", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-volume {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 1, type: "knob", name: "OSC1 Detune"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x01 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/detune", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/detune", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-detune {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 2, type: "knob", name: "OSC1 Cutoff"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x02 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/cutoff", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/cutoff", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-cutoff {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 3, type: "knob", name: "OSC1 Resonance"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x03 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/resonance", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/resonance", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-resonance {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 4, type: "knob", name: "OSC2 Volume"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x10 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/volume", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/volume", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-volume {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 5, type: "knob", name: "OSC2 Detune"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x11 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/detune", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/detune", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-detune {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 6, type: "knob", name: "OSC2 Cutoff"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x12 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/cutoff", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/cutoff", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-cutoff {A0};"}],
        },
        {
            base: {
                general: {board: 0, slot: 7, type: "knob", name: "OSC2 Resonance"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x13 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/resonance", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/resonance", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-resonance {A0};"}],
        },

        // Board 2: 2 Oscillators – Attack, Decay, Sustain, Release
        {
            base: {
                general: {board: 1, slot: 0, type: "knob", name: "OSC1 Attack"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x04 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/attack", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/attack", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-attack {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 1, type: "knob", name: "OSC1 Decay"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x05 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/decay", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/decay", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-decay {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 2, type: "knob", name: "OSC1 Sustain"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x06 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/sustain", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/sustain", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-sustain {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 3, type: "knob", name: "OSC1 Release"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x07 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/release", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/release", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-release {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 4, type: "knob", name: "OSC2 Attack"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x14 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/attack", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/attack", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-attack {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 5, type: "knob", name: "OSC2 Decay"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x15 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/decay", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/decay", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-decay {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 6, type: "knob", name: "OSC2 Sustain"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x16 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/sustain", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/sustain", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-sustain {A0};"}],
        },
        {
            base: {
                general: {board: 1, slot: 7, type: "knob", name: "OSC2 Release"},
                inputs: {
                    a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                    b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                    c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                    a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                    a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A1}", decimals: 0, separator: ""},
                },
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "0x17 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/release", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/release", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-release {A0};"}],
        },
    ],
};

// Database object as singleton
export const db = await JSONFilePreset("db.json", defaultData);

/**
 * Get all configuration values for a control or throw "not-found", when no such
 * control is found.
 * 
 * @param board Board ID
 * @param slot Slot ID
 * @returns Control configuration
 */
export function getControlOr404(board: number, slot: number): Control {
    let result = db.data.controls.find(e => e.base.general.board === board && e.base.general.slot === slot);
    if (!result) throwNotFound();
    return result;
}