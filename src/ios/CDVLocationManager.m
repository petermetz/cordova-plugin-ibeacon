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

#import "CDVLocationManager.h"
#import "LMLogger.h"

@implementation CDVLocationManager {

}

# pragma mark CDVPlugin

- (void)pluginInitialize
{
    [self initEventQueue];
    [self pauseEventPropagationToDom]; // Before the DOM is loaded we'll just keep collecting the events and fire them later.

    [self initLocationManager];
    [self initPeripheralManager];
    
    self.debugLogEnabled = true;
    self.debugNotificationsEnabled = false;
    
    [self resumeEventPropagationToDom]; // DOM propagation when Location Manager, PeripheralManager initiated
}

- (void) initLocationManager {
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
    
    
    if (IsAtLeastiOSVersion(@"9.0")) {
        self.locationManager.allowsBackgroundLocationUpdates = YES;
    }
}

- (void) initPeripheralManager {
    self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:nil options:nil];
}

- (void) pauseEventPropagationToDom {
    [self checkEventQueue];
    [self.queue setSuspended:YES];
}

- (void) resumeEventPropagationToDom {
    [self checkEventQueue];
    [self.queue setSuspended:NO];
}

- (void) initEventQueue {
    
    self.queue = [NSOperationQueue new];
    self.queue.maxConcurrentOperationCount = 1; // Don't hit the DOM too hard.
    
    [self performSelector:@selector(checkIfDomSignaldDelegateReady) withObject:nil afterDelay:CDV_LOCATION_MANAGER_DOM_DELEGATE_TIMEOUT];
}

- (void) checkEventQueue {
    if (self.queue != nil) {
        return;
    }
    [[self getLogger] debugLog:@"WARNING event queue should not be null."];
    self.queue = [NSOperationQueue new];
}

- (void) checkIfDomSignaldDelegateReady {

    if (self.queue != nil && !self.queue.isSuspended) {
        return;
    }
    NSString *warnMsg = [NSString stringWithFormat:@"[Cordova-Plugin-IBeacon] WARNING did not receive delegate ready callback from DOM after %f seconds!", CDV_LOCATION_MANAGER_DOM_DELEGATE_TIMEOUT];
    
    NSString *javascriptErrorLoggingStatement =[NSString stringWithFormat:@"console.error('%@')", warnMsg];
    [self.commandDelegate evalJs:javascriptErrorLoggingStatement];
}

# pragma mark CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didDetermineState:(CLRegionState)state forRegion:(CLRegion *)region {
    
    [self.commandDelegate runInBackground:^{
        
        [[self getLogger] debugLog:@"didDetermineState: %@ for region: %@", [self regionStateAsString:state], region];
        
        NSMutableDictionary* dict = [NSMutableDictionary new];
        
        [dict setObject: [self jsCallbackNameForSelector:_cmd] forKey:@"eventType"];
        [dict setObject:[self mapOfRegion:region] forKey:@"region"];
        [dict setObject:[self regionStateAsString:state] forKey:@"state"];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.delegateCallbackId];
    }];
}

-(void)locationManager:(CLLocationManager *)manager didEnterRegion:(CLRegion *)region {
    
    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            [[self getLogger] debugLog:@"didEnterRegion: %@", region.identifier];
            [[self getLogger] debugNotification:@"didEnterRegion: %@", region.identifier];
            
            NSMutableDictionary* dict = [NSMutableDictionary new];
            [dict setObject:[self jsCallbackNameForSelector:(_cmd)] forKey:@"eventType"];
            [dict setObject:[self mapOfRegion:region] forKey:@"region"];
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;

        } :nil :NO :self.delegateCallbackId];
    }];
}

-(void)locationManager:(CLLocationManager *)manager didExitRegion:(CLRegion *)region {

    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            [[self getLogger] debugLog:@"didExitRegion: %@", region.identifier];
            [[self getLogger] debugNotification:@"didExitRegion: %@", region.identifier];
            
            NSMutableDictionary* dict = [NSMutableDictionary new];
            [dict setObject:[self jsCallbackNameForSelector:(_cmd)] forKey:@"eventType"];
            [dict setObject:[self mapOfRegion:region] forKey:@"region"];
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;
            
        } :nil :NO :self.delegateCallbackId];
    }];
}

