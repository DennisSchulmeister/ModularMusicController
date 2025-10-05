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

esp_vfs_littlefs_conf_t fs_static = {
    .base_path              = "/static",
    .partition_label        = "static",
    .partition              = nullptr,
    .format_if_mount_failed = false,
    .read_only              = true,
    .dont_mount             = false,
    .grow_on_mount          = false,
};

esp_vfs_littlefs_conf_t fs_var = {
    .base_path              = "/var",
    .partition_label        = "var",
    .partition              = nullptr,
    .format_if_mount_failed = true,
    .read_only              = false,
    .dont_mount             = false,
    .grow_on_mount          = false,
};

esp_err_t mount_all() {
    ESP_LOGI(TAG, "Mounting filesystems");

    // Static data
    esp_err_t ret = esp_vfs_littlefs_register(&fs_static);

    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to mount filesystem for static data: %s", esp_err_to_name(ret));
        return ret;
    }

    // Variable data
    ret = esp_vfs_littlefs_register(&fs_var);

    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to mount filesystem for variable data: %s", esp_err_to_name(ret));
        return ret;
    }

    return ESP_OK;
}

void unmount_all() {
    ESP_LOGI(TAG, "Unmounting filesystems");
    esp_vfs_littlefs_unregister(fs_static.partition_label);
    esp_vfs_littlefs_unregister(fs_var.partition_label);
}

} // namespace my_fs