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

var _ = require('org.apache.cordova.ibeacon.underscorejs');
var CircularRegion = require('org.apache.cordova.ibeacon.CircularRegion');
var BeaconRegion = require('org.apache.cordova.ibeacon.BeaconRegion');
var Region = require('org.apache.cordova.ibeacon.Region');

var klass = require('org.apache.cordova.ibeacon.klass');

/**
 * Utility class for un-marshalling {Region} instances from JSON objects,
 * checking their types.
 * 
 * @type {Regions}
 */
var Regions = klass();

Regions.statics({
    /**
     * Creates an instance of {@link Region} from the provided map of parameters.
     *
     * @param jsonMap The JSON object which is used to construct the return value.
     * 
     * @returns {Region} Returns a subclass of {@link Region}.
     */
    fromJson: function(jsonMap) {

        var typeName = jsonMap.typeName;
        if (!_.isString(typeName) || _.isEmpty(typeName)) {
            throw new TypeError('jsonMap need to have a key "typeName"');
        }

        var region = null;
        if (typeName === 'CircularRegion') {

            var latitude = jsonMap.latitude;
            var longitude = jsonMap.longitude;
            var radius = jsonMap.radius;
            var identifier = jsonMap.identifier;
            region = new CircularRegion(identifier, latitude, longitude, radius);

        } else if (typeName === 'BeaconRegion') {

            var uuid = jsonMap.uuid;
            var major = jsonMap.major;
            var minor = jsonMap.minor;
            var identifier = jsonMap.identifier;
            region = new BeaconRegion(identifier, uuid, major, minor);
        }

        return region;
    },
    fromJsonArray: function(jsonArray) {
        if (!_.isArray(jsonArray)) {
            throw new TypeError('Expected an array.');
        }
            
        var result = [];
        _.each(jsonArray, function(region) {
            result.push(Regions.fromJson(region));
        });
        return result;
    },
    /**
     * Validates the input parameter [region] to be an instance of {Region}.
     * 
     * @param {Region} region : The object that's type will be checked.
     * 
     * @returns {undefined} If [region] is an instance of {Region}, throws otherwise.
     */
    checkRegionType: function(region) {
        var regionHasInvalidType = !(region instanceof Region);
        if (regionHasInvalidType) {
            throw new TypeError('The region parameter has to be an instance of Region');
        }
    },
    isRegion: function(object) {
        return object instanceof Region;
    },
    isCircularRegion: function(object) {
        return object instanceof CircularRegion;
    },
    isBeaconRegion: function(object) {
        return object instanceof BeaconRegion;
    }
});
module.exports = Regions;

