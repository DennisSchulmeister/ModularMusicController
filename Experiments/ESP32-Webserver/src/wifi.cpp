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

/**
 * Write WiFi configuration.
 */
void save_config(const config_t& config) {
}

/**
 * Read WiFi configuration.
 */
config_t read_config() {
    return {};
}

/**
 * Start or restart WiFi according to the saved WiFi configuration.
 */
void restart() {
}

/**
 * Stop all WiFi functionality.
 */
void stop() {
}

} // namespace my_wifi