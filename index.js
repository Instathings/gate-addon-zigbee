const debug = require('debug')('gate-add-on-zigbee2mqtt');
const EventEmitter = require('events');
const mqtt = require('mqtt');
const findDevices = require('./findDevices');

class ZigBee2MQTTAddOnSensorTag extends EventEmitter {
  constructor(allDevices) {
    super();
    this.data = {};
    this.knownDevices = allDevices.zigbee || [];
  }

  init() {
    this.client = mqtt.connect('mqtt://localhost', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });
    this.client.on('connect', () => {
      this.client.subscribe('zigbee2mqtt/bridge/config/devices', (err) => {
        if (err) {
          debug(err);
        }
        findDevices.call(this, (err, newDevice) => {
          if (err) {
            throw err;
          }
          this.newDevice = newDevice;
          this.emit('newDevice', newDevice);
          this.client.unsubscribe('zigbee2mqtt/bridge/config/devices', (err) => {
            if (err) {
              console.log(err);
            }
            this.start();
          })
        });
      });
    });
  }

  start() {
    const { ieeeAddr } = this.newDevice;
    this.client.subscribe(`zibgee2mqtt/${ieeeAddr}`, (err) => {
      if (err) {
        debug(err);
      }
    });

    this.client.on('message', (topic, message) => {
      debug(topic);
      debug(message);
      this.emit('data', message);
    });
  }

  stop() { }
}
module.exports = ZigBee2MQTTAddOnSensorTag;
