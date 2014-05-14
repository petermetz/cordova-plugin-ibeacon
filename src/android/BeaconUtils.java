package com.thinketg.plugin.ibeacongap;

import java.util.ArrayList;
import java.util.Collection;

import android.util.Log;

import com.radiusnetworks.ibeacon.*;
import com.radiusnetworks.ibeacon.IBeaconData;
import com.radiusnetworks.ibeacon.client.DataProviderException;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.TaskStackBuilder;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.ServiceConnection;

import android.os.RemoteException;


public class BeaconUtils implements IBeaconConsumer, RangeNotifier, IBeaconDataNotifier {

    private Context context;
    private IBeaconManager iBeaconManager;
    protected static final String TAG = "BeaconUtils";
    
    private Activity myActivity;
    private Region currentRegion;
    
    public ArrayList<IBeacon> myBeacons = new ArrayList<IBeacon>();
    
    public void stopScanning() {
        try {
            this.iBeaconManager.stopRangingBeaconsInRegion(currentRegion);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    public void startScanning() {
        try {
            this.iBeaconManager.startRangingBeaconsInRegion(currentRegion);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    public BeaconUtils(Context context) {
        this.context = context;
        this.myActivity = (Activity)this.context;
        
        this.iBeaconManager = IBeaconManager.getInstanceForApplication(this.myActivity.getApplicationContext());
        this.iBeaconManager.bind(this);
        
//        verifyBluetooth((Activity) context);
    }

//    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    public static void verifyBluetooth(final Activity activity) {

        try {
            if (!IBeaconManager.getInstanceForApplication(activity).checkAvailability()) {
                final AlertDialog.Builder builder = new AlertDialog.Builder(activity);
                builder.setTitle("Bluetooth not enabled");
                builder.setMessage("Please enable bluetooth in settings and restart this application.");
                builder.setPositiveButton(android.R.string.ok, null);
                builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
                    @Override
                    public void onDismiss(DialogInterface dialog) {
                        activity.finish();
                        //System.exit(0);
                    }
                });
                builder.show();
            }
        } catch (RuntimeException e) {
            final AlertDialog.Builder builder = new AlertDialog.Builder(activity);
            builder.setTitle("Bluetooth LE not available");
            builder.setMessage("Sorry, this device does not support Bluetooth LE.");
            builder.setPositiveButton(android.R.string.ok, null);
            builder.setOnDismissListener(new DialogInterface.OnDismissListener() {

                @Override
                public void onDismiss(DialogInterface dialog) {
                    activity.finish();
                    //System.exit(0);
                }

            });
            builder.show();

        }
    }

    @Override
    public void onIBeaconServiceConnect() {
        currentRegion = new Region("MainActivityRanging", null, null, null);
        try {
//            this.iBeaconManager.startMonitoringBeaconsInRegion(region);
            this.iBeaconManager.setRangeNotifier(this);
            this.iBeaconManager.startRangingBeaconsInRegion(currentRegion);
        } catch (RemoteException e) {
            e.printStackTrace();
        }

        this.iBeaconManager.setMonitorNotifier(new MonitorNotifier() {
            @Override
            public void didEnterRegion(Region region) {
                //createNotification();
                Log.i(TAG, "I am in the range of an IBEACON: "+region.getProximityUuid());
                //SyncServiceHelper.getInst().trySyncOffers(region.getProximityUuid());
            }

            @Override
            public void didExitRegion(Region region) {
                NotificationManager mNotificationManager;
                mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                mNotificationManager.cancel(0);
            }

            @Override
            public void didDetermineStateForRegion(int state, Region region) {
                Log.i(TAG, "I have just switched from seeing/not seeing iBeacons: " + region.getProximityUuid());
//                createNotification();
            }
        });
    }

    @Override
    public Context getApplicationContext() {
        return this.context;
    }

    @Override
    public void unbindService(ServiceConnection serviceConnection) {
        this.context.unbindService(serviceConnection);
//        this.iBeaconManager.unBind(this);
    }

    @Override
    public boolean bindService(Intent intent, ServiceConnection serviceConnection, int i) {
//        this.iBeaconManager.bind(this);
        return this.context.bindService(intent, serviceConnection, i);
//        return true;
    }

    @Override
    public void iBeaconDataUpdate(IBeacon iBeacon, IBeaconData iBeaconData, DataProviderException e) {
        if (e != null) {
            Log.d(TAG, "data fetch error:" + e);
        }
        if (iBeaconData != null) {
            String displayString = iBeacon.getProximityUuid() + " " + iBeacon.getMajor() + " " + iBeacon.getMinor() + "\n" + "Welcome message:" + iBeaconData.get("welcomeMessage");
            Log.d(TAG, displayString);
        }
    }

    @Override
    public void didRangeBeaconsInRegion(Collection<IBeacon> iBeacons, Region region) {
        for (IBeacon iBeacon : iBeacons) {
            iBeacon.requestData(this);
            
            String displayString = iBeacon.getProximityUuid() + " " + iBeacon.getMajor() + " " + iBeacon.getMinor() + "\n";

            Log.d(TAG, displayString);
        }
        
        myBeacons.clear();
        myBeacons.addAll(iBeacons);
        
    }

//    private void createNotification() {
//        Notification.Builder builder =
//                new Notification.Builder(context)
//                        .setContentTitle("New beacon in range")
//                        .setContentText("You are currently in the range of a new beacon.");
////                        .setSmallIcon(R.drawable.ic_launcher);
//
//        TaskStackBuilder stackBuilder = TaskStackBuilder.create(context);
//        stackBuilder.addNextIntent(new Intent(context, MainActivity.class));
//        PendingIntent resultPendingIntent =
//                stackBuilder.getPendingIntent(
//                        0,
//                        PendingIntent.FLAG_UPDATE_CURRENT
//                );
//        builder.setContentIntent(resultPendingIntent);
//        NotificationManager notificationManager =
//                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
//        notificationManager.notify(1, builder.build());
//    }
}