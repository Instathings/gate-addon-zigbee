const _ = require('lodash');
const debug = require('debug')('gate-addon-zigbee');
const EventEmitter = require('events');
const mqtt = require('mqtt');
const async = require('async');
const findDevices = require('./findDevices');

class GateAddOnZigbee extends EventEmitter {
  constructor(id, type, allDevices, options = {}) {
    super();
    this.id = id;
    this.data = {};
    this.knownDevices = allDevices.zigbee || [];
    this.deviceType = type;

    this.client = mqtt.connect('mqtt://mosquitto', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });
    this.touchlink = options.touchlink;
  }

  setKnownDevices(knownDevices) {
    this.knownDevices = knownDevices;
  }

  subscribe(callback) {
    this.client.subscribe('zigbee2mqtt/bridge/config/devices', (err) => {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  }

  factoryReset(callback) {
    if (this.touchlink) {
      return this.client.publish('zigbee2mqtt/bridge/config/touchlink/factory_reset', JSON.stringify({}), (err) => {
        if (err) {
          return callback(err);
        }
        setTimeout(() => {
          return callback();
        }, 5000);
      });
    }
    return callback();
  }

  init() {
    this.client.on('connect', () => {
      async.waterfall([
        this.subscribe.bind(this),
        this.factoryReset.bind(this),
      ], (err) => {
        if (err) {
          throw err;
        }
        findDevices.call(this, (findingErr, newDevice) => {
          this.client.removeAllListeners('message');
          if (findingErr) {
            const payload = {
              status: {
                eventType: 'not_paired',
              },
              deviceId: this.id,
            };
            this.emit('timeoutDiscovering', payload);
          } else {
            this.emit('newDevice', newDevice);
            this.start(newDevice);
          }
          this.client.unsubscribe('zigbee2mqtt/bridge/config/devices', (error) => {
            if (error) {
              console.log(error);
            }
          });
        });
      });
    });
  }

  start(device) {
    const { ieeeAddr } = device;
    const topic = `zigbee2mqtt/${ieeeAddr}`;
    this.client.on('message', (topic, message) => {
      const parsed = JSON.parse(message.toString());
      this.emit('data', parsed);
    });
    if (this.deviceType.type === 'sensor') {
      this.client.subscribe(topic, (err) => {
        if (err) {
          debug('ERR', err);
        }
        debug('OK');
      });
    }
  }

  stop() { }

  control(message, action) {
    const zigbeeDevice = this.knownDevices.filter((zigbeeDeviceFilter) => {
      return zigbeeDeviceFilter.id === this.id;
    })[0];
    const friendlyName = _.get(zigbeeDevice, 'ieeeAddr');
    const topic = `zigbee2mqtt/${friendlyName}/${action}`;

    if (action === 'get') {
      const responseTopic = `zigbee2mqtt/${friendlyName}`;
      this.client.once('message', (topic, responseMessage) => {
        const parsed = JSON.parse(responseMessage.toString());
        this.client.unsubscribe(responseTopic, (err) => { });
        const response = {
          payload: parsed,
          requestId: message.requestId,
          deviceId: message.deviceId,
          projectId: process.env.PROJECT_ID
        };
        this.emit('status', response);
      });
      this.client.subscribe(responseTopic, (err) => { });
    }

    const payloadDevice = (action === 'get') ? message.payload : message;
    this.client.publish(topic, JSON.stringify(payloadDevice), (err) => {
      console.log('ERR', err);
    });
  }
}

module.exports = GateAddOnZigbee;
