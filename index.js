var monitor = require('node-usb-detection');
var exec = require('child_process').exec;
var plist = require('plist');
var _ = require('lodash');
var platform = require('os').platform();

var oses = {
  OSX: 'darwin',
  WIN: 'windows'
};

var osxDiskutilCmd = 'diskutil list -plist';

// #TODO:10 move this to config file
garmin = {
  idVendor: 0x091e,
  volumeName: 'GARMIN'
};

monitor.add(function(device){
  if(device.deviceDescriptor.idVendor == garmin.idVendor) {
    console.log('garmin inserted:\n', device)

    if(platform === oses.OSX) {
      var volume
      var interval = setInterval(function(){
        exec(osxDiskutilCmd, function(error, stdout, stderr) {
          var disks = plist.parse(stdout);
          volume = _.find(
            disks.AllDisksAndPartitions,
            _.matchesProperty('VolumeName', garmin.volumeName)
          );
          if(volume !== undefined && volume.MountPoint !== undefined) {
            clearInterval(interval);
            volumeIsMounted();
          }
        });

      }, 1000);
    }else if(platform === oses.WIN) {
      // TODO handle volume mount delay in windows...
    }
  }
});

function volumeIsMounted() {
  // #TODO:0 Find activities and start uploading
}
