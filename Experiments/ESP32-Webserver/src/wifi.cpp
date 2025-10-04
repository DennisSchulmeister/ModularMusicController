/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

using namespace std;

#include "wifi.h"

namespace my_wifi {

// Current connection status
status_t status = {
    .mode  = mode_t::disabled,
    .state = state_t::disconnected,
    .ssid  = "",
    .ip    = "",
};

void save_config(const config_t& config) {
}

config_t read_config() {
    return {};
}

status_t get_status() {
    return status;
}

void restart() {
}

void stop() {
}

} // namespace my_wifi