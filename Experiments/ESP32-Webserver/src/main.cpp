/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

#include "fs.h"
#include "wifi.h"

#include <esp_event.h>      // esp_event_loop_create_default
#include <esp_log.h>        // ESP_LOG…
#include <esp_sleep.h>      // esp_deep_sleep_start
#include <nvs_flash.h>      // nvs_flash_init

constexpr char const* TAG = "main";

/**
 * Put the CPU into deep sleep without wakeup events when the given return
 * code is not ESP_OK. This is the best we can do in software to halt the
 * CPU without consuming much power.
 * 
 * @param[in] ret Return code
 */
void sleep_on_error(esp_err_t ret) {
    if (ret == ESP_OK) return;

    const char* name = esp_err_to_name(ret);
    ESP_LOGE(TAG, "Going into deep sleep due to unrecoverable error %s", name ? name : "UNKNOWN");

    esp_deep_sleep_start();
}

/**
 * Main entry point
 */
extern "C" void app_main() {
    // Initialize core functions
    esp_err_t error = nvs_flash_init();

    if (error == ESP_ERR_NVS_NO_FREE_PAGES || error == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        sleep_on_error(nvs_flash_erase());
        sleep_on_error(nvs_flash_init());
    } else {
        sleep_on_error(error);
    }

    sleep_on_error(esp_event_loop_create_default());

    // Mount flash partitions
    auto static_partition = my_fs::Partition::mount({
        .partition = "static",
        .base_path = "/static",
        .readonly  = true,
    });
    
    sleep_on_error(static_partition.error());

    auto var_partition = my_fs::Partition::mount({
        .partition = "var",
        .base_path = "/var",
        .readonly  = false,
    });
    
    sleep_on_error(var_partition.error());

    // Start WiFi    
    my_wifi::Config wifi_config = my_wifi::Config::read();
    my_wifi::WiFi::instance()->connect(wifi_config);
    sleep_on_error(my_wifi::WiFi::instance()->error());

    // // Wait to let the WiFi AP settle
    // vTaskDelay(25000 / portTICK_PERIOD_MS);
    // my_wifi::WiFi::instance()->scan();   
    // sleep_on_error(my_wifi::WiFi::instance()->error());
}