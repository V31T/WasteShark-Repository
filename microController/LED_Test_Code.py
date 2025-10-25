import RPi.GPIO as GPIO
from time import sleep
import sys
import signal

LED_R_PIN = 29
LED_G_PIN = 31
LED_B_PIN = 36

GPIO.setmode(GPIO.BOARD)
GPIO.setup([LED_R_PIN, LED_G_PIN, LED_B_PIN], GPIO.OUT)

RED = GPIO.PWM(LED_R_PIN, 1000)
GREEN = GPIO.PWM(LED_G_PIN, 1000)
BLUE = GPIO.PWM(LED_B_PIN, 1000)

def _map(x, in_min, in_max, out_min, out_max):
    return int((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

def safe_exit(sig=None, frame=None):
    for pwm in [RED, GREEN, BLUE]:
        try:
            pwm.stop()
        except:
            pass
    GPIO.cleanup()
    sys.exit(0)

signal.signal(signal.SIGINT, safe_exit)
signal.signal(signal.SIGTERM, safe_exit)

RED.start(0)
GREEN.start(0)
BLUE.start(0)

while True:
    RED.ChangeDutyCycle(_map(0, 0, 255, 0, 100))
    GREEN.ChangeDutyCycle(_map(201, 0, 255, 0, 100))
    BLUE.ChangeDutyCycle(_map(204, 0, 255, 0, 100))
    sleep(1)
    RED.ChangeDutyCycle(_map(247, 0, 255, 0, 100))
    GREEN.ChangeDutyCycle(_map(120, 0, 255, 0, 100))
    BLUE.ChangeDutyCycle(_map(138, 0, 255, 0, 100))
    sleep(1)
    RED.ChangeDutyCycle(_map(52, 0, 255, 0, 100))
    GREEN.ChangeDutyCycle(_map(168, 0, 255, 0, 100))
    BLUE.ChangeDutyCycle(_map(83, 0, 255, 0, 100))
    sleep(1)
