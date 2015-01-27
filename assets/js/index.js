/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
		
		
		/* do: some beacon-stuff here */
		var delegate = new cordova.plugins.locationManager.Delegate();

		delegate.didDetermineStateForRegion = function (pluginResult) {
			console.log('didDetermineStateForRegion:', pluginResult);
			if(pluginResult.state === 'CLRegionStateInside') {
				console.log('CLRegionStateInside');
				cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
					.fail(console.error)
					.done();
			} else if(pluginResult.state === 'CLRegionStateOutside') {
				console.log('CLRegionStateOutside');
				cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
					.fail(console.error)
					.done();
			}
		};

		delegate.didStartMonitoringForRegion = function (pluginResult) {
			console.log('didStartMonitoringForRegion:', pluginResult);
		};

		delegate.didRangeBeaconsInRegion = function (pluginResult) {
			console.log('didRangeBeaconsInRegion:', pluginResult);
			if(pluginResult.beacons.length > 0) {
				console.log(pluginResult.beacons[0]);
			}
		};

		var uuid = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
		var identifier = 'B9407F30-F5F8-466E-AFF9-25556B57FE6D-35387-61546';
		var major = 35387;
		var minor = 61546;
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

		cordova.plugins.locationManager.setDelegate(delegate);

		// required in iOS 8+
		// cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
		// or cordova.plugins.locationManager.requestAlwaysAuthorization()
		console.log('--- starting region monitoring ---');
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();
    }
};

app.initialize();