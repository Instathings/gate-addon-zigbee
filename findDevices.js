const debug = require('debug')('gate-addon-zigbee');

function lookForId(knownDevices, newId) {
  let isKnown = false;
  for (let i = 0; i < knownDevices.length && !isKnown; i += 1) {
    const knownId = knownDevices[i].ieeeAddr;
    if (knownId === newId) {
      isKnown = true;
    }
  }
  return isKnown;
}
module.exports = function findDevices(callback) {
  const timeoutId = setTimeout(() => {
    const err = new Error('timeout discovering zigbee devices');
    return callback(err);
  }, 30000);

  const intervalId = setInterval(() => {
    this.client.publish('zigbee2mqtt/bridge/config/devices/get');
  }, 1000);

  this.client.on('message', (topic, message) => {
    const connectedDevices = JSON.parse(message.toString());
    debug(message.toString());
    const connectedEndDevices = connectedDevices.filter((value) => {
      return value.type === 'EndDevice' || value.type === 'Router';
    });
    for (let i = 0; i < connectedEndDevices.length; i += 1) {
      const device = connectedEndDevices[i];
      const deviceId = device.ieeeAddr;
      const isKnown = lookForId(this.knownDevices, deviceId);
      if (!isKnown) {
        const newDevice =
        {
          ieeeAddr: device.ieeeAddr,
          protocol: 'zigbee',
        };
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        debug('NEWDEVICE', newDevice);
        return callback(null, newDevice);
      }
    }
  });
};
