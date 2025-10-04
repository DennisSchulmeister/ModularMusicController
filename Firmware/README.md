Firmwares
=========

This directory contains the firmware source for each board. Currently these are:

| **Directory**                         | **Type** |**Contents** |
|---------------------------------------|----------|-------------|
| [common](common/)                     | Library  | Shared code |
| [controller](controller/)             | Firmware | Controller board that talks to the main board |
| [main](main/)                         | Firmware | The main board which connects the controllers to the outside world |

When adding a new sub-folder make sure to include it in the parent [`platformio.ini`](./platformio.ini).
Also beware, that when doing so, the PlatformIO environments must have globally unique names.
Such is the price for being able to edit all projects at once and share settings between them.
Use names that start with `fw-` for firmwares and `ex-` for experiments, followed by a string
that resembles the directory name.