/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import api__config__connections      from "./api/config/connections.js";
import api__config__control          from "./api/config/control.js";
import api__config__control_midi     from "./api/config/control-midi.js";
import api__config__control_mqtt     from "./api/config/control-mqtt.js";
import api__config__control_osc      from "./api/config/control-osc.js";
import api__config__control_range    from "./api/config/control-range.js";
import api__config__control_serial   from "./api/config/control-serial.js";
import api__config__controls         from "./api/config/controls.js";
import api__config__device           from "./api/config/device.js";
import api__config__mqtt_servers     from "./api/config/mqtt-servers.js";
import api__config__osc_servers      from "./api/config/osc-servers.js";
import api__config__wifi             from "./api/config/wifi.js";
import api__function__choose_control from "./api/function/choose-control.js";
import api__function__export         from "./api/function/export.js";
import api__function__import         from "./api/function/import.js";

// Reexport of all route handlers to satisfy the open/closed principle,
// so that we don't want to edit the main.ts file when the routes change.
export default [
    api__config__connections,
    api__config__control,
    api__config__control_midi,
    api__config__control_mqtt,
    api__config__control_osc,
    api__config__control_range,
    api__config__control_serial,
    api__config__controls,
    api__config__device,
    api__config__mqtt_servers,
    api__config__osc_servers,
    api__config__wifi,
    api__function__choose_control,
    api__function__export,
    api__function__import,
];