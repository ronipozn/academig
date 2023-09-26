var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");
var misc = require("../misc/misc.ts");

import {Trend, SubmitTrend} from '../models/trends.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

export function trend_id(link: string, callback) {
  db.trends
    .find({"link": link})
    .project({_id: 1, stage: 1})
    .next().then(function(item) {
      callback(null, (item) ? item._id : null)
      // callback(null, (item && item.stage==1) ? item._id : null)
    });
}

export function trend_details(trendId: string, callback) {
  const m = { _id: ObjectID(trendId) };
  const p = { _id: 1, name: 1, link: 1, pic: 1 }

  db.trends.find(m).project(p).next(callback);
}

export function trend_home_items(trendId: string, callback) {
  async.waterfall([
    function (cb) {
      db.trends
        .find({ _id: ObjectID(trendId) })
        .project({
          _id: 0,
          description: 1,
          fields: 1,
          categories: 1,
        })
        .next().then(function(items) {
          cb(null, items)
        });
    },
 ],
 function (err, items) {
   callback(err, items);
 });
}

export function put_trend(trend: Trend, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  async.waterfall([

    // 1. create Trend document
    function (cb) {
      console.log('trend',trend)
      data_clone = JSON.parse(JSON.stringify(trend));
      createTrendDocument(data_clone, function (err, trendId) {
        cb(err, trendId)
      });
    },

    // 2. create Trend algolia
    function (trendId, cb) {
      const object = [{
        objectID: trendId,
        name: trend.name,
        link: trend.link,
        pic: trend.pic,
        description: trend.description,
        // description_long: trend.description_long,
        // fields: trend.fields,
        categories: trend.categories
      }];

      client.initIndex((process.env.PORT) ? 'trends': 'dev_trends').addObjects(object, (err, content) => {
        cb(err);
      });
    }

  ],
  function (err, trendId) {
    callback(err, err ? null : trendId);
  });

}

// export function post_trend(trend: Trend, callback) {
//
// }
// PostTimeline

export function delete_trend(trendId: string,callback) {
  async.series({

    // 1. delete Pic
    pic: function (cb) {
      db.trends
        .find({_id: ObjectID(trendId)})
        .project({ "_id": 0, "pic": 1})
      .next().then(function(item) {
        pics.delete_pic_gallery(item.pic, function(err) {
          cb(err)
        })
      })
    },

    // 2. delete Trend
    trend: function (cb) {
      db.trends.deleteOne(
        { _id: ObjectID(trendId) },
        { safe: true },
        cb()
      );
    },

    // 3. delete from Algolia
    algolia: function (cb) {
      client.initIndex((process.env.PORT ? 'trends' : 'dev_trends')).deleteObject(trendId, (err, content) => {
        cb(err)
      });
    }

  },
  function (err, results) {
    callback(err);
  });
}

function createTrendDocument(data, callback) {
  db.trends.insertOne(
    {
      "name": data.name,
      "link": data.link,
      "pic": data.pic,
      "description": data.description,
      // description_long: data.description_long,
      // fields: data.fields,
      "categories": data.categories
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

export function put_submit_trend(userId: string, submitTrend: SubmitTrend, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["trend"];
        backhelp.verify(submitTrend, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, submitTrend);
    },

    // 2. create Submit Trend document
    function (submit_trend_data, cb) {
      data_clone = JSON.parse(JSON.stringify(submit_trend_data));
      createSubmitTrendDocument(data_clone, function (err, trendId) {
        cb(err);
      });
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });

}

function createSubmitTrendDocument(data: SubmitTrend, callback) {
  db.trends.insertOne(
    {
      "submit": {
        "trend": data.trend,
      }
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}
