/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var _ = require('com.unarin.cordova.beacon.underscorejs');
var Region = require('com.unarin.cordova.beacon.Region');

/**
 * Constructor for {CLBeaconRegion}.
 * 
 * @param {String} identifier @see {CLRegion}
 * 
 * @param {String} uuid The proximity ID of the beacon being targeted. 
 * This value must not be blank nor invalid as a UUID.
 * 
 * @param {Number} major The major value that you use to identify one or more beacons.
 * @param {Number} minor The minor value that you use to identify a specific beacon.
 *
 * @param {BOOL} notifyEntryStateOnDisplay
 * 
 * @returns {BeaconRegion} An instance of {BeaconRegion}.
 */
function BeaconRegion (identifier, uuid, major, minor, notifyEntryStateOnDisplay){
	// Call the parent constructor, making sure (using Function#call)
	// that "this" is set correctly during the call
	Region.call(this, identifier);

	BeaconRegion.checkUuid(uuid);
	BeaconRegion.checkMajorOrMinor(major);
	BeaconRegion.checkMajorOrMinor(minor);

	this.uuid = uuid;
    this.major = major;
    this.minor = minor;
    this.notifyEntryStateOnDisplay = notifyEntryStateOnDisplay;

    this.typeName = 'BeaconRegion';  
};

// Create a BeaconRegion.prototype object that inherits from Region.prototype.
// Note: A common error here is to use "new Region()" to create the
// BeaconRegion.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give Region for the "identifier" 
// argument. The correct place to call Region is above, where we call 
// it from BeaconRegion.
BeaconRegion.prototype = Object.create(Region.prototype);

// Set the "constructor" property to refer to BeaconRegion
BeaconRegion.prototype.constructor = BeaconRegion;

BeaconRegion.isValidUuid = function (uuid) {
	var uuidValidatorRegex = this.getUuidValidatorRegex();
	return uuid.match(uuidValidatorRegex) != null;
};

BeaconRegion.getUuidValidatorRegex = function () {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
};

BeaconRegion.checkUuid = function (uuid) {
	if (!BeaconRegion.isValidUuid(uuid)) {
		throw new TypeError(uuid + ' is not a valid UUID');
	}
};

BeaconRegion.checkMajorOrMinor = function (majorOrMinor) {
	if (!_.isUndefined(majorOrMinor)) {
		if (!_.isFinite(majorOrMinor)) {
			throw new TypeError(majorOrMinor + ' is not a finite value');
		}

		if (majorOrMinor > BeaconRegion.U_INT_16_MAX_VALUE ||
			majorOrMinor < BeaconRegion.U_INT_16_MIN_VALUE) {
			throw new TypeError(majorOrMinor + ' is out of valid range of values.');
		}
	}
};

BeaconRegion.U_INT_16_MAX_VALUE = (1 << 16) - 1;
BeaconRegion.U_INT_16_MIN_VALUE = 0;


module.exports = BeaconRegion;

