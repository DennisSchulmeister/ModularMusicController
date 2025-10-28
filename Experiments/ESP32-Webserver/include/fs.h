/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * @file fs.h
 * @brief Mounting and unmounting the flash filesystems
 */

#pragma once

#include <esp_system.h>     // esp_err_t
#include <string>           // std::string

namespace my_fs {

/**
 * Mount options for mounting a partition.
 */
struct MountOptions {
    std::string partition;          ///< Partition label
    std::string base_path;          ///< Mounting point
    bool readonly;                  ///< Mount read-only and don't format on error
};

/**
 * Wrapper around the native ESP filesystem API to mount a LittleFS partition from the
 * internal flash storage into the virtual file system.
 * 
 * Usually it is okay to leave the partition mounted forever, which means to keep the
 * object instance around and never explicitly call `unmount()`, either. But the partition
 * must be unmounted if it is reformated during normal operation (not during flashing via
 * the bootloader) or when the system is put into deep sleep and the flash chips are
 * powered off. But both is very seldom.
 */
class Partition {
public:
    /**
     * Mount a new partition using the given mount options. This returns a Partition object
     * instance that must be kept around for as long as the partition should remain mounted.
     * In case of an error the `error` attribute will contain the error code.
     * 
     * @param[in] options Mount options
     * @returns Partition instance
     */
    static Partition mount(MountOptions options) noexcept;

    /**
     * Explicitly remount the partition again.
     * @returns Error code
     */
    esp_err_t remount() noexcept;

    /**
     * Explicitly unmount the partition again. Otherwise it will be automatically unmounted
     * when the object gets destroyed. Errors will be silently ignored.
     */
    void unmount() noexcept;

    /**
     * @returns The error code from mounting the partition
     */
    esp_err_t error() noexcept { return _error; }

    /**
     * Destructor – automatically unmounts the partition.
     */
    ~Partition() noexcept;

private:
    /**
     * Constructor – automatically mounts the partition.
     * @param[in] options Mount options
     */
    Partition(MountOptions options) noexcept;

    MountOptions options;           ///< Mount options
    bool mounted;                   ///< Partition is mounted
    esp_err_t _error;               ///< Last error code
};

} // namespace my_fs