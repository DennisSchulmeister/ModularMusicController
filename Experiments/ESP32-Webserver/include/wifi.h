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

namespace my_wifi {

/**
 * WiFi mode
 */
enum class mode_t {
    /**
     * WiFi disabled
     */
    disabled,

    /**
     * Access point mode – Run a built-in WiFi access point with its own network
     */
    access_point,
    
    /**
     * Station mode – Connect to a WiFi network nearby
     */
    station,
};

/**
 * Connection status
 */
enum class state_t {
    /**
     * Disconnected
     */
    disconnected,

    /**
     * Searching for nearby networks
     */
    searching,

    /**
     * Connecting as station, retrieving IP
     */
    connecting,

    /**
     * Connected and IP retrieved
     */
    connected,

    /**
     * Serving as access point
     */
    access_point,
};

/**
 * WiFi configuration
 */
struct config_t {
    /**
     * WiFi mode
     */
    mode_t mode;

    /**
     * Station id (access point or station)
     */
    std::string ssid;

    /**
     * Pre-Shared Key (access point or station)
     */
    std::string psk;
};

/**
 * WiFi status
 */
struct status_t {
    /**
     * Current WiFi mode
     */
    mode_t mode;

    /**
     * Connection status
     */
    state_t state;

    /**
     * Current station id (access point or station)
     */
    std::string ssid;

    /**
     * Current IP address
     */
    std::string ip;
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
void restart();

/**
 * Stop WiFi.
 */
void stop();

} // namespace my_wifi