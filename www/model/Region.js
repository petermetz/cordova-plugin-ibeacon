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

var _ = require('com.unarin.cordova.beacon.underscorejs');

/**
 * Base class for different types of regions that the [LocationManager] can monitor.
 * @constructor
 *
 * @param {String} identifier A unique identifier to associate with the region object.
 *    You use this identifier to differentiate regions within your application.
 *    This value must not be nil.
 */
function Region (identifier) {
	Region.checkIdentifier(identifier);
    this.identifier = identifier;
};

Region.checkIdentifier = function (identifier) {
	if (!_.isString(identifier)) {
		throw new TypeError(identifier + ' is not a String.');
	}
	if (_.isEmpty(identifier)) {
		throw new Error("'identifier' cannot be an empty string.");
	}
};

module.exports = Region;


