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

beforeEach(doneWhenCordovaIsReady);

window.failJasmineTest = function(msg) {
	throw new Error(JSON.stringify(msg) || 'Test failed');
};

function doneWhenCordovaIsReady(done) {
    document.addEventListener("deviceready", function() {

        window.LocationManager = cordova.plugins.LocationManager;
        window.locationManager = cordova.plugins.locationManager;
        window.Regions = locationManager.Regions;

        window.Region = locationManager.Region;
        window.Delegate = locationManager.Delegate;
        window.CircularRegion = locationManager.CircularRegion;
        window.BeaconRegion = locationManager.BeaconRegion;


        window._ = cordova.require('com.unarin.cordova.beacon.underscorejs');

        done();

    }, false);
}
