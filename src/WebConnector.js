const express = require('express');

class WebConnector {
    constructor(devices, port, log) {
        this.devices = devices;
        this.express = express();
        this.setupExpressRoutes();
        this.log = log;
        this.log('listening on port %d', port);
        this.express.listen(port);
    }

    setupExpressRoutes() {
        this.express.get('/', (req, res) => {
            var output = {};
            Object.entries(this.devices).forEach(([id, device]) => output[id] = device.getState());
            res.json(output);
        });

        this.express.get('/:switchbotId', (req, res) => {
            let device = this.requireDevice(req, res);
            if (!device) {return;}

            res.json(device.getState());
        });

        this.express.post('/:switchbotId/on', (req, res) => {
            let device = this.requireDevice(req, res);
            if (!device) {
                return;
            }

            device.log('requesting switchbot on');
            device.switchbotOn();
            res.sendStatus(200);
        });

        this.express.post('/:switchbotId/off', (req, res) => {
            let device = this.requireDevice(req, res);
            if (!device) {
                return;
            }

            device.log('requesting calibrate bottom');
            device.switchbotOff();
            res.sendStatus(200);
        });
    }

    requireDevice(req, res) {
        var device = this.devices[req.params.switchbotId];
        if (!device) {
            res.sendStatus(404);
            return;
        }

        return device;
    }
}

module.exports = WebConnector;
