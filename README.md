# homebridge-alexabridge

Amazon Alexa to homebridge interface.   Using the insecure mode of Homebridge ( -I )
to bridge from Amazon Alexa to homebridge.  Homebridge instances are autodiscovered
at startup by looking for 'hap' devices.   This is an alpha release of code, and
includes minimal error and status handling.  

* Supports multiple homebridge instances running on your network.
* Homebridge autodiscovery to minimize entries in config.json
* Supports devices of homekit Service type Lightbulb, Outlet, and Switch
* If device supports the 'Brightness Characteristic', then the ability to set a
brightness is included.
* This plugin does not have any devices or accessories that are visible from Homekit,
and does not need to be added on the Home app.
* The plugin does not need to be installed in your 'main' homebridge instance.  It
can be installed in a standalone 'Homebridge' instance beside your main instance.
** Uses BWS Systems HA Bridge to interface between Alex and HomeBridge
** Requires an actual Amazon Echo, Dot or Dash and will not work with AlexaPi or the
RaspberryPI Based Alexa AVS Sample.

Alexa device names are the same as the homebridge device names.

This only supports  accessories connected via a homebridge plugin, any 'Homekit'
accessories are not supported, and can not be supported.

# Voice commands supported

* Alexa, turn on the _______
* Alexa, turn off the _______
* Alexa, set ______ to number percent

# Installation and Setup

## Installation

npm install https://github.com/NorthernMan54/homebridge-alexabridge

## Configuration

* Inside index.js

var pin = "031-45-154";
var haBridgePort = 8081;

## Running

node index.js

# config.json - Not needed at this time

```
{
"platform": "Alexa",
     "name": "Alexa",
     "port": 8082
}
```

# Roadmap

* Clean and make this easier to use

# Credits

* bwssystems
