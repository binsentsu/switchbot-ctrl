const EventEmitter = require('events');

const serviceUUID = 'cba20d00224d11e69fb80002a5d5c51b';
const switchbotCharUUID = 'cba20002224d11e69fb80002a5d5c51b';

const SWITCHHANDLE = 0x0016;
const HEX_KEY_SWITCHBOT_ON = "570101";
const HEX_KEY_SWITCHBOT_OFF = "570102";

class switchbot extends EventEmitter {
	static busyDevice = null;
	
    constructor(id, peripheral, noble) {
        super();
        this.log = require('debug')(`switchbot:${id}`);
        this.id = id;
        this.peripheral = peripheral;
        this.noble = noble;
        this.connecttime = null;
        this.lastaction = null;
		this.currentRetry = 0;
        this.maxRetries = 30;
        this.success = false;
    }
    
    writeLog(pLogLine) {
        this.log(pLogLine);
    }
	
	writeKey(handle, key) {
        if (switchbot.busyDevice != null) {
            this.writeLog('Connection busy for other device, waiting...');
            setTimeout(() => {
                this.writeKey(handle, key)
            }, 1000);
            return;
        }

        this.performWriteKey(handle, key);
    }
	
	performWriteKey(handle, key) {
		this.success = false;
        switchbot.busyDevice = this;
		this.peripheral.connect();
        this.peripheral.once('connect', handleDeviceConnected);
        this.peripheral.once('disconnect', disconnectMe);
        const self = this;
		
		function handleDeviceConnected() {
            self.connecttime = new Date();
            self.writeLog('Switchbot connected');
			setTimeout(() => {
                checkSuccess();
            }, 2000);
            self.peripheral.writeHandle(handle, Buffer.from(key, "hex"), true, handleWriteDone);
        }
		
		function checkSuccess() {
			if (self.success === false) {
				self.writeLog('hick up in writeHandle, retrying...');
				self.performWriteKey(handle, key)
			}
		}
		
		function disconnectMe() {
            self.writeLog('disconnected');
            if (self.success === false) {
                if (self.currentRetry < self.maxRetries) {
                    self.writeLog("Writing unsuccessful, retrying in 1 second...");
                    self.currentRetry = self.currentRetry + 1;
                    setTimeout(() => {
                        self.performWriteKey(handle, key)
                    }, 1000);
                } else {
                    self.writeLog("Writing unsuccessful, giving up...");
                    switchbot.busyDevice = null;
                    self.currentRetry = 0;
                }
            } else {
                self.writeLog("Writing was successful");
                switchbot.busyDevice = null;
                self.currentRetry = 0;
            }
        }
		
		function handleWriteDone(error) {
            if (error) {
                self.writeLog('ERROR' + error);
            } else {
                self.writeLog('key written');
                self.success = true;
            }

            setTimeout(() => {
                self.peripheral.disconnect();
            }, 1000);
        }
	}

    
    switchbotOn() {
        this.writeKey(SWITCHHANDLE, HEX_KEY_SWITCHBOT_ON);
        this.lastaction='ON';
    }

    switchbotOff() {
        this.writeKey(SWITCHHANDLE, HEX_KEY_SWITCHBOT_OFF);
        this.lastaction='OFF';
    }

    getState() {
        return {
            id: this.id,
            lastconnect: this.connecttime,
            lastaction: this.lastaction
        };
    }
}

module.exports = switchbot;
