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

### Installation

```
cordova plugin add https://github.com/petermetz/cordova-plugin-ibeacon.git
```

### Usage

The plugin's API closely mimics the one exposed through the [CLLocationManager](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) introduced in iOS 7.

Since version 2, the main ```IBeacon``` facade of the DOM is called ```LocationManager``` and it's API is based on promises instead of callbacks.
Another important change of version 2 is that it no longer pollutes the global namespace, instead all the model classes and utilities are accessible
through the ```cordova.plugins.locationManager``` reference chain.

#### Standard [CLLocationManager](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) functions

##### Creating BeaconRegion DTOs

```
/**
 * Function that creates a BeaconRegion data transfer object.
 * 
 * @throws Error if the BeaconRegion parameters are not valid.
 */
function createBeacon() {

    var uuid = 'DA5336AE-2042-453A-A57F-F80DD34DFCD9'; // mandatory
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
		};

		var delegate = new cordova.plugins.locationManager.Delegate().implement({
			
			didDetermineStateForRegion: function (pluginResult) {

				logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

				cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
					+ JSON.stringify(pluginResult));
			},

			didStartMonitoringForRegion: function (pluginResult) {
				console.log('didStartMonitoringForRegion:', pluginResult);

				logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
			},

			didRangeBeaconsInRegion: function (pluginResult) {
				logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
			}

		});

		var uuid = 'DA5336AE-2042-453A-A57F-F80DD34DFCD9';
		var identifier = 'beaconOnTheMacBooksShelf';
		var minor = 1000;
		var major = 5;
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

		cordova.plugins.locationManager.setDelegate(delegate);
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();

```
 

##### Stop monitoring a single iBeacon
```
		var uuid = 'DA5336AE-2042-453A-A57F-F80DD34DFCD9';
		var identifier = 'beaconOnTheMacBooksShelf';
		var minor = 1000;
		var major = 5;
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

		cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
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
		};

		var delegate = new cordova.plugins.locationManager.Delegate().implement({
			
			didDetermineStateForRegion: function (pluginResult) {

				logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

				cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
					+ JSON.stringify(pluginResult));
			},

			didStartMonitoringForRegion: function (pluginResult) {
				console.log('didStartMonitoringForRegion:', pluginResult);

				logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
			},

			didRangeBeaconsInRegion: function (pluginResult) {
				logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
			}

		});

		var uuid = 'DA5336AE-2042-453A-A57F-F80DD34DFCD9';
		var identifier = 'beaconOnTheMacBooksShelf';
		var minor = 1000;
		var major = 5;
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

		cordova.plugins.locationManager.setDelegate(delegate);
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();

```
 
##### Stop ranging a single iBeacon
```

		var uuid = 'DA5336AE-2042-453A-A57F-F80DD34DFCD9';
		var identifier = 'beaconOnTheMacBooksShelf';
		var minor = 1000;
		var major = 5;
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

		cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();


```

##### Determine if advertising is turned on.

```

This is not yet integrated into version 2. Coming soon!

```

##### Start advertising device as an iBeacon
```

This is not yet integrated into version 2. Coming soon!

```

##### Stopping the advertising
```

This is not yet integrated into version 2. Coming soon!

```

## Contributions

> Contributions are welcome at all times, please make sure that the tests are running without errors
> before submitting a pull request.

### How to execute the tests - OS X

#### Prerequisites Of The Test Runner
* [Dart SDK](http://dartlang.org) installed on the path (Tested with: 1.2, 1.3, 1.3.3)
* [NodeJS](http://nodejs.org/)
* [NPM](https://www.npmjs.org/)
* [Cordova NPM package](https://www.npmjs.org/package/cordova) (Tested with: 3.4.0-0.1.3)
* [XCode](https://developer.apple.com/xcode/) (Tested with 5.0.2)


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