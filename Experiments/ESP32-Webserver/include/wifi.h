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

#include <esp_event.h>      // esp_event_handler_instance_t
#include <esp_netif.h>      // esp_netif_t
#include <esp_system.h>     // esp_err_t
#include <string>           // std::string
#include <vector>           // std::vector

namespace my_wifi {

/**
 * WiFi mode
 */
enum class Mode : uint8_t {
    disabled,                       ///< WiFi disabled
    access_point,                   ///< Access point mode – Run a built-in WiFi access point with its own network
    station,                        ///< Station mode – Connect to a WiFi network nearby
};

/**
 * Connection status
 */
enum class State : uint8_t {
    disconnected,                   ///< Disconnected
    searching,                      ///< Searching for nearby networks
    connecting,                     ///< Connecting as station, retrieving IP
    connected,                      ///< Connected and IP retrieved
    access_point,                   ///< Serving as access point
};

struct IPAddress {
    std::string ip;                 ///< The actual IP address
    std::string netmask;            ///< Net mask
    std::string gateway;            ///< Gateway address
};

/**
 * WiFi status
 */
struct Status {
    Mode mode;                      ///< Current WiFi mode
    State state;                    ///< Connection status
    uint8_t reconnect_count;        ///< Number of connection attempts

    std::string ssid;               ///< Current station id (access point or station)
    std::string mac;                ///< MAC address
    std::string ip4;                ///< IPv4 address
    std::string netmask;            ///< IPv4 Net mask
    std::string gateway;            ///< IPv4 Gateway address
    std::string ip6;                ///< IPv6 address
};

/**
 * Nearby access point found during the WiFi scan.
 */
struct AccessPoint {
    std::string ssid;               ///< Station id
    std::string mac;                ///< MAC address
    int8_t rssi;                    ///< Signal strength
};

/**
 * WiFi configuration
 */
struct Config {
    Mode mode;                      ///< WiFi mode
    std::string ssid;               ///< Station id (access point or station)
    std::string psk;                ///< Pre-Shared Key (access point or station)
    std::string username;           ///< User name for EAP
    std::string password;           ///< Password for EAP

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
 * Wrapper around the native ESP WiFi API. A singleton instance of this class initializes
 * the WiFi stack, configures the ESP as either Access Point or Station, scans the network
 * for available access points and manages the connection.
 * 
 * The implementation is deliberately minimal, assuming that most of the time the device
 * will be connected to a home network (WPA) and only seldom to an enterprise network (EAP).
 * To be able to initially setup the device, the device can act as a simple access point.
 * More advanced features might be added in future based on demand.
 * 
 * NOTE: IPv6 might need more code to actually work.
 * TODO: For unknown reasons this cannot connect to Fritz! mesh networks.
 */
class WiFi {
public:
    /**
     * @returns `WiFi` singleton instance
     */
    static WiFi* instance() noexcept;

    /**
     * Apply the given configuration to make the ESP appear as either an Access Point or
     * a WiFi station.
     */
    esp_err_t connect(Config config) noexcept;

    /**
     * Scan for available access points nearby. Note, that this can only be called after
     * `connect()`, because otherwise the required network interfaces are not yet initialized.
     * Note that this method blocks the caller until the scan is complete.
     * 
     * @returns Found access points
     */
    std::vector<AccessPoint> scan() noexcept;

    /**
     * Disable WiFi and uninitialize the WiFi stack.
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

    // Required by sta_reconnect_timer_cb()
    void __set_state(State state) noexcept { _status.state = state; }
    void __set_error(esp_err_t error) noexcept { _error = error; }
private:
    /**
     * Constructor.
     */
    WiFi() noexcept;

    /**
     * Static trampoline function because we cannot get a C-style function pointer
     * on the `event_handler` member function in C++.
     */
    static void _event_handler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) noexcept;

    /**
     * WiFi event handler responding to WiFi connection changes. Updates the WiFi status.
     */
    void wifi_event_handler(int32_t event_id, void* event_data) noexcept;

    /**
     * Timer callback to try reconnecting as an access point.
     */
    static void sta_reconnect_timer_cb(void* arg) noexcept;

    /**
     * IP event handler responding to IP address changes. Updates the WiFi status.
     */
    void ip_event_handler(int32_t event_id, void* event_data) noexcept;

    static WiFi* _instance;                         ///< Singleton instance
    Status _status;                                 ///< Current WiFi status
    esp_netif_t* interface;                         ///< Network interface
    esp_err_t _error;                               ///< Last error code
    esp_event_handler_instance_t eh_wifi_event;     ///< WiFi event handler instance
    esp_event_handler_instance_t eh_ip_event;       ///< IP event handler instance
};

} // namespace my_wifi