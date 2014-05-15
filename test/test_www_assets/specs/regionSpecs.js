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

describe("Region", function() {

    it('is defined.', function() {
        expect(Region).toBeDefined();
    });

    it('has a constructor to create instances.', function() {
        var identifier = 'dummyIdentifier';
        var region = new Region(identifier);
        expect(region).toBeDefined();

    });

    it("has a constructor setting 'identifier' properly.", function() {
        var identifier = 'asdfasfsa';
        var region = new Region(identifier);
        expect(region instanceof Region).toBe(true);
        expect(region.identifier).toEqual(identifier);
    });

	it('has a constructor that throws if an undefined identifier is passed in', function() {
		var invalidIdentifier = undefined;
		expect(function(){
			new Region(invalidIdentifier);
		}).toThrow();
	});

	it('has a constructor that throws if an NaN identifier is passed in', function() {
		var invalidIdentifier = NaN;
		expect(function(){
			new Region(invalidIdentifier);
		}).toThrow();
	});

	it('has a constructor that throws if an empty string identifier is passed in', function() {
		var invalidIdentifier = '';
		expect(function(){
			new Region(invalidIdentifier);
		}).toThrow();
	});

	it('has a constructor that throws if an Number identifier is passed in', function() {
		var invalidIdentifier = 12.5;
		expect(function(){
			new Region(invalidIdentifier);
		}).toThrow();
	});

	it('has a constructor that throws if an null identifier is passed in', function() {
		var invalidIdentifier = null;
		expect(function(){
			new Region(invalidIdentifier);
		}).toThrow();
	});

});
