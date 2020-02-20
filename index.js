const _ = require('lodash');
const debug = require('debug')('gate-addon-zigbee');
const EventEmitter = require('events');
const mqtt = require('mqtt');
const async = require('async');
const findDevices = require('./findDevices');

class GateAddOnZigbee extends EventEmitter {
  constructor(id, allDevices, options = {}) {
    super();
    this.id = id;
    this.data = {};
    this.knownDevices = allDevices.zigbee || [];

    this.client = mqtt.connect('mqtt://mosquitto', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });
    this.touchlink = options.touchlink;
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
            throw findingErr;
          }
          this.emit('newDevice', newDevice);
          this.client.unsubscribe('zigbee2mqtt/bridge/config/devices', (error) => {
            if (error) {
              console.log(error);
            }
            this.start(newDevice);
          });
        });
      });
    });
  }

  start(device) {
    const { ieeeAddr } = device;
    debug('DEVICE', device);
    const topic = `zigbee2mqtt/${ieeeAddr}`;
    debug('TOPIC', topic);
    this.client.on('message', (topic, message) => {
      const parsed = JSON.parse(message.toString());
      debug('ON MESSAGE', parsed);
      this.emit('data', parsed);
    });

    this.client.subscribe(topic, (err) => {
      if (err) {
        debug('ERR', err);
      }
      debug('OK');
    });
  }

  stop() { }

  control(payload) {
    const zigbeeDevice = this.knownDevices.filter((zigbeeDeviceFilter) => {
      return zigbeeDeviceFilter.id === this.id;
    })[0];
    const friendlyName = _.get(zigbeeDevice, 'ieeeAddr');
    const topic = `zigbee2mqtt/${friendlyName}/set`;
    this.client.publish(topic, JSON.stringify(payload), (err) => {
    });
  }
}
module.exports = GateAddOnZigbee;
