<!---
 license: Licensed to the Apache Software Foundation (ASF) under one
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
-->


## ![iBeacon Cordova Plugin](http://icons.iconarchive.com/icons/artua/mac/128/Bluetooth-icon.png) Cordova / Phonegap iBeacon plugin

### Features

#### Features available on both Android and iOS

 * Ranging
 * Monitoring
 
#### Features exclusive to iOS

 * Region Monitoring (or geo fencing), works in all app states. 
 * Advertising device as an iBeacon

### Installation

```
cordova plugin add https://github.com/petermetz/cordova-plugin-ibeacon.git
```

### Usage

The plugin's API closely mimics the one exposed through the [CLLocationManager](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) introduced in iOS 7.

Since version 2, the main ```IBeacon``` facade of the DOM is called ```LocationManager``` and it's API is based on promises instead of callbacks.
Another important change of version 2 is that it no longer pollutes the global namespace, instead all the model classes and utilities are accessible
through the ```cordova.plugins.locationManager``` reference chain.

Since version 3.2 the Klass dependency has been removed and therefore means creation of the delegate has changed.

#### iOS 8 Permissions

On iOS 8, you have to request permissions from the user of your app explicitly. You can do this through the plugin's API.
See the [LocationManager](https://github.com/petermetz/cordova-plugin-ibeacon/blob/master/www/LocationManager.js)'s 
related methods: ```requestWhenInUseAuthorization``` and ```requestAlwaysAuthorization``` for further details.

#### Standard [CLLocationManager](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) functions


##### Creating BeaconRegion DTOs

```
/**
 * Function that creates a BeaconRegion data transfer object.
 * 
 * @throws Error if the BeaconRegion parameters are not valid.
 */
function createBeacon() {

    var uuid = '00000000-0000-0000-0000-000000000000'; // mandatory
    var identifier = 'beaconAtTheMacBooks'; // mandatory
    var minor = 1000; // optional, defaults to wildcard if left empty
    var major = 5; // optional, defaults to wildcard if left empty

    // throws an error if the parameters are not valid
    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
   
    return beaconRegion;   
} 
```
 
##### Start monitoring a single iBeacon
```
var logToDom = function (message) {
	var e = document.createElement('label');
	e.innerText = message;

	var br = document.createElement('br');
	var br2 = document.createElement('br');
	document.body.appendChild(e);
	document.body.appendChild(br);
	document.body.appendChild(br2);
	
	window.scrollTo(0, window.document.height);
};

var delegate = new cordova.plugins.locationManager.Delegate();
	
delegate.didDetermineStateForRegion = function (pluginResult) {

    logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

    cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
        + JSON.stringify(pluginResult));
};

delegate.didStartMonitoringForRegion = function (pluginResult) {
    console.log('didStartMonitoringForRegion:', pluginResult);

    logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
};

delegate.didRangeBeaconsInRegion = function (pluginResult) {
    logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
};

var uuid = '00000000-0000-0000-0000-000000000000';
var identifier = 'beaconOnTheMacBooksShelf';
var minor = 1000;
var major = 5;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

cordova.plugins.locationManager.setDelegate(delegate);

// required in iOS 8+
cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
// or cordova.plugins.locationManager.requestAlwaysAuthorization()

cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();

```
 

##### Stop monitoring a single iBeacon
```
var uuid = '00000000-0000-0000-0000-000000000000';
var identifier = 'beaconOnTheMacBooksShelf';
var minor = 1000;
var major = 5;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

cordova.plugins.locationManager.stopMonitoringForRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();

```
 
 
##### Start ranging a single iBeacon
```
var logToDom = function (message) {
	var e = document.createElement('label');
	e.innerText = message;

	var br = document.createElement('br');
	var br2 = document.createElement('br');
	document.body.appendChild(e);
	document.body.appendChild(br);
	document.body.appendChild(br2);
	
	window.scrollTo(0, window.document.height);
};

var delegate = new cordova.plugins.locationManager.Delegate();
	
delegate.didDetermineStateForRegion = function (pluginResult) {

    logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

    cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
        + JSON.stringify(pluginResult));
};

delegate.didStartMonitoringForRegion = function (pluginResult) {
    console.log('didStartMonitoringForRegion:', pluginResult);

    logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
};

delegate.didRangeBeaconsInRegion = function (pluginResult) {
    logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
};



var uuid = '00000000-0000-0000-0000-000000000000';
var identifier = 'beaconOnTheMacBooksShelf';
var minor = 1000;
var major = 5;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

cordova.plugins.locationManager.setDelegate(delegate);

// required in iOS 8+
cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
// or cordova.plugins.locationManager.requestAlwaysAuthorization()

cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();

```
 
##### Stop ranging a single iBeacon
```
var uuid = '00000000-0000-0000-0000-000000000000';
var identifier = 'beaconOnTheMacBooksShelf';
var minor = 1000;
var major = 5;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();

```

##### Determine if advertising is supported (iOS is supported, Android is not yet)

```
cordova.plugins.locationManager.isAdvertisingAvailable()
    .then(function(isSupported){
        console.log("isSupported: " + isSupported);
    })
    .fail(function(e) { console.error(e); })
    .done();

```

##### Determine if advertising is currently turned on (iOS only)

```        
cordova.plugins.locationManager.isAdvertising()
    .then(function(isAdvertising){
        console.log("isAdvertising: " + isAdvertising);
    })
    .fail(function(e) { console.error(e); })
    .done();

```

##### Start advertising device as an iBeacon (iOS only)
```
var uuid = '00000000-0000-0000-0000-000000000000';
var identifier = 'advertisedBeacon';
var minor = 2000;
var major = 5;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

// The Delegate is optional
var delegate = new cordova.plugins.locationManager.Delegate();

// Event when advertising starts (there may be a short delay after the request)
// The property 'region' provides details of the broadcasting Beacon
delegate.peripheralManagerDidStartAdvertising = function(pluginResult) {
    console.log('peripheralManagerDidStartAdvertising: '+ JSON.stringify(pluginResult.region));
};
// Event when bluetooth transmission state changes 
// If 'state' is not set to BluetoothManagerStatePoweredOn when advertising cannot start
delegate.peripheralManagerDidUpdateState = function(pluginResult) {
    console.log('peripheralManagerDidUpdateState: '+ pluginResult.state);
};

cordova.plugins.locationManager.setDelegate(delegate);

// Verify the platform supports transmitting as a beacon
cordova.plugins.locationManager.isAdvertisingAvailable()
    .then(function(isSupported){

        if (isSupported) {
            cordova.plugins.locationManager.startAdvertising(beaconRegion)
                .fail(conole.error)
                .done();
        } else {
            console.log("Advertising not supported");
        }
    })
    .fail(function(e) { console.error(e); })
    .done();

```

##### Stopping the advertising (iOS only)
```
cordova.plugins.locationManager.stopAdvertising()
    .fail(function(e) { console.error(e); })
    .done();

```

##### Enable/Disable BlueTooth (Android only)

```        
cordova.plugins.locationManager.isBluetoothEnabled()
    .then(function(isEnabled){
        console.log("isEnabled: " + isEnabled);
        if (isEnabled) {
            cordova.plugins.locationManager.disableBluetooth();
        } else {
            cordova.plugins.locationManager.enableBluetooth();        
        }
    })
    .fail(function(e) { console.error(e); })
    .done();

```

## Contributions

> Contributions are welcome at all times, please make sure that the tests are running without errors
> before submitting a pull request. The current development branch that you should submit your pull requests against is
> "v3.x" branch.

### How to execute the tests - OS X

#### Prerequisites Of The Test Runner
* [Dart SDK](http://dartlang.org) installed on the path (Tested with: 1.2, 1.3, 1.3.3)
* [NodeJS](http://nodejs.org/)
* [NPM](https://www.npmjs.org/)
* [Cordova NPM package](https://www.npmjs.org/package/cordova) (Tested with: 3.4.0-0.1.3)
* [XCode](https://developer.apple.com/xcode/) (Tested with 5.0.2 and 6.0)


```
dart test/run_tests.dart
```

Executing the test runner will do the following:
* Generates a Cordova project
* Add the iOS platform
* Installs the iBeacon plugin from the local file-system.
* Launches XCode by opening the project.

### How to execute the tests - Without the Dart SDK

* Open an app which has Cordova iBeacon plugin installed in XCode
* Install it onto a device or simulator
* Open Safari
* Go to the dev tools window
* Paste the code from the examples into the javascript console, it should run without any errors.
