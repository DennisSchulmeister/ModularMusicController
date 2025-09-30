/**
 * Atmega 328p as Display Controller
 * =================================
 *
 * GPIO pins are scarce on almost all microcontrollers. The problem becomes even greater
 * the more pins a single component requires. A typical 16x2 character dot-matrix display
 * with the classic HD44780 chip is such an example, as it requires a whopping 10 pins.
 * We already save one pin if we only send data to the display and do not read from it.
 * Otherwise, it would be 11 pins. Regardless, you could save another 4 pins by communicating
 * with the display in 4-bit mode. However, this mode is very susceptible to interference
 * and timing issues, which can result in garbled data being displayed. The 8-bit mode is
 * much more robust.
 *
 * This program is therefore intended to build a small controller board for a display,
 * a rotary encoder, and a button as a test case to validate the feasibility of our
 * product idea. The program is uploaded to an Arduino Uno, whose Atmega 328p microcontroller
 * is then removed and placed on a breadboard with the display and other components.
 * A new chip must then be inserted into the Arduino.
 *
 * The program communicates with a host system via the serial UART interface, with messages
 * being extremely simple. On the host system, only two pins are used for sending and receiving
 * data, provided a UART is available or a software UART can be used. Details are given below.
 *
 * Hardware Setup:
 * ---------------
 *
 * See images. :-) After the program is uploaded to an Arduino Uno, its Atmega 328p is placed
 * on a breadboard and powered:
 *
 *  - Pin 1:  RESET -> 10k Ohm -> +5V
 *  - Pin 7:  VCC --------------> +5V
 *  - Pin 8:  GND --------------> Ground
 *  - Pin 20: AVCC -------------> +5V
 *  - Pin 21: Aref -------------> +5V
 *  - Pin 22: GND --------------> Ground
 *
 * Additionally, a 16 MHz crystal oscillator must be inserted:
 *
 *  - Pin 9:  XTAL1 -----> Crystal <-+
 *  - Pin 10: XTAL2 -----------------+
 *
 * A rotary encoder with push button is used for data input:
 *
 *  - Pin 23: A0 ------------> Button ------> Ground
 *
 *  - Pin 4:  Digital 2-----> Encoder A
 *                            Encoder COM -> Ground
 *  - Pin 5:  Digital 3 ----> Encoder B
 *
 * Finally, the display:
 *
 *  - Pin 6:  Digital 4 --> RS
 *  - Pin 7:  Digital 5 --> E
 *  - Pin 8:  Digital 6 --> D0
 *  - Pin 13: Digital 7 --> D1
 *  - Pin 14: Digital 8 --> D2
 *  - Pin 15: Digital 9 --> D3
 *  - Pin 16: Digital 10 -> D4
 *  - Pin 17: Digital 11 -> D5
 *  - Pin 18: Digital 12 -> D6
 *  - Pin 19: Digital 13 -> D7
 *                          VSS -> Ground
 *                          VDD -> +5V
 *                          V0 --> Potentiometer -> +5V/Ground (adjustable voltage divider!)
 *                          RW --> Ground
 *                          A ---> +5V
 *                          K ---> Ground
 *
 * Serial Communication
 * --------------------
 *
 * The external microcontroller board must be connected to the Atmega as follows:
 *
 *  - Pin 2: RX (receive data) -> microcontroller TX
 *  - Pin 3: TX (send data) ----> microcontroller RX
 *  - Pin 7: GND ------------------> microcontroller GND
 *
 * Communication is based on a bidirectional exchange of 1-byte messages, with some messages
 * including additional parameters. The transmission format is 8N1 (default on Arduino) at a
 * baud rate of 9600.
 *
 * ### Microcontroller to Atmega
 *
 * | **Message** | **Parameter** | **Meaning**                                         |
 * |-------------|---------------|-----------------------------------------------------|
 * | 'I'         | Byte, Byte    | Init: Initialize display                            |
 * | 'C'         | None          | Clear Screen: Clear display                         |
 * | 'P'         | String        | Print: Output text line                             |
 * | 'L'         | Byte, Byte    | Locate: Set write position/cursor                   |
 * | 'S'         | Boolean       | Show Cursor: (Do not) show cursor for text input    |
 * | 'B'         | Boolean       | Blink Cursor: (Do not) blink cursor                 | 
 *
 * The parameters have the following types:
 *
 *  - String: Any character string followed by '\n' (newline character)
 *  - Byte: Unsigned integer from 0 to 255 transmitted as a single byte
 *  - Boolean: Any byte, where 0 is False and anything else is True
 *
 * Their values are:
 *
 *  - Init: Number of columns and rows of the display
 *  - Print: Text to be displayed
 *  - Locate: Column and row of the new cursor position (e.g. to display text here)
 *  - Cursor/Blink: True or False
 *
 * ### Atmega to Microcontroller
 *
 * | **Message** | **Meaning**                                             |
 * |-------------|---------------------------------------------------------|
 * | 'l'         | Left: Rotary encoder turned one step to the left        |
 * | 'r'         | Right: Rotary encoder turned one step to the right      |
 * | 'b'         | Button: The button (in the rotary encoder) was pressed  |
 *
 * A note on special characters
 * ============================
 *
 * The HD44780 has its own 8-bit character set, which includes most ASCII characters, many Japanese
 * Kanji characters, and some special characters. Additionally, up to eight custom characters can
 * be defined. The program assumes that UTF-8 is now the standard encoding even for Arduino source
 * code, so special characters are also transmitted via the serial interface in UTF-8 encoding for
 * simplicity. The following characters are mapped to the HD44780 character set or represented by
 * custom characters:
 *
 *   ä ö ü Ä Ö Ü ß \ ~ ← →
 *
 * Relevant Documentation
 * ----------------------
 *
 * https://docs.arduino.cc/language-reference/en/functions/communication/Serial/
 * https://docs.arduino.cc/libraries/liquidcrystal/
 */
 
