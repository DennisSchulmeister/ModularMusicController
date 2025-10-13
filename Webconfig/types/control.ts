/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type {Format}          from "./binary.js";
import type {MIDIMessageType} from "./midi.js";
import type {OSCArgument}     from "./osc.js";

export type ControlType = "button" | "switch" | "knob" | "fader" | "ribbon" | "wheel" | "cv_gate"
                        | "rotary" | "rotary+button" | "joystick" | "touchpad" | "display" | "generic";

export const controlTypes = [
    "button", "switch", "knob", "fader", "ribbon", "wheel", "cv_gate",
    "rotary", "rotary+button", "joystick", "touchpad", "display", "generic",
];

export type ControlBase = {
    general: {
        board: number;
        slot:  number;
        type:  ControlType;
        name:  string;
    };
    inputs: {
        a:  InputParameters;
        b:  InputParameters;
        c:  InputParameters;
        a0: InputParameters;
        a1: InputParameters;
    };
};

export type InputParameters = {
    from:        number;
    to:          number;
    initial:     number;
    placeholder: string;
    decimals:    number;
    separator:   string;
};

export type ControlMIDI = {
    send:     boolean;
    receive:  boolean;
    channel:  number;
    message:  MIDIMessageType;
    data:     string;
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
    base:    ControlBase;
    midi:    ControlMIDI[];
    osc:     ControlOSC[];
    mqtt:    ControlMQTT[];
    serial:  ControlSerial[];
};