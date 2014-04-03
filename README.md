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

 * Ranging
 * Monitoring
 * Coming soon => Advertising (Turning the actual device into a beacon)

### Installation

```
cordova plugin add https://github.com/petermetz/cordova-plugin-ibeacon.git
```

### Usage

The plugin's API closely mimics the one exposed through the [CLLocationManager](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) in iOS 7. There is some added sugar as well, like the ability to interact with multiple iBeacons through a single call.

#### Standard [CLLocationManager](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) functions

##### Creating CLBeaconRegion DTOs
```
/**
 * Function that creates a CLBeaconRegion data transfer object.
 * 
 * @throws Error if the CLBeaconRegion cannot be created.
 */
function createBeacon() {
   var identifier = 'beaconAtTheMacBooks'; // optional
   var major = 1111; // mandatory
   var minor = 2222; // mandatory
   var uuid = '550e8400-e29b-41d4-a716-446655440000'; // mandatory

   // throws an error if the parameters are not valid
   var beacon = new IBeacon.CLBeaconRegion(uuid, major, minor, identifier);
   return beacon;   
} 
```
 
##### Start monitoring a single iBeacon
```

var onDidDetermineStateCallback = function (result) {
     console.log(result.state);
};

var beacon = createBeacon();
IBeacon.startMonitoringForRegion(beacon, onDidDetermineStateCallback);

```
 

##### Stop monitoring a single iBeacon
```

var beacon = createBeacon();
IBeacon.stopMonitoringForRegion(beacon);

```
 
 
##### Start ranging a single iBeacon
```

var onDidRangeBeacons = function (result) {
   console.log('onDidRangeBeacons() ', result);
};

var beacon = createBeacon();
IBeacon.startRangingBeaconsInRegion(beacon, onDidRangeBeacons);


```
 
##### Stop ranging a single iBeacon
```

var beacon = createBeacon();
IBeacon.stopRangingBeaconsInRegion(beacon);

```

#### Convenience functions

##### Handle multiple beacons with the same call:
```

var beacon1 = createBeacon(); 
var beacon2 = createBeacon(); 
var beacon3 = createBeacon(); 
var beacons = [beacon1, beacon2, beacon3]; 

IBeacon.startMonitoringForRegions(beacons); 
IBeacon.startRangingBeaconsInRegions(beacons);
```


## Contributions

> Contributions are welcome at all times, please make sure that the tests are running without errors
> before submitting a pull request.

### How to execute the tests

* Open an app which has Cordova iBeacon plugin installed in XCode
* Install it onto a device or simulator
* Open Safari
* Go to the dev tools window
* Paste the code below (the contents of ```test/tests.js```) into the Javascript console
* Run the snippet, there should not be any errors.

```
function createBeacon() {
   var identifier = 'beaconAtTheMacBooks'; // optional
   var major = 1111; // mandatory
   var minor = 2222; // mandatory
   var uuid = '550e8400-e29b-41d4-a716-446655440000'; // mandatory

   // throws an error if the parameters are not valid
   var beacon = new IBeacon.CLBeaconRegion(uuid, major, minor, identifier);
   return beacon;   
} 

var b1 = createBeacon();
var b2 = createBeacon();
var b3 = createBeacon();

var arrayOfBeacons = [b1, b2, b3];

var onDidDetermineStateCallback = function (result) {
     console.log(result.state);
};

var beacon = createBeacon();
IBeacon.startMonitoringForRegion(beacon, onDidDetermineStateCallback);
IBeacon.stopMonitoringForRegion(beacon);

IBeacon.startMonitoringForRegions(arrayOfBeacons, onDidDetermineStateCallback);
IBeacon.stopMonitoringForRegions(arrayOfBeacons);

var onDidRangeBeacons = function (result) {
   console.log('onDidRangeBeacons() ', result);
};
IBeacon.startRangingBeaconsInRegion(beacon, onDidRangeBeacons);
IBeacon.stopRangingBeaconsInRegion(beacon);

IBeacon.startRangingBeaconsInRegions(arrayOfBeacons, onDidRangeBeacons);
IBeacon.stopRangingBeaconsInRegions(arrayOfBeacons);


```