///
///
/// Paste this code into the Safari Dev Tools Javascript console to execute the tests.
///
///

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
