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
#include <list>             // std::list
#include <string>           // std::string

namespace my_wifi {

/**
 * WiFi mode
 */
enum class Mode {
    disabled,                   ///< WiFi disabled
    access_point,               ///< Access point mode – Run a built-in WiFi access point with its own network
    station,                    ///< Station mode – Connect to a WiFi network nearby
};

/**
 * Connection status
 */
enum class State {
    disconnected,               ///< Disconnected
    searching,                  ///< Searching for nearby networks
    connecting,                 ///< Connecting as station, retrieving IP
    connected,                  ///< Connected and IP retrieved
    access_point,               ///< Serving as access point
};

/**
 * WiFi status
 */
struct Status {
    Mode mode;                  ///< Current WiFi mode
    State state;                ///< Connection status
    std::string ssid;           ///< Current station id (access point or station)
    std::string mac;            ///< MAC address
    std::string ip;             ///< Current IP address
};

/**
 * Nearby access point found during the WiFi scan.
 */
struct AccessPoint {
    std::string ssid;           ///< Station id
    std::string mac;            ///< MAC address
    int8_t rssi;                ///< Signal strength
};

/**
 * WiFi configuration
 */
struct Config {
    Mode mode;                  ///< WiFi mode
    std::string ssid;           ///< Station id (access point or station)
    std::string psk;            ///< Pre-Shared Key (access point or station)
    std::string username;       ///< User name for EAP
    std::string password;       ///< Password for EAP

    /**
     * Read saved WiFi configuration from flash memory or return defaults,
     * if no configuration has been saved before.
     * 
     * @returns WiFi configuration
     */
    static Config read() noexcept;

    /**
     * Save current WiFi configuration to flash memory.
     */
    void save() noexcept;
};

/**
 * 
 */
class WiFi {
public:
    /**
     * @returns `WiFi` singleton instance
     */
    static WiFi* instance() noexcept;

    /**
     * 
     */
    std::list<AccessPoint> scan() noexcept;

    /**
     * 
     */
    esp_err_t connect(Config config) noexcept;

    /**
     * 
     */
    esp_err_t disconnect() noexcept;

    /**
     * @returns The last error code
     */
    esp_err_t error() noexcept { return _error; }

    /**
     * @returns Current WiFi status
     */
    Status status() noexcept { return _status; }

private:
    /**
     * Constructor.
     */
    WiFi() noexcept;

    static WiFi* _instance;     ///< Singleton instance

    esp_err_t _error;           ///< Last error code
    Status _status;             ///< Current WiFi status
};

} // namespace my_wifi