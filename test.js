var GoogleSpreadsheet = require('google-spreadsheet');

var my_sheet = new GoogleSpreadsheet("1_blqESLe2bVW3yUqcXVRejwtizhntQBNv__wv3ZY0ww");
var credentials = require('./google-generated-creds.json');

var sheet;
my_sheet.useServiceAccountAuth(credentials, function(err){
    my_sheet.getInfo(function(err, data){
      console.log(data);
      sheet = data; //あとから使えるように外部スコープに保存
      for(var i in sheet.worksheets) {
          if(sheet.worksheets[i].title === 'シート1') {
              sheet.worksheets[i].getRows( function( err, rows ) {
                  for(var i in rows) {
                      console.log(rows[i]);
                  }
              });
          }
      }
    });


});
