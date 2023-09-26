var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var departments = require('./departments.ts');
var universities = require('./universities.ts');
var peoples = require("./peoples.ts");
var contacts = require("./contacts.ts");
var shared = require("./shared.ts");
var admin = require("./admin.ts");
var news = require("./news.ts");
var messages = require("./messages.ts");
var invites = require("./invites.ts");
var pics = require("./pics.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

import { complexName, Affiliation, Countries } from '../models/shared.ts';

exports.version = "0.1.0";

export function groups_compare_init(groupsIds, callback) {
  var m = { "$match" : { "_id" : { "$in" : groupsIds } } }
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ groupsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = { "$project" :
            {
              pic: "$homePageItems.pic",
              groupIndex: 1,
              country: 1,
              state: 1,
              city: 1
            }
          };

  db.groups.aggregate( [ m, a, s, f ] ).toArray(callback);
}

export function groups_compare(groupsIds, followingsIds, callback) {
  var m = { "$match" : { "_id" : { "$in" : groupsIds } } }
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ groupsIds, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var p = {
           _id: 1,
           pic: "$homePageItems.pic",
           size: "$homePageItems.size",
           establish: "$homePageItems.establish",
           topic: "$homePageItems.topic",
           groupIndex: 1,

           background: "$homePageItems.background",
           intrests: "$homePageItems.intrests",

           activesIds: "$peoplesItems.activesIds",
           alumniIds: "$peoplesItems.alumniIds",

           publicationsIds: "$publicationsItems.publicationsIds",

           topicsItems: 1,

           resourcesIds: "$resourcesItems.resourcesIds",

           collaborationsIds: "$collaborationsItems.currentIds",

           fundingsIds: "$fundingsItems.currentFundingsIds",

           positionsIds: "$positionsItems.positionsIds",

           teachingsIds: "$teachingsItems.currentTeachingsIds",

           galleriesIds: "$eventsItems.eventsIds",

           publicInfo: 1,
           socialInfo: 1,

           country: 1,
           state: 1,
           city: 1,
           location: 1,
          };
  var f = { "$project" : p };

  db.groups.aggregate( [ m, a, s, f ] ).map(
   function(u) {
     u.followStatus = followingsIds ? followingsIds.toString().includes(u._id.toString()) : null;
     return u;
   }
  ).toArray(callback);

}
