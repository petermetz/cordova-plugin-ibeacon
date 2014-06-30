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

import java.util.Collection;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.RemoteException;
import android.util.Log;

import com.radiusnetworks.ibeacon.IBeacon;
import com.radiusnetworks.ibeacon.IBeaconConsumer;
import com.radiusnetworks.ibeacon.IBeaconManager;
import com.radiusnetworks.ibeacon.MonitorNotifier;
import com.radiusnetworks.ibeacon.RangeNotifier;
import com.radiusnetworks.ibeacon.Region;

public class IBeaconPlugin extends CordovaPlugin implements IBeaconConsumer {
    public static final String TAG = "IBeacon";
    private IBeaconManager iBeaconManager;

    /**
     * Constructor.
     */
    public IBeaconPlugin() {
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

        iBeaconManager = IBeaconManager.getInstanceForApplication(cordova.getActivity());
        iBeaconManager.bind(this);
    }
    
    /**
     * The final call you receive before your activity is destroyed.
     */ 
    @Override
    public void onDestroy() {
    	iBeaconManager.unBind(this);
    	
    	super.onDestroy(); 
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
        	startAdvertising(args.optJSONObject(0), callbackContext);
        } else if (action.equals("stopAdvertising")) {
        	stopAdvertising(args.optJSONObject(0), callbackContext);
        } else if (action.equals("startMonitoringForRegion")) {
        	startMonitoringForRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("stopMonitoringForRegion")) {
        	stopMonitoringForRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("startRangingBeaconsInRegion")) {
        	startRangingBeaconsInRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("stopRangingBeaconsInRegion")) {
        	stopRangingBeaconsInRegion(args.optJSONObject(0), callbackContext);
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
    	Log.w(TAG, "'isAdvertising' not supported on Android");
        callbackContext.error("Advertising mode not supported on Android");
    }

    private void startAdvertising(JSONObject arguments, CallbackContext callbackContext) {
    	Log.w(TAG, "'startAdvertising' not supported on Android");
        callbackContext.error("Advertising mode not supported on Android");
    }
    
    private void stopAdvertising(JSONObject arguments, CallbackContext callbackContext) {
    	Log.w(TAG, "'stopAdvertising' not supported on Android");
         callbackContext.error("Advertising mode not supported on Android");
    }
    
