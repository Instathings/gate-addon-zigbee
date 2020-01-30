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
      this.client.publish('zigbee2mqtt/bridge/config/force_remove', '0x00158d0004018344');
      this.client.publish('zigbee2mqtt/bridge/config/force_remove', '0x00158d0003d2d12a');
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
          });
        });
      });
    });
  }

  start() {
    const { ieeeAddr } = this.newDevice;
    console.log('DEVICE', this.newDevice);
    const topic = `zigbee2mqtt/${ieeeAddr}`;
    console.log('TOPIC', topic)
    this.client.on('message', (topic, message) => {
      console.log('ON MESSAGE', message);
      this.emit('data', message);
    });

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.log('ERR', err)
      }
      console.log('OK');
    });


  }

  stop() { }
}
module.exports = ZigBee2MQTTAddOnSensorTag;
