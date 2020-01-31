const debug = require('debug')('gate-add-on-zigbee2mqtt');
const EventEmitter = require('events');
const mqtt = require('mqtt');
const findDevices = require('./findDevices');

class GateAddOnZigbee extends EventEmitter {
  constructor(allDevices) {
    super();
    this.data = {};
    this.knownDevices = allDevices.zigbee || [];
    this.client = mqtt.connect('mqtt://localhost', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });
  }

  init() {
    this.client.on('connect', () => {
      this.client.subscribe('zigbee2mqtt/bridge/config/devices', (err) => {
        if (err) {
          debug(err);
        }
        findDevices.call(this, (err, newDevice) => {
          this.client.removeAllListeners('message');
          if (err) {
            throw err;
          }
          this.emit('newDevice', newDevice);
          this.client.unsubscribe('zigbee2mqtt/bridge/config/devices', (err) => {
            if (err) {
              console.log(err);
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
    console.log('TOPIC', topic)
    this.client.on('message', (topic, message) => {
      const parsed = JSON.parse(message.toString());
      console.log('ON MESSAGE', parsed);
      this.emit('data', parsed);
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
