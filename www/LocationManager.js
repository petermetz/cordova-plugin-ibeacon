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

var exec = require('cordova/exec');
var _ = require('com.unarin.cordova.beacon.underscorejs');
var Q = require('com.unarin.cordova.beacon.Q');

var Regions = require('com.unarin.cordova.beacon.Regions');
var Delegate = require('com.unarin.cordova.beacon.Delegate');

var Region = require('com.unarin.cordova.beacon.Region');
var CircularRegion = require('com.unarin.cordova.beacon.CircularRegion');
var BeaconRegion = require('com.unarin.cordova.beacon.BeaconRegion');

/**
 * Creates an instance of the plugin.
 * 
 * Important note: Creating multiple instances is expected to break the delegate
 * callback mechanism, as the native layer can only handle one  callback ID at a 
 * time.
 *
 * @constructor {LocationManager}
 */

 function LocationManager (){
	this.delegate = new Delegate();
	this._registerDelegateCallbackId();

	this.bindMethodContexts();
	
 }
 
/**
 * Binds the contexts of instance methods to the actual {LocationManager}
 * instance. 
 * The goal of this is to make the caller code clean of binding calls when
 * the promise functions are chained for example.
 * 
 * @returns {undefined}
 */
LocationManager.prototype.bindMethodContexts = function() {
	this.disableDebugLogs = _.bind(this.disableDebugLogs, this);
	this.enableDebugLogs = _.bind(this.enableDebugLogs, this);
};


LocationManager.prototype.getDelegate = function() {
	return this.delegate;
};

LocationManager.prototype.setDelegate = function(newDelegate) {
	if (!(newDelegate instanceof Delegate)) {
		console.error('newDelegate parameter has to be an instance of Delegate.');
		return;
	}
	this.delegate = newDelegate;

	this.onDomDelegateReady();

	return this.delegate;
};

/**
 * Calls the method 'registerDelegateCallbackId' in the native layer which
 * saves the callback ID for later use. 
 * 
 * The saved callback ID will be used when the native layer wants to notify
 * the DOM asynchronously about an event of it's own, for example entering 
 * into a region.
 * 
 * The same callback will be used for success and fail handling since the
 * handling is the same. 
 *
 * @returns {Q.Promise}
 */
LocationManager.prototype._registerDelegateCallbackId = function () {
	this.appendToDeviceLog('registerDelegateCallbackId()');
	var d = Q.defer();

	exec(_.bind(this._onDelegateCallback, this, d), _.bind(this._onDelegateCallback, this, d), "LocationManager",
		"registerDelegateCallbackId", []);

	return d.promise;
};

/**
 * Handles asynchronous calls from the native layer. In this context async
 * means that message is not a response to a request of the DOM.
 *
 * @param {type} deferred {promise, resolve, reject} object.
 *
 * @param {type} pluginResult The PluginResult object constructed by the
 * native layer as the payload of the message it wishes to send to the DOM
 * asynchronously.
 *  
 * @returns {undefined}
 */
LocationManager.prototype._onDelegateCallback = function (deferred, pluginResult) {

	this.appendToDeviceLog('_onDelegateCallback() ' + JSON.stringify(pluginResult));

	if (pluginResult && _.isString(pluginResult['eventType'])) { // The native layer calling the DOM with a delegate event.
		this._mapDelegateCallback(pluginResult);
	} else if (Q.isPending(deferred.promise)) { // The callback ID registration finished, runs only once.
		deferred.resolve();
	} else { // The native layer calls back the delegate without specifying an event, coding error.
		console.error('Delegate registration promise is already been resolved, all subsequent callbacks should provide an "eventType" field.');
	}
};

/**
 * Routes async messages arriving from the native layer to the appropriate
 * delegate methods.
 * 
 * @param {type} pluginResult The PluginResult object constructed by the
 * native layer as the payload of the message it wishes to send to the DOM
 * 
 * @returns {undefined}
 */
LocationManager.prototype._mapDelegateCallback = function (pluginResult) {
	var eventType = pluginResult['eventType']; // the Objective-C selector's name
	
	this.appendToDeviceLog('_mapDelegateCallback() found eventType ' + eventType);

	if (_.isFunction(this.delegate[eventType])) {
		this.delegate[eventType](pluginResult);
	} else {
		console.error('Delegate unable to handle eventType: ' + eventType);
	}
};

