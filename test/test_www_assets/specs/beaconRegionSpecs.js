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

describe('BeaconRegion', function() {

    it('is defined', function() {
        expect(BeaconRegion).toBeDefined();
    });

	it('has a constructor that returns new instances from an identifier and a uuid.', function () {
		var uuid = 'B7CFA126-510E-4E18-83AB-59F6780B3AF5';
		var identifier = 'BeaconInTheHouse';
		var beaconRegion = new BeaconRegion(identifier, uuid);
		expect(beaconRegion).toBeDefined();
        expect(beaconRegion instanceof BeaconRegion).toBe(true);
		expect(beaconRegion.typeName).toBe('BeaconRegion');
		expect(beaconRegion.uuid).toBe(uuid);
		expect(beaconRegion.identifier).toBe(identifier);
		expect(beaconRegion.major).toBeUndefined();
		expect(beaconRegion.minor).toBeUndefined();
	});

	it('has a constructor that returns new instances from an identifier, a uuid and a major', function () {
		var uuid = 'B7CFA126-510E-4E18-83AB-59F6780B3AF6';
		var identifier = 'BeaconNextToTheHouse';
		var major = 12345;
		var beaconRegion = new BeaconRegion(identifier, uuid, major);
		expect(beaconRegion).toBeDefined();
		expect(beaconRegion instanceof BeaconRegion).toBe(true);
		expect(beaconRegion.typeName).toBe('BeaconRegion');
		expect(beaconRegion.uuid).toBe(uuid);
		expect(beaconRegion.identifier).toBe(identifier);
		expect(beaconRegion.major).toBe(major);
		expect(beaconRegion.minor).toBeUndefined();
	});

	it('has a constructor that returns new instances from an identifier, a uuid and a major+minor', function () {
		var uuid = 'B7CFA126-510E-4E18-83AB-59F6780B3AF7';
		var identifier = 'BeaconCloseToTheHouse';
		var major = 12345;
		var minor = 30000;
		var beaconRegion = new BeaconRegion(identifier, uuid, major, minor);
		expect(beaconRegion).toBeDefined();
		expect(beaconRegion instanceof BeaconRegion).toBe(true);
		expect(beaconRegion.typeName).toBe('BeaconRegion');
		expect(beaconRegion.uuid).toBe(uuid);
		expect(beaconRegion.identifier).toBe(identifier);
		expect(beaconRegion.major).toBe(major);
		expect(beaconRegion.minor).toBe(minor);
	});

	it('has a constructor that throws if you pass in a non-valid UUID', function () {
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var invalidIdentifier = null;

		expect(function () {
			new BeaconRegion(invalidIdentifier, uuid);
		}).toThrow();
	});

	it('has a constructor that throws if you pass in a non-valid UUID', function () {
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var invalidIdentifier = '';

		expect(function () {
			new BeaconRegion(invalidIdentifier, uuid);
		}).toThrow();
	});


	it('has a constructor that throws if you pass in a non-valid identifier', function () {
		var invalidUuid = 'B7CFA126-510E*INVALID*83AB-59F6780B3AF7';
		var identifier = 'InvalidBeaconCloseToTheHouse';
		expect(function () {
			new BeaconRegion(identifier, invalidUuid, major, minor);
		}).toThrow();
	});


	it('has a constructor that throws if you pass in a too large major', function () {
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var identifier = 'ValidBeaconCloseToTheHouse';
		var invalidMajor = 75000;
		expect(function () {
			new BeaconRegion(identifier, uuid, invalidMajor);
		}).toThrow();
	});

	it('has a constructor that throws if you pass in a too large minor', function () {
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var identifier = 'ValidBeaconCloseToTheHouse';
		var invalidMinor = 80000;
		var major = 55000;
		expect(function () {
			new BeaconRegion(identifier, uuid, major, invalidMinor);
		}).toThrow();
	});

	it('has a constructor that throws if you pass in a too small major', function () {
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var identifier = 'ValidBeaconCloseToTheHouse';
		var invalidMajor = -1000;
		expect(function () {
			new BeaconRegion(identifier, uuid, invalidMajor);
		}).toThrow();
	});

	it('has a constructor that throws if you pass in a too small minor', function () {
		var uuid = '328B8BF6-B6ED-4DBF-88F3-287E3B3F16B6';
		var identifier = 'ValidBeaconCloseToTheHouse';
		var invalidMinor = -1;
		var major = 55000;
		expect(function () {
			new BeaconRegion(identifier, uuid, major, invalidMinor);
		}).toThrow();
	});
});