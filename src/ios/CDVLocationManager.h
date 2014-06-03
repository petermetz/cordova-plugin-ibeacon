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

#import <Cordova/CDV.h>
#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>

typedef CDVPluginResult* (^CDVPluginCommandHandler)(CDVInvokedUrlCommand*);

const int CDV_LOCATION_MANAGER_INPUT_PARSE_ERROR = 100;

@interface CDVLocationManager : CDVPlugin<CLLocationManagerDelegate> {

}

@property (retain) NSOperationQueue *queue;

@property (retain) CLLocationManager *locationManager;

@property (retain) NSString* delegateCallbackId;

@property BOOL debugEnabled;


- (void)startMonitoringForRegion:(CDVInvokedUrlCommand*)command;
- (void)stopMonitoringForRegion:(CDVInvokedUrlCommand*)command;


- (void)isRangingAvailable:(CDVInvokedUrlCommand*)command;
- (void)getAuthorizationStatus:(CDVInvokedUrlCommand*)command;
- (void)getMonitoredRegions:(CDVInvokedUrlCommand*)command;
- (void)getRangedRegions:(CDVInvokedUrlCommand*)command;


- (void)disableDebugLogs:(CDVInvokedUrlCommand*)command;
- (void)enableDebugLogs:(CDVInvokedUrlCommand*)command;
- (void)appendToDeviceLog:(CDVInvokedUrlCommand*)command;

- (void)registerDelegateCallbackId:(CDVInvokedUrlCommand*)command;

@end

