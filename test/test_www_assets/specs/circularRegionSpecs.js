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

describe('CircularRegion', function() {

    it('is defined', function() {
        expect(CircularRegion).toBeDefined();
    });

    it('has a constructor to create instances.', function() {
        // Coordinates for London, Charing Cross
        var latitude = 51.5072;
        var longitude = -0.1275;
        var radius = 200; // 200 meters of radius
        var id = 'charingCrossRegion';
        var charingCross = new CircularRegion(id, latitude, longitude, radius);

        expect(charingCross).toBeDefined();
        expect(charingCross instanceof CircularRegion).toBe(true);
    });
});