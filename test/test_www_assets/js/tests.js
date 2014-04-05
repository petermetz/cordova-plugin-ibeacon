try {
  function createBeacon(index) {
    var addition = parseInt(index);
    addition = isFinite(addition) ? addition : 0;
    var identifier = 'cordova-ibeacon-plugin-test'; // optional
    var major = 1111; // mandatory
    var minor = 1111 + addition; // mandatory
    var uuid = '11111111-1111-1111-1111-111111111111'; // mandatory

    // throws an error if the parameters are not valid
    var beacon = new IBeacon.CLBeaconRegion(uuid, major, minor, identifier);
    return beacon;
  }

  var b1 = createBeacon();
  var b2 = createBeacon();
  var b3 = createBeacon();

  var arrayOfBeacons = [b1, b2, b3];

  var onDidDetermineStateCallback = function(result) {
    console.log(result.state);
  };

  var beacon = createBeacon();
  IBeacon.startMonitoringForRegion(beacon, onDidDetermineStateCallback);
  IBeacon.stopMonitoringForRegion(beacon);

  IBeacon.startMonitoringForRegions(arrayOfBeacons, onDidDetermineStateCallback);
  IBeacon.stopMonitoringForRegions(arrayOfBeacons);

  var onDidRangeBeacons = function(result) {
    console.log('onDidRangeBeacons() ', result);
  };
  IBeacon.startRangingBeaconsInRegion(beacon, onDidRangeBeacons);
  IBeacon.stopRangingBeaconsInRegion(beacon);

  IBeacon.startRangingBeaconsInRegions(arrayOfBeacons, onDidRangeBeacons);
  IBeacon.stopRangingBeaconsInRegions(arrayOfBeacons);

  IBeacon.isAdvertising(function(pluginResult) {
    var isAdvertising = pluginResult.isAdvertising;
    console.log('isAdvertising:' + isAdvertising);
    if (isAdvertising === true) {
      throw new Error('Test case failed for `isAdvertising` #1');
    }

    // TODO This is ugly, define more top level callbacks to make it cleaner.
    var onPeripheralManagerDidStartAdvertising = function(pluginResult) {
      console.log('onPeripheralManagerDidStartAdvertising() pluginResult: ', pluginResult);

      IBeacon.isAdvertising(function(pluginResult) {
        var isAdvertising = pluginResult.isAdvertising;
        console.log('isAdvertising:' + isAdvertising);
        if (isAdvertising !== true) {
          throw new Error('Test case failed for `isAdvertising` #2');
        }
        IBeacon.stopAdvertising(function() {

          IBeacon.isAdvertising(function(pluginResult) {
            var isAdvertising = pluginResult.isAdvertising;
            console.log('isAdvertising:' + isAdvertising);
            // FIXME The CBPeripheralManager is not KVO compilant and provides no way to
            // get notified when the advertising really shut down.
            // if (isAdvertising === true) {
            //   throw new Error('Test case failed for `isAdvertising` #3');
            // }
          });

        });
      });
    }

    IBeacon.startAdvertising(createBeacon(), onPeripheralManagerDidStartAdvertising);
  });



  if (app && app.receivedEvent) {
    app.receivedEvent('deviceready');
  } else {
    alert('Tests were successful.');
  }


} catch (error) {
  alert('There were test failures. \n' + error.message);
}