// const GateAddOnSensorTag = require('./index');

// const gaST = new GateAddOnSensorTag({}, { touchlink: true });
// gaST.init();
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', () => {
  client.publish('zigbee2mqtt/bridge/config/force_remove', JSON.stringify({ friendly_name: '0x0017880103fa5754' }));
});
