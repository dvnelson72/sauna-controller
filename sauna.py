from flask import Flask, request, render_template, jsonify
import datetime
import time, threading, math
import RPi.GPIO as GPIO
import json
import re
from flask import jsonify

app = Flask(__name__)

global configsFile
global configs
global defaultTime
global defaultTemp
global heaterValue
global onoffValue
global currentTime
global targetTemp
global currentTemp
global lastToggleHeater
global heaterToggleThreshold
global relayPin1
global relayPin2
global timerLastCountdown

configsFile = "config.json"

with open(configsFile, 'r') as c:
    configs = json.loads(c.read())
    
defaultTime = configs['defaultTime']
defaultTemp = configs['defaultTemp']
heaterValue = False
onoffValue = False
currentTemp = 75
currentTime = defaultTime
targetTemp = defaultTemp
lastToggleHeater = 0
heaterToggleThreshold = 10000
relayPin1 = 17
relayPin2 = 27
timerLastCountdown = 0
    
GPIO.setmode(GPIO.BCM)    
GPIO.setup(relayPin1, GPIO.OUT)
GPIO.setup(relayPin2, GPIO.OUT)

def writeConfigs():
    global configsFile
    global configs
    global defaultTime
    global defaultTemp
    
    configs['defaultTime'] = defaultTime
    configs['defaultTemp'] = defaultTemp
    
    with open(configsFile, "w") as f:
        f.write(json.dumps(configs))
        f.truncate()

def countdown():
    global heaterValue
    global onoffValue
    global currentTime
    global targetTemp
    global currentTemp
    global lastToggleHeater
    global heaterToggleThreshold
    global timerLastCountdown
    
    decInterval = 60000
    
    if onoffValue:
        if (currentTime>0):            
            millis = int(round(time.time() * 1000))
            if (millis - timerLastCountdown > decInterval and currentTime>0):
                timerLastCountdown = timerLastCountdown + decInterval
                currentTime = currentTime - 1
    
    return
            

def controlSauna():
    global heaterValue
    global onoffValue
    global currentTime
    global targetTemp
    global currentTemp
    global lastToggleHeater
    global heaterToggleThreshold
    global relayPin1
    global relayPin2
    global timerLastCountdown
    global defaultTime
    global defaultTemp
    
    countdown()
    
    if (currentTime<=0):
        currentTime = 0
        onoffValue = False
        currentTime = defaultTime
        
    
    if onoffValue:
        needsToggle = False
        
        if (currentTemp<targetTemp):
            if (not heaterValue):
                needsToggle = True
        else:
            if (heaterValue):
                needsToggle = True
        
        canToggle = False
        
        millis = int(round(time.time() * 1000))
        if (millis - lastToggleHeater > 500):
            canToggle = True
        
        if (canToggle and needsToggle):
            heaterValue = not heaterValue
            lastToggleHeater = millis
            #if (heaterValue):
            #    GPIO.output(relayPin, 1)
            #else:
            #    GPIO.output(relayPin, 0)
    else:
        heaterValue = False
        
    if (heaterValue):
        GPIO.output(relayPin1, 1)
        GPIO.output(relayPin2, 1)
    else:
        GPIO.output(relayPin1, 0)
        GPIO.output(relayPin2, 0)
        
    threading.Timer(0.05, controlSauna).start()
controlSauna()

@app.route("/")
def hello():
   now = datetime.datetime.now()
   timeString = now.strftime("%Y-%m-%d %H:%M")
   templateData = {
      'title' : 'Sauna Control',
      'time': timeString
      }
   return render_template('index.html', **templateData)

@app.route("/current-temp")
def getCurrentTemp():
    global currentTemp
    return f"{currentTemp}"
    
@app.route("/target-temp")
def getTargetTemp():
    global targetTemp
    return f"{targetTemp}"
    
@app.route("/target-inc")
def targetInc():
    global targetTemp
    global defaultTemp
    
    targetTemp = targetTemp + 5
    
    if (not onoffValue):
        defaultTemp = targetTemp
        
    return f"{targetTemp}"
    
@app.route("/target-dec")
def targetDec():
    global targetTemp
    global defaultTemp
    
    targetTemp = targetTemp - 5
    
    if (not onoffValue):
        defaultTemp = targetTemp
        
    return f"{targetTemp}"
    
@app.route("/current-time")
def getCurrentTime():
    global currentTime
    return f"{currentTime}"
    
@app.route("/time-inc")
def timeInc():
    global currentTime
    global defaultTime
    
    currentTime = (int(math.floor(currentTime / 5.0)) * 5) + 5
    
    if (not onoffValue):
        defaultTime = currentTime
        
    return f"{currentTime}"
    
@app.route("/time-dec")
def timeDec():
    global currentTime
    global defaultTime
    
    currentTime = (int(math.ceil(currentTime / 5.0)) * 5) - 5
    
    if (not onoffValue):
        defaultTime = currentTime
        
    return f"{currentTime}"
    
@app.route("/onoff-toggle")
def onoffToggle():
    global defaultTime
    global defaultTemp
    global onoffValue
    global heaterValue
    global timerLastCountdown
    
    onoffValue = not onoffValue
    
    if onoffValue:
        defaultTime = currentTime
        defaultTemp = targetTemp
        writeConfigs()
        timerLastCountdown = int(round(time.time() * 1000))
        print(f"SET TIME {timerLastCountdown}")
        return "1"
    else:
        return "0"
    
@app.route("/onoff-status")
def onoffStatus():
    global onoffValue
    
    if onoffValue:
        return "1"
    else:
        return "0"
    
@app.route("/heater-status")
def heaterStatus():
    global heaterValue
    
    if heaterValue:
        return "1"
    else:
        return "0"
    
if __name__ == "__main__":
   app.run(host='0.0.0.0', port=80, debug=False)
   