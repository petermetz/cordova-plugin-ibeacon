
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


//
//  CDVPluginIBeacon.m
//
//  Created by Peter Metz on 19/02/2014.
//
//

#import "CDVIBeacon.h"

@implementation CDVIBeacon
    {
        NSString *monitoringCallbackId;
        NSString *rangingCallbackId;
        NSString *advertisingCallbackId;
        
        NSDictionary *peripheralData;
        
        CLLocationManager *_locationManager;
        CBPeripheralManager * _peripheralManager;
    }
    
# pragma mark CDVPlugin
    
- (void)pluginInitialize
    {
        NSLog(@"[IBeacon Plugin] pluginInitialize()");
        
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        
        _peripheralManager = [[CBPeripheralManager alloc] init];
        _peripheralManager.delegate = self;
        
        // You can listen to more app notifications, see:
        // http://developer.apple.com/library/ios/#DOCUMENTATION/UIKit/Reference/UIApplication_Class/Reference/Reference.html#//apple_ref/doc/uid/TP40006728-CH3-DontLinkElementID_4
        
        // NOTE: if you want to use these, make sure you uncomment the corresponding notification handler
        
        // [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onPause) name:UIApplicationDidEnterBackgroundNotification object:nil];
        // [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onResume) name:UIApplicationWillEnterForegroundNotification object:nil];
        // [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onOrientationWillChange) name:UIApplicationWillChangeStatusBarOrientationNotification object:nil];
        // [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onOrientationDidChange) name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
        
        // Added in 2.3.0
        // [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didReceiveLocalNotification:) name:CDVLocalNotification object:nil];
        
        // Added in 2.5.0
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(pageDidLoad:) name:CDVPageDidLoadNotification object:self.webView];
    }
    
- (void) pageDidLoad: (NSNotification*)notification{
    NSLog(@"[IBeacon Plugin] pageDidLoad()");
}
    
# pragma mark Utilities
    
- (NSString*) nameOfRegionState:(CLRegionState)state {
    switch (state) {
        case CLRegionStateInside:
        return @"CLRegionStateInside";
        break;
        case CLRegionStateOutside:
        return @"CLRegionStateOutside";
        case CLRegionStateUnknown:
        return @"CLRegionStateUnknown";
        default:
        return @"ErrorUnknownCLRegionStateObjectReceived";
        break;
    }
}
    
- (NSDictionary*) mapOfRegion: (CLRegion*) region {
    NSMutableDictionary* dict;
    
    if ([region isKindOfClass:[CLBeaconRegion class]]) {
        CLBeaconRegion* beaconRegion = (CLBeaconRegion*) region;
        dict = [[NSMutableDictionary alloc] initWithDictionary:[self mapOfBeaconRegion:beaconRegion]];
    } else {
        dict = [[NSMutableDictionary alloc] init];
    }
    
    // identifier
    [dict setObject:region.identifier forKey:@"identifier"];
    
    // radius
    NSNumber* radius = [[NSNumber alloc] initWithDouble:region.radius ];
    [dict setObject:radius forKey:@"radius"];
    CLLocationCoordinate2D coordinates;
    
    // center
    NSDictionary* coordinatesMap = [[NSMutableDictionary alloc]initWithCapacity:2];
    [coordinatesMap setValue:[[NSNumber alloc] initWithDouble: coordinates.latitude] forKey:@"latitude"];
    [coordinatesMap setValue:[[NSNumber alloc] initWithDouble: coordinates.longitude] forKey:@"longitude"];
    [dict setObject:coordinatesMap forKey:@"center"];
    
    
    return dict;
}
    
- (NSDictionary*) mapOfBeaconRegion: (CLBeaconRegion*) region {
    
    NSMutableDictionary* dict = [[NSMutableDictionary alloc] init];
    [dict setObject:region.proximityUUID.UUIDString forKey:@"uuid"];
    [dict setObject:region.major forKey:@"major"];
    [dict setObject:region.minor forKey:@"minor"];
    
    
    return dict;
}
    