- (void)locationManager:(CLLocationManager *)manager didStartMonitoringForRegion:(CLRegion *)region {

    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            [[self getLogger] debugLog:@"didStartMonitoringForRegion: %@", region];
            
            NSMutableDictionary* dict = [NSMutableDictionary new];
            [dict setObject:[self jsCallbackNameForSelector :_cmd] forKey:@"eventType"];
            [dict setObject:[self mapOfRegion:region] forKey:@"region"];
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;
            
        } :nil :NO :self.delegateCallbackId];
    }];
}

- (void)locationManager:(CLLocationManager *)manager monitoringDidFailForRegion:(CLRegion *)region withError:(NSError *)error {
    
    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            [[self getLogger] debugLog:@"monitoringDidFailForRegion: %@", error.description];
            
            NSMutableDictionary* dict = [NSMutableDictionary new];
            [dict setObject:[self jsCallbackNameForSelector :_cmd] forKey:@"eventType"];
            [dict setObject:[self mapOfRegion:region] forKey:@"region"];
            [dict setObject:error.description forKey:@"error"];
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;
            
        } :nil :NO :self.delegateCallbackId];
    }];
}

- (void)locationManager:(CLLocationManager *)manager didRangeBeacons:(NSArray *)beacons inRegion:(CLBeaconRegion *)region {
    
    NSMutableArray* beaconsMapsArray = [NSMutableArray new];
    for (CLBeacon* beacon in beacons) {
        NSDictionary* dictOfBeacon = [self mapOfBeacon:beacon];
        [beaconsMapsArray addObject:dictOfBeacon];
    }
    
    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            [[self getLogger] debugLog:@"didRangeBeacons: %@", beacons];
            
            NSMutableDictionary* dict = [[NSMutableDictionary alloc]init];
            [dict setObject:[self jsCallbackNameForSelector :_cmd] forKey:@"eventType"];
            [dict setObject:[self mapOfRegion:region] forKey:@"region"];
            [dict setObject:beaconsMapsArray forKey:@"beacons"];
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;
            
        } :nil :NO :self.delegateCallbackId];
    }];
}


# pragma mark Javascript Plugin API

- (void)onDomDelegateReady:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand * command) {

        // Starts propagating the events.
        [self resumeEventPropagationToDom];
        
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } :command];
}

- (void)disableDebugLogs:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand * command) {

        self.debugLogEnabled = false;
        [self.logger setDebugLogEnabled:false];
        
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } :command];

}

- (void)enableDebugLogs:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand * command) {
        
        self.debugLogEnabled = true;
        [self.logger setDebugLogEnabled:true];
        
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } :command];
}

- (void)disableDebugNotifications:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand * command) {
        
        self.debugNotificationsEnabled = false;
        [self.logger setDebugNotificationsEnabled:false];
        
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } :command];
}

- (void)enableDebugNotifications:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand * command) {

        self.debugNotificationsEnabled = true;
        [self.logger setDebugNotificationsEnabled:true];
        
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } :command];
}

- (void)appendToDeviceLog:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand * command) {
        
        NSString* message = [command.arguments objectAtIndex:0];
        if (message != nil && [message length] > 0) {
            [[self getLogger] debugLog:[@"[DOM] " stringByAppendingString:message]];
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
        } else {
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        }
    } :command];
}

- (void)startMonitoringForRegion:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        if (region == nil) {
            if (error != nil) {
                [[self getLogger] debugLog:@"ERROR %@", error];
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unknown error."];
            }
        } else {
            [_locationManager startMonitoringForRegion:region];
            
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            return result;
        }
    } :command];
}

- (void)stopMonitoringForRegion:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        if (region == nil) {
            if (error != nil) {
                [[self getLogger] debugLog:@"ERROR %@", error];
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unknown error."];
            }
        } else {
            [_locationManager stopMonitoringForRegion:region];
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            return result;
        }
        
    } :command];
}

