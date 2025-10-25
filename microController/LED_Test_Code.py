

import RPi.GPIO as GPIO
from time import sleep

LED_R_PIN = 13
LED_G_PIN = 12
LED_B_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup([LED_R_PIN, LED_G_PIN, LED_B_PIN],GPIO.OUT)
RED = GPIO.PWM(LED_R_PIN, 1000)
GREEN = GPIO.PWM(LED_G_PIN, 1000)
BLUE = GPIO.PWM(LED_B_PIN, 1000)


def _map(x, in_min, in_max, out_min, out_max):
    return int((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

RED.start(0)
GREEN.start(0)
BLUE.start(0)

try:
    while True:
        # color code #00C9CC (R = 0,   G = 201, B = 204)
        RED.ChangeDutyCycle(_map(0, 0, 255, 0, 100))
        GREEN.ChangeDutyCycle(_map(201, 0, 255, 0, 100))
        BLUE.ChangeDutyCycle(_map(204, 0, 255, 0, 100))
        sleep(1)

        # color code #F7788A (R = 247, G = 120, B = 138)
        RED.ChangeDutyCycle(_map(247, 0, 255, 0, 100))
        GREEN.ChangeDutyCycle(_map(120, 0, 255, 0, 100))
        BLUE.ChangeDutyCycle(_map(138, 0, 255, 0, 100))
        sleep(1)

        # color code #34A853 (R = 52,  G = 168, B = 83)
        RED.ChangeDutyCycle(_map(52, 0, 255, 0, 100))
        GREEN.ChangeDutyCycle(_map(168, 0, 255, 0, 100))
        BLUE.ChangeDutyCycle(_map(83, 0, 255, 0, 100))
        sleep(1)
finally:
    RED.stop()
    GREEN.stop()
    BLUE.stop()
    GPIO.cleanup()
