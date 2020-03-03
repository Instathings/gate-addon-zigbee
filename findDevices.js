const debug = require('debug')('gate-addon-zigbee');

module.exports = function findDevices(callback) {
  const timeoutId = setTimeout(() => {
    this.emit('internalNewDeviceTimeout');
  }, 30000);

  this.client.on('message', (topic, message) => {
    if (topic !== 'zigbee2mqtt/bridge/log') {
      return;
    }
    const logMessage = JSON.parse(message.toString());
    const messageType = logMessage.type;
    if (messageType !== 'device_connected') {
      return;
    }
    const ieeeAddr = logMessage.message.friendly_name;
    const newDevice =
    {
      ieeeAddr,
      protocol: 'zigbee',
    };
    clearTimeout(timeoutId);
    this.emit('internalNewDevice', newDevice);
  });
  return callback();
};
