/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

export type WiFiMode = "disabled" | "access_point" | "station";
export const wiFiModes = ["disabled", "access_point", "station"];

export type WiFi = {
    mode:     WiFiMode;
    ssid:     string;
    psk:      string;
    username: string;
    password: string;
};