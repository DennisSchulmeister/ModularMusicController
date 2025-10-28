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
#include <esp_wifi.h>       // esp_wifi_…

namespace my_wifi {
constexpr char const* TAG = "wifi";

/////////////////////////
///// struct Config /////
/////////////////////////

Config Config::read() {
}

void Config::save() {
}

//////////////////////
///// class WiFi /////
//////////////////////

WiFi* WiFi::instance() {
    if (WiFi::_instance == nullptr) WiFi::_instance = new WiFi();
    return WiFi::_instance;
}

WiFi::WiFi()
    : _error(ESP_OK),
      _status{
          .mode  = Mode::disabled,
          .state = State::disconnected,
          .ssid  = "",
          .ip    = "",
      }
{
}

std::list<AccessPoint> WiFi::scan() {
}

esp_err_t WiFi::connect(Config config) {
}

esp_err_t WiFi::disconnect() {
}

} // namespace my_wifi