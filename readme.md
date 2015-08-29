Garmin Strava Automator
=======================

### What is it?
Garmin Strava Automator [GSA] takes the pain out of uploading your activities
after a long ride or run. Get home, plug your Garmin device into your Mac (Window support soon...) and GSA uploads the activity to Strava, and
backs up your activity files from your Garmin to your chosen location (I
  use Dropbox). It then cleans up your activities from the Garmin, freeing up
  scare memory.

### Installation
Clone this repository to your machine, then run `npm install` to install all
node dependencies.

Next make a copy of `config.sample.json` and save it as `config.json`.

#### Garmin setup
You need to configure where you want to grab activities from on your device,
where your device normally mounts and where you want to copy activities to as
backup.

You can set all these options in config.json.

```
{
  "env": {
    ...
  },
  "garmin": {
    "idVendor": 2334,
    "volumeName": "GARMIN",
    "activityPath": "/Garmin/Activities/"
  },
  "dropboxPath": "~/Dropbox/Garmin Backups/"
}
```

`idVendor` as far as I know is fixed for all Garmins as 2334 (0x91E), but if
yours doesn't work you can find it out and change it here. To find it run
`system_profiler SPUSBDataType` and find your device in there. You'll need to
convert the number from hex to dec so it can be stored in JSON format.

#### Strava Access Token Generation
You will need to create your own application on Strava in
[Settings -> My API Application](https://www.strava.com/settings/api).

Make a copy of `config.sample.json` and save it as `config.json` then add the
Client ID, Client Secret and Access Token from your API Application page to the
"env" properties in `config.json`.

It should look something like this:
```
{
  "env": {
  	"STRAVA_ACCESS_TOKEN": "f7e50f461da110ca62b74a31c5652631f7e50f46",
  	"STRAVA_CLIENT_SECRET": "ec679d3d9ba115d9906e23efa2eb68ef2af3c1c",
  	"STRAVA_CLIENT_ID": "1234",
  	"STRAVA_REDIRECT_URI": "http://localhost"
  }...
```

On your API Application page set the 'Authorization Callback Domain' to be
`http://localhost`.

The default access token only has public permissions, which are insufficient to
upload files, so we need to request `write` permissions from the API.

To do this simply run

```
node app-setup
```

This will launch your browser and go to strava to request authorization for
this local application. Approve it and when redirected, select the new `code`
value from the url you are redirected to. You want to copy everything after
`code=` in the url below

```
http://localhost/?state=&code=7a29cc1ae49c0e0148620cadd69196a19b33be1f
```
Paste that code into the terminal as prompted.

That's it, you're authorized to upload to Strava.

### Running GSA
To run GSA just
```
node app
```

If you want to run if in the background, all the time...
