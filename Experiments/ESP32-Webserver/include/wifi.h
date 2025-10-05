/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * @file wifi.h
 * @brief Configuration, status and functions for WiFi connectivity
 */

#pragma once
#include <esp_system.h>     // esp_err_t
#include <string>           // std::string

namespace my_wifi {

/**
 * WiFi mode
 */
enum class mode_t {
    disabled,           ///< WiFi disabled
    access_point,       ///< Access point mode – Run a built-in WiFi access point with its own network
    station,            ///< Station mode – Connect to a WiFi network nearby
};

/**
 * Connection status
 */
enum class state_t {
    disconnected,       ///< Disconnected
    searching,          ///< Searching for nearby networks
    connecting,         ///< Connecting as station, retrieving IP
    connected,          ///< Connected and IP retrieved
    access_point,       ///< Serving as access point
};

/**
 * WiFi configuration
 */
struct config_t {
    mode_t mode;        ///< WiFi mode
    std::string ssid;   ///< Station id (access point or station)
    std::string psk;    ///< Pre-Shared Key (access point or station)
};

/**
 * WiFi status
 */
struct status_t {
    mode_t mode;        ///< Current WiFi mode
    state_t state;      ///< Connection status
    std::string ssid;   ///< Current station id (access point or station)
    std::string ip;     ///< Current IP address
};

/**
 * Write WiFi configuration to non-volatile memory.
 * @param config The WiFi configuration
 */
void save_config(const config_t& config);

/**
 * Read WiFi configuration from non-volatile memory or return default values, if missing.
 * @returns The WiFi configuration
 */
config_t read_config();

/**
 * Get current WiFi status
 */
status_t get_status();

/**
 * Start or restart WiFi either in access point or station mode, depending
 * on the saved WiFi configuration values.
 */
esp_err_t restart();

/**
 * Stop WiFi.
 */
esp_err_t stop();

} // namespace my_wifi