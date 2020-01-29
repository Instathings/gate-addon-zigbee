const debug = require('debug')('gate-add-on-zigbee2mqtt');
const EventEmitter = require('events');

const mqtt = require('mqtt');

class ZigBee2MQTTAddOnSensorTag extends EventEmitter {
  constructor() {
    super();
    this.data = {};
  }

  start() {
    debug(this.data);
    const client = mqtt.connect('mqtt://localhost', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });

    client.on('connect', () => {
      client.subscribe('zibgee2mqtt/#', (err) => {
        if (err) {
          debug(err);
        }
      });
    });

    client.on('message', (topic, message) => {
      debug(topic);
      debug(message);
      this.emit('data', message);
    });
  }

  stop() { }
}

module.exports = ZigBee2MQTTAddOnSensorTag;
