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

#include "file.h"           // my_file::…
#include <algorithm>        // std::min
#include <cstring>          // std::strncpy
#include <esp_eap_client.h> // esp_wifi_sta_enterprise_…, esp_eap_client_…
#include <esp_event.h>      // esp_event_…
#include <esp_log.h>        // ESP_LOG…
#include <esp_mac.h>        // MAC2STR, MACSTR
#include <esp_netif.h>      // esp_netif_…
#include <esp_wifi.h>       // esp_wifi_…

namespace my_wifi {
constexpr char const* TAG = "wifi";

/////////////////////////
///// struct Config /////
/////////////////////////

constexpr const char* config_file = "/var/config/wifi";

Config Config::read() noexcept {
    Config config{
        .mode     = Mode::access_point,
        .ssid     = "Modular-Music-Controller",
        .psk      = "Modular-Music-Controller",
        .username = "",
        .password = "",
    };

    my_file::IFF_Reader iff_reader{config_file};

    constexpr size_t buffer_size = 257;
    char buffer[buffer_size] = {};

    while (true) {
        auto chunk = iff_reader.peek();

        if (chunk.type == "mode") {
            iff_reader.chunk(reinterpret_cast<char*>(&config.mode), sizeof(config.mode));
        } else if (chunk.type == "ssid") {
            iff_reader.chunk(buffer, buffer_size - 1);  // -1 to keep the final zero-byte
            config.ssid = std::string(buffer);
        } else if (chunk.type == "psk ") {
            iff_reader.chunk(buffer, buffer_size - 1);
            config.psk = std::string(buffer);
        } else if (chunk.type == "user") {
            iff_reader.chunk(buffer, buffer_size - 1);
            config.username = std::string(buffer);
        } else if (chunk.type == "pass") {
            iff_reader.chunk(buffer, buffer_size - 1);
            config.password = std::string(buffer);
        } else if (chunk.type == "    ") {
            break;
        } else {
            iff_reader.skip();
        }
    }

    iff_reader.close();
    return config;
}

void Config::save() noexcept {
    my_file::IFF_Writer iff_writer{config_file};

    iff_writer.chunk("mode", reinterpret_cast<const char *>(&mode), sizeof(mode));
    iff_writer.chunk("ssid", ssid.c_str(), ssid.size());
    iff_writer.chunk("psk ", psk.c_str(), psk.size());
    iff_writer.chunk("user", username.c_str(), username.size());
    iff_writer.chunk("pass", password.c_str(), password.size());

    iff_writer.close();
}

//////////////////////
///// class WiFi /////
//////////////////////

WiFi* WiFi::_instance = nullptr;

WiFi* WiFi::instance() noexcept {
    if (WiFi::_instance == nullptr) WiFi::_instance = new WiFi();
    return WiFi::_instance;
}

WiFi::WiFi() noexcept
    : _status{
        .mode            =   Mode::disabled,
        .state           =   State::disconnected,
        .reconnect_count = 0,
        .ssid            = "",
        .mac             = "",
        .ip4             = "",
        .netmask         = "",
        .gateway         = "",
        .ip6             = "",
    },
    interface(nullptr),
    _error(ESP_OK),
    eh_wifi_event(0),
    eh_ip_event(0)
{
}

esp_err_t WiFi::connect(Config config) noexcept {
    // Initialize network device
    disconnect();

    _error = esp_netif_init();
    if (_error != ESP_OK) return _error;

    switch (config.mode) {
        case Mode::access_point:
            ESP_LOGI(TAG, "Connecting as WiFi Access Point with SSID %s", config.ssid.c_str());
            interface = esp_netif_create_default_wifi_ap();
            break;
        case Mode::station:
            ESP_LOGI(TAG, "Connecting as WiFi Station to SSID %s", config.ssid.c_str());
            interface = esp_netif_create_default_wifi_sta();
            break;
        default:
            _error = ESP_OK;
            return ESP_OK;
    }

    _status.mode = config.mode;
    _status.reconnect_count = 0;

    // Start WiFi
    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();

    _error = esp_wifi_init(&wifi_init_config);
    if (_error != ESP_OK) return _error;
    
    // Register event handlers
    esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &WiFi::_event_handler, this, &eh_wifi_event);
    esp_event_handler_instance_register(IP_EVENT, ESP_EVENT_ANY_ID, &WiFi::_event_handler, this, &eh_ip_event);

    // Setup access point / station
    wifi_config_t wifi_config{};

