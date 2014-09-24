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

import java.security.InvalidKeyException;
import java.util.Collection;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Handler;
import android.os.RemoteException;
import android.util.Log;

import com.radiusnetworks.ibeacon.BleNotAvailableException;
import com.radiusnetworks.ibeacon.IBeacon;
import com.radiusnetworks.ibeacon.IBeaconConsumer;
import com.radiusnetworks.ibeacon.IBeaconManager;
import com.radiusnetworks.ibeacon.MonitorNotifier;
import com.radiusnetworks.ibeacon.RangeNotifier;
import com.radiusnetworks.ibeacon.Region;

@TargetApi(Build.VERSION_CODES.HONEYCOMB)
public class LocationManager extends CordovaPlugin implements IBeaconConsumer {
	
    public static final String TAG = "com.unarin.cordova.beacon";
    private static int CDV_LOCATION_MANAGER_DOM_DELEGATE_TIMEOUT = 30;
    
    private IBeaconManager iBeaconManager;
    private BlockingQueue<Runnable> queue;
    private PausableThreadPoolExecutor threadPoolExecutor;
    
    private boolean debugEnabled = true;
    private IBeaconServiceNotifier beaconServiceNotifier; 
    
    //listener for changes in state for system Bluetooth service
	private BroadcastReceiver broadcastReceiver; 



    /**
     * Constructor.
     */
    public LocationManager() {
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

        initBluetoothListener();
        initEventQueue();
        pauseEventPropagationToDom(); // Before the DOM is loaded we'll just keep collecting the events and fire them later.
        
        initLocationManager();
        
        debugEnabled = true;
        
        //TODO AddObserver when page loaded

    }
    
