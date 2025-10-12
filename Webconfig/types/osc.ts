/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import type {Format} from "./binary.js";

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

export type OSCType = "i" | "f" | "s" | "b" | "S" | "T" | "F" | "N";
export const oscTypes = ["i", "f", "s", "b", "S", "T", "F", "N"];

export type OSCArgument = {
    type:   OSCType;
    format: Format;
    value:  string;
};