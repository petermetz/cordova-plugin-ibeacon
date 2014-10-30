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
 * @throws {TypeError} if any of the parameters are passed with an incorrect type.
 * @throws {Error} if any of the parameters are containing invalid values.
 */
 
function CircularRegion (identifier, latitude, longitude, radius){
	// Call the parent constructor, making sure (using Function#call)
	// that "this" is set correctly during the call
	Region.call(this, identifier);

	CircularRegion.checkLatitude(latitude);
	CircularRegion.checkLongitude(longitude);
	CircularRegion.checkRadius(radius);

	this.latitude = latitude;
	this.longitude = longitude;
	this.radius = radius;

	// {String} typeName A String holding the name of the Objective-C type that the value
	//    this will get converted to once the data is in the Objective-C runtime.
	this.typeName = 'CircularRegion';
  
};
 
// Create a CircularRegion.prototype object that inherits from Region.prototype.
// Note: A common error here is to use "new Region()" to create the
// CircularRegion.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give Region for the "identifier" 
// argument. The correct place to call Region is above, where we call 
// it from CircularRegion.
CircularRegion.prototype = Object.create(Region.prototype);

// Set the "constructor" property to refer to CircularRegion
CircularRegion.prototype.constructor = CircularRegion;


CircularRegion.checkRadius = function (radius) {
	if (_.isNaN(radius)) {
		throw new TypeError("'radius' is not a number.");
	}
	if (!_.isNumber(radius)) {
		throw new TypeError("'radius'" + radius + ' is not number.');
	}
	if (radius < 0) {
		throw new Error("'radius' has to be a finite, positive number.");
	}
};

CircularRegion.checkLongitude = function (longitude) {
	if (_.isNaN(longitude)) {
		throw new TypeError("'longitude' is not a number.");
	}
	if (!_.isNumber(longitude)) {
		throw new TypeError(longitude + ' is not a Number.');
	}

	if (longitude > 180 || longitude < -180) {
		throw new Error(longitude + ' has to be a value between -180 and +180');
	}
};

CircularRegion.checkLatitude = function (latitude) {
	if (_.isNaN(latitude)) {
		throw new TypeError("'latitude' is not a number.");
	}
	if (!_.isNumber(latitude)) {
		throw new TypeError(latitude + ' is not a Number.');
	}

	if (latitude > 90 || latitude < -90) {
		throw new Error(latitude + ' has to be a value between -90 and +90');
	}
};

module.exports = CircularRegion;

