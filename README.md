# Sauna Controller
I built a sauna controller using a Raspberry Pi and some basic parts from Amazon.


## Why?
- My infrared sauna controller board started acting funky. 
- It would turn off randomly.  
- I cleaned all contacts, and it would work a while.  Then, meh off again.
- Finally, I took the board off my sauna and found it had some suspect spots where it looked like a fire hazard.

### Long time coming
I actually had this project in mind for a while.  My sauna is upstairs, near the kids' rooms.  They dread this yell coming from downstairs "Turn on the sauna!"

And, since it got a little funky, I never really knew if it was heating or off.

I was toying with this project for a while.  When the controller was clearly done, it was time to research.

## The Build

### Parts
These are the actual parts I ordered.

- $45 Raspberry Pi 3 B+  https://www.amazon.com/gp/product/B01CMC50S0/ref=ppx_yo_dt_b_asin_title_o06_s02?ie=UTF8&psc=1
- $90 7" touchscreen https://www.amazon.com/gp/product/B06XRM4MCW/ref=ppx_yo_dt_b_asin_title_o05_s00?ie=UTF8&psc=1
- $20 100v-250v 30A High Power 2 channel relay **DC5V** Hih-Low trigger https://www.amazon.com/gp/product/B077W1NVLM/ref=ppx_yo_dt_b_asin_title_o07_s00?ie=UTF8&psc=1
- $17 (pack of 5) 3V 1 channel relay with optocoupler isolation https://www.amazon.com/gp/product/B01M0E6SQM/ref=ppx_yo_dt_b_asin_title_o07_s00?ie=UTF8&psc=1
- $10 Max6675 Module + k Type Thermocouple https://www.amazon.com/gp/product/B07TZ7CCVL/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1
- $7 Jumper wires https://www.amazon.com/gp/product/B01LZF1ZSZ/ref=ppx_yo_dt_b_asin_title_o07_s02?ie=UTF8&psc=1

That's a total of about $189.  When I shopped online for a sauna controller replacement, it was going to cost $500+.  And at that price, there was no remote monitoring or control.

### General Layout
Here is the LAYOUT
- The Pi and the Touchscreen are separated from EVERYTHING else.
- I use a CAT5 to connect the power parts to the Pi.
- The rest of the parts are sitting on a high temperature (heat resistant) styrofoam.
- Those parts are on top of the sauna.
- Cat5 from the power parts, goes to the Pi/Touchscreen
- I am including the Pi power supply in the power parts.  I took the innards out of a power supply and keep it up top.  The power goes through the cat5.
- I am assuming ground is the same for the power supply and the Pi rail.  They are attached at the power parts.
- However, I am running the ground and 5V+ to the microUSB rather than the rail, because I read that there is some power safety between the USB and the rail.  I dunno.

### Cat5
I am using all 8 wires.

3.3V (GPIO pin)
5.5V (to USB)
Gnd (to USB)

3 wires for thermocouple data (GPIO pins)

1 GPIO to turn on/off the heating elements (GPIO pin)
1 GPIO for later use, maybe to reconnect the lights (GPIO pin)

### The Sauna
- I ripped everything out from the controller area.
- The old controller had two relays, for the front (2) and back (3) heating elements.
- I decided to honor that, mostly because I wasn't sure about the power capacity
- I stripped wires....
- And I soldered.  A lot.  
- The grounds all got soldered together.  
- I have a ground and hot soldered to a AWG8 wire coming up to the top of the sauna (short run)
- I have front (white) and back (black) power wires coming up to the top of the sauna.
- everything is still fronted by the 30A circuit breaker that came with the unit

### Circuit
I am too lazy to do a circuit diagram.  Sorry.  I'll take pics if anyone requests it.

#####Thermocouple
The thermocouple has 5 connections.  3 are data and 2 are 3v/Gnd.  The 3V is soldered to the 3V coming from the Cat5 connected to the Pi.  Gnd is soldered as well.  The 3 data input/outputs are connected from the cat5.

#####Low Voltage Relay
It has a 3V/Gnd connection... soldered to thermocouple 3V/Gnd with the Thermocouple. 

It also has a trigger that is attached to one of the GPIO pins from the Cat5 (GPIO17 for me).

#### High Voltage Relay
The high voltage relay was a real pain in the ass.  The 5V trigger killed me.  That is why I have the low voltage relay.

The high voltage relay is interesting.  It has 120V input.  It also has 5V output.  In high mode, if you touch the 5V output to the 5v triggers, it flips the relay.

First of all, the AC power coming from the sauna will be soldered/split, and will connect to the AC input of this device.

So -- here is the idea... The 3v GPIO trigger flips the low voltage relay.  That will connect the 5V output of THIS relay to the normally closed pins on the low voltage relay.

The normally closed pins on the relay will connect to BOTH input triggers on the high voltage relays.

So -- low voltage relay basically connects the high voltage relay's 5V output to the triggers for the relays. 

NOW on the power side of the high voltage relay... We attach AC hot to both relay commons.  Then, we attach white/black (front/back) wires to the normally closed high voltage pins for each relay.

#### Pi Power
I destroyed a microUSB power plug.  I cut the wire in two.

The microUSB part, is down by the Pi, soldered to the Cat5.

The transformer part is up at the power parts, and the ground/5V are soldered to respective Cat5 wires.

# Does it work?
yes.

The program might need a little refinement over time.  It basically copies the functionality from my original controller:
- Power: on/off
- Timer: countdown when on
- Target Temp
- Current Temp

There is a little latency that annoys me. Honestly, though, honey badger don't care.

I have my Pi set to a static IP on my home network.  My phone has a home link to the web page.  On my work-from-home computer, I have it bookmarked.

When I want to warm up the sauna, I go to the controller web page.  I can turn it on and monitor it from there.

# Auto start chromium
nano /etc/xdg/openbox/autostart
chromium-browser --disable-infobars --kiosk --allow-insecure-localhost 'https://localhost?key=YOURKEY'