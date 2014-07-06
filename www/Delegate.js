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
var Regions = require('org.apache.cordova.ibeacon.Regions');


/**
 * Instances of this class are delegates between the {@link LocationManager} and
 * the code that consumes the messages generated on in the native layer.
 * 
 * @example 
 * 
 * var delegate = new cordova.plugins.LocationManager.Delegate.implement({
 *       didDetermineStateForRegion: function(region) {
 *           console.log('didDetermineState:forRegion: ' + JSON.stringify(region));
 *       },
 *       didStartMonitoringForRegion: function (region) {
 *           console.log('didStartMonitoringForRegion: ' + JSON.stringify(region));
 *       }
 *   });
 * 
 * @returns {Delegate} An instance of the type {@type Delegate}.
 */
var Delegate = klass();

/**
 * A bunch of pre-processor methods to parse and unmarshal the region objects.
 */
Delegate.statics({
    didDetermineStateForRegion: function(pluginResult) {
        pluginResult.region = Regions.fromJson(pluginResult.region);
    },
    didStartMonitoringForRegion: function(pluginResult) {
        pluginResult.region = Regions.fromJson(pluginResult.region);
    },
    didExitRegion: function(pluginResult) {
        pluginResult.region = Regions.fromJson(pluginResult.region);
    },
    didEnterRegion: function(pluginResult) {
        pluginResult.region = Regions.fromJson(pluginResult.region);
    },
    didRangeBeaconsInRegion: function(pluginResult) {
        pluginResult.region = Regions.fromJson(pluginResult.region);
    },
	safeTraceLogging: function(message) {
		if (!_.isString(message)) {
			return;
		}
		try {
			cordova.plugins.locationManager.appendToDeviceLog(message);
		} catch (e) {
			console.error('Fail in safeTraceLogging()' + e.message, e);
		}
	}

});

/**
 * Defualt implementations of the Delegate methods which are noop.
 */
Delegate.methods({
    didDetermineStateForRegion: function() {
		Delegate.safeTraceLogging('DEFAULT didDetermineStateForRegion()');
    },
    didStartMonitoringForRegion: function() {
		Delegate.safeTraceLogging('DEFAULT didStartMonitoringForRegion()');
    },
    didExitRegion: function() {
		Delegate.safeTraceLogging('DEFAULT didExitRegion()');
    },
    didEnterRegion: function() {
		Delegate.safeTraceLogging('DEFAULT didEnterRegion()');
    },
    didRangeBeaconsInRegion: function() {
        Delegate.safeTraceLogging('DEFAULT didRangeBeaconsInRegion()');
    }

});

module.exports = Delegate;
