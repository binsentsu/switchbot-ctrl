# Switchbot Controller Util
Util for controlling a switchbot switch, either over MQTT or via a HTTP API (https://www.switch-bot.com/)

# Installation
Run `npm install -g https://github.com/binsentsu/switchbot-ctrl`

# Usage
`switchbotctrl` by itself will print usage information

You need to manually specify a list of MAC addresses to connect to, e.g.: `switchbotctrl f5:11:7b:ee:f3:43`


You must then specify options to use either MQTT, HTTP or both

## To use with HTTP
Specify a port for the API to listen on with `-l`:
`switchbotctrl MACx MACy -l 3000`

## To use with MQTT
Specify a broker URL with `--url` option:
`switchbotctrl --url mqtt://yourbroker` (mqtt/mqtts/ws/wss accepted)

Username and password for MQTT may be specified with `-u` and `-p` option

If no password argument is supplied, you can enter it interactively

Base topic defaults to `homeassistant`, but may be configured with the `-topic` option


# MQTT
To issue commands:

ON: `<baseTopic>/switch/<deviceID>/set` - message: 'ON'

OFF: `<baseTopic>/switch/<deviceID>/set` - message: 'OFF'

In addition, for use with [Home Assistant MQTT Discovery](https://www.home-assistant.io/docs/mqtt/discovery/):

To automatically setup the switch device:
`<baseTopic>/switch/<deviceID>/config` will be set to, e.g.:
```
{
    "name": "MAC",
    "availability_topic": "homeassistant/cover/MACx/connection",
    "payload_available": "Online",
    "payload_not_available": "Offline",
    "command_topic": "homeassistant/switch/MACx/set",
    "payload_on": "ON",
    "payload_off": "OFF",
    "unique_id": "switchbot_MACx_switch",
    "device": {
        "identifiers": "switchbot_MACx",
        "name": "MACx",
        "manufacturer": "Switchbot"
    }
}
```

## Parameters

`<deviceID>` has format of the device's MAC address in lowercase, with the colon's stripped out and cannot be changed


# HTTP Endpoints

`GET /`: list devices.
Response type: `[String : Device]` - ID as String key, Device as value
```
{
   "c03dc8105277":{
      "id":"c03dc8105277",
      "lastconnect":"2019-11-23T17:39:48.949Z",
      "lastaction":"ON"
   }
}
```

`GET /<deviceID>`: Get individual device data (or 404 if no device by that ID).

Response type: `Device` example:
```
{
   "id":"c03dc8105277",
   "lastconnect":"2019-11-23T17:39:48.949Z",
   "lastaction":"ON"
}
```

`POST /<deviceID>/on`: Send ON command to switchbot. Response type: `200 - OK` or `404 - Not Found`

`POST /<deviceID>/off`: Send OFF command to switchbot. Response type: `200 - OK` or `404 - Not Found`
