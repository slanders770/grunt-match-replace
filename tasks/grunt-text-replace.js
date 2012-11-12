/*    
  
  grunt-text-replace
  General purpose text-replacement for grunt.

  Copyright (c) 2012 Jonathan Holmes. 
  Licensed under the MIT license. 
  
*/

"use strict";

var path, plugin, grunt;

module.exports = function (referenceToGrunt) {
  grunt = referenceToGrunt;
  plugin.registerPluginTask();
};

path = require('path');

plugin = {

//------------------------------------------------------------------------------
// Define the DATA that will be used by the plugin
//------------------------------------------------------------------------------

  gruntTask: {},
  
  get sourceFiles () {
    return this.gruntTask.data.src;
  },

  get sourceFilePaths () {
    return grunt.file.expandFiles(this.sourceFiles);
  },
  
  get replacements () {
    return this.gruntTask.data.replacements;
  },

  get pathToDestination () {
    return this.gruntTask.data.dest;
  },

  get isDestinationDefined () {
    return typeof this.pathToDestination !== 'undefined';
  },

  get isOverwriteTrue () {
    return (typeof this.gruntTask.data.overwrite !== 'undefined') && 
      this.gruntTask.data.overwrite;
  },

  get isDestinationDirectory () {
    return (/\/$/).test(this.pathToDestination);
  },

  errorMessages: {
    noTargets: "No targets were found. Remember to wrap functionality within " +
      "a target.",
    noSourceFiles: "No source files found",
    noDestination: "Destination is not defined! If you want to overwrite " +
      "files, then make sure to set overwrite: true. If you don't wish to " +
      "overwrite, then make sure to set a destination",
    overwriteFailure: "You've set overwrite to true. If you want to " + 
      "overwrite files, remove the destination. If you want to send files " +
      "to a destination, then ensure overwrite is not set to true",
    multipleSourceSingleDestination: "Cannot write multiple files to same " +
      "file. If you wish to export to a directory, make sure there is a " + 
      "trailing slash on the destination. If you wish to write to a single " +
      "file, make sure there is only one source file"
  },

//------------------------------------------------------------------------------
// Define the BEHAVIOUR of the plugin
//------------------------------------------------------------------------------
  
  registerPluginTask: function () {
    grunt.registerMultiTask('replace', 
      'General purpose text-replacement for grunt', 
      this.runTheTextReplaceMultiTask);
  },

  runTheTextReplaceMultiTask: function () {  
    var referenceToGrunkTask = this;
    plugin.saveGruntTask(referenceToGrunkTask);
    plugin.checkForErrors();
    plugin.makeAllReplacements();
  },

  saveGruntTask: function (gruntTask) {
    this.gruntTask = gruntTask;
  },

  checkForErrors: function () {
  //  this.failIfNoTargetsDefined();
    this.failIfNoDestinationDefined();
    this.failIfOverwriteNotPossible();
    this.failIfNoSourceFilesFound();
    this.failIfCannotRectifyDesintation();
  },

  failIfNoTargetsDefined: function () {
    if (false = (this.pathToDestination || this.sourceFiles || 
      this.replacements)) {
      grunt.warn(this.errorMessages.noTargets);
    }
  },

  failIfNoDestinationDefined: function () {
    if (this.isDestinationDefined === false && 
        this.isOverwriteTrue === false) {
      grunt.warn(this.errorMessages.noDestination);
    }
  },

  failIfOverwriteNotPossible: function () {
    if (this.isDestinationDefined && this.isOverwriteTrue) {
      grunt.warn(this.errorMessages.overwriteFailure);
    }
  },

  failIfNoSourceFilesFound: function () {
    if (this.sourceFiles.length === 0) {
        grunt.warn(this.errorMessages.noSourceFiles);
    }
  },

  failIfCannotRectifyDesintation: function () {
    if (this.isDestinationDirectory === false && this.sourceFiles.length > 1 && 
      this.isOverwriteTrue === false) {
      grunt.warn(this.errorMessages.multipleSourceSingleDestination);    
    }
  },

  makeAllReplacements: function () {
    this.sourceFilePaths.forEach(function (pathToFile) {
      plugin.makeReplacementsToFile(pathToFile);
    });
  },

  makeReplacementsToFile: function (pathToFile) {
    var pathToWriteTo = this.getWriteToPathForFile(pathToFile);      
    grunt.file.copy(pathToFile, pathToWriteTo, {
      process: this.makeReplacementsToText
    });
  },

  getWriteToPathForFile: function (pathToFile) {
    var fileName = path.basename(pathToFile), 
      destination;
    if (this.isOverwriteTrue) {
      destination = pathToFile;
    } else {
      destination = this.pathToDestination + 
        (this.isDestinationDirectory ? fileName : '');
    }
    return destination;
  },

  makeReplacementsToText: function (fileContents) {
    plugin.replacements.forEach(function (replacement) {
      fileContents = fileContents.replace(replacement.from, replacement.to);
    });
    return fileContents;
  }
};