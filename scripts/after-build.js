const fs = require('fs');
// const cheerio = require('cheerio');
// const moment = require('moment');

const indexFilePath = 'dist/browser/index.html';

const newsletterFileFromPath = 'academig_daily_template.html';
const newsletterFileToPath = 'dist/academig_daily_template.html';

fs.createReadStream(newsletterFileFromPath).pipe(fs.createWriteStream(newsletterFileToPath));

fs.readFile(indexFilePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = data.replace(/pk_test_2RHNxcJmlF4eMUlTNiA4Mafn/g, 'pk_live_tgg8wsbknoKTJcOPuahXPEtv');
  var result = result.replace(/c367913a2486a422f3ab/g, 'db20eafbf3648a36d4d0');

  fs.writeFile(indexFilePath, result, 'utf8', function (err) {
   if (err) return console.log(err);
   console.log('Successfully rewrote index html');
});

});

// https://stackoverflow.com/questions/14177087/replace-a-string-in-a-file-with-nodejs
// Maybe try: npm install replace-in-file
