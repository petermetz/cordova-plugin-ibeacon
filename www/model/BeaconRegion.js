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

var _ = require('org.apache.cordova.ibeacon.underscorejs');
var klass = require('org.apache.cordova.ibeacon.klass');

var Region = require('org.apache.cordova.ibeacon.Region');

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
 * @returns {BeaconRegion} An instance of {BeaconRegion}.
 */
var BeaconRegion = Region.extend(function(identifier, uuid, major, minor) {

	Region.checkIdentifier(identifier);

	BeaconRegion.checkUuid(uuid);
	BeaconRegion.checkMajorOrMinor(major);
	BeaconRegion.checkMajorOrMinor(minor);

	this.uuid = uuid;
    this.major = major;
    this.minor = minor;

    this.typeName = 'BeaconRegion';
});

BeaconRegion.statics({
	isValidUuid: function (uuid) {
		var uuidValidatorRegex = this.getUuidValidatorRegex();
		return uuid.match(uuidValidatorRegex) != null;
	},

	getUuidValidatorRegex: function () {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	},

	checkUuid: function (uuid) {
		if (!BeaconRegion.isValidUuid(uuid)) {
			throw new TypeError(uuid + ' is not a valid UUID');
		}
	},

	checkMajorOrMinor: function (majorOrMinor) {
		if (!_.isUndefined(majorOrMinor)) {
			if (!_.isFinite(majorOrMinor)) {
				throw new TypeError(majorOrMinor + ' is not a finite value');
			}

			if (majorOrMinor > BeaconRegion.U_INT_16_MAX_VALUE ||
				majorOrMinor < BeaconRegion.U_INT_16_MIN_VALUE) {
				throw new TypeError(majorOrMinor + ' is out of valid range of values.');
			}
		}
	},

	U_INT_16_MAX_VALUE: (1 << 16) - 1,
	U_INT_16_MIN_VALUE: 0
});

module.exports = BeaconRegion;

