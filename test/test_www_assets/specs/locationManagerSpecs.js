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

describe('LocationManager', function() {

    it('is defined', function() {
        expect(locationManager).toBeDefined();
    });

    it('is an instance of LocationManager', function() {
        expect(locationManager instanceof LocationManager).toBe(true);
    });

    it('stops the monitoring of circular regions', function(done) {
        // Coordinates for London, Charing Cross
        var latitude = 51.5072;
        var longitude = -0.1275;
        var radius = 200; // 200 meters of radius
        var id = 'charingCrossRegion';
        var charingCross = new CircularRegion(id, latitude, longitude, radius);

        locationManager.stopMonitoringForRegion(charingCross)
			.then(done).fail(window.failJasmineTest)
			.done();

	});

    it('starts the monitoring of circular regions', function(done) {

        // Coordinates for London, Charing Cross
        var latitude = 51.5072;
        var longitude = -0.1275;
        var radius = 200; // 200 meters of radius
        var id = 'charingCrossRegion';
        var charingCross = new CircularRegion(id, latitude, longitude, radius);

        expect(charingCross).toBeDefined();
        expect(charingCross instanceof CircularRegion).toBe(true);

        var delegate = new Delegate().implement({
            didDetermineStateForRegion: function(pluginResult) {
                expect(Delegate['didDetermineStateForRegion']).toHaveBeenCalled();
                expect(pluginResult).toBeDefined();
                expect(pluginResult.region).toBeDefined();
                locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' 
                        + JSON.stringify(pluginResult.region));
            },
            didStartMonitoringForRegion: function(pluginResult) {
                console.log('didStartMonitoringForRegion:', pluginResult);

                var region = pluginResult.region;
				expect(region).toBeDefined();
                expect(region instanceof Region).toBe(true);
                done();
            }
        });

        locationManager.setDelegate(delegate);
        locationManager.startMonitoringForRegion(charingCross)
			.fail(window.failJasmineTest)
			.done();
    });



    it('starts the monitoring of circular regions #2', function(done) {

        // Coordinates for Apple HQ, so it is easy to debug from the simulator
        // Actual address: 1 Infinite Loop, Cupertino, CA 95014-2083
        var latitude = 37.330561;
        var longitude = -122.029832;
        var radius = 200; // 200 meters of radius
        var id = 'charingCrossRegion';
        var appleHq = new CircularRegion(id, latitude, longitude, radius);

        expect(appleHq).toBeDefined();
        expect(appleHq instanceof CircularRegion).toBe(true);

        var delegate = new Delegate().implement({
            didDetermineStateForRegion: function(pluginResult) {
                expect(Delegate['didDetermineStateForRegion']).toHaveBeenCalled();
                expect(pluginResult).toBeDefined();
                expect(pluginResult.region).toBeDefined();
                locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' 
                        + JSON.stringify(pluginResult.region));
            },
            didStartMonitoringForRegion: function(pluginResult) {
                console.log('didStartMonitoringForRegion:', pluginResult);

                var region = pluginResult.region;
				expect(region).toBeDefined();
                expect(region instanceof Region).toBe(true);
                done();
            }
        });

        locationManager.setDelegate(delegate);
        locationManager.startMonitoringForRegion(appleHq)
			.fail(window.failJasmineTest)
			.done();
    });

	it('starts monitoring of beacon regions.', function () {

		// You can't test the iBeacon monitoring properly in the emulator, thus the crippled test.
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var identifier = 'asdf';
		var minor = 12345;
		var major = 23455;
		var beaconRegion = new BeaconRegion(identifier, uuid, major, minor);

		locationManager.startMonitoringForRegion(beaconRegion)
			.fail(window.failJasmineTest)
			.done();

	});

	it('turns debug logging on and off', function (done) {
		locationManager.enableDebugLogs()
                .then(locationManager.disableDebugLogs)
                .then(function() {
                    done();
                    // make sure logs are enabled while the tests are running
                    locationManager.enableDebugLogs();
                })
                .done();
    });

    it('turns debug logging off and on', function(done) {
        locationManager.disableDebugLogs()
                .then(locationManager.enableDebugLogs)
                .then(done)
                .done();
    });

    it('queries the native layer for authorizationStatus', function(done) {
        var validStatuses = [
            'AuthorizationStatusNotDetermined',
            'AuthorizationStatusRestricted',
            'AuthorizationStatusDenied',
            'AuthorizationStatusAuthorized'
        ];

        locationManager.getAuthorizationStatus().then(function(pluginResult) {
            expect(pluginResult).toBeDefined();

            var status = pluginResult.authorizationStatus;
            expect(status).toBeDefined();

            expect(validStatuses.indexOf(status)).toBeGreaterThan(-1);
            done();
        }).done();
    });

    it('determines if ranging is available or not', function(done) {
        locationManager.isRangingAvailable()
                .then(function(isRangingAvailable) {
                    expect(typeof (isRangingAvailable)).toBe('boolean');
                    done();
                }).done();
    });

    it('gets an array of monitored regions', function(done) {
        locationManager.getMonitoredRegions()
                .then(function(regions) {
                    expect(_.isArray(regions)).toBe(true);
                    expect(_.every(regions, Regions.isRegion)).toBe(true);
                    done();
                }).done();
    });

    it('gets an array of ranged regions', function(done) {
        locationManager.getRangedRegions()
                .then(function(regions) {
                    expect(_.isArray(regions)).toBe(true);
                    expect(_.every(regions, Regions.isRegion)).toBe(true);
                    done();
                }).done();

    });

    it('sends debug log messages to the native layer', function(done) {
        var testMessage = 'Test log messeage from the specs.';
        locationManager.appendToDeviceLog(testMessage)
                .then(function(pluginResult) {
                    expect(pluginResult).toBe(testMessage);
                    done();
                })
                .done();
    });

});