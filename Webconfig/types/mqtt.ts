/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

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