#include <Arduino.h>
#include <LiquidCrystal.h>

#include "lcd-board-commands.hpp"

void rotaryEncoderISR();
char readRotaryEncoder(int pin_a, int pin_b, volatile int& state);
char receiveChar();
String receiveString();
String mapSpecialChars(String str);
void createSpecialChars();

LiquidCrystal lcd(
  /* RS */ 4,
  /* RE */ 5,
  /* D0 */ 6,
  /* D1 */ 7,
  /* D2 */ 8,
  /* D3 */ 9,
  /* D4 */ 10,
  /* D5 */ 11,
  /* D6 */ 12,
  /* D7 */ 13
);

constexpr int encoder_pin_a     = 2;
constexpr int encoder_pin_b     = 3;
constexpr int button_pin        = A0;

constexpr int buffer_size = 25;

/**
 * Quick and dirty FIFO buffer for encoder values detected in the ISR.
 * To make sure we are missing no detents while we are sending, like
 * we would due to a race condition, if the buffer was a single value.
 */
volatile struct {
  int write_index = 0;
  int read_index  = 0;
  char buffer[buffer_size] = {};

  bool empty() const volatile {
    return read_index == write_index;
  }

  bool full() const volatile {
    return ((write_index + 1) % buffer_size) == read_index;
  }

  char read() volatile {
    if (empty()) return 0;
    read_index = (read_index + 1) % buffer_size;
    return buffer[read_index];
  }

  void write(char value) volatile {
    if (full()) return;
    write_index = (write_index + 1) % buffer_size;
    buffer[write_index] = value;
  }
} encoder_msg_fifo;

/**
 * Initialize hardware after power up.
 */
