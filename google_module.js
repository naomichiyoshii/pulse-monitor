var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var responseRRI = [];

var google_module = {};


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

google_module.init = function() {
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), setAuth);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

var sheets = google.sheets('v4');
var auth, activeSheet, raw_activeSheet, sheettitle, rawsheettitle;
var SPREADSHEET_ID = "1_blqESLe2bVW3yUqcXVRejwtizhntQBNv__wv3ZY0ww";

function setAuth(a) {
  auth = a;
  console.log(auth);
}

google_module.createSheet = function(callback) {
  var requests = [];
  sheets.spreadsheets.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    sheettitle = "sheet" + (((response.sheets.length) / 2) + 1);
    rawsheettitle = "raw_" + sheettitle;
    console.log("Sheettitle is " + sheettitle);
    console.log("raw_Sheettitle is " + rawsheettitle);
    requests.push({
      addSheet: {
        properties: {
          index: 0,
          title: sheettitle
        }
      }
    });
    requests.push({
      addSheet: {
        properties: {
          index: 0,
          title: rawsheettitle
        }
      }
    });
    var batchUpdateRequest = {
      requests: requests
    }
    sheets.spreadsheets.batchUpdate({
      auth: auth,
      spreadsheetId: SPREADSHEET_ID,
      resource: batchUpdateRequest,
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      activeSheet = sheettitle;
      raw_activeSheet = rawsheettitle;
      console.log("Sheet '" + activeSheet + "' was created!");
      console.log("Sheet '" + raw_activeSheet + "' was created!");
      callback();
    });


  });
};

google_module.appendData = function(data) {
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    valueInputOption: "USER_ENTERED",
    range: activeSheet + "!A1",
    resource: {
      values: data
    }
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log("Appennded");
  });
};

google_module.appendRawdata = function(data) {
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    valueInputOption: "USER_ENTERED",
    range: raw_activeSheet + "!A1",
    resource: {
      values: data
    }
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log("rawdata Appended");
  });
};

google_module.setAnalysisData = function(callback) {
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: "sheet3!B1:B157",
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log('response.values.length: ' + response.values.length);
    if (response.values.length > 0) {
      responseRRI = [];
      for (var i = 0; i < response.values.length; i++) {
        responseRRI.push(response.values[i]);
      }
      console.log("Get RRI");
    }
    callback(responseRRI);
  });
}

module.exports = google_module;
