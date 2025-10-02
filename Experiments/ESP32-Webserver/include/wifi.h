/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

#pragma once
#include <string>       // std::string

using namespace std;

namespace my_wifi {

/**
 * WiFi configuration
 */
struct config_t {
    /**
     * WiFi mode
     */
    enum class mode {
        /**
         * Access point mode – Run a built-in WiFi access point with its own network
         */
        ap,
        
        /**
         * Station mode – Connect to a WiFi network nearby
         */
        station,
    } mode;

    /**
     * Station id of either the built-in access point or the network to connect to
     */
    string ssid;

    /**
     * Pre-Shared Key of either the built-in access point or the network to connect to
     */
    string psk;
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
 * Start or restart WiFi either in access point or station mode, depending
 * on the saved WiFi configuration values.
 */
void restart();

/**
 * Stop WiFi.
 */
void stop();

} // namespace my_wifi