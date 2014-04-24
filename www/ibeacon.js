/*
*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*
*/

var exec = require('cordova/exec');

/**
 * This represents the CLLocationManager's API (only the iBeacon related functions added in iOS 7).
 * 
 * @constructor
 */
function IBeacon() {
}

IBeacon.prototype.isCLBeaconRegion = function (object) {
    return (object instanceof CLBeaconRegion);
};

IBeacon.prototype.validateRegion = function (regionObject) {
    if (!this.isCLBeaconRegion(regionObject)) {
        throw new TypeError('Parameter region has to be a CLBeaconRegion object.');
    }
    regionObject.validateFields(); // ensures fields are not empty
}

IBeacon.prototype.isArrayOfBeacons = function (array) {
    if (!isArray(array)) {
        return false;
    }

    for (var i = 0; i < array.length; i++) {
      var beacon = array[i];
      if (!(beacon instanceof CLBeaconRegion)) {
        return false;
      }
    };
    return true;
};

IBeacon.prototype.validateRegionArray = function (regionArray) {
    if (!this.isArrayOfBeacons(regionArray)) {
      throw new TypeError('The regions parameter is mandatory and has to be an Array of IBeacon.CLBeaconRegion objects.');
    }
};

/**
 * Common function to interact with the Objective C Runtime through the Cordova Plugin 
 * API.
 *
 * @param actionName: The method name to call in the native implementaiton.
 * @param region: A CLBeaconRegion instance, to adminster.
 * @param beaconCallback: This will be called by the native layer when an update
 * is triggered by the OS.
 */
IBeacon.prototype.callObjCRuntime = function (actionName, region, beaconCallback, errorCallback, extraArgs) {
    this.validateRegion(region);
    
    var validActions = ['startMonitoringForRegion', 'stopMonitoringForRegion', 'startRangingBeaconsInRegion', 'stopRangingBeaconsInRegion', 'startAdvertising'];
    
    if (validActions.indexOf(actionName) < 0) {
        throw new Error('Invalid operation: ' + actionName + ' Valid ones are: ' + validActions.join(','));
    }

    var onSuccess = function (result) {
        if (beaconCallback) {
          beaconCallback(result);  
        } else {
          console.error('There is no callback to call with ', result);
        }
    };
    var onFailure = function (error) {
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error('There was en error in the beacon registration process: ' +  JSON.stringify(error));
      }
    };

    var commandArguments = [region];
    if (isArray(extraArgs)) {
        commandArguments = commandArguments.concat(extraArgs);
    }

    exec(onSuccess, onFailure, "IBeacon", actionName, commandArguments);
};

IBeacon.prototype.startMonitoringForRegion = function (region, didDetermineStateCallback) {
    return this.callObjCRuntime('startMonitoringForRegion', region, didDetermineStateCallback);
};

/**
 * A simple wrapper around {#startMonitoringForRegion()} to make it possible to start monitoring
 * multiple beacons with a single call.
 * 
 * @param regions Array of IBeacon.CLBeaconRegion objects to monitor.
 * @param didDetermineStateCallback: The function to call when any of the passed CLBeaconRegion
 * objects were captured on the native layer.
 *
 */
IBeacon.prototype.startMonitoringForRegions = function (regions, didDetermineStateCallback) {
    this.validateRegionArray(regions);

    for (var i = 0; i < regions.length; i++) {
      var region = regions[i];
      this.callObjCRuntime('startMonitoringForRegion', region, didDetermineStateCallback);
    }
};

IBeacon.prototype.stopMonitoringForRegion = function (region) {
    this.validateRegion(region);
    return this.callObjCRuntime('stopMonitoringForRegion', region);
};

IBeacon.prototype.stopMonitoringForRegions = function (regions) {
    this.validateRegionArray(regions);

    for (var i = 0; i < regions.length; i++) {
      var region = regions[i];
      this.callObjCRuntime('stopMonitoringForRegion', region);
    }
};

/**
 * A simple wrapper around {#startRangingBeaconsInRegion()} to make it possible to start ranging
 * multiple beacons with a single call.
 * 
 * @param regions Array of IBeacon.CLBeaconRegion objects to range.
 * @param didRangeBeaconsCallback: The function to call when any of the passed CLBeaconRegion
 * objects were captured on the native layer.
 *
 */
IBeacon.prototype.startRangingBeaconsInRegions = function (regions, didRangeBeaconsCallback) {
    this.validateRegionArray(regions);

    for (var i = 0; i < regions.length; i++) {
      var region = regions[i];
      this.callObjCRuntime('startRangingBeaconsInRegion', region, didRangeBeaconsCallback);
    }
};

IBeacon.prototype.startRangingBeaconsInRegion = function (region, didRangeBeaconsCallback) {
    this.validateRegion(region);
    return this.callObjCRuntime('startRangingBeaconsInRegion', region, didRangeBeaconsCallback);
};

