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
#include <esp_log.h>    // ESP_LOG…
#include <esp_sleep.h>  // esp_deep_sleep_start

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
    ESP_LOGE(TAG, "Going into deep sleep due to unrecoverable error");
    esp_deep_sleep_start();
}

/**
 * Main entry point
 */
extern "C" void app_main() {
    auto static_partition = my_fs::Partition::mount({
        .partition = "static",
        .base_path = "/static",
        .readonly  = true,
    });
    
    auto var_partition = my_fs::Partition::mount({
        .partition = "var",
        .base_path = "/var",
        .readonly  = false,
    });
    
    sleep_on_error(static_partition.error());
    sleep_on_error(var_partition.error());
    // sleep_on_error(my_wifi::restart());
}