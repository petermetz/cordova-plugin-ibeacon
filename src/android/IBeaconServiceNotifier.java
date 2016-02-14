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
package com.unarin.cordova.beacon;

import org.altbeacon.beacon.Region;

/*
 * Interface for addition iOS events
 */
public interface IBeaconServiceNotifier {
    /*
     * notified when a region monitor is successfully started
     */
    public void didStartMonitoringForRegion(Region region);

    /*
     * notified when a region monitor fails to start or the region is invalid
     * NOTE: Should add service listener for when BT is turned on and off
     */
    public void monitoringDidFailForRegion(Region region, Exception exception);

    /*
     * notified when a ranging listener fails to start or the listener fails
     */
    public void rangingBeaconsDidFailForRegion(Region region, Exception exception);

    /*
     * Most likely when Bluetooth aerial is switched on or off
     */
    public void didChangeAuthorizationStatus(String status);
}

