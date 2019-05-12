# 3.8.1
- Fixing botched plugin id in release of v3.8.0.

# 3.8.0

- 40abc3b feat: add ARMA filter support for distance calcs
- f2fe545 build(android): updated to latest published altbeacon library
- 0fa7553 fix(build): upgrades commitlint  CLI due to vulnerability
- 7a0472a fix(ios): location manager no longer handles other instances messages

# 3.6.1

* Fixes: https://github.com/petermetz/cordova-plugin-ibeacon/issues/259

# 3.6.0

* Android now allows the usage of wildcard UUIDs by passing in `cordova.plugins.locationManager.BeaconRegion.WILDCARD_UUID`
    as the UUID of a BeaconRegion (constructor)

# 3.5.6

* iOS 11 .plist compatibility added (`NSLocationAlwaysAndWhenInUseUsageDescription`)
    - https://github.com/petermetz/cordova-plugin-ibeacon/issues/322

# 3.5.5

* Fixes: https://github.com/petermetz/cordova-plugin-ibeacon/issues/323
    - Upgrades to the latest stable AltBeacon library at present (v2.12.4)

# 3.5.4

* Fix: Cordova Android 7.0.0 build issues averted:
    - https://github.com/petermetz/cordova-plugin-ibeacon/pull/337

# 3.5.3

* Fix: WKWebView crash no longer happens
    - https://github.com/petermetz/cordova-plugin-ibeacon/pull/326

# 3.5.2

* Feature: Stop advertising as iBeacon is now implemented on the Android platform as well.

# 3.5.1

* Hot-fix: syntax errors fixed in Android

# 3.5.0

* Upgraded AltBeacon to v2.11
* iBeacon advertising added for Android: https://github.com/petermetz/cordova-plugin-ibeacon/pull/282/commits/85967c962acd0ba50b5f1ccce89c3e28873e4530
* Smaller fixes/updates

# 3.4.1

## Backwards Compatibility
* Plugin is now once again usable with Android SDK targets below 23 (Marshmallow)

# 3.4.0

## Features
* New Feature: You can now configure the foreground scan between period (Android) directly from
the config.xml file of your Cordova project.
* Dependency updated: AltBeacon jar is now on version 2.7.1.
* Important for contributors: The Android source code has been reformatted with Android Studio, the
indentation is now 4 spaces instead of a mixture of tabs and spaces. These changes were on commits
that have no other changes contained in them.

# 3.3.0

## Features

* New feature: ```enableBluetooth```/```disableBluetooth``` (Android only) (Thanks to @akreienbring)
* New feature: ```isBluetoothEnabled```
* AltBeacon library backend for Android version (Thanks to @RonMen)

# 3.2.2

## Features

* New feature added: ```requestStateForRegion``` (iOS only)

# 3.2.0

## Breaking Changes

* Klass dependency has been removed. Therefore ```cordova.plugins.LocationManager.Delegate``` entity no longer supports
implements and any callbacks mys override the default callbacks directly. See ```ReadMe.md``` for examples of how to use
 Delegate since this change

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

# 2.1.0 (10.08.2014)
* API for Advertising added to 2.0 design (support for iOS only).
* Distance approximation called 'accuracy' added to Ranging callback
* Beacon Tx value added (Android only)

# 2.0.0 (06.07.2014)
* Redesigned to use **Promise** .then() .fail(), .done() for method callbacks
* Singleton **Delegate** object implementation for event handling
* Android support added
* Monitoring and Ranging support for iOS and Android

# 1.0.0 (05.04.2014)
* iOS API for Advertising, Ranging and Monitoring on iOS.

# 0.2.0 (20.03.2014)
* Wrote proper documentation and retested all the functionality. No API change introduced.

# 0.1.0 (14.02.2014)
* Beta version created.
