var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var shared = require("./shared.ts");
var pics = require("./pics.ts");

exports.version = "0.1.0";

export function put_contact(mode: number, id: string, adminFlag: boolean, data, callback) {
  var collection: string;

  if (mode==0) {
    collection = "universities";
  } else if (mode==1) {
    collection = "departments";
  } else if (mode==2) {
    collection = "groups";
  };

  var reqFields: string[];

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = [ "title" ];
        backhelp.verify(data, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, data);
    },

    // 2. create Contact document.
    function (contact_data, cb) {
      const data_clone = JSON.parse(JSON.stringify(contact_data));

      createContactDocument(data_clone, adminFlag, function (err, contactId) {
        cb(null, (data.mode==1) ? data.member._id : null, data.mode, contactId)
      });

    },

    // 3. push Contact ID to Profile (if mode==1)
    function (peopleId, contactMode, contactId, cb) {
      if (contactMode==0) {
        cb(null, contactId);
      } else {
        db.peoples.updateOne(
           { _id: peopleId},
           { $push: { "contactsIds": contactId } },
           { safe: true },
           cb(null, contactId)
        )
      }
    },

    // 4. insert Contact ID to Chosen Collection.
    function (contactId, cb) {
      if (mode==2) {
        db.groups.updateOne(
           {_id: ObjectID(id)},
           {
             $push: { "contactsItems.contactsIds": contactId },
             $set: { "progress.22": 1}
           },
           { safe: true },
           cb(null, contactId)
        )
      } else {
        db[collection].updateOne(
          { _id: ObjectID(id)},
          { $push: { "contactsItems.contactsIds": contactId } },
          { safe: true },
          cb(null, contactId)
        )
      }
    }

  ],
  function (err, contactId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : contactId);
    }
  });
};

export function post_contact(contactId: string, data, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = [ "title" ];
        backhelp.verify(data, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, data);
    },

    // 2. update Contact document
    function (contact_data, cb) {
      if (contact_data.mode==3) { // Profile Pic Update

        db.contacts.updateOne(
           { _id: ObjectID(contactId) },
           { $set: { "member.pic": contact_data.pic } },
           { safe: true },
           cb(null, contactId)
        );

      } else if (contact_data.mode==2) { // Public Info Update

        db.contacts.updateOne(
           { _id: ObjectID(contactId)},
           { $set:
             {
              "address": contact_data.address,
              "phone": contact_data.phone,
              "fax": contact_data.fax,
              "email": contact_data.email
             },
           },
           { safe: true },
           cb(null, contactId)
        );

      } else if (contact_data.mode==1) { // Contact Page Associated People

        db.contacts.updateOne(
           { _id: ObjectID(contactId)},
           { $set:
             {
               "title": contact_data.title,
               // "mode": contact_data.mode,
               "member": contact_data.member
             },
           },
           { safe: true },
           cb(null, contactId)
        );

      } else { // Contact Page Custom Contacts

        pics.delete_pic("contacts", "pic", contactId, contact_data.pic, false, function(err) {
          db.contacts.updateOne(
             { _id: ObjectID(contactId)},
             { $set:
               {
                 "title": contact_data.title,
                 // "mode": contact_data.mode,
                 "pic": contact_data.pic,
                 "address": contact_data.address,
                 "phone": contact_data.phone,
                 "fax": contact_data.fax,
                 "email": contact_data.email
               },
             },
             { safe: true },
             cb(null, contactId)
          );
        })

      }

    },

  ],
  function (err, contactId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : contactId);
    }
  });
};

export function delete_contact(mode: number, contactId: string, id: string, callback) {
  var collection: string;

  if (mode==0) {
    collection = "universities";
  } else if (mode==1) {
    collection = "departments";
  } else if (mode==2) {
    collection = "groups";
  };

  async.series({

    // 1. delete Contact Group Links
    links: function (cb) {
      if (mode==2) {
        var progress: number = 1;

        db.groups.aggregate([
            { "$match": { '_id': ObjectID(id)}},
            { "$project": {'_id': 0, 'contactsItems.contactsIds': 1 }}
        ]).next().then(function(item) {
          if (item.contactsItems.contactsIds.length==1) progress = 0;
          db.groups.updateOne(
             {_id: ObjectID(id)},
             {
               $set: { "progress.22": progress },
               $pull: { "contactsItems.contactsIds": ObjectID(contactId) },
             },
             { multi: false, safe: true },
             cb())
        });

      } else {
        db[collection].updateOne(
          { _id: ObjectID(id)},
          { $pull: { "contactsItems.contactsIds": ObjectID(contactId) } },
          { multi: false, safe: true },
          cb()
        )
      }

    },

    // 2. delete People Associated
    associate: function (cb) {
      db.contacts
        .find({_id: ObjectID(contactId)})
        .project({_id: 0, "member._id": 1, "pic": 1})
      .next().then(function(item) {
        if (item && item.member) { // Member Contact
          db.peoples.updateOne(
            { _id: item.member._id},
            { $pull: { "contactsIds": ObjectID(contactId) } },
            { multi: false, safe: true },
            cb()
          )
        } else if (item) { // Custom Contacts
          pics.delete_pic_direct(item.pic, function(err) {
            cb()
          })
        } else {
          cb()
        }
      });
    },

    // 3. delete Contact Item
    contact: function (cb) {
      db.contacts.deleteOne({ _id: ObjectID(contactId) },
                            { safe: true },
                            cb());
    }

  },
  function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });

}

function createContactDocument(data, adminFlag: boolean, callback) {

  db.contacts.insertOne(
    {
     "title": data.title,
     "pic": data.pic,
     "mode": data.mode,
     "member": (data.mode==1) ? {"_id": data.member._id, "name": data.member.name, "pic": data.member.pic} : null,

     "ai": (adminFlag && data.ai) ? 1 : 0,

     "address": data.address,
     "phone": data.phone,
     "fax": data.fax,
     "email": data.email,
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );

}

export function contacts_list(contactsIds: string[], aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : contactsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ contactsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };

  db.contacts.aggregate( [ m, a, s ] ).toArray(callback);
}

function invalid_contact_name() {
    return backhelp.error("invalid_contact_name", "Group names can have letters, #s, _ and, -");
}
