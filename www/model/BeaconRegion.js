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
 * @returns {CLBeaconRegion} An instance of {CLBeaconRegion}.
 */
var BeaconRegion = Region.extend(function(identifier, uuid, major, minor) {
    this.uuid = uuid;
    this.major = major;
    this.minor = minor;

    this.typeName = 'BeaconRegion';
});

module.exports = BeaconRegion;