- (void)requestStateForRegion:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        if (region == nil) {
            if (error != nil) {
                [[self getLogger] debugLog:@"ERROR %@", error];
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unknown error."];
            }
        } else {
            [_locationManager requestStateForRegion:region];
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            return result;
        }
        
    } :command];
}

- (void)startRangingBeaconsInRegion:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        if (region == nil) {
            if (error != nil) {
                [[self getLogger] debugLog:@"ERROR %@", error];
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unknown error."];
            }
        } else {
            [_locationManager startRangingBeaconsInRegion:(CLBeaconRegion*)region];
            
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            return result;
        }
    } :command];
}

- (void)stopRangingBeaconsInRegion:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        if (region == nil) {
            if (error != nil) {
                [[self getLogger] debugLog:@"ERROR %@", error];
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unknown error."];
            }
        } else {
            [_locationManager stopRangingBeaconsInRegion:(CLBeaconRegion*)region];
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [result setKeepCallbackAsBool:YES];
            return result;
        }
        
    } :command];
}

- (void)getAuthorizationStatus:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        CLAuthorizationStatus authorizationStatus = [CLLocationManager authorizationStatus];

        NSString* authorizationStatusString = [self authorizationStatusAsString:authorizationStatus];
        
        NSDictionary *dict = @{@"authorizationStatus": authorizationStatusString};
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
        
        
    } :command];
}

- (void) requestAlwaysAuthorization:(CDVInvokedUrlCommand*)command {

    // Under iOS 8, there is no need for these permissions, therefore we can
    // send back OK to the calling DOM without any further ado.
    if (!IsAtLeastiOSVersion(@"8.0")) {
        CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else {

        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand* command) {

            [self.locationManager requestAlwaysAuthorization];

            return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

        } :command];
    }
}

- (void) requestWhenInUseAuthorization:(CDVInvokedUrlCommand*)command  {

    // Under iOS 8, there is no need for these permissions, therefore we can
    // send back OK to the calling DOM without any further ado.
    if (!IsAtLeastiOSVersion(@"8.0")) {
        CDVPluginResult * pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else {

        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand* command) {

            [self.locationManager requestWhenInUseAuthorization];

            return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

        } :command];
    }
}

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    NSLog(@"didChangeAuthorizationStatus");
    
     [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
         
         NSString *statusString = [self authorizationStatusAsString:status];
         
         [[self getLogger] debugLog:@"didChangeAuthorizationStatus: %d => %@", status, statusString];
         [[self getLogger] debugNotification:@"didChangeAuthorizationStatus: %d => %@", status, statusString];
         
         NSMutableDictionary* dict = [NSMutableDictionary new];
         [dict setObject:[self jsCallbackNameForSelector:(_cmd)] forKey:@"eventType"];
         [dict setObject:statusString forKey:@"status"];
         
         CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
         [pluginResult setKeepCallbackAsBool:YES];
         return pluginResult;

     } :nil :NO :self.delegateCallbackId];
}


- (void)getMonitoredRegions:(CDVInvokedUrlCommand*)command {
    
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSArray* arrayOfRegions = [self mapsOfRegions:self.locationManager.monitoredRegions];
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:arrayOfRegions];
        
    } :command];
}

- (void)getRangedRegions:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSArray* arrayOfRegions;
        
        if ([self isBelowIos7]) {
            [[self getLogger] debugLog:@"WARNING Ranging is an iOS 7+ feature."];
            arrayOfRegions = [NSArray new];
        } else {
            arrayOfRegions = [self mapsOfRegions:self.locationManager.rangedRegions];
        }

        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:arrayOfRegions];
    } :command];
}


- (void)isRangingAvailable:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand* command) {
        
        BOOL isRangingAvailable;
        
        if ([self isBelowIos7]) {
            [[self getLogger] debugLog:@"WARNING Ranging is an iOS 7+ feature."];
            isRangingAvailable = false;
        } else {
            isRangingAvailable = [CLLocationManager isRangingAvailable];
        }
        
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: isRangingAvailable];
        
    } :command];
}

