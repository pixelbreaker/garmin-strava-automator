Garmin Strava Automator
=======================

### Installation
Clone this repository to your machine, then run `npm install` to install all
node dependencies.

#### Strava Access Token Generation
You will need to create your own application on strava in
[Settings -> My API Application](https://www.strava.com/settings/api).

Make a copy of `config.sample.json` and save it as `config.json` then add the
Client ID, Client Secret and Access Token from your API Application page to the
"env" properties in `config.json`.

On your API Application page set the 'Authorization Callback Domain' to be
`http://localhost`.

The default access token only has public permissions, which are insufficient to
upload files, so we need to request `write` permissions from the API.
