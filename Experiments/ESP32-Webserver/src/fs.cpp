/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

#include "fs.h"
#include <esp_littlefs.h>       // esp_vfs_littlefs…
#include <esp_log.h>            // ESP_LOG…

namespace my_fs {
constexpr char const* TAG = "fs";

///////////////////////////
///// class Partition /////
///////////////////////////

Partition::Partition(MountOptions options)
    : options(options),
      mounted(false),
      _error(ESP_OK)
{
    remount();
}

Partition::~Partition() {
    unmount();
}

Partition Partition::mount(MountOptions options) {
    return Partition(options);
}

esp_err_t Partition::remount() {
    ESP_LOGI(TAG, "Mounting %s", options.partition.c_str());

    esp_vfs_littlefs_conf_t conf_littlefs = {
        .base_path              = options.base_path.c_str(),
        .partition_label        = options.partition.c_str(),
        .partition              = nullptr,
        .format_if_mount_failed = !options.readonly,
        .read_only              = options.readonly,
        .dont_mount             = false,
        .grow_on_mount          = false,
    };

    _error = esp_vfs_littlefs_register(&conf_littlefs);

    if (_error != ESP_OK) {
        ESP_LOGE(TAG, "Failed to mount %s: %s", options.partition.c_str(), esp_err_to_name(_error));
    } else {
        mounted = true;
    }

    return _error;
}

void Partition::unmount() {
    if (!mounted) return;
    
    ESP_LOGI(TAG, "Unmounting %s", options.partition.c_str());

    esp_vfs_littlefs_unregister(options.partition.c_str());
    mounted = false;
}

} // namespace my_fs