void setup() {
  pinMode(encoder_pin_a, INPUT_PULLUP);
  pinMode(encoder_pin_b, INPUT_PULLUP);
  pinMode(button_pin,    INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(encoder_pin_a), rotaryEncoderISR, CHANGE);
  attachInterrupt(digitalPinToInterrupt(encoder_pin_b), rotaryEncoderISR, CHANGE);

  while (!Serial);
  Serial.begin(LCD_SERIAL_SPEED);
}

/**
 * Main program logic
 */
void loop() {
  // Check if a button was pressed
  if (digitalRead(button_pin) == LOW) {
    delay(100);

    if (digitalRead(button_pin) == LOW) {
      Serial.write(LCD_CMD_BUTTON_PRESSED);
    }
  }

  // Send message for rotary encoder, if available
  while (!encoder_msg_fifo.empty()) {
    Serial.write(encoder_msg_fifo.read());
  }

  // Receive and execute message
  if (!Serial.available()) return;
  byte msg = Serial.read();

  switch (msg) {
    case LCD_CMD_INIT_DISPLAY: {
      char cols = receiveChar();
      char rows = receiveChar();
      lcd.begin(cols, rows);
      createSpecialChars();
      break;
    }
    case LCD_CMD_CLEAR_SCREEN: {
      lcd.clear();
      break;
    }
    case LCD_CMD_PRINT: {
      lcd.print(mapSpecialChars(receiveString()).c_str());
      break;
    }
    case LCD_CMD_LOCATE: {
      char col = receiveChar();
      char row = receiveChar();
      lcd.setCursor(col, row);
      break;
    }
    case LCD_CMD_SHOW_CURSOR: {
      receiveChar() ? lcd.cursor() : lcd.noCursor();
      break;
    }
    case LCD_CMD_BLINK_CURSOR: {
      receiveChar() ? lcd.blink() : lcd.noBlink();
      break;
    }
  }
}

/**
 * Interrupt handler for the rotary encoder. Normally the recommendation is to sample the
 * encoder at fixed intervals like every millisecond to make sure that bounces don't produce
 * ecessive CPU usage. But I found that this would skip many detents even going down to zero
 * detected movement when the encoder is moved quickly. Since we are not doing much here
 * except reading the inputs and sending the result, excessive CPU usage is not a problem –
 * so back to the ISR.
 */
void rotaryEncoderISR() {
  volatile static int encoder_state = 0;
  char msg = readRotaryEncoder(encoder_pin_a, encoder_pin_b, encoder_state);
  if (msg) encoder_msg_fifo.write(msg);
}

/**
 * Read a quadrature rotary encoder. Updates the given state variable to implement a simple
 * state machine that detects the valid transitions and rejects all invalid transitions due
 * to bouncing. To be called at fixed intervals, usually each millisecond.
 *
 * NOTE: A roatary encoder is a quadrature encoder, meaning that it produces four valid transitions
 * for each detent (click). For higher accurary you want to cound all transitions but use hardware
 * debouncing. For precise editing you want to cound only when it resets to 0b00, meaning the user
 * moved it a single step.
 * 
 * @param pin_a Encoder pin A
 * @param pin_b Encoder pin B
 * @param state Last valid encoder state
 * @returns Encoder direction or zero
 */
char readRotaryEncoder(int pin_a, int pin_b, volatile int& state) {
  int new_state = (digitalRead(pin_a) << 1) | digitalRead(pin_b);

  // Valid CW transitions: 00->01->11->10->00
  // Valid CCW transitions: 00->10->11->01->00
  if (
    (state == 0b00 && new_state == 0b01) ||
    (state == 0b01 && new_state == 0b11) ||
    (state == 0b11 && new_state == 0b10) ||
    (state == 0b10 && new_state == 0b00)
  ) {
    state = new_state;

    if (state == 0b00) {
      return LCD_CMD_ENCODER_RIGHT;
    }
  } else if (
    (state == 0b00 && new_state == 0b10) ||
    (state == 0b10 && new_state == 0b11) ||
    (state == 0b11 && new_state == 0b01) ||
    (state == 0b01 && new_state == 0b00)
  ) {
    state = new_state;

    if (state == 0b00) {
      return LCD_CMD_ENCODER_LEFT;
    }
  }

  return 0;
}

