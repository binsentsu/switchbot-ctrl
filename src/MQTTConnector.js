const mqtt = require('mqtt');

const switchTopic = 'switch/';

class MQTTConnector {
    constructor(device, mqttUrl, baseTopic, username, password) {
        const mqttClient = mqtt.connect(mqttUrl, {
            will: {
                topic: `${baseTopic}${switchTopic}${device.id}/connection`,
                payload: 'Offline',
                retain: true
            },
            username: username,
            password: password
        });

        let deviceTopic = `${baseTopic}${switchTopic}${device.id}`;
        mqttClient.subscribe([`${deviceTopic}/set`]);

        mqttClient.on('message', (topic, message) => {
            device.log('mqtt message received %o, %o', topic, message.toString());
            if (topic.endsWith('set') && message.length !== 0) {
                if (message.toString().toLowerCase() === 'on') {
                    device.log('requesting switchbot on');
                    device.switchbotOn();
                } else  if (message.toString().toLowerCase() === 'off'){
                    device.log('requesting switchbot off');
                    device.switchbotOff();
                }
            }
        });

        let deviceInfo = {
            identifiers: `switchbot_${device.id}`,
            name: device.id,
            manufacturer: 'Switchbot'
        };

        let switchConfig = {
            name: device.id,
            command_topic: `${deviceTopic}/set`,
            availability_topic: `${deviceTopic}/connection`,
            payload_available: 'Online',
            payload_not_available: 'Offline',
            payload_on: 'ON',
            payload_off: 'OFF',
            unique_id: `switchbot_${device.id}_switch`,
            device: deviceInfo
        };

        device.log(`mqtt topic ${deviceTopic}`);

        

        mqttClient.on('connect', () => {
        	switchConfig.name = device.getState().id;
        	switchConfig.device.name = device.getState().id;
        	mqttClient.publish(`${deviceTopic}/config`, JSON.stringify(switchConfig), {retain: true});
            mqttClient.publish(`${deviceTopic}/connection`, 'Online', {retain:true});
        	device.log('mqtt connected')
        });
        mqttClient.on('end', () => device.log('mqtt ended'));
        mqttClient.on('error', (e) => device.log('mqtt error %o', e));
        mqttClient.on('offline', () => device.log('mqtt offline'));
        mqttClient.on('close', () => device.log('mqtt close'));
    }
}

module.exports = MQTTConnector;
