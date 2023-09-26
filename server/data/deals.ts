var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

// const algoliasearch = require('algoliasearch');
// const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var pics = require("./pics.ts");
var emails = require("../misc/emails.ts");
var misc = require("../misc/misc.ts");

import {App, SubmitApp} from '../models/apps.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

////////////////////////////////////
////////////////////////////////////
//////////////// List //////////////
////////////////////////////////////
////////////////////////////////////

export function deals_list(userId: string, dealsIds: string[], callback) {
  var m = { "$match" : { "_id" : { "$in" : dealsIds.map(r => ObjectID(r)) } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ dealsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = {
    "$project" : {
      _id: 1, name: 1, link: 1, pic: 1,
      planType: "$deal.plans.planType",
      price: {$arrayElemAt:["$deal.plans",0]},
      // price_full: "$deal.plans.0.price_full",
      buys: {
              $filter: {
               input: "$deal.buys",
               as: "buys",
               cond: { $eq: [ "$$buys.userId", userId ] }
              }
            }
    }
  };

  db.apps.aggregate( [ m, a, s, f ] ).toArray(callback);
}

////////////////////////////////////
////////////////////////////////////
////////////// Details /////////////
////////////////////////////////////
////////////////////////////////////

export function deal_details(itemId: string, adminFlag: boolean, userId: string, callback) {
  var m = {
            "$match": {
              "_id": ObjectID(itemId),
              "deal.status": (adminFlag==true) ? {$in: [0, 1, 2, 3]} : {$in: [1, 2, 3]},
            }
          };

  var p = {
            background: "$deal.background",
            clip: "$deal.clip",
            tldr: "$deal.tldr",
            blocks: "$deal.blocks",
            status: "$deal.status",
            type: "$deal.type",
            dateStart: "$deal.dateStart",
            dateEnd: "$deal.dateEnd",
            webinarLink: "$deal.webinarLink",
            webinarDate: "$deal.webinarDate",
            terms: "$deal.terms",
            features: "$deal.features",
            plansTotal: "$deal.plansTotal",
            plansType: "$deal.plansType",
            plans: "$deal.plans"
          };

  // if (adminFlag) p["codesTotal"] = 1;
  var f = { "$project" : p };

  db.apps.aggregate( [ m, f ] ).next(callback);
}

////////////////////////////////////
////////////////////////////////////
///////////// Put Data /////////////
////////////////////////////////////
////////////////////////////////////

export function put_tldr(dealId: string, tldr: string[], callback) {
  db.apps.updateOne(
    { _id: ObjectID(dealId), "deal.status": { $eq: 0 } },
    { $set: { "deal.tldr": [tldr[0], tldr[1], tldr[2], tldr[3]] } },
    { safe: true },
    callback()
  );
}

export function put_deal(dealId: string, deal: any, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        const reqFields: string[] = ["type", "dateStart", "webinarLink", "webinarDate", "plansTotal", "codesTotal"];
        backhelp.verify(deal, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb();
    },

    // 2. generateCodes
    function (cb) {
      let codes: string[] = [];
      for (var i = 0; i < deal.codesTotal; i++) {
        codes[i] = generateCodes(10)
      }
      console.log('codes',codes)
      cb(null, codes)
    },

    // 2. put Deal Details
    function (codes, cb) {
      db.apps.updateOne(
        { _id: ObjectID(dealId), "deal.status": { $eq: 0 } },
        { $set:
          {
            "deal": {
              "status": 0, // 0: Pending
                           // 1: Active
                           // 2: End Date Set
                           // 3: Expired (Sold Out)
              "type": deal.type,
              "dateStart": deal.dateStart,
              "dateEnd": null,
              "webinarLink": deal.webinarLink,
              "webinarDate": deal.webinarDate,

              "terms": deal.terms,
              "features": deal.features,

              "codesTotal": Number(deal.codesTotal),
              "plansTotal": Number(deal.plansTotal),
              "plansType": 0,
                           // Number(deal.planType), // 0 Code-based,
                                                     // 1 Downloadable
              "plans": [],

              "emails": [],

              "codes": codes // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
            }
          }
        },
        { safe: true },
        cb()
      );
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

export function put_deal_plan(dealId: string, i: number, plan: any, callback) {
  var data_clone;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      console.log('plan',plan,i)
      try {
        const reqFields: string[] = ["features", "price_reduced", "price_full"];
        backhelp.verify(plan, reqFields);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, plan);
    },

    // 2. put Plan Details
    function (plan, cb) {
      const planObj = {
        "features": plan.features,
        "price_reduced": plan.price_reduced,
        "price_full": plan.price_full
      }
      db.apps.updateOne(
        { _id: ObjectID(dealId), "deal.status": { $eq: 0 } },
        { $set: { ["deal.plans." + Number(i)]: planObj } },
        { safe: true },
        cb()
      )
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

function generateCodes(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

////////////////////////////////////
////////////////////////////////////
//////////////// Buy ///////////////
////////////////////////////////////
////////////////////////////////////

export function deal_id_price_id(dealId: string, quantity: number, callback) {
  db.apps
    .find({
      _id: ObjectID(dealId),
      "deal.status": { $in: [1,2] }, // check active deal status
      "deal.plansTotal": { $gte: quantity } // TBD: check quantity < max
    })
    .project({
      "deal.stripe.pricingId": 1,
      "deal.plansTotal": 1,
      "deal.buys": 1,
      "id": 1
    })
  .next().then(function(item) {
    // buys+quantity < plansTotal // TBD: check user didn't bought more then the maximum codes allowed
    if (item && item.deal) {
      callback(null, item.deal.stripe.pricingId, item._id)
    } else {
      callback()
    }
  })
}

export function post_deal_notify(customerId: string, dealId: string, totalCodes: number, callback) {
  async.waterfall([

    // 1. pull Codes
    function (cb) {
      async.concat(Array.from({ length: totalCodes }), function (lab, next) {
        db.apps.findOneAndUpdate(
           { _id: ObjectID(dealId) },
           { $pop: { "deal.codes": -1 } },
           { projection: { "deal.codes": 1 } }
        )
        .then(function(item) {
          next(null, item.value.deal.codes[0])
        })
      }, function (err, codes) {
        // console.log('codes',codes)
        cb(err,codes);
      })
    },

    // 2. push dealId
    function (codes: string[], cb) {
      db.peoples.findOneAndUpdate(
         { stripe_id: customerId },
         { $push: { "dealsIds": dealId } },
         { projection: { "_id": 1 } }
      )
      .then(function(item) {
        cb(null, item.value._id, codes)
      })
    },

    // 3. push Codes
    function (userId: string, codes: string[], cb) {
      let objectCodes = [];
      codes.forEach((code, index) => {
        if (code) {
          objectCodes.push({
            _id: ObjectID(),
            userId: userId,
            code: code,
            status: 0,
            date: new Date()
          });
        }
      });
      // console.log('objectCodes',objectCodes)
      db.apps.updateOne(
        { _id: ObjectID(dealId) },
        { $push: { ["deal.buys"]: { $each: objectCodes } } },
        { safe: true },
        cb()
      );
    },

    // 3. Emails: Order confirmation / Write a review
    function (cb) {
      emails.dealBuyEmail(null, function (err) {
        cb()
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