/**
 * Goes through the provided pre-processors *in order* adn applies them to 
 * [pluginResult].
 * When the pre-processing is done, [resolve] is called with the pre-
 * processed results. The raw input is discarded.
 * 
 * @param {Function} resolve A callback which will get called upon completion.
 *
 * @param {Array} pluginResult The PluginResult object constructed by the
 * native layer as the payload of the message it wishes to send to the DOM.
 * This function expects the [pluginResult] to be an array of elements.
 *
 * @param {Array} preProcessors An array of {Function}s which will be applied
 * to [pluginResult], in order.
 *
 * @returns {undefined}
 */
LocationManager.prototype._preProcessorExecutor = function (resolve, pluginResult, preProcessors) {
	_.each(preProcessors, function (preProcessor) {
		pluginResult = preProcessor(pluginResult);
	});
	resolve(pluginResult);
};

/**
 * Wraps a Cordova exec call into a promise, allowing the client code to
 * operate with those promises instead of callbacks.
 *
 * @param {String} method The name of the method in the native layer to be
 * called by Cordova.
 *
 * @param {Array} commandArgs An array of arguments to be passed for the
 * native layer. Defaults to an empty array if omitted.
 *
 * @param {Array} preProcessors An array of callback functions all of which
 * takes an iterable (array) as it's parameter and applies a certain
 * operation to the elements of that iterable.
 * 
 * @returns {Q.Promise}
 */
LocationManager.prototype._promisedExec = function (method, commandArgs, preProcessors) {
	var self = this;
	commandArgs = _.isArray(commandArgs) ? commandArgs : [];
	preProcessors = _.isArray(preProcessors) ? preProcessors : [];
	preProcessors = _.filter(preProcessors, function(preProcessor) {
		return _.isFunction(preProcessor);
	});

	var d = Q.defer();


	var resolveWrap = function(pluginResult) {
		self._preProcessorExecutor(d.resolve, pluginResult, preProcessors);
	};

	exec(resolveWrap, d.reject, "LocationManager", method, commandArgs);

	return d.promise;
};

/**
 * Signals the native layer that the client side is ready to consume messages.
 * Readiness here means that it has a {Delegate} set by the consumer javascript
 * code.
 * <p>
 * The {LocationManager.setDelegate()} will implicitly call this method as well,
 * therefore the only case when you have to call this manually is if you don't
 * wish to specify a {Delegate} of yours.
 * <p>
 * The purpose of this signaling mechanism is to make the events work when the
 * app is being woken up by the Operating System to give it a chance to handle
 * region monitoring events for example.
 * <p>
 * If you don't set a {Delegate} and don't call this method manually, an error
 * message get emitted in the native runtime and the DOM as well after a certain
 * period of time.
 *
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the request and started to send events.
 */
LocationManager.prototype.onDomDelegateReady = function() {
	return this._promisedExec('onDomDelegateReady', [], []);
};

/**
 * Determines if bluetooth is switched on, according to the native layer.
 * @returns {Q.Promise} Returns a promise which is resolved with a {Boolean}
 * indicating whether bluetooth is active.
 */
LocationManager.prototype.isBluetoothEnabled = function() {
	return this._promisedExec('isBluetoothEnabled', [], []);
};

/**
 * Enables Bluetooth using the native Layer. (ANDROID ONLY)
 *
 * @returns {Q.Promise} Returns a promise which is resolved when Bluetooth
 * could be enabled. If not, the promise will be rejected with an error.
 */
LocationManager.prototype.enableBluetooth = function() {
	return this._promisedExec('enableBluetooth', [], []);
};

/**
 * Disables Bluetooth using the native Layer. (ANDROID ONLY)
 *
 * @returns {Q.Promise} Returns a promise which is resolved when Bluetooth
 * could be enabled. If not, the promise will be rejected with an error.
 */
LocationManager.prototype.disableBluetooth = function() {
	return this._promisedExec('disableBluetooth', [], []);
};

/**
 * Start monitoring the specified region.
 *
 * If a region of the same type with the same identifier is already being 
 * monitored for this application,
 * it will be removed from monitoring. For circular regions, the region 
 * monitoring service will prioritize
 * regions by their size, favoring smaller regions over larger regions.
 *
 * This is done asynchronously and may not be immediately reflected in monitoredRegions.
 *
 * @param {Region} region An instance of {Region} which will be monitored
 * by the operating system.
 * 
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the monitoring request.
 */
LocationManager.prototype.startMonitoringForRegion = function(region) {
	Regions.checkRegionType(region);
	return this._promisedExec('startMonitoringForRegion', [region], []);
};

/**
 * Stop monitoring the specified region.  It is valid to call 
 * stopMonitoringForRegion: for a region that was registered for monitoring 
 * with a different location manager object, during this or previous 
 * launches of your application.
 *
 * This is done asynchronously and may not be immediately reflected in monitoredRegions.
 *
 * @param {Region} region An instance of {Region} which will be monitored
 * by the operating system.
 * 
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the request to stop monitoring.
 */