    private void startMonitoringForRegion(JSONObject arguments, final CallbackContext callbackContext) throws JSONException {
        Region region = parseRegion(arguments);
        
        iBeaconManager.setMonitorNotifier(new MonitorNotifier() {
            @Override
            public void didEnterRegion(Region region) {
            	Log.i(TAG, "[IBeacon Plugin] didEnterRegion INSIDE for "+region.getUniqueId());      
            }

            @Override
            public void didExitRegion(Region region) {
            	Log.i(TAG, "[IBeacon Plugin] didExitRegion OUTSIDE for "+region.getUniqueId());      
            }

            @Override
			public void didDetermineStateForRegion(int state, Region region) {
                Log.i(TAG, "[IBeacon Plugin] didDetermineState '"+nameOfRegionState(state)+"' for "+region.getUniqueId());
                dispatchMonitorState(state,region,callbackContext);
            }
            
            /*
             * Send state to callback until stopped
             */
            private void dispatchMonitorState(final int state, final Region region, final CallbackContext callbackContext) {
            	Log.i(TAG, "[IBeacon Plugin] dispatchMonitorState ");
            	cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                    	String stateName = nameOfRegionState(state);
                    	try {
                    		JSONObject data = new JSONObject();
        					data.put("state", stateName);
        					data.put("region", mapOfRegion(region));
        					
        					//send and keep reference to callback 
        					PluginResult result = new PluginResult(PluginResult.Status.OK,data);
        					result.setKeepCallback(true);
        					callbackContext.sendPluginResult(result);
        					
        				} catch (JSONException e) {
        					Log.e(TAG, "[IBeacon Plugin] didDetermineState JSON serialiser error "+e.getMessage());
        					
        					callbackContext.error("Monitor Failed");
        				}
                    }
                });
            }

        });

        try {
            iBeaconManager.startMonitoringBeaconsInRegion(region);
        } catch (RemoteException e) {   
        	Log.e(TAG, "'startMonitoringForRegion' service error " + e.getCause());
        	callbackContext.error("RemoteException"+e);
        }
  	
    }
    

   
    private void stopMonitoringForRegion(JSONObject arguments, CallbackContext callbackContext) throws JSONException {
    	
        Region region = parseRegion(arguments);

        try {
            iBeaconManager.stopMonitoringBeaconsInRegion(region);
        } catch (RemoteException e) {   
        	callbackContext.error("RemoteException"+e);
        }
    }
    
    private void startRangingBeaconsInRegion(JSONObject arguments, final CallbackContext callbackContext) throws JSONException {
        
        Region region = parseRegion(arguments);

        iBeaconManager.setRangeNotifier(new RangeNotifier() {
	        @Override 
	        public void didRangeBeaconsInRegion(Collection<IBeacon> iBeacons, Region region) {
	            if (iBeacons.size() > 0) {
	            	dispatchRangingState(iBeacons,region, callbackContext);
	                //Log.i(TAG, "The first iBeacon I see is about "+iBeacons.iterator().next().getAccuracy()+" meters away.");       
	            }
	        }
	        
	        /*
             * Send state to callback until stopped
             */
            private void dispatchRangingState(final Collection<IBeacon> iBeacons, final Region region, final CallbackContext callbackContext) {
            	
            	Log.i(TAG, "[IBeacon Plugin] dispatchRangingState ");
            	cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                    	
                    	try {
                    		JSONObject data = new JSONObject();
                    		JSONArray beaconData = new JSONArray();
                    		for (IBeacon beacon : iBeacons) {
                    			beaconData.put(mapOfBeacon(beacon));
                    		}
                    		
        					data.put("region", mapOfRegion(region));
        					data.put("beacons", beaconData);
        					
        					//send and keep reference to callback 
        					PluginResult result = new PluginResult(PluginResult.Status.OK,data);
        					result.setKeepCallback(true);
        					callbackContext.sendPluginResult(result);
        				} catch (JSONException e) {
        					Log.e(TAG, "[IBeacon Plugin] setRangeNotifier JSON serialiser error "+e.getMessage());      
        					callbackContext.error("Randing Failed");
        				}
                    }
                });
            }

	    });

        try {
            iBeaconManager.startRangingBeaconsInRegion(region);
        } catch (RemoteException e) {   
        	Log.e(TAG, "'startRangingBeaconsInRegion' service error " + e.getCause());
        	callbackContext.error("RemoteException"+e);
        }
  	
    }
    
    private void stopRangingBeaconsInRegion(JSONObject arguments, CallbackContext callbackContext) throws JSONException {
        Region region = parseRegion(arguments);

        try {
            iBeaconManager.stopRangingBeaconsInRegion(region);
        } catch (RemoteException e) {   
        	callbackContext.error("RemoteException"+e);
        }
   	
    }
    
     
    /* Helper methods */
    private Region parseRegion(JSONObject json) throws JSONException {
    	String identifier = json.getString("identifier");
    	String uuid = json.has("uuid")&&!json.isNull("uuid") ? json.getString("uuid") : null;
    	Integer major = json.has("major")&&!json.isNull("major") ? json.getInt("major") : null;
    	Integer minor = json.has("minor")&&!json.isNull("minor") ? json.getInt("minor") : null;
    	
    	return new Region(identifier,uuid,major,minor);
    }
    

    private String nameOfRegionState(int state) {
        switch (state) {
        case MonitorNotifier.INSIDE:
            return "CLRegionStateInside";
        case MonitorNotifier.OUTSIDE:
            return "CLRegionStateOutside";
        /*case MonitorNotifier.UNKNOWN:
            return "CLRegionStateUnknown";*/
        default:
            return "ErrorUnknownCLRegionStateObjectReceived";

        }   	
    }
    
    private JSONObject mapOfRegion(Region region) throws JSONException {
        JSONObject dict = new JSONObject();
        
         // identifier
         if (region.getUniqueId() != null) {
        	 dict.put("identifier", region.getUniqueId());
         }

     	dict.put("uuid", region.getProximityUuid());

        if (region.getMajor()!=null) {
            dict.put("major", region.getMajor());
        }

        if (region.getMinor()!=null) {
        	dict.put("minor", region.getMinor());
        }

        // radius
        //dict.put("radius", region.getRadius());

        // center
        /*JSONObject coordinates = new JSONObject();
        coordinates.put("latitude", 0.0d);
        coordinates.put("longitude", 0.0d);
        dict.put("center", coordinates);*/
        
        
        return dict;
    }

    private JSONObject mapOfBeacon(IBeacon region) throws JSONException {
    	JSONObject dict = new JSONObject();
        
    	// uuid
    	dict.put("uuid", region.getProximityUuid());
        dict.put("major", region.getMajor());
       	dict.put("minor", region.getMinor());

        // proximity
        dict.put("proximity", nameOfProximity(region.getProximity()));
        // rssi
        dict.put("rssi", region.getRssi());
        
        return dict;
    }

    private String nameOfProximity(int proximity) {
        switch (proximity) {
            case IBeacon.PROXIMITY_NEAR:
                return "CLProximityNear";
            case IBeacon.PROXIMITY_FAR:
                return "CLProximityFar";
            case IBeacon.PROXIMITY_IMMEDIATE:
                return "CLProximityImmediate";
            case IBeacon.PROXIMITY_UNKNOWN:
                return "CLProximityUnknown";
            default:
                return "ErrorProximityValueUnknown";
        }
    }

    //////// IBeaconConsumer implementation /////////////////////

	@Override
	public void onIBeaconServiceConnect() {
		serviceRunning = true;
	}

	@Override
	public Context getApplicationContext() {
		return cordova.getActivity();
	}

	@Override
	public void unbindService(ServiceConnection connection) {
		serviceRunning = false;
		cordova.getActivity().unbindService(connection);
	}

	@Override
	public boolean bindService(Intent intent, ServiceConnection connection,
			int mode) {

		
		serviceRunning = true;
		return cordova.getActivity().bindService(intent, connection, mode);
	}
    
    boolean serviceRunning = false;
}
