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
constexpr char const* TAG = "wifi";

// Current connection status
Status status = {
    .mode  = Mode::disabled,
    .state = State::disconnected,
    .ssid  = "",
    .ip    = "",
};

void save_config(const Config& config) {
}

Config read_config() {
    return {};
}

Status get_status() {
    return status;
}

esp_err_t restart() {
    return ESP_OK;
}

esp_err_t stop() {
    return ESP_OK;
}

} // namespace my_wifi