var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var peoples = require("./peoples.ts");
var news = require("./news.ts");

import { FAQ } from '../models/faqs.ts';

exports.version = "0.1.0";

export function put_faq(faq: FAQ, id: string, userId: string, mode: number, adminFlag: boolean, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  if (mode==0) {
    key = "faqPageItems.faqs";
    collection = "groups";
  } else if (mode==1) {
    key = "faqsIds";
    collection = "projects";
  } else if (mode==2) {
    key = "faqsIds";
    collection = "resources";
  } else if (mode==3) {
    key = "faqsIds";
    collection = "mentors";
  }

  async.waterfall([

    // 1. validate data
    function (cb) {
      try {
        const reqFields: string[] = [ "question", "answer" ];
        backhelp.verify(faq, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, faq);
    },

    // 2. create FAQ document
    function (faq_data, cb) {
      data_clone = JSON.parse(JSON.stringify(faq_data));
      createFAQDocument(data_clone, adminFlag, function (err, faqId) {
        cb(null, faqId)
      });
    },

    // 3. insert FAQ ID in a specific Collection
    function (faqId, cb) {
      if (mode==0) {
        db.groups.updateOne(
          { _id: ObjectID(id) },
          {
            $push: { [key]: faqId },
            $set: { "progress.20": 1}
          },
          { safe: true },
          cb(null, faqId)
        )
      } else {
        db[collection].updateOne(
          { _id: ObjectID(id) },
          { $push: { [key]: faqId } },
          { safe: true },
          cb(null, faqId)
        )
      }
    },

    // 4. push News
    function (faqId, cb) {
      if (mode==0) {
        if (adminFlag && data_clone.ai) {
          cb(null, faqId)
        } else {
          push_news(userId, faqId, id, data_clone.question, data_clone.answer, function (err) {
            cb(err, faqId)
          })
        }
      } else {
        cb(null, faqId)
      }
    }

  ],
  function (err, faqId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : faqId);
    }
  });

}

function push_news(userId: string, faqId: string, id: string, question: string, answer: string, callback) {
  news.add_group_activity(userId, 1010, faqId, id, faqId, [], question, answer, null, 3, function (err, newsId) {
    callback(err)
  })
}

export function post_faq(faqId: string, faq: FAQ, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = [ "question", "answer" ];
        backhelp.verify(faq, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, faq);
    },

    // 2. update FAQ document
    function (faq_data, cb) {
      db.faq.updateOne(
         { _id: ObjectID(faqId) },
         { $set:
           {
             "question": faq_data.question,
             "answer": faq_data.answer,
           },
         },
         { safe: true },
         cb(null, faqId)
      );
    }

  ],
  function (err, faqId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : faqId);
    }
  });

}

export function delete_faq(faqId: string, id: string, mode: number, callback) {
  var key: string;
  var collection: string;

  if (mode==0) {
    key = "faqPageItems.faqs";
    collection = "groups";
  } else if (mode==1) {
    key = "faqsIds";
    collection = "projects";
  } else if (mode==2) {
    key = "faqsIds";
    collection = "resources";
  } else if (mode==3) {
    key = "faqsIds";
    collection = "mentors";
  }

  async.parallel({

    // 1. delete FAQ specific Collection Links
    links: function (cb) {
      if (mode==0) {
        var progress: number = 1;

        db.groups.aggregate([
            { "$match": { '_id': ObjectID(id)}},
            { "$project": {'_id': 0, 'faqPageItems.faqs': 1 }}
        ]).next().then(function(item) {

          if (item.faqPageItems.faqs.length==1) progress = 0;

          db.groups.updateOne(
             { _id: ObjectID(id) },
             {
               $set: { "progress.20": progress },
               $pull: { [key]: ObjectID(faqId) },
             },
             { multi: false, safe: true },
             cb())

        });

      } else {

        db[collection].updateOne(
          { _id: ObjectID(id) },
          { $pull: { [key]: ObjectID(faqId) } },
          { multi: false, safe: true },
          cb());

      }

    },

    // 2. delete FAQ Item
    faq: function (cb) {
      db.faq.deleteOne(
        { _id: ObjectID(faqId) },
        { safe: true },
        cb()
      );
    },

    // 3. remove FAQ news
    news: function (cb) {
      if (mode==0) {
        news.remove_activity(id, faqId, 0, function (err, newsId) {
          cb();
        });
      } else {
        cb();
      }
    },

  },
  function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });

}

function createFAQDocument(data, adminFlag: boolean, callback) {
  db.faq.insertOne(
    {
      "question": data.question,
      "answer": data.answer,
      "created_on": new Date(),

      "ai": (adminFlag && data.ai) ? 1 : 0,
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

export function faq_list(faqsIds: string[], aiStatus: number, callback) {
  var m = { "$match" : {"_id" : { "$in" : faqsIds }, "ai": (aiStatus==1) ? 1 : {$in: [null, 0]} } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ faqsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = ({ "$project" : { _id: 1, question: 1, answer: 1 }});

  db.faq.aggregate( [ m, a, s, f ] ).toArray(callback);
}

function invalid_faq_name() {
    return backhelp.error("invalid_faq_name",
                          "FAQ names can have letters, #s, _ and, -");
}
