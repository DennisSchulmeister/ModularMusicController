/**
 * Test Program for Atmega328p Display Board
 * =========================================
 *
 * This is a small test program for any Arduino board to test our custom-built
 * Atmega328p display board. The program displays a counter on the display,
 * which can be changed using the rotary encoder and confirmed by pressing the button.
 *
 * Hardware Setup:
 * ---------------
 *
 * The display board must be powered and connected to the Arduino's UART.
 *
 *  - 0 RX -> Display Board TX
 *  - 1 TX -> Display Board RX
 *  - GND --> Display Board GND
 *  - 5V ---> Display Board 5V
 * 
 * If necessary a level-shifter must be placed between the remote board and the LCD board.
 *
 * Relevant Documentation
 * ----------------------
 *
 * https://docs.arduino.cc/language-reference/en/functions/communication/Serial/
 */

#include <Arduino.h>
#include "lcd-board-commands.hpp"

constexpr unsigned long message_ms = 1000;
constexpr unsigned long redraw_ms  = 100;

/**
 * Initialize hardware after power up.
 */
void setup() {
  #ifndef ARDUINO_ARCH_ESP32
  while (!Serial);
  #endif

  Serial.begin(LCD_SERIAL_SPEED);

  // Wait a little for the LCD board to become ready
  delay(500);

  // Initialize display with 16x2 characters
  Serial.write(LCD_CMD_INIT_DISPLAY);
  Serial.write(16);   // Amount columns
  Serial.write(2);    // Amount rows/lines
  Serial.flush();
}

/**
 * Main program logic.
 */
void loop() {
  // Update state upon user input
  static int counter = 0;
  static unsigned long message = 0;
  static bool redraw = true;

  unsigned long current_time = millis();

  while (Serial.available()) {
    char msg = Serial.read();

    switch (msg) {
      case LCD_CMD_ENCODER_LEFT:
        counter--;
        redraw  = true;
        break;
      case LCD_CMD_ENCODER_RIGHT:
        counter++;
        redraw  = true;
        break;
      case LCD_CMD_BUTTON_PRESSED:
        message = current_time;
        redraw  = true;
    }
  }

  if (message && (current_time - message >= message_ms)) {
    message = 0;
    redraw  = true;
  }

  // Display updated state. We need to be a little careful to not redraw the
  // the display too quickly when many changes occur in a row, as this could
  // cause garbled output.
  static unsigned long prev_redraw_time = 0;

  if (redraw && (current_time - prev_redraw_time > redraw_ms)) {
    redraw = false;
    prev_redraw_time = current_time;

    if (message) {
        Serial.write(LCD_CMD_CLEAR_SCREEN);

        Serial.write(LCD_CMD_LOCATE);
        Serial.write(6);    // Column
        Serial.write(0);    // Row

        Serial.write(LCD_CMD_PRINT);
        Serial.println("Okay");
    } else {
      // NOTE: Update the whole screen without clearing first, because clearing flickers.
      // Unfortunately this increases the chance for corruption.
      Serial.write(LCD_CMD_LOCATE);
      Serial.write(0);    // Column
      Serial.write(1);    // Row
      Serial.write(LCD_CMD_PRINT);
      Serial.println("      ÄÖÜäöü←→~\\");

      Serial.write(LCD_CMD_LOCATE);
      Serial.write(0);    // Column
      Serial.write(0);    // Row
      Serial.write(LCD_CMD_PRINT);
      Serial.println("Counter:        ");
  
      Serial.write(LCD_CMD_LOCATE);
      Serial.write(0);    // Column
      Serial.write(1);    // Row
      Serial.write(LCD_CMD_PRINT);
      Serial.println(counter);
    }

    Serial.flush();
  }
}