IBeacon.prototype.stopRangingBeaconsInRegion = function (region) {
    this.validateRegion(region);
    return this.callObjCRuntime('stopRangingBeaconsInRegion', region);
};

/**
 * Stops ranging an array of IBeacon.CLBeaconRegion objects.
 * A short-hand wrapper around {#stopRangingBeaconsInRegion} 
 * 
 * @param regions: An array of CLBeaconRegion objects.
 * @throws: TypeError if the regions parameter is not an array of
 * objects which are all instances of the CLBeaconRegion prototype.
 *
 */
IBeacon.prototype.stopRangingBeaconsInRegions = function (regions) {
    this.validateRegionArray(regions);
    
    for (var i = 0; i < regions.length; i++) {
      var region = regions[i];
      this.callObjCRuntime('stopRangingBeaconsInRegion', region);
    } 
};

IBeacon.prototype.isAdvertising = function (onSuccess) {
    if (typeof(onSuccess) !== 'function') {
        throw new TypeError('The onSuccess parameter has to be a callback function.');
    }
    exec(onSuccess, null, "IBeacon", 'isAdvertising', []);
};

/**
 * Starts advertising the current device as an iBeacon. Backed by the CoreBluetooth framework of iOS.
 * 
 * @param onPeripheralManagerDidStartAdvertising: Callback to be called when the Objective-C runtime receives
 * the similarly named invocation.
 *
 * @param measuredPower: Optional parameter, if left empty, the device will use it's own default value.
 *
 */
IBeacon.prototype.startAdvertising = function (region, onPeripheralManagerDidStartAdvertising, measuredPower) {
    this.validateRegion(region);
    if (measuredPower) {
        return this.callObjCRuntime('startAdvertising', region, onPeripheralManagerDidStartAdvertising, null, [measuredPower]);
    } else {
        return this.callObjCRuntime('startAdvertising', region, onPeripheralManagerDidStartAdvertising);
    }
    
};

IBeacon.prototype.stopAdvertising = function (onSuccess) {
    exec(onSuccess, null, "IBeacon", 'stopAdvertising', []);
};

function isArray(array) {
    return !(!array || typeof(array.length) !== 'number');
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}


/**
 * A model class which mimics the CLBeaconRegion class from the native iOS SDK.
 * 
 * Used to validate the input fields in a more fashioned
 * way than checking JSON objects' keys in the plugin's code.
 *
 * Also the client code should feel better to write instead of hacking together the 
 * random JSON objects.
 *
 * @param notifyEntryStateOnDisplay: 
 *
 */
var CLBeaconRegion = function(uuid, major, minor, identifier, notifyEntryStateOnDisplay) {
    this.uuid = uuid;
    this.major = major;
    this.minor = minor;
    this.identifier = identifier;
    this.notifyEntryStateOnDisplay = true;

    if (typeof(notifyEntryStateOnDisplay) === 'Boolean') {
        this.notifyEntryStateOnDisplay = notifyEntryStateOnDisplay;
    } else {
      this.notifyEntryStateOnDisplay = true;
    }

    this.validateFields();
   
};

CLBeaconRegion.prototype.isValidUuid = function (uuid) {
	var uuidValidatorRegex = this.getUuidValidatorRegex();
	return uuid.match(uuidValidatorRegex) != null;
};

CLBeaconRegion.prototype.getUuidValidatorRegex = function () {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
}

CLBeaconRegion.prototype.validateFields = function () {
    // Parameter uuid
    if (isBlank(this.uuid)) {
        throw new TypeError('Parameter uuid has to be a String.');
    }
	var uuidInvalid = !this.isValidUuid(this.uuid);
	if (uuidInvalid) {
		throw new TypeError('Parameter uuid has to be in the format of ' + this.getUuidValidatorRegex());
	}

	// Parameter major - only validated if non null/undefined value is passed in
	var shouldValidateMajor = (this.major !== undefined && this.major !==  null);
	var majorInt = parseInt(this.major);
	var majorIsNotValid = (majorInt !== this.major || majorInt === NaN);
	if (shouldValidateMajor && majorIsNotValid) {
        throw new TypeError('Parameter major has to be an integer.');
    }

    // Parameter minor - only validated if non null/undefined value is passed in
	var shouldValidateMinor = (this.minor !== undefined && this.minor !==  null);
    var minorInt = parseInt(this.minor);
	var minorIsNotValid = (minorInt !== this.minor || minorInt === NaN);
    if (shouldValidateMinor && minorIsNotValid) {
        throw new TypeError('Parameter minor has to be an integer.');
    } 

    // Parameter identifier
    if (isBlank(this.identifier)) {
        throw new TypeError('Parameter identifier has to be a String.');
    }
};

IBeacon.prototype.CLBeaconRegion = CLBeaconRegion;


module.exports = new IBeacon();


