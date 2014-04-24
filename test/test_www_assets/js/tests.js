try {
	function createBeacon(index) {
		var addition = parseInt(index);
		addition = isFinite(addition) ? addition : 0;
		var identifier = 'cordova-ibeacon-plugin-test'; // optional
		var major = 1111; // optional
		var minor = 1111 + addition; // optional
		var uuid = '9C3B7561-1B5E-4B80-B7E9-31183E73B0FB'; // mandatory

		// throws an error if the parameters are not valid
		var beacon = new IBeacon.CLBeaconRegion(uuid, major, minor, identifier);
		return beacon;
	}

	var onDidDetermineStateCallback = function (result) {
		console.log(result.state);
	};

	var onDidRangeBeacons = function (result) {
		console.log('onDidRangeBeacons() ', result);
	};

	// should not throw any errors since the major and minor parameters are optional
	var beaconWithoutMajorOrMinor = new IBeacon.CLBeaconRegion('9C3B7561-1B5E-4B80-B7E9-31183E73B0FB', null, null, 'dummyIdentifier');
	if (!(beaconWithoutMajorOrMinor instanceof IBeacon.CLBeaconRegion)) {
		throw new Error('Test failed. CLBeaconRegion constructor did not return an instance of CLBeaconRegion');
	}
	IBeacon.startMonitoringForRegion(beaconWithoutMajorOrMinor, onDidDetermineStateCallback);
	IBeacon.stopMonitoringForRegion(beaconWithoutMajorOrMinor);
	IBeacon.startRangingBeaconsInRegion(beaconWithoutMajorOrMinor, onDidRangeBeacons);
	IBeacon.stopRangingBeaconsInRegion(beaconWithoutMajorOrMinor);


	// should not throw any errors since the major and minor parameters are optional
	var beaconWithoutMajorOrMinor2 = new IBeacon.CLBeaconRegion('9C3B7561-1B5E-4B80-B7E9-31183E73B0FB', undefined, undefined, 'dummyIdentifier');
	if (!(beaconWithoutMajorOrMinor2 instanceof IBeacon.CLBeaconRegion)) {
		throw new Error('Test failed. CLBeaconRegion constructor did not return an instance of CLBeaconRegion');
	}
	IBeacon.startMonitoringForRegion(beaconWithoutMajorOrMinor2, onDidDetermineStateCallback);
	IBeacon.stopMonitoringForRegion(beaconWithoutMajorOrMinor2);
	IBeacon.startRangingBeaconsInRegion(beaconWithoutMajorOrMinor2, onDidRangeBeacons);
	IBeacon.stopRangingBeaconsInRegion(beaconWithoutMajorOrMinor2);

	// should not throw any errors since the minor parameter is optional
	var beaconWithoutMajorOrMinor3 = new IBeacon.CLBeaconRegion('9C3B7561-1B5E-4B80-B7E9-31183E73B0FB', 12345, undefined, 'dummyIdentifier');
	if (!(beaconWithoutMajorOrMinor3 instanceof IBeacon.CLBeaconRegion)) {
		throw new Error('Test failed. CLBeaconRegion constructor did not return an instance of CLBeaconRegion');
	}
	IBeacon.startMonitoringForRegion(beaconWithoutMajorOrMinor3, onDidDetermineStateCallback);
	IBeacon.stopMonitoringForRegion(beaconWithoutMajorOrMinor3);
	IBeacon.startRangingBeaconsInRegion(beaconWithoutMajorOrMinor3, onDidRangeBeacons);
	IBeacon.stopRangingBeaconsInRegion(beaconWithoutMajorOrMinor3);


	// should throw an error, because we validate against the format of the UUID in the constructor
	var exceptionThrown = false;
	try {
		new IBeacon.CLBeaconRegion('9C3B7561-5E-80-E9-31183E73B0FB', null, null, 'dummyIdentifier');
	} catch (error) {
		exceptionThrown = true;
	}
	if (exceptionThrown !== true) {
		throw new Error('Test failed. CLBeaconRegion constructor accepted an invalid UUID');
	}

	// should throw an error, because major and minor has to be integers, if they were defined
	var exceptionThrown = false;
	try {
		new IBeacon.CLBeaconRegion('9C3B7561-1B5E-4B80-B7E9-31183E73B0FB', '', '', 'dummyIdentifier');
	} catch (error) {
		exceptionThrown = true;
	}
	if (exceptionThrown !== true) {
		throw new Error('Test failed. CLBeaconRegion constructor accepted major/minor to be String');
	}

	// should throw an error, because major and minor has to be integers, if they were defined
	var exceptionThrown = false;
	try {
		new IBeacon.CLBeaconRegion('9C3B7561-1B5E-4B80-B7E9-31183E73B0FB', NaN, NaN, 'dummyIdentifier');
	} catch (error) {
		exceptionThrown = true;
	}
	if (exceptionThrown !== true) {
		throw new Error('Test failed. CLBeaconRegion constructor accepted major/minor to be NaN');
	}

	var b1 = createBeacon();
	var b2 = createBeacon();
	var b3 = createBeacon();

	var arrayOfBeacons = [b1, b2, b3];

	var beacon = createBeacon();
	IBeacon.startMonitoringForRegion(beacon, onDidDetermineStateCallback);
	IBeacon.stopMonitoringForRegion(beacon);

	IBeacon.startMonitoringForRegions(arrayOfBeacons, onDidDetermineStateCallback);
	IBeacon.stopMonitoringForRegions(arrayOfBeacons);

	IBeacon.startRangingBeaconsInRegion(beacon, onDidRangeBeacons);
	IBeacon.stopRangingBeaconsInRegion(beacon);

	IBeacon.startRangingBeaconsInRegions(arrayOfBeacons, onDidRangeBeacons);
	IBeacon.stopRangingBeaconsInRegions(arrayOfBeacons);

	IBeacon.isAdvertising(function (pluginResult) {
		var isAdvertising = pluginResult.isAdvertising;
		console.log('isAdvertising:' + isAdvertising);
		if (isAdvertising === true) {
			throw new Error('Test case failed for `isAdvertising` #1');
		}

		// TODO This is ugly, define more top level callbacks to make it cleaner.
		var onPeripheralManagerDidStartAdvertising = function (pluginResult) {
			console.log('onPeripheralManagerDidStartAdvertising() pluginResult: ', pluginResult);

			IBeacon.isAdvertising(function (pluginResult) {
				var isAdvertising = pluginResult.isAdvertising;
				console.log('isAdvertising:' + isAdvertising);
				if (isAdvertising !== true) {
					throw new Error('Test case failed for `isAdvertising` #2');
				}
				IBeacon.stopAdvertising(function () {

					IBeacon.isAdvertising(function (pluginResult) {
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