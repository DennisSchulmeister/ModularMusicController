/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

#pragma once
#include <esp_system.h>     // esp_err_t

namespace my_fs {

/**
 * Mount all filesystems into the VFS. Usually it is okay to leave the filesystems
 * mounted forever, unless the partitions are rewritten or reformated during normal
 * operation (not the bootloader stage when flashing a new firmware) or the system
 * is put into deep sleep with powered off flash chips. But this is very seldom.
 * 
 * Mounts the following paths:
 * 
 * - `/static`: Static read-only data e.g. for the web portal
 * - `/var`: Variable data e.g. for configuration files or logging
 */
esp_err_t mount_all();

/**
 * Unmount all filesystems from the VFS. Does nothing if the filesystems have not
 * been mounted before.
 */
void unmount_all();

} // namespace my_fs