LocationManager.prototype.stopMonitoringForRegion = function(region) {
	Regions.checkRegionType(region);
	return this._promisedExec('stopMonitoringForRegion', [region], []);
};

/**
 * Request state the for specified region. When result is ready
 * didDetermineStateForRegion is triggered. This can be any region, 
 * also those which is not currently monitored. 
 *
 * This is done asynchronously and may not be immediately reflected in monitoredRegions.
 *
 * @param {Region} region An instance of {Region} which will be monitored
 * by the operating system.
 * 
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the request to stop monitoring.
 */
LocationManager.prototype.requestStateForRegion = function(region) {
	Regions.checkRegionType(region);
	return this._promisedExec('requestStateForRegion', [region], []);
};

/**
 * Start ranging the specified beacon region.
 *
 * If a region of the same type with the same identifier is already being
 * monitored for this application, it will be removed from monitoring.
 *
 * This is done asynchronously and may not be immediately reflected in rangedRegions.
 *
 * @param {Region} region An instance of {BeaconRegion} which will be monitored
 * by the operating system.
 *
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the monitoring request.
 */
LocationManager.prototype.startRangingBeaconsInRegion = function(region) {
	if (!Regions.isBeaconRegion(region))
		throw new TypeError('The region parameter has to be an instance of BeaconRegion');

	return this._promisedExec('startRangingBeaconsInRegion', [region], []);
};

/**
 * Stop ranging the specified region.  It is valid to call
 * stopMonitoringForRegion: for a region that was registered for ranging
 * with a different location manager object, during this or previous
 * launches of your application.
 *
 * This is done asynchronously and may not be immediately reflected in rangedRegions.
 *
 * @param {Region} region An instance of {BeaconRegion} which will be monitored
 * by the operating system.
 *
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the request to stop monitoring.
 */
LocationManager.prototype.stopRangingBeaconsInRegion = function(region) {
	if (!Regions.isBeaconRegion(region))
		throw new TypeError('The region parameter has to be an instance of BeaconRegion');

	return this._promisedExec('stopRangingBeaconsInRegion', [region], []);
};

/**
 * Queries the native layer to determine the current authorization in effect.
 * 
 * @returns {Q.Promise} Returns a promise which is resolved with the 
 * requested authorization status.
 */
LocationManager.prototype.getAuthorizationStatus = function() {
	return this._promisedExec('getAuthorizationStatus', [], []);
};

/**
 * For iOS 8 and above only. The permission model has changed by Apple in iOS 8, making it necessary for apps to
 * explicitly request permissions via methods like these:
 * <a href="https://developer.apple.com/library/prerelease/iOS/documentation/CoreLocation/Reference/CLLocationManager_Class/index.html#//apple_ref/occ/instm/CLLocationManager/requestWhenInUseAuthorization">requestWhenInUseAuthorization</a>
 * <a href="https://developer.apple.com/library/prerelease/iOS/documentation/CoreLocation/Reference/CLLocationManager_Class/index.html#//apple_ref/occ/instm/CLLocationManager/requestAlwaysAuthorization">requestAlwaysAuthorization</a>
 *
 * If you are using this plugin on Android devices only, you will never have to use this, nor {@code requestAlwaysAuthorization}
 * @returns {Q.Promise}
 */
LocationManager.prototype.requestWhenInUseAuthorization = function() {
	return this._promisedExec('requestWhenInUseAuthorization', [], []);
};

/**
 * See the docuemntation of {@code requestWhenInUseAuthorization} for further details.
 *
 * @returns {Q.Promise}
 */
LocationManager.prototype.requestAlwaysAuthorization = function() {
	return this._promisedExec('requestAlwaysAuthorization', [], []);
};

/** 
 * 
 * @returns {Q.Promise} Returns a promise which is resolved with an {Array}
 * of {Region} instances that are being monitored by the native layer.
 */
LocationManager.prototype.getMonitoredRegions = function() {
	var preProcessors = [Regions.fromJsonArray];
	return this._promisedExec('getMonitoredRegions', [], preProcessors);
};

/** 
 * 
 * @returns {Q.Promise} Returns a promise which is resolved with an {Array}
 * of {Region} instances that are being ranged by the native layer.
 */
LocationManager.prototype.getRangedRegions = function() {
	var preProcessors = [Regions.fromJsonArray];
	return this._promisedExec('getRangedRegions', [], preProcessors);
};

/**
 * Determines if ranging is available or not, according to the native layer.
 * @returns {Q.Promise} Returns a promise which is resolved with a {Boolean}
 * indicating whether ranging is available or not.
 */
