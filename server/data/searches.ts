var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

// const csv = require('fast-csv');
// const fs = require('fs');
// const request = require("request");

var news = require("./news.ts");

var group_create_data = require("../data/groups_create.ts");
var department_data = require("../data/departments.ts");
var university_data = require("../data/universities.ts");
var shared_data = require("../data/shared.ts");

// var emails = require("../misc/emails.ts");

import {CreateGroup} from '../models/groups.ts';
import {PublicInfo, SocialInfo, complexName} from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

export function featured(callback) {
  db.featured.find().project({_id: 0}).toArray(callback);
};

export function searches(userId: string, callback) {
  db.peoples.find({ _id: userId }).project({ _id: 0, search: 1 })
            .next().then(function(item) { callback(null, item.search) });
};

export function put_search(userId: string, title: string, query: string, refinements: any, callback) {
  const _id = ObjectID();

  db.peoples.updateOne(
    { _id: userId },
    { $push: {
        "search": {
          "_id": _id,
          "title": title,
          "query": query,
          "refinements": refinements
        }
      }
    },
    { safe: true },
  ).then(function(item) {
    callback(null, _id)

    // const object = [{
    //   "objectID": _id,
    //   "userId": userId,
    //   "query": query,
    //   "countries": refinements.countries,
    //   "states": refinements.states,
    //   "cities": refinements.cities,
    //   "universities": refinements.universities,
    //   "disciplines": refinements.disciplines,
    //   "interests": refinements.interests,
    //   "positions": refinements.positions,
    //   "sizes": refinements.size,
    //   "establish": refinements.establish
    // }];
    // console.log('object',object)
    // client.initIndex((process.env.PORT) ? 'save': 'dev_save').addObjects(object, (err, content) => {
    //   callback(err, _id)
    // });
  })
};

export function delete_search(userId: string, itemId: string, callback) {
  // pull saved_search
  db.peoples.updateOne(
    { _id: userId },
    { $pull: { "search": {"_id": ObjectID(itemId) } } },
    { multi: false, safe: true },
  ).then(function(item) {
    // client.initIndex((process.env.PORT) ? 'save': 'dev_save').deleteObject(itemId, (err, content) => {
      // callback(err)
      callback()
    // });
  })
};

// function (cb) {
//   searches.query_search("5e0b5f74cc97394abe8d88db",
//                         "http://academig.com/dummy/dummy",
//                         null,
//                         null,
//                         null,
//                         "Tel Aviv University",
//                         null,
//                         "Pozner lab",
//                         null,
//                         [],
//                         [],
//                         [],
//                         function (err) {
//     cb(err, null);
//   })
//   // user_settings_data.reports(0, null, function (err, reports) {
//   //   cb(err, reports);
//   // });
// },

