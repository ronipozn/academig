var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var pics = require("./pics.ts");

var emails = require("../misc/emails.ts");
var misc = require("../misc/misc.ts");
var searches = require("./searches.ts");

import {App, SubmitApp} from '../models/apps.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

export function app_id(link: string, callback) {
  db.apps
    .find({"link": link})
    .project({_id: 1, stage: 1})
    .next().then(function(item) {
      callback(null, item ? item._id : null)
      // callback(null, (item && item.stage==1) ? item._id : null)
    });
}

export function app_details(appId: string, followingsIds: string[], callback) {
  const m = { "$match" : {"_id" : ObjectID(appId) } };
  const f = { "$project" : { _id: 1, name: 1, link: 1, pic: 1, publicInfo: 1, socialInfo: 1, location: 1, country: 1, state: 1, city: 1, team: 1 } };

  if (followingsIds) {
    db.apps.aggregate( [ m, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).next(callback);
  } else {
    db.apps.aggregate( [ m, f ] ).next(callback);
  }
}

export function apps_list(appsIds: string[], followingsIds: string[], callback) {
  var m = { "$match" : {"_id" : { "$in" : appsIds } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ appsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = ({ "$project" : { _id: 1, name: 1, link: 1, pic: 1, type: 1, description: 1, categories: 1, website: 1, release: 1, company: 1, price: 1, location: 1 } });

  if (followingsIds) {
    db.apps.aggregate( [ m, a, s, f ] ).map(
     function(u) {
       u.followStatus = followingsIds.toString().includes(u._id.toString());
       return u;
     }
    ).toArray(callback);
  } else {
    db.apps.aggregate( [ m, a, s, f ] ).toArray(callback);
  }
}

export function app_home_items(appId: string, callback) {
  async.waterfall([
    function (cb) {
      db.apps
        .find({ _id: ObjectID(appId) })
        // description_long: 1,
        .project({
          _id: 0,
          description: 1,
          fields: 1,
          categories: 1,

          type: 1,
          website: 1,
          release: 1,
          language: 1,
          company: 1,
          price: 1
        })
        .next().then(function(items) {
          cb(null, items)
        });
    },
    // deal
 ],
 function (err, items) {
   callback(err, items);
 });
}

export function put_app(app: App, callback) {
  var data_clone;

  var key: string;
  var collection: string;

  async.waterfall([

    // 1. create App document
    function (cb) {
      data_clone = JSON.parse(JSON.stringify(app));
      createAppDocument(data_clone, function (err, appId) {
        cb(err, appId)
      });
    },

    // 2. create App algolia
    function (appId, cb) {
      const object = [{
        objectID: appId,
        name: app.name,
        link: misc.NFD(app.name),
        pic: app.pic,
        description: app.description,
        // fields: app.fields,
        categories: app.categories,
        type: app.type,
        website: app.website,
        release: app.release, // establish
        language: app.language,
        company: app.company
        // price: app.price,
        // country: app.country,
        // state: app.state ? app.state : null,
        // city: app.city ? app.city : null,
        // _geoloc: (app.location && app.location[0]) ? { lat: app.location[0], lng: app.location[1] } : { lat: '', lng: '' }
      }];

      client.initIndex((process.env.PORT) ? 'apps': 'dev_apps').addObjects(object, (err, content) => {
        searches.query_search('app', appId,  misc.NFD(app.name), null, null, null, null, null, app.name, null, app.release, app.categories, [], function (err) {
          cb(err, appId);
        })
        // cb(err, appId);
      });
    }

  ],
  function (err, appId) {
    callback(err, err ? null : appId);
  });

}

// export function post_app(app: App, callback) {
//
// }

export function delete_app(appId: string,callback) {
  async.series({

    // 1. delete Pic
    pic: function (cb) {
      db.apps
        .find({_id: ObjectID(appId)})
        .project({ "_id": 0, "pic": 1})
      .next().then(function(item) {
        pics.delete_pic_gallery(item.pic, function(err) {
          cb(err)
        })
      })
    },

    // 2. delete App
    app: function (cb) {
      db.apps.deleteOne(
        { _id: ObjectID(appId) },
        { safe: true },
        cb()
      );
    },

    // 3. delete from Algolia
    algolia: function (cb) {
      client.initIndex((process.env.PORT ? 'apps' : 'dev_apps')).deleteObject(appId, (err, content) => {
        cb(err)
      });
    }

  },
  function (err, results) {
    callback(err);
  });
}

function createAppDocument(data, callback) {
  db.apps.insertOne(
    {
      "name": data.name,
      "link": misc.NFD(data.name),
      "pic": data.pic,
      "description": data.description,
      // "description_long": data.description_long,
      // "fields": data.fields,
      "categories": data.categories,

      "type": data.type,
      "website": data.website,
      "release": data.release,
      "language": data.language,
      "company": data.company,

      "team": []
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}

/////////////////////////////////////
/////////////////////////////////////
/////////////// Submit //////////////
/////////////////////////////////////
/////////////////////////////////////

export function put_submit_app(userId: string, submitApp: SubmitApp, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["productName", "productURL"];
        backhelp.verify(submitApp, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, submitApp);
    },

    // 2. create Submit App document
    function (submit_app_data, cb) {
      data_clone = JSON.parse(JSON.stringify(submit_app_data));
      createSubmitAppDocument(data_clone, function (err, appId) {
        cb(err, appId)
      });
    },

    // 3. send Submit Apps emails
    function (appId, cb) {
      emails.submitApp(data_clone, appId, function (err) {
        cb(err)
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

function createSubmitAppDocument(data: SubmitApp, callback) {
  db.apps.insertOne(
    {
      "submit": {
        "productName": data.productName,
        "productURL": data.productURL,
        "productMarkets": data.productMarkets,
        "productType": data.productType,
        "productDescription": data.productDescription,
        "productBenefits": data.productBenefits,

        "companyName": data.companyName,
        "companyYear": data.companyYear,
        "companyUsers": data.companyUsers,
        "companyRevenue": data.companyRevenue,
        // "support": data.support

        "email": data.email,
        "twitter": data.twitter,
        "firstName": data.firstName,
        "lastName": data.lastName,
        "role": data.role,

        "goal": data.goal,
        "goalMain": data.goalMain,
        "goalType": data.goalType,
        "productVersion": data.productVersion,
        "priceFull": data.priceFull,

        "referred": data.referred,
        "comments": data.comments,
      }
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback(null, docsInserted.insertedId);
    }
  );
}
