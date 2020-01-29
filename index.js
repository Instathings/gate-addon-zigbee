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
    client.on('connect', (err) => {
      client.subscribe('zigbee2mqtt/+', (err) => {
        if (err) {
          debug(err);
        }
        client.on('message', (topic, message) => {
          debug(topic);
          const parsed = JSON.parse(message.toString());
          console.log(parsed);
          this.emit('data', parsed);
        });
      });
    });
  }

  stop() { }
}
module.exports = ZigBee2MQTTAddOnSensorTag;
