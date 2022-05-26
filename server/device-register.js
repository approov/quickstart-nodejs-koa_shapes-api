// shapes api server

const { debug } = require('./utils');

// deviceQueue holds the registered device IDs in the order they were added.
// (A simple queue implementation using a linked list)
const deviceQueue = {
  begin: null,
  end: null,
  push: (deviceID) => {
    let newEnd = {deviceID: deviceID, next: null};
    if (deviceQueue.end === null) {
      deviceQueue.begin = newEnd;
    } else {
      deviceQueue.end.next = newEnd;
    }
    deviceQueue.end = newEnd;
  },
  pop: () => {
    if (deviceQueue.begin === null) {
      return false;
    }
    let deviceID = deviceQueue.begin.deviceID;
    debug(`deviceQueue.pop: ${deviceID}`);
    deviceQueue.begin = deviceQueue.begin.next
    if (deviceQueue.begin === null) {
      deviceQueue.end = null;
    }
    return deviceID;
  }
};

// register holds a simple mapping from deviceID to a stored value.
// add(deviceID, value): devices may only be added once (when a new one is
//     added it may evict the least recently added deviceID to make sure the
//     map never grows beyond a fixed size.) Returns true if the addition is
//     successful, false if the device is already present, in which case the
//     value will not be changed.
// get(deviceID): gets the value associated with the device ID or null if the
//     device was never added or is no longer present.
// set(deviceID, value): changes the value associated with a device. Returns
//     true if the update was successful; false if the device is no present
//     in the register.
const MAX_REGISTER_SIZE = 100;
const register = {
  devices: {},
  add: (deviceID, value) => {
    if (register.devices.hasOwnProperty(deviceID)) {
      debug(`device add failed: ${deviceID} already registered`);
      return false;
    }
    // evict an old device if we need to make room for the new
    if (Object.keys(register.devices).length > MAX_REGISTER_SIZE) {
      let evictedDeviceID = deviceQueue.pop();
      if (evictedDeviceID) {
        delete register.devices[evictedDeviceID];
      }
    }
    // add the new device
    deviceQueue.push(deviceID);
    register.devices[deviceID] = value;
    return true;
  },
  get: (deviceID) => {
    if (register.devices.hasOwnProperty(deviceID)) {
      return register.devices[deviceID];
    }
    return null;
  },
  set: (deviceID, value) => {
    if (!register.devices.hasOwnProperty(deviceID)) {
      debug(`device set failed: ${deviceID} not registered`);
      return false;
    }
    // update the device value
    register.devices[deviceID] = value;
    return true;
  }
};

const registerDeviceWithValue = (deviceID, value) => {
  return register.add(deviceID, value);
}

const getDeviceValue = (deviceID) => {
  return register.get(deviceID);
}

const resetDeviceValue = (deviceID, value) => {
  return register.set(deviceID, value);
}

module.exports = { registerDeviceWithValue, getDeviceValue, resetDeviceValue };

// end of file
