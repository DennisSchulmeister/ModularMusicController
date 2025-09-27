/**
 * Test Program for Atmega Display Board
 * =====================================
 *
 * This is a small test program for any Arduino board to test our custom-built
 * Atmega 328p display board. The program displays a counter on the display,
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

/**
 * Initialize hardware after power up.
 */
void setup() {
  while (!Serial);
  Serial.begin(9600);

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
  static int counter = 0;
  static int prevCounter = -1;

  while (Serial.available()) {
    char msg = Serial.read();

    switch (msg) {
      case LCD_CMD_ENCODER_LEFT:
        counter--;
        break;
      case LCD_CMD_ENCODER_RIGHT:
        counter++;
        break;
      case LCD_CMD_BUTTON_PRESSED:
        Serial.write(LCD_CMD_CLEAR_SCREEN);

        Serial.write(LCD_CMD_LOCATE);
        Serial.write(6);    // Column
        Serial.write(0);    // Row

        Serial.write(LCD_CMD_PRINT);
        Serial.println("Okay");

        Serial.flush();
        delay(500);
    }
  }

  if (counter != prevCounter) {
    prevCounter = counter;

    Serial.write(LCD_CMD_CLEAR_SCREEN);

    Serial.write(LCD_CMD_LOCATE);
    Serial.write(0);    // Column
    Serial.write(0);    // Row

    Serial.write(LCD_CMD_PRINT);
    Serial.println("Zähler:");

    Serial.write(LCD_CMD_LOCATE);
    Serial.write(0);    // Column
    Serial.write(1);    // Row

    Serial.write(LCD_CMD_PRINT);
    Serial.println(counter);

    // Test of the special character mapping
    Serial.write(LCD_CMD_LOCATE);
    Serial.write(6);    // Column
    Serial.write(1);    // Row

    Serial.write(LCD_CMD_PRINT);
    Serial.println("ÄÖÜäöü←→~\\");
  }
}