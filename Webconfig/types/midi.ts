/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

export type MIDIVersion = "1.0" | "2.0";
export const midiVersions = ["1.0", "2.0"];

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
