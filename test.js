// const GateAddOnSensorTag = require('./index');
// mosquitto_pub -h localhost -t zigbee2mqtt/bridge/config/force_remove -m '0x0017880103fa5754'
// const gaST = new GateAddOnSensorTag({}, { touchlink: true });
// gaST.init();
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', () => {
  // const payload = { friendly_name: '0x0017880103fa5754' }
  client.publish('zigbee2mqtt/bridge/config/force_remove', JSON.stringify('0x0017880103fa5754'));
});