- (void)registerDelegateCallbackId:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand* command) {
        
        [[self getLogger] debugLog:@"Registering delegate callback ID: %@", command.callbackId];
        self.delegateCallbackId = command.callbackId;

        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [result setKeepCallbackAsBool:YES];

        return result;
    } :command];
}

# pragma mark CBPeripheralManagerDelegate

- (void) peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral {
    
    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            NSString *stateName = [self peripherialStateAsString:peripheral.state];
            
            [[self getLogger] debugLog:@"peripheralManagerDidUpdateState: %@",stateName];
            [[self getLogger] debugNotification:@"peripheralManagerDidUpdateState: %@",stateName];
            
            //Start advertising is a beacon definition is already set
            if (_advertisedPeripheralData && peripheral.state == CBPeripheralManagerStatePoweredOn) {
                [[self getLogger] debugLog:@"Start advertising."];
                [peripheral startAdvertising:_advertisedPeripheralData];
            }
            
            NSMutableDictionary* dict = [NSMutableDictionary new];
            [dict setObject:[self jsCallbackNameForSelector:(_cmd)] forKey:@"eventType"];
            [dict setObject:stateName forKey:@"state"];
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;
            
        } :nil :NO :self.delegateCallbackId];
    }];
    
    NSString *stateName = [self peripherialStateAsString:peripheral.state];
    [[self getLogger] debugLog:@"peripheralManagerDidUpdateState() state: %@", stateName];
    
    if (peripheral.state != CBPeripheralManagerStatePoweredOn) {
        return;
    }
    
}

- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error{
    
    [self.queue addOperationWithBlock:^{
        
        [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
            
            NSString *stateName = [self peripherialStateAsString:peripheral.state];
            
            NSMutableDictionary* dict = [NSMutableDictionary new];
            [dict setObject:[self jsCallbackNameForSelector:(_cmd)] forKey:@"eventType"];
            [dict setObject:stateName forKey:@"state"];
            
            if (error) {
                [[self getLogger] debugLog:@"Error Advertising: %@", [error localizedDescription]];
                [[self getLogger] debugNotification:@"Error Advertising: %@", [error localizedDescription]];
                [dict setObject:[error localizedDescription] forKey:@"error"];
            } else {
                [[self getLogger] debugLog:@"peripheralManagerDidStartAdvertising"];
                [[self getLogger] debugNotification:@"peripheralManagerDidStartAdvertising"];
                [dict setObject:[self mapOfRegion:_advertisedBeaconRegion] forKey:@"region"];
            }
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [pluginResult setKeepCallbackAsBool:YES];
            return pluginResult;
            
        } :nil :NO :self.delegateCallbackId];
    }];
}

#pragma mark Advertising

- (void)isAdvertisingAvailable:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        //advertising supported since iOS6
        BOOL isAvailable = true;
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isAvailable];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

- (void)isAdvertising:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        BOOL isAdvertising = [_peripheralManager isAdvertising];
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isAdvertising];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

- (void)startAdvertising: (CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        if (region == nil) {
            if (error != nil) {
                [[self getLogger] debugLog:@"ERROR %@", error];
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unknown error."];
            }
        } else if (![region isKindOfClass:[CLBeaconRegion class]]) {
            [[self getLogger] debugLog:@"ERROR Cannot advertise with that Region. Must be a Beacon"];
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Cannot advertise with that Region. Must be a BeaconRegion"];
        } else {
           
            BOOL measuredPowerSpecifiedByUser = command.arguments.count > 1;
            NSNumber *measuredPower = nil;
            if (measuredPowerSpecifiedByUser) {
                measuredPower = [command.arguments objectAtIndex: 1];
                [[self getLogger] debugLog:@"Custom measuredPower specified by caller: %@", measuredPower];
            } else {
                [[self getLogger] debugLog:@"[Default measuredPower will be used."];
            }

            CLBeaconRegion* beaconRegion = (CLBeaconRegion*)region;
            _advertisedBeaconRegion = beaconRegion;
            _advertisedPeripheralData = [beaconRegion peripheralDataWithMeasuredPower:measuredPower];

            NSMutableDictionary* dict = [[NSMutableDictionary alloc]init];
            [dict setObject:[self peripherialStateAsString:_peripheralManager.state] forKey:@"state"];
            
            if (_peripheralManager.state == CBPeripheralManagerStatePoweredOn) {
                [_peripheralManager startAdvertising:_advertisedPeripheralData];
            } else {
                [[self getLogger] debugLog:@"Advertising is accepted, but won't start until peripheral manager is powered on."];
            }
            
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
            [result setKeepCallbackAsBool:YES];
            return result;
        }
    } :command];
}