- (NSDictionary*) mapOfBeacon: (CLBeacon*) beacon {
    NSMutableDictionary* dict = [[NSMutableDictionary alloc] init];
    
    // uuid
    NSString* uuid = beacon.proximityUUID.UUIDString;
    [dict setObject:uuid forKey:@"uuid"];
    
    // proximity
    CLProximity proximity = beacon.proximity;
    NSString* proximityString = [self nameOfProximity:proximity];
    [dict setObject:proximityString forKey:@"proximity"];
    
    // major
    [dict setObject:beacon.major forKey:@"major"];
    
    // minor
    [dict setObject:beacon.minor forKey:@"minor"];
    
    // rssi
    NSNumber * rssi = [[NSNumber alloc] initWithInteger:beacon.rssi];
    [dict setObject:rssi forKey:@"rssi"];
    
    return dict;
}
    
- (NSString*) nameOfProximity: (CLProximity) proximity {
    switch (proximity) {
        case CLProximityNear:
        return @"CLProximityNear";
        break;
        case CLProximityFar:
        return @"CLProximityFar";
        case CLProximityImmediate:
        return @"CLProximityImmediate";
        case CLProximityUnknown:
        return @"CLProximityUnknown";
        default:
        return @"ErrorProximityValueUnknown";
        break;
    }
}
    
- (CLBeaconRegion *) parse :(NSDictionary*) regionArguments {
    
    NSString* uuidString = [regionArguments objectForKey:@"uuid"];
    NSUUID* uuid = [[NSUUID alloc] initWithUUIDString:uuidString];
    int major = [[regionArguments objectForKey:@"major"] intValue];
    int minor = [[regionArguments objectForKey:@"minor"] intValue];
    NSString* identifier = [regionArguments objectForKey:@"identifier"];
    BOOL notifyEntryStateOnDisplay = [[regionArguments objectForKey:@"notifyEntryStateOnDisplay"] boolValue];
    
    CLBeaconRegion *beaconRegion;
    NSLog(@"[IBeacon Plugin] Creating Beacon with parameters uuid: %@, major: %i, minor: %i, identifier: %@", uuid, major, minor, identifier);
    beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:uuid major: major minor: minor identifier: identifier];
    beaconRegion.notifyEntryStateOnDisplay = notifyEntryStateOnDisplay;
    NSLog(@"[IBeacon Plugin] Parsed CLBeaconRegion successfully: %@", beaconRegion.debugDescription);
    return beaconRegion;
}
    
- (NSString*) nameOfPeripherialState: (CBPeripheralManagerState) state {
    switch (state) {
        case CBPeripheralManagerStatePoweredOff:
        return @"CBPeripheralManagerStatePoweredOff";
        case CBPeripheralManagerStatePoweredOn:
        return @"CBPeripheralManagerStatePoweredOn";
        case CBPeripheralManagerStateResetting:
        return @"CBPeripheralManagerStateResetting";
        case CBPeripheralManagerStateUnauthorized:
        return @"CBPeripheralManagerStateUnauthorized";
        case CBPeripheralManagerStateUnknown:
        return @"CBPeripheralManagerStateUnknown";
        case CBPeripheralManagerStateUnsupported:
        return @"CBPeripheralManagerStateUnsupported";
        default:
        return @"ErrorUnknownCBPeripheralManagerState";
    }
}
    
    
# pragma mark CBPeripheralManagerDelegate
    
- (void) peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral {
    NSString *stateName = [self nameOfPeripherialState:peripheral.state];
    NSLog(@"[IBeacon Plugin] peripheralManagerDidUpdateState() state: %@", stateName);
    
    NSLog(@"[IBeacon Plugin] Sending plugin callback with callbackId: %@", advertisingCallbackId);
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* callbackData = [[NSMutableDictionary alloc]init];
        
        [callbackData setObject:stateName forKey:@"state"];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:callbackData];
        [pluginResult setKeepCallbackAsBool:YES];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:advertisingCallbackId];
    }];
}
    
- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(CBService *)service error:(NSError *)error{
    NSLog(@"[IBeacon Plugin] Starting to advertise with peripheralData %@", peripheralData);
    [_peripheralManager startAdvertising:peripheralData];
    NSLog(@"[IBeacon Plugin] started advertising successfully.");
}
    
- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error{
    NSLog(@"[IBeacon Plugin] peripheralManagerDidStartAdvertising()");
}
    
    
# pragma mark CLLocationManagerDelegate
    
