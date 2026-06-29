def on_forever():
    keypad.set_key_pad4(DigitalPin.P5,
        DigitalPin.P6,
        DigitalPin.P7,
        DigitalPin.P9,
        DigitalPin.P11,
        DigitalPin.P8,
        DigitalPin.P12,
        DigitalPin.P13)
    I2C_LCD1602.lcd_init(0)
    I2C_LCD1602.show_string("Hello", 0, 1)
basic.forever(on_forever)
