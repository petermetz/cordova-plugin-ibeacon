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

import 'dart:io';
import 'dart:convert';
import 'dart:async';

final String TEST_PROJECT_NAME = 'cordova-plugin-ibeacon-xcode-test';
final String CORDOVA = 'cordova';

final Uri script = Platform.script;
final Directory scriptDir = new Directory.fromUri(script);
final String scriptDirPath = scriptDir.path;

final Uri testWwwAssetsUri = script.resolve('test_www_assets');
final Directory testWwwAssetsDir = new Directory.fromUri(testWwwAssetsUri);

final Uri testDirUri = script.resolve('./');
final Uri scriptParent = script.resolve('../');

final Directory testDir = new Directory.fromUri(testDirUri);
final String xcodeProjRelativePath = '/platforms/ios/$TEST_PROJECT_NAME.xcodeproj';

File xcodeProjFile = null;
Directory tmpDir = null;
Directory testProjectRooot = null;

main() {

  if (!Platform.isMacOS) {
    stderr.writeln('Sorry! The test runner only works on OS X.');
    exit(-1);
  }

  checkIfBinaryIsAvailable('node');
  checkIfBinaryIsAvailable('npm');
  checkIfBinaryIsAvailable('cordova');
  checkIfBinaryIsAvailable('xcodebuild');

  tmpDir = Directory.systemTemp.createTempSync('test_project_');
  print('Created tmp dir: ${tmpDir.path}');

  testProjectRooot = new Directory('${tmpDir.path}/$TEST_PROJECT_NAME');
  print('Test project`s root: ${testProjectRooot.path}');

  xcodeProjFile = new File('${testProjectRooot.path}$xcodeProjRelativePath');
  print('XCodeProj file path: $xcodeProjFile');

  createCordovaProject().then((exitCode) => addPlatforms().then((exitCode) =>
  addPlugin().then((exitCode) => openInXCode().then((exitCode) {

    print('Press any key to clean up the resources on the file-system.');
    stdin.readLineSync(encoding: UTF8, retainNewlines: true);

    print('Deleting $tmpDir recursively...');
    tmpDir.deleteSync(recursive: true);

    print('Test runner finished.');
  }))));

}

void checkIfBinaryIsAvailable(String binaryName) {
  ProcessResult whichNpm = Process.runSync('which', [binaryName]);
  if (whichNpm.exitCode != 0) {
    stderr.writeln('You need to have $binaryName on the path.');
    exit(-2);
  }
}

Future<int> prepareProject() {
  print('Running cordova prepare on the generated project...');
  return _runProcess(CORDOVA, ['prepare'], workingDirectory:
  testProjectRooot.path);
}

Future<int> openInXCode() {
  print('Opening generated test project in XCode.');
  return _runProcess('open', [xcodeProjFile.path], workingDirectory:
  xcodeProjFile.parent.path);
}

Future<int> addPlugin() {
  print('Adding the plugin to the generated project...');
  List<String> processArgs = ['plugin', 'add', scriptParent.path];
  return _runProcess(CORDOVA, processArgs, workingDirectory:
  testProjectRooot.path);
}

Future<int> addPlatforms() {
  print('Adding platforms to the generated project...');
  List<String> processArgs = ['platform', 'add', 'ios'];
  return _runProcess(CORDOVA, processArgs, workingDirectory:
  testProjectRooot.path);
}

Future<int> createCordovaProject() {
  print('Creating cordova project...');
  List<String> processArgs = ['create', testProjectRooot.path, 'com.example',
  TEST_PROJECT_NAME, '--link-to', testWwwAssetsDir.path];
  return _runProcess(CORDOVA, processArgs);
}

Future<int> _runProcess(String binary, List<String>
processArgs, {workingDirectory: null}) {
  Future<Process> process = null;
  if (workingDirectory != null) {
    process = Process.start(binary, processArgs, workingDirectory:
    workingDirectory, includeParentEnvironment: true);
  } else {
    process = Process.start(binary, processArgs, workingDirectory: tmpDir.path,
    includeParentEnvironment: true);
  }

  Completer completer = new Completer();
  process.then((process) {
    process.stdout.transform(new Utf8Decoder()).transform(new LineSplitter()
    ).listen((String line) => print(line));
    process.stderr.transform(new Utf8Decoder()).transform(new LineSplitter()
    ).listen((String line) => print(line));
    process.exitCode.then((int exitCode) => completer.complete(exitCode));
  });
  return completer.future;
}
