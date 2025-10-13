/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

export type SerialWordLength = "5" | "6" | "7" | "8";
export const serialWordLengths = ["5", "6", "7", "8"];

export type SerialParity = "none" | "even" | "odd";
export const serialParities = ["none", "even", "odd"];

export type SerialStopBits = "1" | "1.5" | "2";
export const serialStopBits = ["1", "1.5", "2"];