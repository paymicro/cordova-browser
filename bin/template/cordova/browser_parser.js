/**
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

/* jshint sub:true */

var fs = require('fs'),
    path = require('path'),
    shell = require('shelljs'),
    CordovaError = require('cordova-common').CordovaError;

function dirExists(dir) {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

function browser_parser(project) {
    if (!dirExists(project) || !dirExists(path.join(project, 'cordova'))) {
        throw new CordovaError('The provided path "' + project + '" is not a valid browser project.');
    }
    this.path = project;
}

module.exports = browser_parser;

// Returns a promise.
browser_parser.prototype.update_from_config = function() {
    return Promise.resolve();
};

browser_parser.prototype.www_dir = function() {
    return path.join(this.path, 'www');
};

// Used for creating platform_www in projects created by older versions.
browser_parser.prototype.cordovajs_path = function(libDir) {
    var jsPath = path.join(libDir, 'cordova-lib', 'cordova.js');
    return path.resolve(jsPath);
};

browser_parser.prototype.cordovajs_src_path = function(libDir) {
    //console.log("cordovajs_src_path");
    var jsPath = path.join(libDir, 'cordova-js-src');
    return path.resolve(jsPath);
};

// Replace the www dir with contents of platform_www and app www.
browser_parser.prototype.update_www = function() {
    var projectRoot = this.path;
    var app_www = path.join(this.path,"../../www");
    var platform_www = path.join(this.path, 'platform_www');
    var my_www = this.www_dir();

    // Clear the www dir
    shell.rm('-rf', my_www);
    shell.mkdir(my_www);

    // Copy over all app www assets
    var srcPath = path.join(app_www,'*');

    var ls = shell.ls(srcPath);
    shell.cp('-rf', srcPath, my_www);
    // Copy over stock platform www assets (cordova.js)
    shell.cp('-rf', path.join(platform_www, '*'), my_www);
};

browser_parser.prototype.update_overrides = function() {
    // console.log("update_overrides");
    return;
    // TODO: ?
    // var projectRoot = util.isCordova(this.path);
    // var mergesPath = path.join(util.appDir(projectRoot), 'merges', 'browser');
    // if(fs.existsSync(mergesPath)) {
    //     var overrides = path.join(mergesPath, '*');
    //     shell.cp('-rf', overrides, this.www_dir());
    // }
};

browser_parser.prototype.config_xml = function(){
    return path.join(this.path, 'config.xml');
};

// Returns a promise.
browser_parser.prototype.update_project = function(cfg) {
    var defer = this.update_from_config();
    var self = this;
    var www_dir = self.www_dir();
    defer.then(function(){
        self.update_overrides();
        // Copy munged config.xml to platform www dir
        shell.cp('-rf', path.join(www_dir, '..', 'config.xml'), www_dir);
    });
    return defer;
};
