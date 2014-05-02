
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
        
        CLBeaconRegion *_advertisedBeaconRegion; // The beacon object provided by the caller, used to construct the _peripheralData object.
        NSDictionary *_peripheralData;
        
        CLLocationManager *_locationManager;
        CBPeripheralManager * _peripheralManager;
    }
    
# pragma mark CDVPlugin
    
- (void)pluginInitialize
    {
        NSLog(@"[IBeacon Plugin] pluginInitialize()");
        
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        
        _peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:nil];
        
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(pageDidLoad:) name:CDVPageDidLoadNotification object:self.webView];
    }
    
- (void) pageDidLoad: (NSNotification*)notification{
    NSLog(@"[IBeacon Plugin] pageDidLoad()");
}

- (void) onReadyToStartAdvertising {
    if (_peripheralData == NULL) {
        NSLog(@"[IBeacon Plugin] Can`t start advertising, peripheral data is unavailable.");
        return;
    }
    if (_peripheralManager == NULL || _peripheralManager.state != CBPeripheralManagerStatePoweredOn) {
        NSLog(@"[IBeacon Plugin] Can`t start advertising, the peripheral manager is not yet powered on.");
        return;
    }
    NSLog(@"[IBeacon Plugin] Starting the actual advertising of %@", _peripheralData);
    [_peripheralManager startAdvertising:_peripheralData];
}
    
# pragma mark CBPeripheralManagerDelegate
    
- (void) peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral {
    NSString *stateName = [self nameOfPeripherialState:peripheral.state];
    NSLog(@"[IBeacon Plugin] peripheralManagerDidUpdateState() state: %@", stateName);
    
    if (peripheral.state != CBPeripheralManagerStatePoweredOn) {
        return;
    }
    [self onReadyToStartAdvertising];
}

- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error{
    NSString *stateName = [self nameOfPeripherialState:peripheral.state];
    NSLog(@"[IBeacon Plugin] peripheralManagerDidStartAdvertising() %@", stateName);
    
    if (_peripheralData == NULL) {
        NSLog(@"[IBeacon Plugin] peripheral data is not yet available.");
        return;
    }
    
    NSLog(@"[IBeacon Plugin] Sending plugin callback with callbackId: %@", advertisingCallbackId);
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* callbackData = [[NSMutableDictionary alloc]init];
    
        CDVCommandStatus status = CDVCommandStatus_OK;
        if (error) {
            NSLog(@"Error advertising: %@", [error localizedDescription]);
            status = CDVCommandStatus_ERROR;
            [callbackData setObject:error.localizedDescription forKey:@"error"];
        } else {
            [callbackData setObject:[self mapOfBeaconRegion:_advertisedBeaconRegion] forKey:@"region"];
        }
        
        [callbackData setObject:stateName forKey:@"state"];
       
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:status messageAsDictionary:callbackData];
        [pluginResult setKeepCallbackAsBool:YES];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:advertisingCallbackId];
    }];
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

- (void) isAdvertising:(CDVInvokedUrlCommand *)command {
    NSNumber *isAdvertising = [NSNumber numberWithBool:_peripheralManager.isAdvertising];
    
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* callbackData = [[NSMutableDictionary alloc]init];
        [callbackData setObject:isAdvertising forKey:@"isAdvertising"];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:callbackData];
        [pluginResult setKeepCallbackAsBool:YES];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)startAdvertising: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] startAdvertising() %@", command.arguments);
    
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    BOOL measuredPowerSpecifiedByUser = command.arguments.count > 1;
    NSNumber *measuredPower = nil;
    if (measuredPowerSpecifiedByUser) {
        measuredPower = [command.arguments objectAtIndex: 1];
        NSLog(@"[IBeacon Plugin] Custom measuredPower specified by caller: %@", measuredPower);
    } else {
        NSLog(@"[IBeacon Plugin] Default measuredPower will be used.");
    }
    
    _advertisedBeaconRegion = beaconRegion;
    _peripheralData = [beaconRegion peripheralDataWithMeasuredPower:measuredPower];
    NSLog(@"[IBeacon Plugin] %@", [self nameOfPeripherialState:_peripheralManager.state]);
    
    if (_peripheralManager.state == CBPeripheralManagerStatePoweredOn) {
        [self onReadyToStartAdvertising];
    }
    
    advertisingCallbackId = command.callbackId;
}

- (void) stopAdvertising:(CDVInvokedUrlCommand *)command {
    NSLog(@"[IBeacon Plugin] stopAdvertising()");
    if (_peripheralManager.state == CBPeripheralManagerStatePoweredOn) {
        NSLog(@"[IBeacon Plugin] Stopping the advertising. The peripheral manager might report isAdvertising true even after this, for a short period of time.");
        [_peripheralManager stopAdvertising];
    } else {
        NSLog(@"[IBeacon Plugin] Peripheral manager isn`t powered on. There is nothing to stop.");
    }
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* callbackData = [[NSMutableDictionary alloc]init];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:callbackData];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}
    