export function query_search(searchType: string,
                             itemId: string,
                             itemLink: string,
                             country: string,
                             state: string,
                             city: string,
                             universityName: string,
                             disciplineName: string,
                             itemName: string,
                             size: number,
                             establish: number[],
                             interestsArr: string[],
                             positionsArr: string[],
                             callback) {

  console.log('searchType', searchType)
  console.log('country', country, 'state', state, 'city', city, 'university', universityName, 'discipline', disciplineName, 'group', itemName, 'size', size, 'establish', establish, 'interestsArr', interestsArr, 'positionsArr', positionsArr)

  var searchQuery: string;
  switch (searchType) {
    case "university": searchQuery = 'Universities'; break;
    case "department": searchQuery = 'Departments'; break;
    case "lab": searchQuery = 'Labs'; break;
    case "company": searchQuery = 'Companies'; break;
    case "researcher": searchQuery = 'Researchers'; break;
    case "mentor": searchQuery = 'Mentors'; break;
    case "service": searchQuery = 'Services'; break;
    case "trend": searchQuery = 'Trends'; break;
    case "podcast": searchQuery = 'Podcasts'; break;
    case "event": searchQuery = 'Events'; break;
    case "app": searchQuery = 'Apps'; break;
    case "quote": searchQuery = 'Quotes'; break;
    // case 12: searchQuery = 'kits'; break;
  }

  // https://stackoverflow.com/questions/26699885/how-can-i-use-a-regex-variable-in-a-query-for-mongodb
  // https://stackoverflow.com/questions/36932078/unable-to-use-regex-in-in-operator-in-mongodb
  const m = {
    $and: [
      // { "search.query": { $in: [ RegExp(country ,'i'), RegExp(state ,'i'), RegExp(city ,'i'), RegExp(universityName ,'i'), RegExp(disciplineName ,'i') ] } },
      { $or: [ { "search.refinements.search_type": searchQuery }, { "search.refinements.search_type": { $size: 0 } } ] },
      { $or: [ { "search.refinements.countries": country }, { "search.refinements.countries": { $size: 0 } } ] },
      { $or: [ { "search.refinements.states": state }, { "search.refinements.states": { $size: 0 } } ] },
      { $or: [ { "search.refinements.cities": city }, { "search.refinements.cities": { $size: 0 } } ] },
      { $or: [ { "search.refinements.universities": universityName }, { "search.refinements.universities": { $size: 0 } } ] },
      { $or: [ { "search.refinements.disciplines": disciplineName }, { "search.refinements.disciplines": { $size: 0 } } ] },
      { $or: [ { "search.refinements.sizes": size }, { "search.refinements.sizes": { $size: 0 } } ] },
      { $or: [ { "search.refinements.types": "0" }, { "search.refinements.types": { $size: 0 } } ] },
      // { $or: [ { "search.refinements.establish": {$gte: establish[0], $lte: establish[1]} }, { "search.refinements.establish": { $size: 0 } } ] }
      // { $or: [ { "search.refinements.positions": (positionsArr.length>0 ? { "$in" : positionsArr } : null) }, { "search.refinements.sizes": { $size: 0 } } ] }
      // interests // if (interestsArr.length>0) x.concat(interestsArr);
    ]
  };

  db.peoples.find(m).project({ "_id": 1, "search": 1 }).toArray().then(function(peoples) {
    const text: string =
      (country ? ('Country: ' + country + '. ') : '') +
      (state ? ('State: ' + state + '. ') : '') +
      (city ? ('City: ' + city + '. ') : '') +
      (universityName ? ('University: ' + universityName + '. ') : '') +
      (disciplineName ? ('Discipline: ' + disciplineName + '. ') : '') +
      (size ? ('Lab size: ' + size + '. ') : '');
      // establish
      // positionsArr

    const notification_text = ' A new ' + searchType + ' matches your search filters: ' + itemName + '.' + text;

    async.forEachOf(peoples, function (people, key, cb) {
      // console.log('query_search_people',people.search[0])
      news.add_activity(3, "academig", 1500, itemId, people._id, people._id, [], people.search[0].title + notification_text, null, null, true, function (err, newsId) {
        news.add_notification("academig", 1500, itemId, people._id, people._id, [], people.search[0].title + notification_text, null, null, function (err, newsId) {
          cb(err)
        });
      })
    }, function (err) {
      callback(err);
    })
  })
};

