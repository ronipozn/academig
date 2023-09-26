var helpers = require('./helpers.ts');
var async = require("async");

var contact_data = require("../data/contacts.ts");
var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var department_data = require("../data/departments.ts");
var university_data = require("../data/universities.ts");
var privilege_data = require("../data/privileges.ts");
var messages_data = require("../data/messages.ts");

var emails = require("../misc/emails.ts");

import { objectMini } from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.contactsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var projectsIds;

  async.series({
    contactsIds: function (callback) {
      switch (mode) {

        case 0: // University
          university_data.university_items_ids("contactsItems", getp.id, function (err, items) {
            callback (null, items.contactsIds);
          });
          break;

        case 1: // Department
          department_data.department_items_ids("contactsItems", getp.id, function (err, items) {
            callback (null, items.contactsIds);
          });
          break;

        case 2: // Group
          group_data.group_items_ids("contactsItems", getp.id, function (err, items) {
            callback (null, items.contactsIds);
          });
          break;

        case 3: // Group AI
        case 4: // Group AI - Archive
          privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
            if (flag) {
              group_data.group_items_ids("contactsItems", getp.id, function (err, items) {
                callback (null, items.contactsIds);
              });
            } else {
              callback (helpers.invalid_privileges());
            }
          })
          break;

      }
    },
  },
  function (err, results) {
    contact_data.contacts_list(results.contactsIds, (mode==3) ? 1 : ((mode==4) ? -1 : 0), function (err, contacts) {
      if (err) {
        helpers.send_failure(res, 500, err);
        return;
      }
      helpers.send_success(res, contacts);
    });
  });
}

exports.contactPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Contact Data, Mode are valid
    function (cb) {
        if (!ObjectID.isValid(getp.id) || !req.body || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==0) { // universities
        if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==1) { // departments
        if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==2) { // groups
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      };
    },

    // 3. put Contact
    function (cb) {
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      contact_data.put_contact(mode, getp.id, adminFlag, req.body, cb);
    }

  ],
  function (err, contactId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, contactId);
    }
  });
}

exports.contactPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Contact ID, Contact Data, Mode are valid
    function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==0) { // universities
        if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==1) { // departments
        if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==2) { // groups
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      };
    },

    // 3. update Contact
    function (cb) {
      contact_data.post_contact(getp.itemId, req.body, cb);
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

exports.contactDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Contact ID, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      if (mode==0) { // universities
        if (req.user.scope.indexOf('write:universities')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==1) { // departments
        if (req.user.scope.indexOf('write:departments')>-1) cb(); else cb(helpers.invalid_privileges());
      } else if (mode==2) { // groups
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      };
    },

    // 3. delete Contact
    function (cb) {
      contact_data.delete_contact(mode, getp.itemId, getp.id, cb);
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

exports.contactMessage = function (req, res) {
  var getp = req.query;
  var data = req.body;

  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, Mode are valid
    function (cb) {
      if (((mode==0) ? !ObjectID.isValid(getp.id) : false) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. send Email Message
    function (userId: string, cb) {
      var replyLink: string;
      people_data.put_contact_message(userId, getp.id, mode, function (err, flag) {
        people_data.people_email(userId, function (err, userFrom) {
          if (mode==0) { // Lab
            group_data.groupMembers(getp.id, 4, function (err, admins) {
              replyLink = 'people/'+userId+'/contact';
              const adminEmails = admins.map(r => r.personalInfo.email);
              emails.contactEmail(replyLink, userId, userFrom.pic, userFrom.name, userFrom.personalInfo.email, adminEmails, data.subject, data.message, function (err) {
                cb(err, userId, null);
              })
            })
          } else { // User
            people_data.people_email(getp.id, function (err, userTo) {
              replyLink = (userTo.stage==0) ? 'people/'+userId+'/contact' : 'messages';
              emails.contactEmail(replyLink, userId, userFrom.pic, userFrom.name, userFrom.personalInfo.email, [userTo.personalInfo.email], data.subject, data.message, function (err) {
                cb(err, userId, userTo.stage);
              })
            })
          }
        })
      })
    },

    // 4. send Message (create channel if not exist)
    function (userId: string, stage: number, cb) {
      if (mode==0 || stage==0) { // Lab or Invited-User
        cb();
      } else { // User
        messages_data.put_channel(userId, [userId, getp.id], function (err, channelId) {
          const message = {_id: null, type: 0, userId: userId, text: data.subject + ": " + data.message, file: null, date: Date};
          messages_data.put_message(message, channelId, userId, null, [getp.id], 0, function (err, messageId) {
            cb(err);
          });
        });
      }
    }

  ],
  function (err) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  });

};
