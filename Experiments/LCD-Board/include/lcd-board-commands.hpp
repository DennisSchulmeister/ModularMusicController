#pragma once

// Constants for received messages
constexpr char LCD_CMD_ENCODER_LEFT   = 'l';
constexpr char LCD_CMD_ENCODER_RIGHT  = 'r';
constexpr char LCD_CMD_BUTTON_PRESSED = 'b';

// Constants for sent messages
constexpr char LCD_CMD_INIT_DISPLAY   = 'I';
constexpr char LCD_CMD_CLEAR_SCREEN   = 'C';
constexpr char LCD_CMD_LOCATE         = 'L';
constexpr char LCD_CMD_PRINT          = 'P';
constexpr char LCD_CMD_SHOW_CURSOR    = 'S';
constexpr char LCD_CMD_BLINK_CURSOR   = 'B';