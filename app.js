var _ = require('lodash');
var colors = require('colors');
var config = require('./config.json');
var exec = require('child_process').exec;
var fs = require('fs');
var monitor = require('node-usb-detection');
var open = require('open');
var platform = require('os').platform();
var plist = require('plist');
var Progress = require('node-progress').get();
_.extend(process.env, config.env);

// Must initialise after extending the 'process.env' object with
// our config settings
var strava = require('strava-v3');

var garminStravaAutomator = (function(){
  var checkVolumeInterval;
  var osxDiskutilCmd = 'diskutil list -plist';
  var osxRSync = 'rsync -aviuP {src} {dest} --remove-source-files';// --dry-run
  var progress = new Progress();

  var os = {
    DARWIN: 'darwin',
    WIN: 'windows'
  };

  var onDeviceInserted = function(device){
    if(device.deviceDescriptor.idVendor == config.garmin.idVendor) {
      console.log('Garmin detected.'.bold.yellow);

      if(platform === os.DARWIN) {
        var volume;
        progress.setProgressMessage('Waiting for volume to mount');
        progress.start();
        checkVolumeInterval = setInterval(checkVolumeIsMounted, 500);
      }else if(platform === os.WIN) {
        // #TODO:20 handle volume mount delay in windows...
      }
    }
  };

  var checkVolumeIsMounted = function() {
    exec(osxDiskutilCmd, function(error, stdout, stderr) {
      var disks = plist.parse(stdout);
      volume = _.find(
        disks.AllDisksAndPartitions,
        _.matchesProperty('VolumeName', config.garmin.volumeName)
      );
      if(volume !== undefined && volume.MountPoint !== undefined) {
        volumeIsMounted(volume.MountPoint);
        if(checkVolumeInterval !== undefined) {
          clearInterval(checkVolumeInterval);
        }
      }
    });
  };

  var volumeIsMounted = function(volumePath) {
    progress.finish();
    console.log("Volume is mounted at:", volumePath);

    var activityPath = volumePath + config.garmin.activityPath;
    var activities = fs.readdirSync(activityPath);
    var files = _.filter(activities, function(fn){
      return /(.fit|.gpx|.tcx)$/.test(fn);
    });
    var fileCount = files.length;
    progress.setProgressMessage('Uploading');
    progress.start();
    _.forEach(files, function(file){
      var ext = file.match(/(?!\.)([0-9a-z]){3}$/i)[0];
      console.log('Uploading file:'.yellow, file);

      var statusCallback = function(err,payload) {

        if(payload.error !== null) {
          console.log("statusCallback:\n",payload);
        }
        if(payload.activity_id !== null){
          var url = 'https://www.strava.com/activities/' + payload.activity_id;
          open(url);
          console.log("Activity processed, opening:".yellow, url.yellow);
        }
      };
      strava.uploads.post({
        data_type: ext,
        file: activityPath + file,
        statusCallback: _.debounce(statusCallback, 5000)
      },function(err,payload) {
        if(err!==null){
          console.log('error:\n',err);
        } else {
          console.log('complete:\n',payload);
        }
        if(--fileCount === 0){
          uploadComplete(volumePath);
          progress.finish();
        }
      });
    });
  };

  var uploadComplete = function(volumePath){
    console.log('Activities uploaded.'.bold.yellow);
    var activityPath = volumePath + config.garmin.activityPath;
    if(platform === os.DARWIN) {
      osxRSyncFinal = osxRSync.slice()
        .replace('{src}',activityPath)
        .replace('{dest}',config.dropboxPath.replace(/ /g,'\\ '));
      // console.log(osxRSyncFinal);
      exec(osxRSyncFinal, function(error, stdout, stderr) {
        // console.log(stdout);
        console.log("Activities copied to " + config.dropboxPath);
      });
    }else if(platform === os.WIN) {
      // #TODO:0 Backup activities on windows machines
    }
  };

  return {
    init: function(){
      monitor.add(onDeviceInserted);
      console.log('Listening for Garmin USB devices.'.bold.yellow);
      checkVolumeIsMounted();
    }
  };
})();

garminStravaAutomator.init();
