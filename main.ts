// 5. Matrix scanning function
function readKeypad () {
    for (let r = 0; r <= 3; r++) {
        // Power all rows HIGH
        for (let i = 0; i <= 3; i++) {
            pins.digitalWritePin(rows[i], 1)
        }
        // Pull the active row being scanned LOW
        pins.digitalWritePin(rows[r], 0)
        for (let c = 0; c <= 3; c++) {
            // Read column. If it drops to 0, that key is pressed!
            if (pins.digitalReadPin(cols[c]) == 0) {
                return keys[r][c]
            }
        }
    }
    return ""
}
let userEntered = ""
let myKey = ""
let keys: string[][] = []
let cols: number[] = []
let rows: number[] = []
servos.P0.setAngle(0)
let strip = neopixel.create(DigitalPin.P1, 8, NeoPixelMode.RGB)
// 1. Safe Pin Mapping (Columns stay on P3, P4, P14, P15 with LED matrix disabled)
rows = [
DigitalPin.P11,
DigitalPin.P8,
DigitalPin.P12,
DigitalPin.P13
]
cols = [
DigitalPin.P3,
DigitalPin.P4,
DigitalPin.P14,
DigitalPin.P15
]
// 2. PERFECT RE-TRANSPOSED GRID: Corrected layout orientation to match ABCD = 123A
keys = [
[
"D",
"#",
"0",
"*"
],
[
"C",
"9",
"8",
"7"
],
[
"B",
"6",
"5",
"4"
],
[
"A",
"3",
"2",
"1"
]
]
let correctCode = "1234"
// CRITICAL HARDWARE FIX: Turn off the built-in 5x5 LED matrix to free up pins completely
led.enable(false)
// 3. Set Pull-Up resistors on column pins
pins.setPull(DigitalPin.P3, PinPullMode.PullUp)
pins.setPull(DigitalPin.P4, PinPullMode.PullUp)
pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
// 4. Initialize your I2C LCD Screen
// Change 39 to 63 if the screen remains blank
I2C_LCD1602.LcdInit(39)
I2C_LCD1602.BacklightOn()
I2C_LCD1602.ShowString("Enter Code:", 0, 0)
// 6. Main execution loop
basic.forever(function () {
    myKey = readKeypad()
    if (myKey != "") {
        // Option A: Clear everything if "#" is pressed
        // Option B: Backspace if "*" is pressed
        // Option C: Enter digit and show it on screen
        if (myKey == "#") {
            music.playTone(150, music.beat(BeatFraction.Quarter))
            userEntered = ""
            I2C_LCD1602.clear()
            I2C_LCD1602.ShowString("Enter Code:", 0, 0)
        } else if (myKey == "*") {
            if (userEntered.length > 0) {
                music.playTone(200, music.beat(BeatFraction.Quarter))
                I2C_LCD1602.ShowString(" ", userEntered.length - 1, 1)
                userEntered = userEntered.substr(0, userEntered.length - 1)
            }
        } else {
            music.playTone(262, music.beat(BeatFraction.Whole))
            userEntered = "" + userEntered + myKey
            I2C_LCD1602.ShowString(myKey, userEntered.length - 1, 1)
            // Validate code when 4 characters are reached
            if (userEntered.length == 4) {
                basic.pause(500)
                I2C_LCD1602.clear()
                if (userEntered == correctCode) {
                    I2C_LCD1602.ShowString("ACCESS GRANTED", 0, 0)
                    music.playTone(523, music.beat(BeatFraction.Double))
                    strip.showColor(neopixel.colors(NeoPixelColors.Green))
                    servos.P0.setAngle(90)
                } else {
                    I2C_LCD1602.ShowString("ACCESS DENIED", 0, 0)
                    music.playTone(131, music.beat(BeatFraction.Double))
                    strip.showColor(neopixel.colors(NeoPixelColors.Red))
                }
                basic.pause(2000)
                userEntered = ""
                I2C_LCD1602.clear()
                I2C_LCD1602.ShowString("Enter Code:", 0, 0)
                // Debounce delay
                basic.pause(5000)
                servos.P0.setAngle(0)
                strip.clear()
                // Debounce delay
                basic.pause(300)
                strip.show()
            }
        }
        // Debounce delay
        basic.pause(300)
    }
})
