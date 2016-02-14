# iBeacon Cordova Plugin - Frequently Asked Questions

### How do I debug notifications in the background?

Enable the debug logging and inspect the console logs of your device through XCode.


### I would like to customise how frequently the AltBeacon library scans for proximity devices (beacons). How do I do that?

Introduce an Android specific preference in your config.xml, something like this:
    <preference name="com.unarin.cordova.beacon.android.altbeacon.ForegroundBetweenScanPeriod" value="5000" />
This will ensure that the AltBeacon library will wait five seconds in-between foreground scans.
The default is 0 for the mentioned configuration value.