export function export_search(query: string, refinements: any, plan: number, callback) {
  // https://www.algolia.com/doc/api-reference/widgets/refinement-list/angular/#widget-param-searchable
  // https://www.algolia.com/doc/api-reference/api-parameters/filters/
  // const filters = 'available = 1 AND (category:Book OR NOT category:Ebook) AND _tags:published AND publication_date:1441745506 TO 1441755506 AND inStock > 0 AND author:"John Doe"';

  console.log('query',query);
  console.log('refinements',refinements);
  console.log('plan',plan);

  var countries: string = '';
  var states: string = '';
  var cities: string = '';
  var universities: string = '';
  var disciplines: string = '';
  var interests: string = '';
  var positions: string = '';
  var sizes: string = '';
  var types: string = '';

  refinements.countries.forEach(function(country) { countries += 'country:"' + country + '" OR ' });
  refinements.states.forEach(function(state) { states += 'state:"' + state + '" OR ' });
  refinements.cities.forEach(function(city) { cities += 'city:"' + city + '" OR ' });
  refinements.universities.forEach(function(university) { universities += 'groupIndex.university.name:"' + university + '" OR ' });
  refinements.disciplines.forEach(function(discipline) { disciplines += 'groupIndex.department.name:"' + discipline + '" OR ' });
  refinements.interests.forEach(function(interest) { interests += 'interests:"' + interest + '" OR ' });
  refinements.positions.forEach(function(position) { positions += 'position.name:"' + position + '" OR ' });
  refinements.size.forEach(function(size) { sizes += 'size:"' + size + '" OR ' });
  refinements.types.forEach(function(type) { types += 'type:"' + type + '" OR ' });

  const checkboxFilters = (
                           ((refinements.countries.length>0) ? (countries.slice(0, -4) + ' AND ') : '') +
                           ((refinements.states.length>0) ? (states.slice(0, -4) + ' AND ') : '') +
                           ((refinements.cities.length>0) ? (cities.slice(0, -4) + ' AND ') : '') +
                           ((refinements.universities.length>0) ? (universities.slice(0, -4) + ' AND ') : '') +
                           ((refinements.disciplines.length>0) ? (disciplines.slice(0, -4) + ' AND ') : '') +
                           ((refinements.interests.length>0) ? (interests.slice(0, -4) + ' AND ') : '') +
                           ((refinements.positions.length>0) ? (positions.slice(0, -4) + ' AND ') : '') +
                           ((refinements.size.length>0) ? (sizes.slice(0, -4) + ' AND ') : '') +
                           ((refinements.types.length>0) ? (types.slice(0, -4) + ' AND ') : '')
                          );

  const establishFilter = (refinements.establish) ? ((' establish >= ' + refinements.establish[0]) + ' AND ' + ('establish <= ' + refinements.establish[1]) + ' AND ') : '';

  const filters = (checkboxFilters + establishFilter).slice(0, -5);

  console.log('Filters',filters)

  if (filters) {
    let algoliaIndex
    switch (refinements.search_type[0]) {
      case 'Institutes': algoliaIndex = client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes'); break;
      case 'Labs': algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_podcasts'); break;
      case 'Companies': algoliaIndex = client.initIndex((process.env.PORT) ? 'companies': 'dev_companies'); break;
      case 'Researchers': algoliaIndex = client.initIndex((process.env.PORT) ? 'researchers': 'dev_researchers'); break;
      case 'Trends': algoliaIndex = client.initIndex((process.env.PORT) ? 'trends': 'dev_trends'); break;
      case 'Podcasts': algoliaIndex = client.initIndex((process.env.PORT) ? 'podcasts': 'dev_podcasts'); break;
      case 'Events': algoliaIndex = client.initIndex((process.env.PORT) ? 'events': 'dev_events'); break;
      case 'Apps': algoliaIndex = client.initIndex((process.env.PORT) ? 'apps': 'dev_apps'); break;
      case 'Quotes': algoliaIndex = client.initIndex((process.env.PORT) ? 'quotes': 'dev_quotes'); break;
    }

    algoliaIndex.search(
      {
        query: query,
        // attributesToRetrieve: ['firstname', 'lastname'],
        filters: filters,
        hitsPerPage: (plan==0) ? 3 : 500,
      },
      (err, results) => {
        // console.log('results',results)

        const ids = results.hits.filter(r => r.groupIndex).map(r => ObjectID(r.groupIndex.group._id));
        var hits = results.hits;

        // console.log('hits',hits)

        // EXTRACT contact + social info
        var m = { "$match" : {"_id" : { "$in" : ids } } };
        var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ ids, "$_id" ] } } };
        var s = { "$sort" : { "__order" : 1 } };
        var f = { "$project" : { publicInfo: 1, socialInfo: 1} };

        db.groups.aggregate( [ m, a, s, f ] ).toArray().then(function(results) {
          results.forEach(function(result, index) {
            // console.log('result',result.publicInfo, result.socialInfo)
            Object.assign(hits[index], result.publicInfo, result.socialInfo);
          });
          // console.log('hits',hits)
          if (plan==0) hits.push({'name': "upgrade"});
          callback(err, hits)
        });
      }
    );
  } else {
    console.log('No Filters')
    callback()
  }
};

export function papers_kits(callback) {
  db.groups.aggregate(
   [
    { "$match" : { $or: [
      {"papersKit.beginnersIds": { $exists: true } },
      {"papersKit.intermediateIds": { $exists: true } },
      {"papersKit.advancedIds": { $exists: true } },
    ] } },
    { "$project":
      {
        _id: 0, groupIndex: 1, country: 1, topics: 1,
        beginners: { $size: "$papersKit.beginnersIds" },
        intermediate: { $size: "$papersKit.intermediateIds" },
        advanced: { $size: "$papersKit.advancedIds" }
      }
    }
   ]
  ).toArray(callback);
};