- (void)stopAdvertising: (CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        if (_peripheralManager.state == CBPeripheralManagerStatePoweredOn) {
            [[self getLogger] debugLog:@"Stopping the advertising. The peripheral manager might report isAdvertising true even after this, for a short period of time."];

            [_peripheralManager stopAdvertising];
            _advertisedBeaconRegion = nil;
            _advertisedPeripheralData = nil;
        } else {
            [[self getLogger] debugLog:@"Peripheral manager isn`t powered on. There is nothing to stop."];
        }
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

- (void)isMonitoringAvailableForClass:(CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        NSError* error;
        CLRegion* region = [self parseRegion:command returningError:&error];
        BOOL isValidRegion = region != nil;
        
        BOOL isAvailable;
        if (![self isBelowIos7]) {
            isAvailable = isValidRegion && [CLLocationManager isMonitoringAvailableForClass:[region class]];
        } else {
            isAvailable = isValidRegion;
        }

        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isAvailable];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

- (void)isBluetoothEnabled: (CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {

        //this should be sufficient - otherwise will need to add a centralmanager reference
        BOOL isEnabled = _peripheralManager.state == CBPeripheralManagerStatePoweredOn;
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isEnabled];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

- (void)enableBluetooth: (CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
       [[self getLogger] debugLog:@"Enable Bluetooth not required on iOS."];
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

- (void)disableBluetooth: (CDVInvokedUrlCommand*)command {
    [self _handleCallSafely:^CDVPluginResult *(CDVInvokedUrlCommand *command) {
        
        [[self getLogger] debugLog:@"Disable Bluetooth not required on iOS."];
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [result setKeepCallbackAsBool:YES];
        return result;
        
    } :command];
}

#pragma mark Parsing 

- (CLRegion*) parseRegion:(CDVInvokedUrlCommand*) command returningError:(out NSError **)error {
    
    NSDictionary* dict = command.arguments[0];

    NSString* typeName = [dict objectForKey:@"typeName"];
    if (typeName == nil) {
        *error = [self parseErrorWithDescription:@"'typeName' is missing, cannot parse CLRegion."];
        return nil;
    }
    
    NSString* identifier = [dict objectForKey:@"identifier"];
    if (identifier == nil) {
        *error = [self parseErrorWithDescription:@"'identifier' is missing, cannot parse CLRegion."];
        return nil;
    }
  
    if ([typeName isEqualToString:@"BeaconRegion"]) {
        return [self parseBeaconRegionFromMap:dict andIdentifier:identifier returningError:error];
    } else if ([typeName isEqualToString:@"CircularRegion"]) {
        return [self parseCircularRegionFromMap:dict andIdentifier:identifier returningError:error];
    } else {
        NSString* description = [NSString stringWithFormat:@"unsupported CLRegion subclass: %@", typeName];
        *error = [self parseErrorWithDescription: description];
        return nil;
    }
}

- (CLRegion*) parseCircularRegionFromMap:(NSDictionary*) dict andIdentifier:(NSString*) identifier returningError:(out NSError **)error {
    CLRegion *region;
    
    NSNumber *latitude = [dict objectForKey:@"latitude"];
    if (latitude == nil) {
        *error = [self parseErrorWithDescription:@"'latitude' is missing, cannot parse CLCircularRegion."];
        return nil;
    }
    
    NSNumber *longitude = [dict objectForKey:@"longitude"];
    if (longitude == nil) {
        *error = [self parseErrorWithDescription:@"'longitude' is missing, cannot parse CLCircularRegion."];
        return nil;
    }
    
    NSNumber *radiusAsNumber = [dict objectForKey:@"radius"];
    if (radiusAsNumber == nil) {
        *error = [self parseErrorWithDescription:@"'radius' is missing, cannot parse CLCircularRegion."];
        return nil;
    }
    
    CLLocationDistance radius = [radiusAsNumber doubleValue];
    CLLocationCoordinate2D center = CLLocationCoordinate2DMake([latitude doubleValue], [longitude doubleValue]);
    
    region = [[CLRegion alloc] initCircularRegionWithCenter:center radius:radius identifier:identifier];

    if (region == nil) {
        *error = [self parseErrorWithDescription:@"CLCircularRegion parsing failed for unknown reason."];
    }
    return region;
}

- (CLBeaconRegion*) parseBeaconRegionFromMap:(NSDictionary*) dict andIdentifier:(NSString*) identifier returningError:(out NSError **)error {
    CLBeaconRegion *region;
    if ([self isBelowIos7]) {
        *error = [self parseErrorWithDescription:@"CLBeaconRegion only supported on iOS 7 and above."];
        return nil;
    }
    NSString *uuidString = [dict objectForKey:@"uuid"];
    if (uuidString == nil) {
        *error = [self parseErrorWithDescription:@"'uuid' is missing, cannot parse CLBeaconRegion."];
        return nil;
    }
    NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:uuidString];
    if (uuid == nil) {
        NSString* description = [NSString stringWithFormat:@"'uuid' %@ is not a valid UUID. Cannot parse CLBeaconRegion.", uuidString];
        *error = [self parseErrorWithDescription:description];
        return nil;
    }
    
    NSNumber *major = [dict objectForKey:@"major"];
    NSNumber *minor = [dict objectForKey:@"minor"];
    
    if (major == nil && minor == nil) {
        region = [[CLBeaconRegion alloc] initWithProximityUUID:uuid identifier:identifier];
    } else if (major != nil && minor == nil){
        region = [[CLBeaconRegion alloc] initWithProximityUUID:uuid major:[major doubleValue] identifier:identifier];
    } else if (major != nil && minor != nil) {
        region = [[CLBeaconRegion alloc] initWithProximityUUID:uuid major:[major doubleValue] minor:[minor doubleValue] identifier:identifier];
    } else {
        *error = [self parseErrorWithDescription:@"Unsupported combination of 'major' and 'minor' parameters."];
        return nil;
    }

    NSNumber *notifyFlag = [dict objectForKey:@"notifyEntryStateOnDisplay"];
    
    if (notifyFlag != nil) {
        BOOL notify = [notifyFlag boolValue];
        region.notifyEntryStateOnDisplay = notify;
        NSString *notifyValue = notify ? @"Yes" : @"No";
        NSLog(@"using notifyEntryStateOnDisplay BOOL for this region with value %@.", notifyValue);
    }
    
    if (region == nil) {
        *error = [self parseErrorWithDescription:@"CLBeaconRegion parsing failed for unknown reason."];
    }
    return region;
}

#pragma mark Utilities

- (NSError*) parseErrorWithDescription:(NSString*) description {
    return [self errorWithCode:CDV_LOCATION_MANAGER_INPUT_PARSE_ERROR andDescription:description];
}


- (NSError*) errorWithCode: (int)code andDescription:(NSString*) description {

    NSMutableDictionary* details;
    if (description != nil) {
        details = [NSMutableDictionary dictionary];
        [details setValue:description forKey:NSLocalizedDescriptionKey];
    }
    
    return [[NSError alloc] initWithDomain:@"CDVLocationManager" code:code userInfo:details];
}

- (void) _handleCallSafely: (CDVPluginCommandHandler) unsafeHandler : (CDVInvokedUrlCommand*) command  {
    [self _handleCallSafely:unsafeHandler :command :true];
}

- (void) _handleCallSafely: (CDVPluginCommandHandler) unsafeHandler : (CDVInvokedUrlCommand*) command : (BOOL) runInBackground :(NSString*) callbackId {
    if (runInBackground) {
        [self.commandDelegate runInBackground:^{
            @try {
                [self.commandDelegate sendPluginResult:unsafeHandler(command) callbackId:callbackId];
            }
            @catch (NSException * exception) {
                [self _handleExceptionOfCommand:command :exception];
            }
        }];
    } else {
        @try {
            [self.commandDelegate sendPluginResult:unsafeHandler(command) callbackId:callbackId];
        }
        @catch (NSException * exception) {
            [self _handleExceptionOfCommand:command :exception];
        }
    }
}

- (void) _handleCallSafely: (CDVPluginCommandHandler) unsafeHandler : (CDVInvokedUrlCommand*) command : (BOOL) runInBackground {
    [self _handleCallSafely:unsafeHandler :command :true :command.callbackId];
    
}

- (void) _handleExceptionOfCommand: (CDVInvokedUrlCommand*) command : (NSException*) exception {
    NSLog(@"Uncaught exception: %@", exception.description);
    NSLog(@"Stack trace: %@", [exception callStackSymbols]);

    // When calling without a request (LocationManagerDelegate callbacks) from the client side the command can be null.
    if (command == nil) {
        return;
    }
    CDVPluginResult* pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.description];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (BOOL) isBelowIos7 {
    return [[[UIDevice currentDevice] systemVersion] floatValue] < 7.0;
}

- (NSString *)regionStateAsString: (CLRegionState) regionState {
    NSDictionary *states = @{@(CLRegionStateInside): @"CLRegionStateInside",
                             @(CLRegionStateOutside): @"CLRegionStateOutside",
                             @(CLRegionStateUnknown): @"CLRegionStateUnknown"};
    return [states objectForKey:[NSNumber numberWithInteger:regionState]];
}

- (NSString *)authorizationStatusAsString: (CLAuthorizationStatus) authorizationStatus {
    
    NSDictionary* statuses = @{@(kCLAuthorizationStatusNotDetermined) : @"AuthorizationStatusNotDetermined",
      @(kCLAuthorizationStatusAuthorized) : @"AuthorizationStatusAuthorized",
      @(kCLAuthorizationStatusDenied) : @"AuthorizationStatusDenied",
      @(kCLAuthorizationStatusRestricted) : @"AuthorizationStatusRestricted",
      @(kCLAuthorizationStatusAuthorizedWhenInUse) : @"AuthorizationStatusAuthorizedWhenInUse",
      @(kCLAuthorizationStatusAuthorizedAlways) : @"AuthorizationStatusAuthorizedAlways"};
    
    return [statuses objectForKey:[NSNumber numberWithInt: authorizationStatus]];
}

- (NSString*) proximityAsString: (CLProximity) proximity {
    NSDictionary *dict = @{@(CLProximityNear): @"ProximityNear",
                           @(CLProximityFar): @"ProximityFar",
                           @(CLProximityImmediate): @"ProximityImmediate",
                           @(CLProximityUnknown): @"ProximityUnknown"};
    return [dict objectForKey:[NSNumber numberWithInteger:proximity]];
}

- (NSString*) peripherialStateAsString: (CBPeripheralManagerState) state {
    NSDictionary *dict = @{@(CBPeripheralManagerStatePoweredOff): @"PeripheralManagerStatePoweredOff",
                           @(CBPeripheralManagerStatePoweredOn): @"PeripheralManagerStatePoweredOn",
                           @(CBPeripheralManagerStateResetting): @"PeripheralManagerStateResetting",
                           @(CBPeripheralManagerStateUnauthorized): @"PeripheralManagerStateUnauthorized",
                           @(CBPeripheralManagerStateUnknown): @"PeripheralManagerStateUnknown",
                           @(CBPeripheralManagerStateUnsupported): @"PeripheralManagerStateUnsupported"};
    return [dict objectForKey:[NSNumber numberWithInteger:state]];
}

- (NSArray*) mapsOfRegions: (NSSet*) regions {
    NSMutableArray* array = [NSMutableArray new];
    for(CLRegion* region in regions) {
        [array addObject:[self mapOfRegion:region]];
    }
    return array;
}


- (NSDictionary*) mapOfRegion: (CLRegion*) region {

    NSMutableDictionary* dict = [[NSMutableDictionary alloc] init];

    // identifier
    [dict setObject:region.identifier forKey:@"identifier"];

    // typeName - First two characters are cut down to remove the "CL" prefix.
    NSString *typeName = [NSStringFromClass([region class]) substringFromIndex:2];
    typeName = [typeName isEqualToString:@"Region"] ? @"CircularRegion" : typeName;
    [dict setObject:typeName forKey:@"typeName"];

    if ([region isKindOfClass:[CLBeaconRegion class]]) {
        CLBeaconRegion* beaconRegion = (CLBeaconRegion*) region;
        NSDictionary * beaconRegionDict = [self mapOfBeaconRegion:beaconRegion];
        [dict addEntriesFromDictionary: beaconRegionDict];
        return dict;
    }
    
    // radius
    NSNumber* radius = [NSNumber numberWithDouble: region.radius];
    [dict setValue: radius forKey:@"radius"];

    
    NSNumber* latitude = [NSNumber numberWithDouble: region.center.latitude ];
    NSNumber* longitude = [NSNumber numberWithDouble: region.center.longitude];
    // center
    [dict setObject: latitude forKey:@"latitude"];
    [dict setObject: longitude forKey:@"longitude"];

    return dict;
}

- (NSDictionary*) mapOfBeaconRegion: (CLBeaconRegion*) region {
    
    NSMutableDictionary* dict = [[NSMutableDictionary alloc] init];
    [dict setObject:region.proximityUUID.UUIDString forKey:@"uuid"];
    
    if (region.major != nil) {
        [dict setObject: region.major forKey:@"major"];
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
    NSString* proximityString = [self proximityAsString:proximity];
    [dict setObject:proximityString forKey:@"proximity"];
    
    // major
    [dict setObject:beacon.major forKey:@"major"];
    
    // minor
    [dict setObject:beacon.minor forKey:@"minor"];
    
    // rssi
    NSNumber * rssi = [[NSNumber alloc] initWithInteger:beacon.rssi];
    [dict setObject:rssi forKey:@"rssi"];
    // TODO: Tx value not available from CLBeacon, but possible from CBCentralManager scan on detection
    
    // accuracy is a rough estimate of distance in metres. capped to two decimal places
    NSNumber *accuracy = [NSNumber numberWithDouble:round(100*beacon.accuracy)/100];
    [dict setObject:accuracy forKey:@"accuracy"];
    
    return dict;
}

- (LMLogger*) getLogger {
    
    if (self.logger == nil) {
        _logger = [[LMLogger alloc] init];
    }
    
    [self.logger setDebugLogEnabled:self.debugLogEnabled];
    [self.logger setDebugNotificationsEnabled:self.debugNotificationsEnabled];
    
    return self.logger;
}

- (NSString*) jsCallbackNameForSelector: (SEL) selector {
    NSString* fullName = NSStringFromSelector(selector);
    
    NSString* shortName = [fullName stringByReplacingOccurrencesOfString:@"locationManager:" withString:@""];
    shortName = [shortName stringByReplacingOccurrencesOfString:@":error:" withString:@""];

    NSRange range = [shortName rangeOfString:@":"];
    
    while(range.location != NSNotFound) {
        shortName = [shortName stringByReplacingCharactersInRange:range withString:@""];
        if (range.location < shortName.length) {
            NSString* upperCaseLetter = [[shortName substringWithRange:range] uppercaseString];
            shortName = [shortName stringByReplacingCharactersInRange:range withString:upperCaseLetter];
        }

        range = [shortName rangeOfString:@":"];
    };
    
    [[self getLogger] debugLog:@"Converted %@ into %@", fullName, shortName];
    return shortName;
}


@end
