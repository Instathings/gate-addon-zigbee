const debug = require('debug')('gate-add-on-zigbee2mqtt');
const EventEmitter = require('events');
const mqtt = require('mqtt');
const async = require('async');
const findDevices = require('./findDevices');

class GateAddOnZigbee extends EventEmitter {
  constructor(allDevices, options = {}) {
    super();
    this.data = {};
    this.knownDevices = allDevices.zigbee || [];
    this.client = mqtt.connect('mqtt://localhost:1883', {
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
      console.log('debuggonee', this.touchlink);
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
        this.factoryReset.bind(this)
      ],
        (err) => {
          if (err) {
            throw err;
          }
          findDevices.call(this, (err, newDevice) => {
            this.client.removeAllListeners('message');
            if (err) {
              throw err;
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
    console.log('DEVICE', device);
    const topic = `zigbee2mqtt/${ieeeAddr}`;
    console.log('TOPIC', topic);
    this.client.on('message', (topic, message) => {
      const parsed = JSON.parse(message.toString());
      console.log('ON MESSAGE', parsed);
      this.emit('data', parsed);
    });

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.log('ERR', err);
      }
      console.log('OK');
    });
  }

  stop() { }
}
module.exports = GateAddOnZigbee;
