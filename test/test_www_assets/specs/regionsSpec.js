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

describe('Regions', function() {

    it('is defined.', function() {
        expect(Regions).toBeDefined();
    });

    it('has a fromJson method', function() {
        expect(Regions.fromJson).toBeDefined();
        expect(Regions.fromJson instanceof Function).toBe(true);
    });

    it('converts valid JSON maps to BeaconRegion instances.', function() {
        var jsonMap = {
			identifier: 'ValidIdentifierString',
			typeName: 'BeaconRegion',
			uuid: '116ABDD3-3B07-4257-BBB8-CB24794CB066',
            major: 12345
        };

        var beaconRegion = Regions.fromJson(jsonMap);
        expect(beaconRegion).toBeDefined();
        expect(beaconRegion instanceof BeaconRegion).toBe(true);
    });

	it('has a method which throws if a non Region object is passed in', function () {
		expect(function () {
			Regions.checkRegionType(new Object())
		}).toThrow();
	});

	it('throws if invalid JSON map is provided by the caller as a BeaconRegion.', function () {
		var jsonMap = {
			identifier: '', // invalid
			typeName: 'BeaconRegion',
			uuid: '116ABDD3-3B07-4257-BBB8-CB24794CB066',
			major: 12345
		};

		expect(function () {
			Regions.fromJson(jsonMap);
		}).toThrow();
	});

	it('validates JSON maps to be valid input for creating regions.', function () {
		expect(Regions.checkRegionType(new Region('id'))).toBe(undefined);
    });

    it('throws if an array is passed instead of a Region instance', function() {
        expect(function() {
            Regions.checkRegionType([]);
        }).toThrow();
    });

    it('throws if an object literal is passed instead of a Region instance', function() {
        expect(function() {
            Regions.checkRegionType({});
        }).toThrow();
    });

    it('throws if nothing is passed instead of a Region instance', function() {
        expect(function() {
            Regions.checkRegionType();
        }).toThrow();
    });

    it('throws if a String is passed instead of a Region instance', function() {
        expect(function() {
            Regions.checkRegionType('');
        }).toThrow();
    });

    it('throws if a Number is passed instead of a Region instance', function() {
        expect(function() {
            Regions.checkRegionType(1);
        }).toThrow();
    });
});


