const https = require('https');

var helpers = require('./helpers.ts');
var async = require("async");

var groups = require('./groups.ts');

var publication_data = require("../data/publications.ts");
var privilege_data = require("../data/privileges.ts");

import {Journal, JournalObj} from '../models/publications.ts';

exports.version = "0.1.0";

exports.queryJournals = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err);
        })
      }
    },

    function (cb) {
      https.get(`https://api.crossref.org/journals?query=` + getp.term + `&mailto=roni.pozner@gmail.com`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          try{
            var journals = JSON.parse(data).message.items.map(function(obj) {
              var rObj = obj;
              rObj['name'] = obj.title;
              rObj['issn'] = obj.ISSN;
              return rObj;
            })
            cb(null, journals);
          } catch(e) {
            cb(e);
            return;
          }
        });

      }).on("error", (err) => {
        cb(err) // console.log("Error: " + err.message);
      });
    }

  ],
  function (err, journals) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, journals);
    }
  })
}

exports.publicationJournalPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Journal Objeect, mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || !req.body.journal || mode==null ||
         ((!ObjectID.isValid(getp.id) && (mode==0 || mode==3 || mode==4)) || (!getp.id && mode==5))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilegeMode: number;

      if (req.user.scope.indexOf('write:publications')>-1) {
        privilegeMode = 10;
      // } else if (mode>=7 && mode<=10) { // publications authors
      } else { // publications authors
        privilegeMode = 70;
      }

      privilege_data.privilages(req.user.sub, getp.itemId, privilegeMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Journal Field
    function (cb) {
      publication_data.post_journal_field(req.body, getp.itemId, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });

}

exports.publicationJournalDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Parent ID, Item ID, Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.itemId) || mode==null ||
           ((!ObjectID.isValid(getp.id) && (mode==0 || mode==3 || mode==4)) || (!getp.id && mode==5))
           ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        var privilegeMode: number;

        if (req.user.scope.indexOf('write:publications')>-1) {
          privilegeMode = 10;
        // } else if (mode>=7 && mode<=10) { // publications authors
        } else { // publications authors
          privilegeMode = 70;
        }

        privilege_data.privilages(req.user.sub, getp.itemId, privilegeMode, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Journal Field
      function (cb) {

        const journalObjNull: JournalObj = {
          journal: {
            name: null,
            issn: null
          },
          issue: null,
          pages: null,
          publisher: null,
          volume: null
        }

        publication_data.post_journal_field(journalObjNull, getp.itemId, cb);
      }

  ],
  function (err, results) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, results);
      }
  });

}