LocationManager.prototype.isRangingAvailable = function() {
	return this._promisedExec('isRangingAvailable', [], []);
};

/**
 * Determines if region type is supported or not, according to the native layer.
 *
 * @param {Region} region An instance of {Region} which will be checked
 * by the operating system.
 *
 * @returns {Q.Promise} Returns a promise which is resolved with a {Boolean}
 * indicating whether the region type is supported or not.
 */
LocationManager.prototype.isMonitoringAvailableForClass = function(region) {
	Regions.checkRegionType(region);
	return this._promisedExec('isMonitoringAvailableForClass', [region], []);
};

/**
 * Start advertising the specified region.
 *
 * If a region a different identifier is already being advertised for
 * this application, it will be replaced with the new identifier.
 *
 * This call will accept a valid beacon even when no BlueTooth is available,
 * and will start when BlueTooth is powered on. See {Delegate.}
 *
 * @param {Region} region An instance of {Region} which will be advertised
 * by the operating system.
 * @param {Integer} measuredPower: Optional parameter, if left empty, the device will
 * use it's own default value.
 *
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the advertising request.
 */
LocationManager.prototype.startAdvertising = function(region, measuredPower) {
	Regions.checkRegionType(region);
	if (measuredPower)
		return this._promisedExec('startAdvertising', [region, measuredPower], []);
	else
		return this._promisedExec('startAdvertising', [region], []);
};

/**
 * Stop advertising as a beacon.
 *
 * This is done asynchronously and may not be immediately reflected in isAdvertising.
 *
 * @return {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer acknowledged the dispatch of the request to stop advertising.
 */
LocationManager.prototype.stopAdvertising = function() {
	return this._promisedExec('stopAdvertising', [], []);
};

/**
 * Determines if advertising is available or not, according to the native layer.
 * @returns {Q.Promise} Returns a promise which is resolved with a {Boolean}
 * indicating whether advertising is available or not.
 */
LocationManager.prototype.isAdvertisingAvailable = function() {
	return this._promisedExec('isAdvertisingAvailable', [], []);
};

/**
 * Determines if advertising is currently active, according to the native layer.
 * @returns {Q.Promise} Returns a promise which is resolved with a {Boolean}
 * indicating whether advertising is active.
 */
LocationManager.prototype.isAdvertising = function() {
	return this._promisedExec('isAdvertising', [], []);
};

/**
 * Disables debug logging in the native layer. Use this method if you want
 * to prevent this plugin from writing to the device logs.
 * 
 * @returns {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer has set the logging level accordingly.
 */
LocationManager.prototype.disableDebugLogs = function() {
	return this._promisedExec('disableDebugLogs', [], []);
};

/**
 * Enables the posting of debug notifications in the native layer. Use this method if you want
 * to allow the plugin the posting local notifications.
 * This can be very helpful when debugging how to apps behave when launched into the background.
 *
 * @returns {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer has set the flag to enabled.
 */
LocationManager.prototype.enableDebugNotifications = function() {
	return this._promisedExec('enableDebugNotifications', [], []);
};
/**
 * Disables the posting of debug notifications in the native layer. Use this method if you want
 * to prevent the plugin from posting local notifications.
 *
 * @returns {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer has set the flag to disabled.
 */
LocationManager.prototype.disableDebugNotifications = function() {
	return this._promisedExec('disableDebugNotifications', [], []);
};

/**
 * Enables debug logging in the native layer. Use this method if you want
 * a debug the inner workings of this plugin.
 *
 * @returns {Q.Promise} Returns a promise which is resolved as soon as the
 * native layer has set the logging level accordingly.
 */
LocationManager.prototype.enableDebugLogs = function() {
	return this._promisedExec('enableDebugLogs', [], []);
};

/**
 * Appends the provided [message] to the device logs.
 * Note: If debug logging is turned off, this won't do anything.
 *
 * @param {String} message The message to append to the device logs.
 *
 * @returns {Q.Promise} Returns a promise which is resolved with the log
 * message received by the native layer for appending. The returned message
 * is expected to be equivalent to the one provided in the original call.
 */
LocationManager.prototype.appendToDeviceLog = function(message) {
	return this._promisedExec('appendToDeviceLog', [message], []);
};

var locationManager = new LocationManager();
locationManager.Regions = Regions;
locationManager.Region = Region;
locationManager.CircularRegion = CircularRegion;
locationManager.BeaconRegion = BeaconRegion;
locationManager.Delegate = Delegate;

module.exports.LocationManager = LocationManager;
module.exports.locationManager = locationManager;