    switch (config.mode) {
        case Mode::access_point: {
            wifi_config.ap.authmode = config.psk.size() > 0 ? WIFI_AUTH_WPA2_WPA3_PSK : WIFI_AUTH_OPEN;
            wifi_config.ap.sae_pwe_h2e = WPA3_SAE_PWE_BOTH;
            wifi_config.ap.bss_max_idle_cfg.period = WIFI_AP_DEFAULT_MAX_IDLE_PERIOD;
            wifi_config.ap.bss_max_idle_cfg.protected_keep_alive = 1;

            std::strncpy(
                /* dst */ reinterpret_cast<char*>(&wifi_config.ap.ssid),
                /* src */ config.ssid.c_str(),
                /* len */ std::min(config.ssid.size(), static_cast<std::size_t>(MAX_SSID_LEN))
            );

            std::strncpy(
                /* dst */ reinterpret_cast<char*>(&wifi_config.ap.password),
                /* src */ config.psk.c_str(),
                /* len */ std::min(config.ssid.size(), static_cast<std::size_t>(MAX_PASSPHRASE_LEN))
            );

            _error = esp_wifi_set_mode(WIFI_MODE_STA);
            if (_error != ESP_OK) return _error;

            _error = esp_wifi_set_config(WIFI_IF_AP, &wifi_config);
            if (_error != ESP_OK) return _error;

            _status.state = State::access_point;
            break;
        }
        case Mode::station: {
            wifi_config.sta.threshold.authmode = WIFI_AUTH_OPEN;
            wifi_config.sta.failure_retry_cnt  = MY_WIFI_MAX_RETRY_COUNT;
            wifi_config.sta.scan_method        = WIFI_ALL_CHANNEL_SCAN;         // Required for failure_retry_cnt

            std::strncpy(
                /* dst */ reinterpret_cast<char*>(&wifi_config.sta.ssid),
                /* src */ config.ssid.c_str(),
                /* len */ std::min(config.ssid.size(), static_cast<std::size_t>(MAX_SSID_LEN))
            );

            std::strncpy(
                /* dst */ reinterpret_cast<char*>(&wifi_config.sta.password),
                /* src */ config.psk.c_str(),
                /* len */ std::min(config.ssid.size(), static_cast<std::size_t>(MAX_PASSPHRASE_LEN))
            );

            _error = esp_wifi_set_mode(WIFI_MODE_AP);
            if (_error != ESP_OK) return _error;

            _error = esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
            if (_error != ESP_OK) return _error;

            // Enable enterprise authentication
            if (config.username.size() > 0) {
                _error = esp_eap_client_set_username(reinterpret_cast<const unsigned char*>(config.username.c_str()), config.username.size());
                if (_error != ESP_OK) return _error;

                if (config.password.size() > 0) {
                    _error = esp_eap_client_set_password(reinterpret_cast<const unsigned char*>(config.password.c_str()), config.password.size());
                    if (_error != ESP_OK) return _error;
                }

                esp_eap_client_set_disable_time_check(true);
                esp_eap_client_use_default_cert_bundle(true);

                _error = esp_wifi_sta_enterprise_enable();
                if (_error != ESP_OK) return _error;
            }

            _status.state = State::connecting;
            break;
        }
        default:
            // Nothig to do – Surpress compilation error
            break;
    }

    _error = esp_wifi_start();
    if (_error != ESP_OK) return _error;

    return ESP_OK;
}

void WiFi::_event_handler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) noexcept {
    WiFi* wifi = reinterpret_cast<WiFi*>(arg);
    
    if (event_base == WIFI_EVENT) {
        wifi->wifi_event_handler(event_id, event_data);
    } else if (event_base == IP_EVENT) {
        wifi->ip_event_handler(event_id, event_data);
    }
}

void WiFi::wifi_event_handler(int32_t event_id, void* event_data) noexcept {
    char buffer[128] = {};

    switch (event_id) {
        case WIFI_EVENT_STA_START:
        case WIFI_EVENT_STA_DISCONNECTED: {
            if (_status.reconnect_count++ < MY_WIFI_MAX_RETRY_COUNT) {
                ESP_LOGI(TAG, "Trying to connect ...");
                _status.state = State::connecting;
                _error = esp_wifi_connect();
            } else {
                ESP_LOGI(TAG, "Unable to connect to access point after %i atempts", _status.reconnect_count);
                _status.state = State::disconnected;
            }

            break;
        }
        case WIFI_EVENT_STA_CONNECTED: {
            auto event = reinterpret_cast<wifi_event_sta_connected_t*>(event_data);
            
            std::snprintf(buffer, sizeof(buffer), MACSTR, MAC2STR(event->bssid));
            _status.mac = buffer;
            
            _status.state = State::connected;
            _status.reconnect_count = 0;

            ESP_LOGI(TAG, "Connected to access point %s", _status.mac.c_str());
            break;
        }
        case WIFI_EVENT_AP_STACONNECTED: {
            auto event = reinterpret_cast<wifi_event_ap_staconnected_t*>(event_data);
            ESP_LOGI(TAG, "Station " MACSTR " connected to access point", MAC2STR(event->mac));
            break;
        }
        case WIFI_EVENT_AP_STADISCONNECTED: {
            auto event = reinterpret_cast<wifi_event_ap_stadisconnected_t*>(event_data);
            ESP_LOGI(TAG, "Station " MACSTR " disconnected from access point", MAC2STR(event->mac));
            break;
        }
    }
}

