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
package org.apache.cordova.ibeacon;

import java.util.TimeZone;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.provider.Settings;

public class IBeacon extends CordovaPlugin {
    public static final String TAG = "IBeacon";

    /**
     * Constructor.
     */
    public IBeacon() {
    }

    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);

    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("isAdvertising")) {
        	
            isAdvertising(args.optJSONObject(0), callbackContext);
        } else if (action.equals("startAdvertising")) {
            isAdvertising(args.optJSONObject(0), callbackContext);
        	
        } else if (action.equals("stopAdvertising")) {
            isAdvertising(args.optJSONObject(0), callbackContext);
        	
        } else if (action.equals("startMonitoringForRegion")) {
            isAdvertising(args.optJSONObject(0), callbackContext);
        	
        } else if (action.equals("stopMonitoringForRegion")) {
            isAdvertising(args.optJSONObject(0), callbackContext);
        	
        } else if (action.equals("startRangingBeaconsInRegion")) {
            isAdvertising(args.optJSONObject(0), callbackContext);
        	
        } else if (action.equals("stopRangingBeaconsInRegion")) {
            isAdvertising(args.optJSONObject(0), callbackContext);
        	
        }
        else {
            return false;
        }
        return true;
    }
    
    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------

    private void isAdvertising(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }

    private void startAdvertising(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }
    
    private void stopAdvertising(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }
    
    private void startMonitoringForRegion(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }
    
    private void stopMonitoringForRegion(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }
    
    private void startRangingBeaconsInRegion(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }
    
    private void stopRangingBeaconsInRegion(JSONObject arguments, CallbackContext callbackContext) {
        JSONObject r = new JSONObject();

        callbackContext.success(r);
   	
    }
    
    
}
