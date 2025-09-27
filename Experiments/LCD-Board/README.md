Experiment: Generic LCD-Board with multiple MCUs
================================================

1. [Description](#description)
1. [Learning Targets](#learning-targets)
1. [Actual Learnings](#actual-learnings)
1. [Hardware Schematics](#hardware-schematics)

Description
-----------

Use [PlatformIO](platformio.org) to develop a small generic board with an LCD, a rotary encoder
and a button that can serve as a simple UI for remote microcontroller attached via UART. Use the
Arduino libraries for prototyping and also the Arduino Uno to program the Atmega328p MCU. Use the
same project to build an additional sample project that shows how to use the new board. Build the
sample for different platform architectures (here Arduino UNO and ESP32).

Learning Targets
----------------

1. Install the PlatformIO IDE extension in VS Code
1. Structure a project with multiple target platforms
1. Build distinct firmware programs for each target
1. Build the same code for different architectures, where needed
1. Share code between the firmware programs
1. Include external libraries
1. Flash an Arduino board with PlatformIO

Actual Learnings
----------------

1. Content of the `platform.io` configuration file (environments, platforms, library dependencies)
1. Basic usage of the `pio` CLI and the IDE UI
1. How to use the `pio` command shipped with the PlatformIO extension (see below).
1. How to use mono repos with VS Code and PlatformIO IDE (see below).
1. How to build different firmwares for different targets (see below).
1. Sharing header files (see below)

### `pio` command not found

Normally the PlatformIO IDE extension has a setting that says "Use Builtin PIO Core" that should add an
included version of the `pio` command to the terminal path. If you find like me, that this is not working,
simply extend your `$PATH` in your `.bashrc` or similar file.

```sh
export PATH=$PATH:~/.platformio/penv/bin
```

This is actually much easier than all the [solutions in the documentation](https://docs.platformio.org/en/latest/core/installation/shell-commands.html#piocore-install-shell-commands).

### PlatformIO IDE and mono repos

Like so often with VS Code, the IDE and its extension assume a single repo, where each code repository
(actually workspace) hosts exactly one project. That is, the PlatformIO IDE extension **and** VS Code
assume that the `platformio.ini` file lies at the root of your workspace / repository. If like me you
like to bundle all that belongs to a "project" (meaning a project in real-life, not the technical term
used by the IDE that is nothing more than a plain source directory) in a mono-repo, you can do that.

But you must always open only the sub-directory with the sub-project that you are currently working on.
Never open the whole repository as a workspace in VS Code. Because then the PlatfromIO IDE extension won't
find the `platformio.ini` file, as it only looks for it in the root directory of the workspace. Thus it
never generates the `.vscode/*.json` files that VS Code also expects to find at the workspace root. The
result will be that you cannot use the IDE functions to build projects and that VS Code reports a lot of
errors due to seemingly missing header files.

If it looks like this, all is fine:

TODO: Screenshot

If it looks like this, you are screwed:

TODO: Screenshot

### How to build different firmwares for different targets

By default PlatformIO assumes that you want to build the exact same source for each environment defined
in `platformio.ini`. This is meant to define separate build configurations like `release` or `debug`.
Actually, see the [Build Configurations](https://docs.platformio.org/en/latest/projectconf/build_configurations.html)
in the documentation on how to do this.

Another use case can be to actually build different programs for some of the environments. A typical use
case would be to have multiple boards with distinct hardware and responsibility, like in this project.
In that case, create sub-directories for each program below `src` and use [`build_src_filter`](https://docs.platformio.org/en/latest/projectconf/sections/env/options/build/build_src_filter.html)
to define which environment build which program. e.g. like this:

```ini
[env:lcd-board]
; Platform, Board, Framework, ...
build_src_filter = 
    -<.git>
    -<.svn>
    +<lcd-board>

[env:usage-example-arduino-uno]
; Platform, Board, Framework, ...
build_src_filter =
    -<.git>
    -<.svn>
    +<usage-example>

[env:usage-example-esp32]
extends = env:usage-example-arduino-uno
; Different Platform, Board, Framework, ...
```

### Sharing header files

The default PlatformIO directory layout has the following directories:

* `include`: Shared header files
* `lib`: Shared libraries, not externally installed
* `src`: Source code for the actual firmware to build

If all you need is to share some header files between different firmwares (defined using `build_src_filter`
in `platformio.ini`) simply place them in the `include` directory. If you put them into `lib` you need to
place them in a separate sub-directory and add this is a library dependency (`lib_deps`) in the INI file.

Hardware Schematics
-------------------

TODO: