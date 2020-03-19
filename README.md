# Gate addon for Zigbee protocol

This addon extends [Instathings Gate](https://github.com/Instathings/gate) for supporting Zigbee protocol.

### Get started

This addon is meant to be used inside the gate Docker container and will be installed automatically once the device pairing procedure is launched from the [Editor](https://editor.instathings.io).

For hardware specific documentation refer to [our documentation](https://docs.instathings.io/docs/guides/working-zigbee.html).

### Device pairing

Pairing a new Zigbee is quite easy: 

- start device pairing procedure from the [Editor](https://editor.instathings.io) 
- turn on the sensor when requested and follow the pairing procedure 

### Events

This addon extends the EventEmitter class, you can listen to the following events: 

- `data`: emitted when a device sends information (e.g.: a temperature sensor sends new data)
- `status`: emitted when a device sends its status after a specific request
- `newDevice`: emitted when a new device is successfully paired to the Gateway
- `deviceRemoved`: emitted when a known device is unpaired from the Gateway
- `timeoutDiscovering`: emitted if after 30s of discovery a new device has not been found
