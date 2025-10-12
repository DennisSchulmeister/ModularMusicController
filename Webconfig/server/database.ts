/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import { JSONFilePreset } from "lowdb/node";
import { throwNotFound } from "./utils.js";

// Typescript type declarations for all configuration values
export type Device = {
    name: string;
};

export type WifiMode = "disabled" | "access_point" | "station";
export const wifiModes = ["disabled", "access_point", "station"];

export type Wifi = {
    mode:     WifiMode;
    ssid:     string;
    psk:      string;
    username: string;
    password: string;
};

export type MIDIVersion = "1.0" | "2.0";
export const midiVersions = ["1.0", "2.0"];

export type SerialWordLength = 5 | 6 | 7 | 8;
export const serialWordLengths = [5, 6, 7, 8];

export type SerialParity = "none" | "even" | "odd";
export const serialParities = ["none", "even", "odd"];

export type SerialStopBits = 1 | 1.5 | 2;
export const serialStopBits = [1, 1.5, 2];

export type Connections = {
    usb: {
        serial: {
            enabled:     boolean;
            speed:       number;
            word_length: SerialWordLength;
            parity:      SerialParity,
            stop_bits:   SerialStopBits,
        },
        midi: {
            enabled: boolean;
        }
    },
    midi: {
        connectors: boolean;
        versions:   MIDIVersion[];
    },
};

export type OSCProtocol = "udp" | "tcp";
export const oscProtocols = ["udp", "tcp"]; 

export type OSCServer = {
    id:       string;
    name:     string;
    protocol: OSCProtocol;
    ip:       string;
    port:     number;
    prefix:   string;
};

export type MQTTProtocol = "mqtt" | "ws";
export const mqttProtocols = ["mqtt", "ws"];

export type MQTTServer = {
    id:       string;
    name:     string;
    protocol: MQTTProtocol;
    ip:       string;
    port:     number;
    username: string;
    password: string;
    prefix:   string;
};

export type ControlType = "button" | "switch" | "knob" | "fader" | "ribbon" | "wheel" | "cv_gate"
                        | "rotary" | "rotary+button" | "joystick" | "touchpad" | "display" | "generic";

export const controlTypes = [
    "button", "switch", "knob", "fader", "ribbon", "wheel", "cv_gate",
    "rotary", "rotary+button", "joystick", "touchpad", "display", "generic",
];

export type ControlGeneral = {
    board: number;
    slot:  number;
    type:  ControlType;
    name:  string;
};

export type RangeParameters = {
    from:        number;
    to:          number;
    initial:     number;
    placeholder: string;
    decimals:    number;
    separator:   string;
};
export type ControlRange = {
    a:  RangeParameters;
    b:  RangeParameters;
    c:  RangeParameters;
    a0: RangeParameters;
    a1: RangeParameters;
};

export type MIDI_NoteOff              = "80";
export type MIDI_NoteOn               = "90";
export type MIDI_PolyKeyPressure      = "A0";
export type MIDI_ControlChange        = "B0";
export type MIDI_ProgramChange        = "C0";
export type MIDI_ChannelPressure      = "D0";
export type MIDI_PitchBend            = "E0";
export type MIDI_SystemExclusive      = "F0";
export type MIDI_TimeCodeQuarterFrame = "F1";
export type MIDI_SongPositionPointer  = "F2";
export type MIDI_SongSelect           = "F3";
export type MIDI_TuneRequest          = "F6";
export type MIDI_TimingClock          = "F8";
export type MIDI_Start                = "FA";
export type MIDI_Continue             = "FB";
export type MIDI_Stop                 = "FC";
export type MIDI_SystemReset          = "FF";

export type MIDIMessageType = MIDI_NoteOff
                            | MIDI_NoteOn
                            | MIDI_PolyKeyPressure
                            | MIDI_ControlChange
                            | MIDI_ProgramChange
                            | MIDI_ChannelPressure
                            | MIDI_PitchBend
                            | MIDI_SystemExclusive
                            | MIDI_TimeCodeQuarterFrame
                            | MIDI_SongPositionPointer
                            | MIDI_SongSelect
                            | MIDI_TuneRequest
                            | MIDI_TimingClock
                            | MIDI_Start
                            | MIDI_Continue
                            | MIDI_Stop
                            | MIDI_SystemReset;

export const midiMessageTypes = ["80", "90", "A0", "B0", "C0", "D0", "E0", "F0", "F1", "F2", "F3", "F6", "F8", "FA", "FB", "FC", "FF"];

export type ControlMIDI = {
    send:     boolean;
    receive:  boolean;
    channel:  number;
    message:  MIDIMessageType;
    data:     string;
};

export type Format = "text" | "binary";
export const formats = ["text", "binary"];

