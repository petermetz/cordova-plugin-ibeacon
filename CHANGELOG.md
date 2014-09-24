# 3.1.1

## Fixed bugs

* Fixed a bug when installing the plugin sometimes resulted in broken Javascript source files that contained syntax 
errors and stopped apps from working after the plugin has been added to the project. 

# 3.1.0

## Features

* Two new methods were added to manage new permissions introduced by iOS 8

* ```BeaconRegion```s now support the parameter ```notifyEntryStateOnDisplay``` in their constructor.

## Breaking Changes

* On iOS 8, the beacon interaction won't work without explicitly asking for permission from the user.


# 3.0.0

## Breaking Changes

* The plugin received a new ID. Previously it was ```org.apache.cordova.ibeacon``` and now it runs as 
```com.unarin.cordova.beacon```. To perform an upgrade from earlier versions with the old ID, you'll have to remove
and add the plugin again with the cordova cli commands: ```cordova plugin rm org.apache.cordova.ibeacon``` and then
```cordova plugin add com.unarin.cordova.beacon``` to get the latest version. You can have a look at the PhoneGap Build
submission [here](https://build.phonegap.com/plugins/986).
