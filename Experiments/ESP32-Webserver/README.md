Experiment: Generic LCD-Board with multiple MCUs
================================================

1. [Description](#description)
1. [Learning Targets](#learning-targets)
1. [Schematics and Pictures](#schematics-and-pictures))
1. [Learnings](#learnings)

Description
-----------

Use [PlatformIO](platformio.org), an [ESP32 development board](https://www.az-delivery.de/products/esp-32-dev-kit-c-v4),
and the [Espressif IDF](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html) framework
to implement a typical web-based configuration portal with the following features:

* Run in WiFi AP mode to provide its own network
* Alternatively connect to an existing WiFi network, supporting PSK2 and EAP
* Run a minimal web server on device that hosts the web interface
* Permanently store configuration values in non-volatile memory
* Integrate an external build system like [npm](https://www.npmjs.com/) to build the static web assets
* Compress all static files as much as possible to save on-device flash memory

Learning Targets
----------------

1. Use Espressif IDF instead of the Arduino framework with PlatformIO
1. Use ESP-IDF `menuconfig` with PlatformIO
1. Integrate an external build system for static assets with PlatformIO
1. Flash storage options on the ESP32 (FAT, SPIFFS, NVM, …)
1. Use WiFi AP mode and WiFi station mode with the ESP-IDF
1. Implement a simple webserver with the ESP-IDF

Schematics and Pictures
-----------------------

This project has no special schematics. Simply connect an ESP32 development board with power.
Below are some screenshots of the configuration portal in different states (w/o WiFi credentions,
w/ credentials, …).

TODO

Learnings
---------

1. [ESP-IDF instead of Arduino](#esp-idf-instead-of-arduino)
1. [ESP32 Flash Memory Size](#esp32-flash-memory-size)
1. [Flash Storage Options](#flash-storage-options)
1. [Custom Partition Table](#custom-partition-table)

### ESP-IDF instead of Arduino

Simply replace `framework = arduino` in `platformio.ini` with `framework = espidf`.

To run the ESP-IDF `menuconfig` use the following command (or the PlatformIO IDE user interface):

```sh
pio run -t menuconfig
pio run --target menuconfig
```

It is worth to check the [ESP32 page](https://docs.platformio.org/en/latest/platforms/espressif32.html)
in the PlatfromIO documentation to see which other options exist.

### ESP32 Flash Memory Size

By default the ESP32 configuration created by PlatformIO assumes 2MB on-board flash memory.
But e.g. on the “ESP32 WROOM-32” it is actually 4MB. Make sure to run `menuconfig` at least
once to change the value. And while at it use quad-speed for memory access to speed up
the firmware uploads.

### Flash Storage Options

The Espressif ESP-IDF supports four filesystem for the built-in flash memory and attached
memory devices more or less out of the box. Each has its strenghts and weaknesses:

* **FAT:** The classic filesystem from MS-DOS and early Windows version. Supported almost
  everywhere, but not optimized for flash memory.

* **SPIFFS:** Optimized for flash memory (wear leveling) but only a flat directory structure
  (no sub-directories, instead each `/` is part of the filename) and propably no active
  development anymore.

* *LittelFS:** Optimized for flash memory, nested directories and actively maintained. Plus
  RAM usage is strictly limited for use on embedded systems with little memory.

* **NVS:** Special key/value store specificly for the ESP32. Best suited for only a few entries
  (less than about 1000) and mostly numerical values. Zero-terminated strings and binary blobs
  are supported as values but tend to be ineffective when often changed due to the way the flash
  memory is allocated. Key names are up to 15 charactes plus 15 characters for an optional namespace.

The page [File System Considerations](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/file-system-considerations.html)
in the ESP-IDF documentation contains a more complete comparison. For our purpose, though, LittleFS
seems to be a good fit. Integration with PlatformIO is decribed in its [README](https://github.com/joltwallet/esp_littlefs?tab=readme-ov-file#platformio).

**LittleFS Gotcha:** "The esp32 has [flash concurrency constraints](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/spi_flash/spi_flash_concurrency.html#concurrency-constraints-for-flash-on-spi1).
When using UART (either for data transfer or generic logging) at the same time, you MUST
enable the following option in KConfig: _menuconfig > Component config > Driver config > UART > UART ISR in IRAM_."

### Custom Partition Table

The ESP32 is quite flexible in how to use the attached flash memory, with very little restricitons
on what can be done:

* The first 36 kB are used for the bootloader and a partition table
* At least one app partition for the firmware is needed
* It is recommended to include a NVS partition of at least 4 kB size for WiFi data

Other than that one can freely divide the available flash memory as described on the page
[Creating Custom Tables](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/partition-tables.html#creating-custom-tables)
ib the ESP-IDF documentation. Typical scenarios include:

* Readonly NVS filesystem with factory defined calibration data
* Readonly FAT, SPIFFS or LittleFS filesystem for other static data
* Writable filesystems for variable runtime data
* A coredump file system
* ...

The partition table is defined as a CSV file that will be compiled into binary format and
automatically uploaded to flash address `0x8000`. In PlatformIO the path for this file is
specified with the configuration option `board_build.partitions`. The default file names
are `default.cvs` for Arduino and `partitions_singleapp.csv` for the ESP-IDF framework.
A simple layout as used for this experiment could be:

```csv
#Name,  Type, SubType,  Offset, Size,     Flags
nvs,    data, nvs,      ,       0x6000,
app,    app,  factory,  ,       0x100000,
static, data, littlefs, ,       0x2C7000, readonly
var,    data, littlefs, ,       0x20000,
```

The offset is automatically calculated by the build tool. The size is given in bytes, though
the documentation contains examples like `1MB` that are not further explained. When booting
the ESP32 logs the partition table on the serial console:

```text
I (43) boot.esp32: SPI Flash Size : 4MB
I (47) boot: Enabling RNG early entropy source...
I (51) boot: Partition Table:
I (54) boot: ## Label            Usage          Type ST Offset   Length
I (60) boot:  0 nvs              WiFi data        01 02 00009000 00006000
I (67) boot:  1 app              factory app      00 00 00010000 00100000
I (73) boot:  2 static           Unknown data     01 83 00110000 002c7000
I (80) boot:  3 var              Unknown data     01 83 003d7000 00020000
I (86) boot: End of partition table
```

PlatformIO for ESP32 allows to automatically upload data into one filesystem. The first filesystem
of type `data` will be used and its type must be given in the configuration with `board_build.filesystem = littlefs`.
By default the content of the `data/` directory will be uploaded, but this can be changed with the
`data_dir` option. The PlatformIO target is called `uploadfs`.
See [Uploading files to the filesystem](https://docs.platformio.org/en/latest/platforms/espressif32.html#uploading-files-to-file-system)
for details.