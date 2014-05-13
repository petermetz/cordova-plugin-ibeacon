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

    it('has a constructor that returns new instances.', function() {
        var uuid = 'B7CFA126-510E-4E18-83AB-59F6780B3AF5';
        var beaconRegion = new BeaconRegion('BeaconInTheHouse', uuid);
        expect(beaconRegion).toBeDefined();
        expect(beaconRegion instanceof BeaconRegion).toBe(true);
    });
});