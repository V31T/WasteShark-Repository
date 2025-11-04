import pymavlink
import cv2
import time

connection = mavutil.mavlink_connection('/dev/ttyAMA0', baud=57600)
connection.wait_heartbeat()
print("Connected to Pixhawk")

cap = cv2.VideoCapture(0)  
frame_width = int(cap.get(3))

def set_motors(left_pwm, right_pwm):
    connection.mav.command_long_send(
        connection.target_system,
        connection.target_component,
        mavutil.mavlink.MAV_CMD_DO_SET_SERVO,
        0, 1, left_pwm, 0, 0, 0, 0, 0)   # channel 1 motor 1
    connection.mav.command_long_send(
        connection.target_system,
        connection.target_component,
        mavutil.mavlink.MAV_CMD_DO_SET_SERVO,
        0, 2, right_pwm, 0, 0, 0, 0, 0)  # channel 2 motor 2 (assuming its in channel 2)

def stop_motors():
    set_motors(1500, 1500) #1500 is 0 power

def forward():
    set_motors(1900, 1900)

def turn_left():
    set_motors(1400, 1700)

def turn_right():
    set_motors(1700, 1400)

print("forward test")
forward()
time.sleep(5)


print("stop test")
stop_motors()
time.sleep(2)

print("turning left")
turn_left()
time.sleep(5)

print("stop test 2")
stop_motors()
time.sleep(2)

print("turning right")
turn_right()
time.sleep(5)

print("game over")

cap.release()