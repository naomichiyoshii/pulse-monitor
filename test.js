var GoogleSpreadsheet = require('google-spreadsheet');
var dataset = {};
var my_sheet = new GoogleSpreadsheet("1_blqESLe2bVW3yUqcXVRejwtizhntQBNv__wv3ZY0ww");
var credentials = require('./My Project-fe2e8436da48.json');
var sheet;

setInterval(function() {
my_sheet.useServiceAccountAuth(credentials, function(err){
    my_sheet.getInfo(function(err, data){
      //console.log(data);
      sheet = data; //あとから使えるように外部スコープに保存
      for(var i in sheet.worksheets) {
          if(sheet.worksheets[i].title === 'sheet3') {
              // sheet.worksheets[i].getRows( function( err, rows ) {
              //     for(var i in rows) {
              //         console.log(rows[i]);
              //     }
              // });
              var nowTime = new Date();
              dataset["col1"] = nowTime;
              dataset["col2"] = "愛生";
              dataset["col3"] = "千葉";
              sheet.worksheets[i].addRow(dataset);
          }
      }
    });


});

}, 1000);
