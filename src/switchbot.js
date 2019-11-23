const EventEmitter = require('events');

const serviceUUID = 'cba20d00224d11e69fb80002a5d5c51b';
const switchbotCharUUID = 'cba20002224d11e69fb80002a5d5c51b';

const SWITCHHANDLE = 0x0016;
const HEX_KEY_SWITCHBOT_ON = "570101";
const HEX_KEY_SWITCHBOT_OFF = "570102";

class switchbot extends EventEmitter {
    constructor(id, peripheral, noble) {
        super();
        this.log = require('debug')(`switchbot:${id}`);
        this.id = id;
        this.peripheral = peripheral;
        this.noble = noble;
        this.connecttime = null;
        this.lastaction = null;

        Object.defineProperty(this, '_init', {set: function(state) {
                this.emit('initPerformed', this.getState());
            }});
    }

    writeKey(handle, key) {
        this.peripheral.connect((error) => {
            if (error) {
                this.log(error);
                this.peripheral.disconnect();
                return;
            }
            this.connecttime = new Date();
            this.log('Switchbot connected');
            this.peripheral.writeHandle(handle, Buffer.from(key, "hex"), false, (error) => {
                this.log('key written');
                if(error)
                {
                    this.log(error);
                }
                this.peripheral.disconnect(() => {
                    this.log('disconnected');
                });
            });
        });
    }

    switchbotInit()
    {
        this._init = true;
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