/**
 * Helper function to receive a byte parameter.
 * Blocks until a byte is received and then returns it.
 */
char receiveChar() {
    while (!Serial.available());
    return Serial.read();
}

/**
 * Helper function to receive a text string.
 * Blocks until a string terminated with '\n' is received and then returns it.
 */
String receiveString() {
    while (true) {
        String result = Serial.readStringUntil('\n');
        if (result.length() > 0) return result.substring(0, result.length() - 1);
    }
}

/**
 * Map special character to the custom characters defined in `createSpecialChars()`.
 * The assumption is that the source code of the remote microcontroller will be
 * UTF-8 encoded so that special characters will be UTF-8 encoded, too.
 * See https://www.cogsci.ed.ac.uk/~richard/utf-8.cgi?mode=char
 */
String mapSpecialChars(String str) {
  String result = "";

  for (size_t i = 0; i < str.length(); i++) {
    char c1, c2, c3;
    c1 = str[i];

    switch (c1) {
      case '\\': result += '\x01'; break;  // Backslash (custom character)
      case '~':  result += '\x02'; break;  // ~ (custom character)

      // Two-byte sequences
      case '\xC3':
        if (i + 1 >= str.length()) continue;
        c2 = str[++i];

        switch (c2) {
          case '\xA4': result += '\xE1'; break;  // ä (built-in)
          case '\xB6': result += '\xEF'; break;  // ö (built-in)
          case '\xBC': result += '\xF5'; break;  // ü (built-in)
          case '\x84': result += '\x03'; break;  // Ä (custom character)
          case '\x96': result += '\x04'; break;  // Ö (custom character)
          case '\x9C': result += '\x05'; break;  // Ü (custom character)
          case '\x9F': result += '\x06'; break;  // ß (custom character)
        }

        break;

      // Three-byte sequences
      case '\xE2':
        if (i + 2 >= str.length()) continue;
        c2 = str[++i];
        c3 = str[++i];

        switch (c2) {
          case '\x86':
            switch (c3) {
              case '\x90': result += '\x7F'; break;  // ← (eingebaut)
              case '\x92': result += '\x7E'; break;  // → (eingebaut)
            }

            break;
        }

        break;

      // Regular ASCII characters
      default:
        result += c1;
    }
  }

  return result;
}

/**
 * The HD44780 supports almost the entire ASCII character set except for backslash and tilde.
 * It also supports the German letters ä, ö, ü, ß and some special characters. However, uppercase
 * umlauts are missing. Here we use the possibility to define up to eight custom characters to add
 * the most important missing characters.
 */
void createSpecialChars() {
  byte specialChars[8][8] = {
    // First element unused because C strings must not contain \x00
    {},

    // Backslash
    {
      B00000,
      B10000,
      B01000,
      B00100,
      B00010,
      B00001,
      B00000,
    },

    // Tilde ~
    {
      B00000,
      B00000,
      B00000,
      B01101,
      B10010,
      B00000,
      B00000,
    },

    // Ä
    {
      B01010,
      B00000,
      B01110,
      B10001,
      B11111,
      B10001,
      B10001,
    },

    // Ö
    {
      B01010,
      B00000,
      B01110,
      B10001,
      B10001,
      B10001,
      B01110,
    },

    // Ü
    {
      B01010,
      B00000,
      B10001,
      B10001,
      B10001,
      B10001,
      B01110,
    },

    // ß
    {
      B01110,
      B10001,
      B11110,
      B10001,
      B11110,
      B10000,
      B10000,
    },

    {},
  };

  for (size_t i = 0; i < 8; i++) {
    lcd.createChar(i, specialChars[i]);
  }
}