    /**
     * The final call you receive before your activity is destroyed.
     */ 
    @Override
    public void onDestroy() {
    	iBeaconManager.unBind(this);
    	
    	if (broadcastReceiver != null) {
    		cordova.getActivity().unregisterReceiver(broadcastReceiver);
    		broadcastReceiver = null;
    	}
    	
    	super.onDestroy(); 
    }


    
	//////////////// PLUGIN ENTRY POINT /////////////////////////////
    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArray of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if (action.equals("onDomDelegateReady")) {
        	onDomDelegateReady(callbackContext);
        } else if (action.equals("disableDebugNotifications")) {
        	disableDebugNotifications(callbackContext);
        } else if (action.equals("enableDebugNotifications")) {
        	enableDebugNotifications(callbackContext);
        } else if (action.equals("disableDebugLogs")) {
        	disableDebugLogs(callbackContext);
        } else if (action.equals("enableDebugLogs")) {
        	enableDebugLogs(callbackContext);
        } else if (action.equals("appendToDeviceLog")) {
        	appendToDeviceLog(args.optString(0), callbackContext);
        } else if (action.equals("startMonitoringForRegion")) {
        	startMonitoringForRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("stopMonitoringForRegion")) {
        	stopMonitoringForRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("startRangingBeaconsInRegion")) {
        	startRangingBeaconsInRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("stopRangingBeaconsInRegion")) {
        	stopRangingBeaconsInRegion(args.optJSONObject(0), callbackContext);
        } else if (action.equals("isRangingAvailable")) {
        	isRangingAvailable(callbackContext);
        } else if (action.equals("getAuthorizationStatus")) {
        	getAuthorizationStatus(callbackContext);
        } else if (action.equals("requestWhenInUseAuthorization")) {
        	requestWhenInUseAuthorization(callbackContext);
        } else if (action.equals("requestAlwaysAuthorization")) {
        	requestAlwaysAuthorization(callbackContext);
        } else if (action.equals("getMonitoredRegions")) {
        	getMonitoredRegions(callbackContext);
        } else if (action.equals("getRangedRegions")) {
        	getRangedRegions(callbackContext);
        } else if (action.equals("registerDelegateCallbackId")) {
        	registerDelegateCallbackId(args.optJSONObject(0), callbackContext);
        } else if (action.equals("isMonitoringAvailableForClass")) {
        	isMonitoringAvailableForClass(args.optJSONObject(0),callbackContext);
        } else if (action.equals("isAdvertisingAvailable")) {
        	isAdvertisingAvailable(callbackContext);
        } else if (action.equals("isAdvertising")) {
        	isAdvertising(callbackContext);
        } else if (action.equals("startAdvertising")) {
        	startAdvertising(args.optJSONObject(0), callbackContext);
        } else if (action.equals("stopAdvertising")) {
        	stopAdvertising(callbackContext);
        } else {
            return false;
        }
        return true;
    }

	///////////////// SETUP AND VALIDATION /////////////////////////////////
    
    private void initLocationManager() {
        iBeaconManager = IBeaconManager.getInstanceForApplication(cordova.getActivity());
        iBeaconManager.bind(this);
    }
    
	private void pauseEventPropagationToDom() {
		checkEventQueue();
		threadPoolExecutor.pause();		
	}
    
	private void resumeEventPropagationToDom() {
		checkEventQueue();
		threadPoolExecutor.resume();		
	}
	
	private void initBluetoothListener() {
	
		//check access
		if (!hasBlueToothPermission()) {
			debugWarn("Cannot listen to Bluetooth service when BLUETOOTH permission is not added");
			return;
		}
		
		//check device support
		try {
			iBeaconManager.checkAvailability();
		} catch (Exception e) {
			//if device does not support iBeacons an error is thrown
			debugWarn("Cannot listen to Bluetooth service: "+e.getMessage());
			return;
		}
		
		if (broadcastReceiver != null) {
			debugWarn("Already listening to Bluetooth service, not adding again");
			return;
		}
		
		broadcastReceiver = new BroadcastReceiver() {
		    @Override
		    public void onReceive(Context context, Intent intent) {
		        final String action = intent.getAction();
	
		        // Only listen for Bluetooth server changes
		        if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
		        	
		            final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE,BluetoothAdapter.ERROR);
		            final int oldState = intent.getIntExtra(BluetoothAdapter.EXTRA_PREVIOUS_STATE,BluetoothAdapter.ERROR);
		            		            
		            debugLog("Bluetooth Service state changed from "+getStateDescription(oldState)+" to " + getStateDescription(state));
		            
		            switch (state) {
			            case BluetoothAdapter.ERROR:
			            	beaconServiceNotifier.didChangeAuthorizationStatus("AuthorizationStatusNotDetermined");
			                break;
			            case BluetoothAdapter.STATE_OFF:
			            case BluetoothAdapter.STATE_TURNING_OFF:
				        	if (oldState==BluetoothAdapter.STATE_ON)
			            		beaconServiceNotifier.didChangeAuthorizationStatus("AuthorizationStatusDenied");
			                break;
			            case BluetoothAdapter.STATE_ON:
			            	beaconServiceNotifier.didChangeAuthorizationStatus("AuthorizationStatusAuthorized");
			                break;
			            case BluetoothAdapter.STATE_TURNING_ON:
			            	break;
		            }
		        }
		    }
		    
		    private String getStateDescription(int state) {
	            switch (state) {
		            case BluetoothAdapter.ERROR:
		            	return "ERROR";
		            case BluetoothAdapter.STATE_OFF:
		            	return "STATE_OFF";
		            case BluetoothAdapter.STATE_TURNING_OFF:
		            	return "STATE_TURNING_OFF";
		            case BluetoothAdapter.STATE_ON:
		            	return "STATE_ON";
		            case BluetoothAdapter.STATE_TURNING_ON:
		            	return "STATE_TURNING_ON";
	            }
	            return "ERROR"+state;
		    }
		};
		
		// Register for broadcasts on BluetoothAdapter state change
	    IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
    	cordova.getActivity().registerReceiver(broadcastReceiver, filter);
	}
	
	private void initEventQueue() {
		//queue is limited to one thread at a time
	    queue = new LinkedBlockingQueue<Runnable>();
	    threadPoolExecutor = new PausableThreadPoolExecutor(queue);
	    
	    //Add a timeout check
	    new Handler().postDelayed(new Runnable() {
			@Override
			public void run() {
				checkIfDomSignaldDelegateReady();
			}
	    }, CDV_LOCATION_MANAGER_DOM_DELEGATE_TIMEOUT*1000);	    
	}
	
	private void checkEventQueue() {
		if (threadPoolExecutor != null && queue != null)
			return;
		
		debugWarn("WARNING event queue should not be null.");
		queue = new LinkedBlockingQueue<Runnable>();
	    threadPoolExecutor = new PausableThreadPoolExecutor(queue);
	}
	
	private void checkIfDomSignaldDelegateReady() {
		if (threadPoolExecutor != null && !threadPoolExecutor.isPaused())
			return;	
		
		String warning = "WARNING did not receive delegate ready callback from DOM after "+CDV_LOCATION_MANAGER_DOM_DELEGATE_TIMEOUT+" seconds!";
		debugWarn(warning);
		
		webView.sendJavascript("console.warn('"+warning+"')");
	}	
	
	///////// CALLBACKS ////////////////////////////
	
	private void createMonitorCallbacks(final CallbackContext callbackContext) {
		
		//Monitor callbacks
		iBeaconManager.setMonitorNotifier(new MonitorNotifier() {
            @Override
            public void didEnterRegion(Region region) {
            	debugLog("didEnterRegion INSIDE for "+region.getUniqueId());
            	dispatchMonitorState("didEnterRegion", MonitorNotifier.INSIDE,region,callbackContext);
            }

            @Override
            public void didExitRegion(Region region) {
            	debugLog("didExitRegion OUTSIDE for "+region.getUniqueId());  
            	dispatchMonitorState("didExitRegion", MonitorNotifier.OUTSIDE,region,callbackContext);
            }

            @Override
			public void didDetermineStateForRegion(int state, Region region) {
            	debugLog("didDetermineStateForRegion '"+nameOfRegionState(state)+"' for region: "+region.getUniqueId());
                dispatchMonitorState("didDetermineStateForRegion", state,region,callbackContext);
            }
            
            // Send state to JS callback until told to stop
            private void dispatchMonitorState(final String eventType, final int state, final Region region, final CallbackContext callbackContext) {
            	
            	threadPoolExecutor.execute(new Runnable() {
                    public void run() {
                    	try {
                    		JSONObject data = new JSONObject();
                    		data.put("eventType", eventType);
        					data.put("region", mapOfRegion(region));
        					
        					if (eventType.equals("didDetermineStateForRegion")) {
        						String stateName = nameOfRegionState(state);
                            	data.put("state", stateName);
        					}
        					//send and keep reference to callback 
        					PluginResult result = new PluginResult(PluginResult.Status.OK,data);
        					result.setKeepCallback(true);
        					callbackContext.sendPluginResult(result);
        					
        				} catch (Exception e) {
        					Log.e(TAG, "'monitoringDidFailForRegion' exception "+e.getCause());
           					beaconServiceNotifier.monitoringDidFailForRegion(region, e);

        				}
                    }
                });
            }
        });
	
	}

	private void createRangingCallbacks(final CallbackContext callbackContext) {
		
       iBeaconManager.setRangeNotifier(new RangeNotifier() {
	        @Override 
	        public void didRangeBeaconsInRegion(final Collection<IBeacon> iBeacons, final Region region) {
	           	
	        	threadPoolExecutor.execute(new Runnable() {
                    public void run() {
                    	
                    	try {
                    		JSONObject data = new JSONObject();
                    		JSONArray beaconData = new JSONArray();
                    		for (IBeacon beacon : iBeacons) {
                    			beaconData.put(mapOfBeacon(beacon));
                    		}
                    		data.put("eventType", "didRangeBeaconsInRegion");
                    		data.put("region", mapOfRegion(region));
        					data.put("beacons", beaconData);
        					
        					debugLog("didRangeBeacons: "+ data.toString());
        					
        					//send and keep reference to callback 
        					PluginResult result = new PluginResult(PluginResult.Status.OK,data);
        					result.setKeepCallback(true);
        					callbackContext.sendPluginResult(result);
        					
           				} catch (Exception e) {
        					Log.e(TAG, "'rangingBeaconsDidFailForRegion' exception "+e.getCause());
        					beaconServiceNotifier.rangingBeaconsDidFailForRegion(region, e);
        				}
                    }
                });
	        }
	        
	    });

	}
    
	private void createManagerCallbacks(final CallbackContext callbackContext) {
		beaconServiceNotifier = new IBeaconServiceNotifier() {
			
			@Override
			public void rangingBeaconsDidFailForRegion(final Region region, final Exception exception) {
				threadPoolExecutor.execute(new Runnable() {
		            public void run() {
		            	
		            	sendFailEvent("rangingBeaconsDidFailForRegion", region, exception, callbackContext);
		            }
		        });				
			}
			
			@Override
			public void monitoringDidFailForRegion(final Region region, final Exception exception) {
				threadPoolExecutor.execute(new Runnable() {
		            public void run() {
		            	
		            	sendFailEvent("monitoringDidFailForRegionWithError", region, exception, callbackContext);
		            }
		        });			
			}
			
			@Override
			public void didStartMonitoringForRegion(final Region region) {
				threadPoolExecutor.execute(new Runnable() {
		            public void run() {
		            	
		            	try {
		            		JSONObject data = new JSONObject();
		            		data.put("eventType", "didStartMonitoringForRegion");
		            		data.put("region", mapOfRegion(region));
												
							debugLog("didStartMonitoringForRegion: "+ data.toString());
							
							//send and keep reference to callback 
							PluginResult result = new PluginResult(PluginResult.Status.OK,data);
							result.setKeepCallback(true);
							callbackContext.sendPluginResult(result);
							
		   				} catch (Exception e) {
							Log.e(TAG, "'startMonitoringForRegion' exception "+e.getCause());
							monitoringDidFailForRegion(region, e);
						}
		            }
		        });
			}
			
			@Override
			public void didChangeAuthorizationStatus(final String status) {
				threadPoolExecutor.execute(new Runnable() {
		            public void run() {
		            	
		            	try {
		            		JSONObject data = new JSONObject();
		            		data.put("eventType", "didChangeAuthorizationStatus");
							data.put("authorizationStatus",status);
							debugLog("didChangeAuthorizationStatus: "+ data.toString());
							
							//send and keep reference to callback 
							PluginResult result = new PluginResult(PluginResult.Status.OK,data);
							result.setKeepCallback(true);
							callbackContext.sendPluginResult(result);
							
		   				} catch (Exception e) {
		   					callbackContext.error("didChangeAuthorizationStatus error: "+ e.getMessage());
						}
		            }
		        });					
			}
			
			private void sendFailEvent(String eventType, Region region, Exception exception, final CallbackContext callbackContext)  {
				try {
					JSONObject data = new JSONObject();
					data.put("eventType", eventType);//not perfect mapping, but it's very unlikely to happen here
					data.put("region", mapOfRegion(region));
					data.put("error", exception.getMessage());
					
					PluginResult result = new PluginResult(PluginResult.Status.OK,data);
					result.setKeepCallback(true);
					callbackContext.sendPluginResult(result);
				} catch (Exception e) {
					//still failing, so kill all further event dispatch
					Log.e(TAG,eventType + " error "+e.getMessage());
					callbackContext.error(eventType + " error "+e.getMessage());
				}
			}
		};
	}

	//--------------------------------------------------------------------------
    // PLUGIN METHODS
    //--------------------------------------------------------------------------

    /*
     *  onDomDelegateReady:
     *
     *  Discussion:
     *      Called from the DOM by the LocationManager Javascript object when it's delegate has been set.
     *      This is to notify the native layer that it can start sending queued up events, like didEnterRegion, 
     *      didDetermineState, etc.
     *
     *      Without this mechanism, the messages would get lost in background mode, because the native layer
     *      has no way of knowing when the consumer Javascript code will actually set it's delegate on the
     *      LocationManager of the DOM.
     */
    private void onDomDelegateReady(CallbackContext callbackContext) {
    	
    	_handleCallSafely(callbackContext, new ILocationManagerCommand() {

    		@Override
			public PluginResult run() {
				resumeEventPropagationToDom();
				return new PluginResult(PluginResult.Status.OK);
			}
    	});
    }
    
	private void disableDebugNotifications(CallbackContext callbackContext) {

		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				debugEnabled = false;
				IBeaconManager.setDebug(false);
				//android.bluetooth.BluetoothAdapter.DBG = false;
				return new PluginResult(PluginResult.Status.OK);
			}
    	});
	}

	private void enableDebugNotifications(CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				debugEnabled = true;
				//android.bluetooth.BluetoothAdapter.DBG = true;
				IBeaconManager.setDebug(true);
				return new PluginResult(PluginResult.Status.OK);
			}
    	});		
	}

    
	private void disableDebugLogs(CallbackContext callbackContext) {

		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				debugEnabled = false;
				IBeaconManager.setDebug(false);
				//android.bluetooth.BluetoothAdapter.DBG = false;
				return new PluginResult(PluginResult.Status.OK);
			}
    	});
	}

	private void enableDebugLogs(CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				debugEnabled = true;
				//android.bluetooth.BluetoothAdapter.DBG = true;
				IBeaconManager.setDebug(true);
				return new PluginResult(PluginResult.Status.OK);
			}
    	});		
	}

	private void appendToDeviceLog(final String message, CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				
				if (message!=null && !message.isEmpty()) {
					debugLog("[DOM] "+message);
					return new PluginResult(PluginResult.Status.OK,message);
				} else {
					return new PluginResult(PluginResult.Status.ERROR,"Log message not provided");
				}
			}
    	});			
	}
    
    private void startMonitoringForRegion(final JSONObject arguments, final CallbackContext callbackContext) {
        
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				
				Region region = null;
				try {
					region = parseRegion(arguments);
					iBeaconManager.startMonitoringBeaconsInRegion(region);
					
					PluginResult result = new PluginResult(PluginResult.Status.OK);
					result.setKeepCallback(true);
					beaconServiceNotifier.didStartMonitoringForRegion(region);
					return result;
					
				} catch (RemoteException e) {   
		        	Log.e(TAG, "'startMonitoringForRegion' service error: " + e.getCause());
		        	beaconServiceNotifier.monitoringDidFailForRegion(region, e);
			    	return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
				} catch (Exception e) {
					Log.e(TAG, "'startMonitoringForRegion' exception "+e.getCause());
					beaconServiceNotifier.monitoringDidFailForRegion(region, e);
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        }
				
			}

    	});			
    }    
   
    private void stopMonitoringForRegion(final JSONObject arguments, final CallbackContext callbackContext) {
    	
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {

				try {
					Region region = parseRegion(arguments);
					iBeaconManager.stopMonitoringBeaconsInRegion(region);
					
					PluginResult result = new PluginResult(PluginResult.Status.OK);
					result.setKeepCallback(true);
					return result;
					
				} catch (RemoteException e) {   
		        	Log.e(TAG, "'stopMonitoringForRegion' service error: " + e.getCause());
		        	return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
				} catch (Exception e) {
					Log.e(TAG, "'stopMonitoringForRegion' exception "+e.getCause());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        }
				
			}
    	});			

    }
    
    private void startRangingBeaconsInRegion(final JSONObject arguments, final CallbackContext callbackContext) {
        
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				
				try {
					Region region = parseRegion(arguments);
					iBeaconManager.startRangingBeaconsInRegion(region);
					
					PluginResult result = new PluginResult(PluginResult.Status.OK);
					result.setKeepCallback(true);
					return result;
					
				} catch (RemoteException e) {   
		        	Log.e(TAG, "'startRangingBeaconsInRegion' service error: " + e.getCause());
		        	return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
				} catch (Exception e) {
					Log.e(TAG, "'startRangingBeaconsInRegion' exception "+e.getCause());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        }
			}
    	});			
    }
    
    private void stopRangingBeaconsInRegion(final JSONObject arguments, CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				
				try {
					Region region = parseRegion(arguments);
					iBeaconManager.stopRangingBeaconsInRegion(region);
					
					PluginResult result = new PluginResult(PluginResult.Status.OK);
					result.setKeepCallback(true);
					return result;
					
				} catch (RemoteException e) {   
		        	Log.e(TAG, "'stopRangingBeaconsInRegion' service error: " + e.getCause());
		        	return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
				} catch (Exception e) {
					Log.e(TAG, "'stopRangingBeaconsInRegion' exception "+e.getCause());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        }
			}
    	});			
   	
    }
    

    
	private void getAuthorizationStatus(CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {

				try {
					
					//Check app has the necessary permissions
					if (!hasBlueToothPermission()) {
						return new PluginResult(PluginResult.Status.ERROR, "Application does not BLUETOOTH or BLUETOOTH_ADMIN permissions");
					}
					
					//Check the Bluetooth service is running
					String authStatus = iBeaconManager.checkAvailability()
							? "AuthorizationStatusAuthorized" : "AuthorizationStatusDenied";
					JSONObject result = new JSONObject();
					result.put("authorizationStatus",authStatus);
					return new PluginResult(PluginResult.Status.OK, result);
					
				} catch (BleNotAvailableException e) {
					//if device does not support iBeacons and error is thrown
					debugLog("'getAuthorizationStatus' Device not supported: "+e.getMessage());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        } catch (Exception e) {
					debugWarn("'getAuthorizationStatus' exception "+e.getMessage());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        }
				
			}
    	});			
	}
	
	private void requestWhenInUseAuthorization(CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				return new PluginResult(PluginResult.Status.OK);
			}
    	});			
	}
	
	private void requestAlwaysAuthorization(CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

			@Override
			public PluginResult run() {
				return new PluginResult(PluginResult.Status.OK);
			}
    	});			
	}
    
    private void getMonitoredRegions(CallbackContext callbackContext) {
       	
    	_handleCallSafely(callbackContext, new ILocationManagerCommand() {

    		@Override
			public PluginResult run() {
				try {
	    			Collection<Region> regions = iBeaconManager.getMonitoredRegions();
	    			JSONArray regionArray = new JSONArray();
	    			for (Region region : regions) {
						regionArray.put(mapOfRegion(region));
	    			}
					
					return new PluginResult(PluginResult.Status.OK,regionArray);
				} catch (JSONException e) {
					debugWarn("'getMonitoredRegions' exception: "+ e.getMessage());
					return new PluginResult(PluginResult.Status.ERROR,e.getMessage());
				}
			}
    	});
		
	}
    
	private void getRangedRegions(CallbackContext callbackContext) {

		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

    		@Override
			public PluginResult run() {
				try {
	    			Collection<Region> regions = iBeaconManager.getRangedRegions();
	    			JSONArray regionArray = new JSONArray();
	    			for (Region region : regions) {
						regionArray.put(mapOfRegion(region));
	    			}
					
					return new PluginResult(PluginResult.Status.OK,regionArray);
				} catch (JSONException e) {
					debugWarn("'getRangedRegions' exception: "+ e.getMessage());
					return new PluginResult(PluginResult.Status.ERROR,e.getMessage());
				}
			}
    	});
	}

	private void isRangingAvailable(CallbackContext callbackContext) {
	   	
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

    		@Override
			public PluginResult run() {
				try {
					
					//Check the Bluetooth service is running
					boolean available = iBeaconManager.checkAvailability();
					return new PluginResult(PluginResult.Status.OK, available);
					
				} catch (BleNotAvailableException e) {
					//if device does not support iBeacons and error is thrown
					debugLog("'isRangingAvailable' Device not supported: "+e.getMessage());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        } catch (Exception e) {
					debugWarn("'isRangingAvailable' exception "+e.getMessage());
					return new PluginResult(PluginResult.Status.ERROR, e.getMessage());
		        }
			}
    	});
	}

	private void registerDelegateCallbackId(JSONObject arguments, final CallbackContext callbackContext) {
	   	
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

    		@Override
			public PluginResult run() {
				debugLog("Registering delegate callback ID: "+callbackContext.getCallbackId());
				//delegateCallbackId = callbackContext.getCallbackId();
				
				createMonitorCallbacks(callbackContext);
				createRangingCallbacks(callbackContext);
				createManagerCallbacks(callbackContext);
				
				PluginResult result = new PluginResult(PluginResult.Status.OK);
				result.setKeepCallback(true);
				return result;
			}
    	});
		
	}

	/*
	 * Checks if the region is supported, both for type and content
	 */
	private void isMonitoringAvailableForClass(final JSONObject arguments,final CallbackContext callbackContext) {
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {

    		@Override
			public PluginResult run() {
    			
    			boolean isValid = true;
    			try {
    				parseRegion(arguments);
    			} catch (Exception e) {
    				//will fail is the region is circular or some expected structure is missing 
    				isValid = false;
    			}
    			
    			PluginResult result = new PluginResult(PluginResult.Status.OK, isValid);
				result.setKeepCallback(true);
				return result;
 				
			}
    	});		
	}

    private void isAdvertisingAvailable(CallbackContext callbackContext) {
    	
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {
    		@Override
			public PluginResult run() {
    			
    			//not supported at Android yet (see Android L)
    			PluginResult result = new PluginResult(PluginResult.Status.OK, false);
				result.setKeepCallback(true);
				return result;
 				
			}
    	});
		
	}
    
    private void isAdvertising(CallbackContext callbackContext) {
    	
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {
    		@Override
			public PluginResult run() {
    			
    			//not supported on Android
    			PluginResult result = new PluginResult(PluginResult.Status.OK, false);
				result.setKeepCallback(true);
				return result;
 				
			}
    	});
		
	}

	private void startAdvertising(JSONObject arguments, CallbackContext callbackContext) {
		
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {
    		@Override
			public PluginResult run() {
    			
    			//not supported on Android
    			PluginResult result = new PluginResult(PluginResult.Status.ERROR, "iBeacon Advertising is not supported on Android");
				result.setKeepCallback(true);
				return result;
			}
    	});
		
	}

	private void stopAdvertising(CallbackContext callbackContext) {
		
		_handleCallSafely(callbackContext, new ILocationManagerCommand() {
    		@Override
			public PluginResult run() {
    			
    			//not supported on Android
    			PluginResult result = new PluginResult(PluginResult.Status.ERROR, "iBeacon Advertising is not supported on Android");
				result.setKeepCallback(true);
				return result;
 				
			}
    	});
	}


     
    /////////// SERIALISATION /////////////////////

    private Region parseRegion(JSONObject json) throws JSONException, InvalidKeyException, UnsupportedOperationException {
    	
    	if (!json.has("typeName"))
    		throw new InvalidKeyException("'typeName' is missing, cannot parse Region.");

    	if (!json.has("identifier"))
    		throw new InvalidKeyException("'identifier' is missing, cannot parse Region.");

    	String typeName = json.getString("typeName");
    	if (typeName.equals("BeaconRegion")) {
    		return parseBeaconRegion(json);
    	} else if (typeName.equals("CircularRegion")) {
    		return parseCircularRegion(json);
    		
    	} else {
    		throw new UnsupportedOperationException("Unsupported region type");
    	}
    	
    }    

    /* NOT SUPPORTED, a possible enhancement later */
    private Region parseCircularRegion(JSONObject json) throws JSONException, InvalidKeyException, UnsupportedOperationException {
    	
     	if (!json.has("latitude")) 
     		throw new InvalidKeyException("'latitude' is missing, cannot parse CircularRegion."); 
    
     	if (!json.has("longitude")) 
     		throw new InvalidKeyException("'longitude' is missing, cannot parse CircularRegion."); 
    
     	if (!json.has("radius")) 
     		throw new InvalidKeyException("'radius' is missing, cannot parse CircularRegion."); 
    
     	/*String identifier = json.getString("identifier");
     	double latitude = json.getDouble("latitude");
     	double longitude = json.getDouble("longitude");
     	double radius = json.getDouble("radius");
    	*/
     	throw new UnsupportedOperationException("Circular regions are not supported at present");
    }    

    private Region parseBeaconRegion(JSONObject json) throws JSONException, UnsupportedOperationException {
    	
    	String identifier = json.getString("identifier");
    	
    	//For Android, uuid can be null when scanning for all beacons (I think)
    	String uuid = json.has("uuid")&&!json.isNull("uuid") ? json.getString("uuid") : null;
    	Integer major = json.has("major")&&!json.isNull("major") ? json.getInt("major") : null;
    	Integer minor = json.has("minor")&&!json.isNull("minor") ? json.getInt("minor") : null;
    	
    	if (major==null && minor!=null)
    		throw new UnsupportedOperationException("Unsupported combination of 'major' and 'minor' parameters.");
    		
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
    	
    	//NOTE: NOT SUPPORTING CIRCULAR REGIONS
    	return mapOfBeaconRegion(region);

    }
    
    private JSONObject mapOfBeaconRegion(Region region) throws JSONException {
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
       
       dict.put("typeName", "BeaconRegion");
       
       return dict;
  	
    }
    
    /* NOT SUPPORTED */
    /*private JSONObject mapOfCircularRegion(Region region) throws JSONException {
        JSONObject dict = new JSONObject();
        
        // identifier
        if (region.getUniqueId() != null) {
       	 dict.put("identifier", region.getUniqueId());
       }

       //NOT SUPPORTING CIRCULAR REGIONS
       //dict.put("radius", region.getRadius());
       //JSONObject coordinates = new JSONObject();
       //coordinates.put("latitude", 0.0d);
       //coordinates.put("longitude", 0.0d);
       //dict.put("center", coordinates);
       //dict.put("typeName", "CircularRegion");
       
       return dict;
  	
    }*/

    private JSONObject mapOfBeacon(IBeacon region) throws JSONException {
    	JSONObject dict = new JSONObject();
        
    	//beacon id
    	dict.put("uuid", region.getProximityUuid());
        dict.put("major", region.getMajor());
       	dict.put("minor", region.getMinor());

        // proximity
        dict.put("proximity", nameOfProximity(region.getProximity()));

        // signal strength and transmission power
        dict.put("rssi", region.getRssi());
        dict.put("tx", region.getTxPower());

        // accuracy = rough distance estimate limited to two decimal places (in metres)
        // NO NOT ASSUME THIS IS ACCURATE - it is effected by radio interference and obstacles
        dict.put("accuracy", Math.round(region.getAccuracy()*100.0)/100.0);
        
        return dict;
    }

    private String nameOfProximity(int proximity) {
        switch (proximity) {
            case IBeacon.PROXIMITY_NEAR:
                return "ProximityNear";
            case IBeacon.PROXIMITY_FAR:
                return "ProximityFar";
            case IBeacon.PROXIMITY_IMMEDIATE:
                return "ProximityImmediate";
            case IBeacon.PROXIMITY_UNKNOWN:
                return "ProximityUnknown";
            default:
                return "ErrorProximityValueUnknown";
        }
    }
    
	private boolean hasBlueToothPermission()
	{
		Context context = cordova.getActivity();
	    int access = context.checkCallingOrSelfPermission(Manifest.permission.BLUETOOTH);
	    int adminAccess = context.checkCallingOrSelfPermission(Manifest.permission.BLUETOOTH_ADMIN); 
	    		
	    return (access == PackageManager.PERMISSION_GRANTED) && (adminAccess == PackageManager.PERMISSION_GRANTED);
	}

    //////// Async Task Handling ////////////////////////////////
    
    private void _handleCallSafely(CallbackContext callbackContext, final ILocationManagerCommand task) {
    	_handleCallSafely(callbackContext, task,true);
    }
    
    private void _handleCallSafely(final CallbackContext callbackContext, final ILocationManagerCommand task, boolean runInBackground) {
    	if (runInBackground) {
    		new AsyncTask<Void, Void, Void>() {

				@Override
				protected Void doInBackground(final Void... params) {

					try {
						_sendResultOfCommand(callbackContext, task.run());
					} catch (Exception ex) {
						_handleExceptionOfCommand(callbackContext, ex);
					}
					return null;
				}

    		}.execute();
    	} else {
			try {
				_sendResultOfCommand(callbackContext, task.run());
			} catch (Exception ex) {
				_handleExceptionOfCommand(callbackContext, ex);
			}
    	}
    }
    
    private void _handleExceptionOfCommand(CallbackContext callbackContext, Exception exception) {
    	
    	Log.e(TAG, "Uncaught exception: " + exception.getMessage());
    	Log.e(TAG, "Stack trace: " + exception.getStackTrace());
    	
    	// When calling without a callback from the client side the command can be null.
        if (callbackContext == null) {
            return;
        }

		callbackContext.error(exception.getMessage());
    }
    
    private void _sendResultOfCommand(CallbackContext callbackContext, PluginResult pluginResult) {
    	
    	//debugLog("Send result: " + pluginResult.getMessage());
    	if (pluginResult.getStatus()!=PluginResult.Status.OK.ordinal())
    		debugWarn("WARNING: " + PluginResult.StatusMessages[pluginResult.getStatus()]);
    	
    	// When calling without a callback from the client side the command can be null.
        if (callbackContext == null) {
            return;
        }

		callbackContext.sendPluginResult(pluginResult);
    }
        
	private void debugLog(String message) {
		if (debugEnabled) {
			Log.d(TAG, message);
		}
	}
	
	private void debugWarn(String message) {
		if (debugEnabled) {
			Log.w(TAG, message);
		}
	}
    
    //////// IBeaconConsumer implementation /////////////////////

	@Override
	public void onIBeaconServiceConnect() {
		debugLog("Connected to IBeacon service");
	}

	@Override
	public Context getApplicationContext() {
		return cordova.getActivity();
	}

	@Override
	public void unbindService(ServiceConnection connection) {
		debugLog("Unbind from IBeacon service");
		cordova.getActivity().unbindService(connection);
	}

	@Override
	public boolean bindService(Intent intent, ServiceConnection connection, int mode) {
		debugLog("Bind to IBeacon service");
		return cordova.getActivity().bindService(intent, connection, mode);
	}

}
