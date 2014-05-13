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
 * @constructor
 *
 * @param {String} identifier @see {CLRegion}
 *
 * @param {Number} latitude The latitude in degrees. Positive values indicate 
 * latitudes north of the equator. Negative values indicate latitudes south of 
 * the equator.
 * 
 * @param {Number} longitude The longitude in degrees. Measurements are relative 
 * to the zero meridian, with positive values extending east of the meridian 
 * and negative values extending west of the meridian.
 * 
 * @param {Number} radius A distance measurement (in meters) from an existing location.
 *
 */
var CircularRegion = Region.extend(function(identifier, latitude, longitude, radius) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;


    // {String} typeName A String holding the name of the Objective-C type that the value
    //    this will get converted to once the data is in the Objective-C runtime.
    this.typeName = 'CircularRegion';
});

module.exports = CircularRegion;

