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

# ESP-IDF instead of Arduino

Simply replace `framework = arduino` in `platformio.ini` with `framework = espidf`.

To run the ESP-IDF `menuconfig` use the following command (or the PlatformIO IDE user interface):

```sh
pio run -t menuconfig
pio run --target menuconfig
```

# ESP32 Flash Memory Size

By default the ESP32 configuration created by PlatformIO assumes 2MB on-board flash memory.
But e.g. on the “ESP32 WROOM-32” it is actually 4MB. Make sure to run `menuconfig` at least
once to change the value. And while at it use quad-speed for memory access to speed up
the firmware uploads.