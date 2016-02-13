#!/usr/bin/env bash

set -x

PLUGIN_ID="com.unarin.cordova.beacon"
PATH_TO_LOCAL_PLUGIN_DIR="${HOME}/projects/cordova-plugin-ibeacon/"


./node_modules/cordova/bin/cordova plugin rm $PLUGIN_ID;

./node_modules/cordova/bin/cordova platform rm android;
./node_modules/cordova/bin/cordova platform add android;

./node_modules/cordova/bin/cordova plugin add $PATH_TO_LOCAL_PLUGIN_DIR