- (void)locationManager:(CLLocationManager *)manager didDetermineState:(CLRegionState)state forRegion:(CLRegion *)region
{
    if(state == CLRegionStateInside) {
        NSLog(@"[IBeacon Plugin] didDetermineState INSIDE for %@", region.identifier);
    }
    else if(state == CLRegionStateOutside) {
        NSLog(@"[IBeacon Plugin] didDetermineState OUTSIDE for %@", region.identifier);
    }
    else {
        NSLog(@"[IBeacon Plugin] didDetermineState OTHER for %@", region.identifier);
    }
    
    NSLog(@"[IBeacon Plugin] Sending plugin callback with callbackId: %@", monitoringCallbackId);
    
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* callbackData = [[NSMutableDictionary alloc]init];
        
        [callbackData setObject:[self mapOfRegion:region] forKey:@"region"];
        [callbackData setObject:[self nameOfRegionState:state] forKey:@"state"];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:callbackData];
        [pluginResult setKeepCallbackAsBool:YES];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:monitoringCallbackId];
    }];
}
    
- (void)locationManager:(CLLocationManager *)manager didRangeBeacons:(NSArray *)beacons inRegion:(CLBeaconRegion *)region
{
    NSLog(@"[IBeacon Plugin] didRangeBeacons() Beacons:");
    for (CLBeacon* beacon in beacons) {
        NSLog(@"[IBeacon Plugin] didRangeBeacons() Description: %@, proximity: %d, proximityUUID: %@, major: %@, minor: %@", beacon.description, beacon.proximity, beacon.proximityUUID, beacon.major, beacon.minor);
    }
    
    NSLog(@"[IBeacon Plugin] Sending plugin callback with callbackId: %@", rangingCallbackId);
    NSMutableArray* beaconsMapsArray = [[NSMutableArray alloc] init];
    for (CLBeacon* beacon in beacons) {
        NSDictionary* dictOfBeacon = [self mapOfBeacon:beacon];
        [beaconsMapsArray addObject:dictOfBeacon];
    }
    
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* callbackData = [[NSMutableDictionary alloc]init];
        [callbackData setObject:[self mapOfRegion:region] forKey:@"region"];
        [callbackData setObject:beaconsMapsArray forKey:@"beacons"];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:callbackData];
        [pluginResult setKeepCallbackAsBool:YES];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:rangingCallbackId];
    }];
}
    
# pragma mark Exposed Javascript API
    
- (void)startAdvertising: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] startAdvertising() %@", command.arguments);
    
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    BOOL measuredPowerSpecifiedByUser = command.arguments.count > 1;
    NSNumber *measuredPower = nil;
    if (measuredPowerSpecifiedByUser) {
        measuredPower = [command.arguments objectAtIndex: 1];
        NSLog(@"[IBeacon Plugin] Custom measuredPower specified by caller: %@", measuredPower);
    }
    
    peripheralData = [beaconRegion peripheralDataWithMeasuredPower:measuredPower];
    
    if (_peripheralManager.state == CBPeripheralManagerStatePoweredOn) {
        NSLog(@"[IBeacon Plugin] Peripheral manager is powered on, starting to advertise now.");
        [_peripheralManager startAdvertising:peripheralData];
    } else {
        NSLog(@"[IBeacon Plugin] Peripheral manager is not powered on, advertising is delayed.");
    }
    
    advertisingCallbackId = command.callbackId;
}
    
    
- (void)startMonitoringForRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] startMonitoringForRegion() %@", command.arguments);
    
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    
    monitoringCallbackId = command.callbackId;
    [_locationManager startMonitoringForRegion:beaconRegion];
    
    NSLog(@"[IBeacon Plugin] started monitoring successfully.");
}
    
- (void)stopMonitoringForRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] stopMonitoringForRegion() %@", command.arguments);
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    [_locationManager stopMonitoringForRegion:beaconRegion];
    NSLog(@"[IBeacon Plugin] stopped monitoring successfully.");
}
    
- (void)startRangingBeaconsInRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] startRangingBeaconsInRegion() %@", command.arguments);
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    rangingCallbackId = command.callbackId;
    [_locationManager startRangingBeaconsInRegion:beaconRegion];
    NSLog(@"[IBeacon Plugin] Started ranging successfully.");
}
    
- (void)stopRangingBeaconsInRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] stopRangingBeaconsInRegion() %@", command.arguments);
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    [_locationManager stopRangingBeaconsInRegion:beaconRegion];
    NSLog(@"[IBeacon Plugin] Stopped ranging successfully.");
}
    
    @end
