/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type {MIDIVersion}      from "./midi.js";
import type {SerialParity}     from "./serial.js";
import type {SerialStopBits}   from "./serial.js";
import type {SerialWordLength} from "./serial.js";

export type Device = {
    name: string;
};

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