- (void)startMonitoringForRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] startMonitoringForRegion() %@", command.arguments);
    
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    monitoringCallbackId = command.callbackId;
    
    if (beaconRegion == nil) {
        NSLog(@"Error CLBeaconRegion is null, cannot start monitoring.");
        return;
    }
    [_locationManager startMonitoringForRegion:beaconRegion];
    
    NSLog(@"[IBeacon Plugin] started monitoring successfully.");
}
    
- (void)stopMonitoringForRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] stopMonitoringForRegion() %@", command.arguments);
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    if (beaconRegion == nil) {
        NSLog(@"Error CLBeaconRegion is null, cannot stop monitoring.");
        return;
    }
    [_locationManager stopMonitoringForRegion:beaconRegion];
    NSLog(@"[IBeacon Plugin] stopped monitoring successfully.");
}
    
- (void)startRangingBeaconsInRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] startRangingBeaconsInRegion() %@", command.arguments);
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    rangingCallbackId = command.callbackId;
    if (beaconRegion == nil) {
        NSLog(@"Error CLBeaconRegion is null, cannot start ranging.");
        return;
    }
    [_locationManager startRangingBeaconsInRegion:beaconRegion];
    NSLog(@"[IBeacon Plugin] Started ranging successfully.");
}
    
- (void)stopRangingBeaconsInRegion: (CDVInvokedUrlCommand*)command {
    NSLog(@"[IBeacon Plugin] stopRangingBeaconsInRegion() %@", command.arguments);
    CLBeaconRegion* beaconRegion = [self parse:[command.arguments objectAtIndex: 0]];
    if (beaconRegion == nil) {
        NSLog(@"Error CLBeaconRegion is null, cannot stop ranging.");
        return;
    }
    [_locationManager stopRangingBeaconsInRegion:beaconRegion];
    NSLog(@"[IBeacon Plugin] Stopped ranging successfully.");
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
    
     // identifier
     if (region.identifier != nil) {
         [dict setObject:region.identifier forKey:@"identifier"];
     }

     if ([region isKindOfClass:[CLBeaconRegion class]]) {
         CLBeaconRegion* beaconRegion = (CLBeaconRegion*) region;
         return [[NSMutableDictionary alloc] initWithDictionary:[self mapOfBeaconRegion:beaconRegion]];
     } else {
         dict = [[NSMutableDictionary alloc] init];
     }

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

    if (region.major != nil) {
        [dict setObject:region.major forKey:@"major"];
    }

    if (region.minor != nil) {
        [dict setObject:region.minor forKey:@"minor"];
    }
    
    
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
    CLBeaconRegion *beaconRegion;

    @try {
        NSString* uuidString = [regionArguments objectForKey:@"uuid"];
        NSUUID* uuid = [[NSUUID alloc] initWithUUIDString:uuidString];

        id majorAsId = [regionArguments objectForKey:@"major"];
        id minorAsId = [regionArguments objectForKey:@"minor"];

        NSString* identifier = [regionArguments objectForKey:@"identifier"];
        BOOL notifyEntryStateOnDisplay = [[regionArguments objectForKey:@"notifyEntryStateOnDisplay"] boolValue];

        NSLog(@"[IBeacon Plugin] Creating Beacon uuid: %@, major: %@, minor: %@, identifier: %@", uuid, majorAsId, minorAsId, identifier);

        BOOL majorDefined = majorAsId != [NSNull null];
        BOOL minorDefined = minorAsId != [NSNull null];
        if (!majorDefined && !minorDefined) {
            beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:uuid identifier: identifier];
            beaconRegion.notifyEntryStateOnDisplay = notifyEntryStateOnDisplay;
        } else if (majorDefined && !minorDefined) {
            beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:uuid major: [majorAsId intValue] identifier: identifier];
            beaconRegion.notifyEntryStateOnDisplay = notifyEntryStateOnDisplay;
        } else if (majorDefined && minorDefined) {
            beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:uuid major: [majorAsId intValue] minor: [minorAsId intValue] identifier: identifier];
            beaconRegion.notifyEntryStateOnDisplay = notifyEntryStateOnDisplay;
        } else {
            NSLog(@"[IBeacon Plugin] Error, incorrect parameter combination. Minor passed but without a major.");
        }

        if (beaconRegion != nil) {
            NSLog(@"[IBeacon Plugin] Parsing CLBeaconRegion OK: %@", beaconRegion.debugDescription);
        } else {
            NSLog(@"[IBeacon Plugin] Error: Parsing CLBeaconRegion Failed for unknown reason.");
        }
    }
    @catch (NSException *exception) {
        NSLog(@"[IBeacon Plugin] Failed to parse CLBeaconRegion. Reason: %@", exception.reason);
    }
    @finally {
        return beaconRegion;
    }
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

@end