export type OSCType = "i" | "f" | "s" | "b" | "S" | "T" | "F" | "N";
export const oscTypes = ["i", "f", "s", "b", "S", "T", "F", "N"];

export type OSCArgument = {
    type:   OSCType;
    format: Format;
    value:  string;
};

export type ControlOSC = {
    send:      boolean;
    receive:   boolean;
    server:    string;
    address:   string;
    arguments: OSCArgument[],
};

export type ControlMQTT = {
    send:    boolean;
    receive: boolean;
    server:  string;
    topic:   string;
    format:  Format;
    data:    string;
};

export type ControlSerial = {
    send:    boolean;
    receive: boolean;
    format:  Format;
    data:    string;
};

export type Control = {
    general: ControlGeneral;
    range:   ControlRange;
    midi:    ControlMIDI[];
    osc:     ControlOSC[];
    mqtt:    ControlMQTT[];
    serial:  ControlSerial[];
};

// Default data for the mock database
export type AllData = {
    device:      Device,
    wifi:        Wifi,
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
                word_length: 8,
                parity:      "none",
                stop_bits:   1.5,
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
            general: {board: 0, slot: 0, type: "knob", name: "OSC1 Volume"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "00 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/volume", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/volume", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-volume {A0};"}],
        },
        {
            general: {board: 0, slot: 1, type: "knob", name: "OSC1 Detune"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "01 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/detune", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/detune", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-detune {A0};"}],
        },
        {
            general: {board: 0, slot: 2, type: "knob", name: "OSC1 Cutoff"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "02 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/cutoff", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/cutoff", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-cutoff {A0};"}],
        },
        {
            general: {board: 0, slot: 3, type: "knob", name: "OSC1 Resonance"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "03 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/resonance", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/resonance", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-resonance {A0};"}],
        },
        {
            general: {board: 0, slot: 4, type: "knob", name: "OSC2 Volume"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "10 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/volume", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/volume", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-volume {A0};"}],
        },
        {
            general: {board: 0, slot: 5, type: "knob", name: "OSC2 Detune"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "11 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/detune", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/detune", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-detune {A0};"}],
        },
        {
            general: {board: 0, slot: 6, type: "knob", name: "OSC2 Cutoff"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "12 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/cutoff", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/cutoff", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-cutoff {A0};"}],
        },
        {
            general: {board: 0, slot: 7, type: "knob", name: "OSC2 Resonance"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "13 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/resonance", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/resonance", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-resonance {A0};"}],
        },

        // Board 2: 2 Oscillators – Attack, Decay, Sustain, Release
        {
            general: {board: 1, slot: 0, type: "knob", name: "OSC1 Attack"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "04 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/attack", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/attack", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-attack {A0};"}],
        },
        {
            general: {board: 1, slot: 1, type: "knob", name: "OSC1 Decay"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "05 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/decay", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/decay", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-decay {A0};"}],
        },
        {
            general: {board: 1, slot: 2, type: "knob", name: "OSC1 Sustain"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "06 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/sustain", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/sustain", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-sustain {A0};"}],
        },
        {
            general: {board: 1, slot: 3, type: "knob", name: "OSC1 Release"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "07 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc1/release", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc1/release", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc1-release {A0};"}],
        },
        {
            general: {board: 1, slot: 4, type: "knob", name: "OSC2 Attack"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "14 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/attack", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/attack", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-attack {A0};"}],
        },
        {
            general: {board: 1, slot: 5, type: "knob", name: "OSC2 Decay"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "15 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/decay", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/decay", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-decay {A0};"}],
        },
        {
            general: {board: 1, slot: 6, type: "knob", name: "OSC2 Sustain"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "16 {A0}"}],
            osc:     [{send: true, receive: true, server: "synth-osc", address: "/osc2/sustain", arguments: [{type: "f", format: "binary", value: "{A0}"}]}],
            mqtt:    [{send: true, receive: true, server: "broker1", topic: "/osc2/sustain", format: "text", data: "set {A0}"}],
            serial:  [{send: true, receive: true, format: "text", data: "osc2-sustain {A0};"}],
        },
        {
            general: {board: 1, slot: 7, type: "knob", name: "OSC2 Release"},
            range:   {
                a:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A}",  decimals: 0, separator: ""},
                b:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{B}",  decimals: 0, separator: ""},
                c:  {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{C}",  decimals: 0, separator: ""},
                a0: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
                a1: {from: 0.0, to: 1.0, initial: 0.0, placeholder: "{A0}", decimals: 0, separator: ""},
            },
            midi:    [{send: true, receive: true, channel: 1, message: "C0", data: "17 {A0}"}],
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
    let result = db.data.controls.find(e => e.general.board === board && e.general.slot === slot);
    if (!result) throwNotFound();
    return result;
}