void WiFi::ip_event_handler(int32_t event_id, void* event_data) noexcept {
    char buffer[128] = {};

    switch (event_id) {
        case IP_EVENT_STA_GOT_IP: {
            auto event = reinterpret_cast<ip_event_got_ip_t*>(event_data);

            _status.state = State::connected;
            _status.reconnect_count = 0;
            
            std::snprintf(buffer, sizeof(buffer), IPSTR, IP2STR(&event->ip_info.ip));
            _status.ip4 = buffer;

            std::snprintf(buffer, sizeof(buffer), IPSTR, IP2STR(&event->ip_info.netmask));
            _status.netmask = buffer;

            std::snprintf(buffer, sizeof(buffer), IPSTR, IP2STR(&event->ip_info.gw));
            _status.gateway = buffer;

            ESP_LOGI(TAG, "Got IPv4 address %s", _status.ip4);
            break;
        }
        case IP_EVENT_GOT_IP6: {
            auto event = reinterpret_cast<ip_event_got_ip6_t*>(event_data);

            _status.state = State::connected;
            _status.reconnect_count = 0;

            std::snprintf(buffer, sizeof(buffer), IPV6STR, IPV62STR(event->ip6_info.ip));
            _status.ip6 = buffer;

            ESP_LOGI(TAG, "Got IPv6 address %s", _status.ip6);
            break;
        }
        case IP_EVENT_STA_LOST_IP: {
            _status.ip4     = "";
            _status.netmask = "";
            _status.gateway = "";

            ESP_LOGI(TAG, "Lost IPv4 address");
            break;
        }
    }
}

std::vector<AccessPoint> WiFi::scan() noexcept {
    ESP_LOGI(TAG, "Starting WiFi scan");

    _error = esp_wifi_scan_start(
        /* config */ NULL,      // Default scan configuration
        /* block  */ true
    );

    if (_error != ESP_OK) return {};

    uint16_t number = 0;
    _error = esp_wifi_scan_get_ap_num(&number);
    if (!_error != ESP_OK) return {};

    std::vector<AccessPoint> result{};
    result.reserve(number);

    for (int i = 0; i < number; i++) {
        wifi_ap_record_t ap_record{};

        _error = esp_wifi_scan_get_ap_record(&ap_record);
        if (_error != ESP_OK) return {};

        char mac_address[18];
        snprintf(mac_address, sizeof(mac_address), "%02x:%02x:%02x:%02x:%02x:%02x",
            ap_record.bssid[0], ap_record.bssid[1], ap_record.bssid[2],
            ap_record.bssid[3], ap_record.bssid[4], ap_record.bssid[5]
        );

        AccessPoint access_point{
            .ssid = reinterpret_cast<char const*>(ap_record.ssid),
            .mac  = mac_address,
            .rssi = ap_record.rssi,
        };

        result.push_back(access_point);
        ESP_LOGI(TAG, " - SSID: %s, MAC: %s, RSSI: %i", access_point.ssid, access_point.mac, access_point.rssi);
    }

    ESP_LOGI(TAG, "Wifi Scan finished");

    esp_wifi_clear_ap_list();
    return result;
}

esp_err_t WiFi::disconnect() noexcept {
    // Unregister event handlers
    if (!interface) return ESP_OK;
    ESP_LOGI(TAG, "Disconnecting from WiFi");
    
    if (eh_wifi_event) {
        esp_event_handler_instance_unregister(WIFI_EVENT, ESP_EVENT_ANY_ID, eh_wifi_event);
        eh_wifi_event = 0;
    }

    if (eh_ip_event) {
        esp_event_handler_instance_unregister(IP_EVENT, ESP_EVENT_ANY_ID, eh_ip_event);
        eh_ip_event = 0;
    }
    
    // Stop WiFi
    if (_status.mode == Mode::station) {
        esp_wifi_sta_enterprise_disable();

        _error = esp_wifi_disconnect();
        if (_error != ESP_OK) return _error;
    }

    _error = esp_wifi_stop();
    if (_error != ESP_OK) return _error;

    _error = esp_wifi_deinit();
    if (_error != ESP_OK) return _error;

    // Destroy network interface
    esp_netif_destroy_default_wifi(interface);
    interface = nullptr;
    
    _status.state = State::disconnected;
    return ESP_OK;
}

} // namespace my_wifi