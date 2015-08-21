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
var Regions = require('com.unarin.cordova.beacon.Regions');


/**
 * Instances of this class are delegates between the {@link LocationManager} and
 * the code that consumes the messages generated on in the native layer.
 * 
 * @example 
 * 
 * var delegate = new cordova.plugins.LocationManager.Delegate();
 *
 * delegate.didDetermineStateForRegion = function(region) {
 *      console.log('didDetermineState:forRegion: ' + JSON.stringify(region));
 * };
 *
 * delegate.didStartMonitoringForRegion = function (region) {
 *      console.log('didStartMonitoringForRegion: ' + JSON.stringify(region));
 * }
 * 
 * @returns {Delegate} An instance of the type {@type Delegate}.
 */
function Delegate (){};

/**
 * A bunch of static pre-processor methods to parse and unmarshal the region objects.
 */
Delegate.didDetermineStateForRegion = function(pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.monitoringDidFailForRegionWithError = function (pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.didStartMonitoringForRegion = function(pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.didExitRegion = function(pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.didEnterRegion = function(pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.didRangeBeaconsInRegion = function(pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.peripheralManagerDidStartAdvertising = function(pluginResult) {
	pluginResult.region = Regions.fromJson(pluginResult.region);
};

Delegate.peripheralManagerDidUpdateState = function(pluginResult) {

};

Delegate.didChangeAuthorizationStatus = function(status) {
	
};

Delegate.safeTraceLogging = function(message) {
	if (!_.isString(message)) {
		return;
	}
	try {
		cordova.plugins.locationManager.appendToDeviceLog(message);
	} catch (e) {
		console.error('Fail in safeTraceLogging()' + e.message, e);
	}
};


/**
* Default implementations of the Delegate methods which are noop.
*/

Delegate.prototype.didDetermineStateForRegion = function() {
	Delegate.safeTraceLogging('DEFAULT didDetermineStateForRegion()');
};

Delegate.prototype.monitoringDidFailForRegionWithError = function () {
	Delegate.safeTraceLogging('DEFAULT monitoringDidFailForRegionWithError()');
};

Delegate.prototype.didStartMonitoringForRegion = function() {
	Delegate.safeTraceLogging('DEFAULT didStartMonitoringForRegion()');
};

Delegate.prototype.didExitRegion = function() {
	Delegate.safeTraceLogging('DEFAULT didExitRegion()');
};

Delegate.prototype.didEnterRegion = function() {
	Delegate.safeTraceLogging('DEFAULT didEnterRegion()');
};

Delegate.prototype.didRangeBeaconsInRegion = function() {
	Delegate.safeTraceLogging('DEFAULT didRangeBeaconsInRegion()');
};


Delegate.prototype.peripheralManagerDidStartAdvertising = function() {
	Delegate.safeTraceLogging('DEFAULT peripheralManagerDidStartAdvertising()');
};

Delegate.prototype.peripheralManagerDidUpdateState = function() {
	Delegate.safeTraceLogging('DEFAULT peripheralManagerDidUpdateState()');
};

Delegate.prototype.didChangeAuthorizationStatus = function() {
	Delegate.safeTraceLogging('DEFAULT didChangeAuthorizationStatus()');
};


module.exports = Delegate;
