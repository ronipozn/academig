var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var shared = require("./shared.ts");
var news = require("./news.ts");
var pics = require("./pics.ts");
var groups_data = require("./groups.ts");

var misc = require("../misc/misc.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

import { Rank, Affiliation } from '../models/shared.ts';

exports.version = "0.1.0";

export function createUniversity(data, createMode: number, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        backhelp.verify(data, [ "university"]);
      } catch (e) {
          cb(e);
          return;
      }
      cb(null, data);
    },

    // 2. create OR update university document, or just RETURN _id
    function (university_data, cb) {
      if (createMode==0) {

        let departmentsCategoryId = ObjectID();

        // https://stackoverflow.com/questions/286921/efficiently-replace-all-accented-characters-in-a-string/42163018#42163018
        db.universities.insertOne(
          {
            "stage": 1, // 0,
            "name": university_data.university,
            "link": misc.NFD(university_data.university),
            "pic": null,
            "contactsPageItems": {
              "findUs": null,
              "findUsPic": null,
              "findUsCaption": null
            },
            "contactsItems": {
              "contactsIds": [],
            },
            "departmentsItems": {
              "categories": [
                              { "id": departmentsCategoryId, "name": "Departments" }, // university_data.unit }
                              // { "id": 0,  "name:": null }, // university_data.unit }
                              { "id": ObjectID(), "name": "Programs" },
                              { "id": ObjectID(), "name": "Centers" },
                            ],
              "departments": university_data.departmentId ?
                              [ {
                                "_id": university_data.departmentId,
                                "stage": 1,
                                "categoryId": departmentsCategoryId,
                                "name": university_data.department,
                                "link": misc.NFD(university_data.department),
                                "pic": null
                              } ] : [ ]
            },
            "news": null,
          },
          { w: 1, safe: true }, function(err, docsInserted) {
            const univeristyId: string = docsInserted.insertedId;
            news.follow_feed(univeristyId, univeristyId, 300, 0, function (err) {
              const object = [{
                objectID: univeristyId,
                name: university_data.university,
                link: misc.NFD(university_data.university),
                pic: null,
                departments: [{
                  _id: university_data.departmentId,
                  categoryId: 0,
                  name: university_data.department,
                  link: misc.NFD(university_data.department),
                  pic: null
                }]
                // score: null
                // rank: null,
                // establish: item.homePageItems.establish ? new Date(item.homePageItems.establish).getFullYear() : null,
                // peoples: peoplesObj,
                // country: item.country ? countries[countries.findIndex(y => y.id == item.country)].name : null,
                // state: item.state ? item.state : null,
                // city: item.city ? item.city : null,
                // _geoloc: (item.location && item.location[0]) ? { lat: item.location[0], lng: item.location[1] } : { lat: '', lng: '' }
              }];
              client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').addObjects(object, (err, content) => {
                cb(err, docsInserted.insertedId);
              });
            })
          }
        );

      } else if (createMode==1) {

        db.universities.findOneAndUpdate(
          { "_id": university_data.universityId },
          { "$push":
            {
              "departmentsItems.departments": {
                                               "_id": university_data.departmentId,
                                               "stage": 1,
                                               // "stage": 0,
                                               "categoryId": 0,
                                               "name": university_data.department,
                                               "link": misc.NFD(university_data.department),
                                               "pic": null
                                              }
            }
          },
          function(err, doc) {
            if (err) {
              throw err;
            } else if (doc) {
              client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').getObject(university_data._id, (err, content) => {
                const object = {
                  _id: university_data.departmentId,
                  type: 0,
                  categoryId: 0,
                  name: university_data.department,
                  pic: null,
                };
                if (content==undefined) {
                  cb(null, doc.value._id)
                } else {
                  if (content && content.departments) content.departments.push(object); else content.departments=[object];
                  client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').partialUpdateObject({
                    objectID: data.groupId,
                    departments: content.departments
                  }, (err, content) => {
                    cb(null, doc.value._id)
                  });
                }
              });
            }
          }
        );

      } else if (createMode==2) {

        db.universities
          .find({"name": university_data.university})
          .project({_id: 1})
          .next().then(function(university) {
            cb(null, university._id)
          });

      };

    }

  ],
  function (err, universityId) {
    callback(err, err ? null : universityId);
  });
};

export function createUniversitySkeleton(data, callback) {
  async.waterfall([
    function (cb) {
      db.universities.insertOne(
        {
          "stage": 1,
          "name": data.name,
          "link": data.link,
          "pic": data.pic,
          "contactsPageItems": {
            "findUs": null,
            "findUsPic": null,
            "findUsCaption": null
          },
          "contactsItems": {
            "contactsIds": [],
          },
          "departmentsItems": {
            "categories": [
                            // { "id": 0,  "name:": null }, // university_data.unit }
                            { "id": ObjectID(), "name": "Departments" }, // university_data.unit }
                            { "id": ObjectID(), "name": "Programs" },
                            { "id": ObjectID(), "name": "Centers" },
                            // { "id": ObjectID(), "name": "Exact Sciences", "icon": 0 },
                            // { "id": ObjectID(), "name": "Life Sciences", "icon": 1 },
                            // { "id": ObjectID(), "name": "Engineering", "icon": 2 },
                            // { "id": ObjectID(), "name": "Social Sciences", "icon": 3 },
                            // { "id": ObjectID(), "name": "Humanities", "icon": 4 },
                            // { "id": ObjectID(), "name": "Interdisciplinary Studies", "icon": 5 }
                          ],
            // "categories": [ ],
            "departments": [ ]
          },
          "news": null,
          "dates": new Date(),
          "description": data.description,
          "source": data.source,
          "externalLink": data.url,
          "country": Number(data.country_id),
          "state": data.state,
          "city": data.city
        },
        { w: 1, safe: true }, function(err, docsInserted) {
          // console.log('data',data)
          const univeristyId: string = docsInserted.insertedId;
          news.follow_feed(univeristyId, univeristyId, 300, 0, function (err) {
            const object = [{
              objectID: univeristyId,
              name: data.name,
              link: data.link,
              pic: data.pic,
              departments: []
              // score: null
              // rank: null,
              // establish: item.homePageItems.establish ? new Date(item.homePageItems.establish).getFullYear() : null,
              // peoples: peoplesObj,
              // country: item.country ? countries[countries.findIndex(y => y.id == item.country)].name : null,
              // state: item.state ? item.state : null,
              // city: item.city ? item.city : null,
              // _geoloc: (item.location && item.location[0]) ? { lat: item.location[0], lng: item.location[1] } : { lat: '', lng: '' }
            }];
            client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').addObjects(object, (err, content) => {
              cb(err, univeristyId);
            });
          });
        }
      );
    }
  ],
  function (err, universityId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : universityId);
    }
  });
};

export function updateUniversityAdmin(data, universityId: string, departmentId: string, itemId: string, callback) {
  if (universityId && departmentId) {
    db.universities.findOneAndUpdate(
      { "_id": ObjectID(universityId) },
      { "$push":
        {
          "departmentsItems.departments": {
                                           "_id": ObjectID(departmentId),
                                           "stage": 1,
                                           "categoryId": ObjectID.isValid(itemId) ? ObjectID(itemId) : 0,
                                           "name": data.name,
                                           "link": data.link,
                                           "pic": data.pic
                                          }
        }
      },
      function(err, doc) {
        callback(err)
      }
    );
  } else {
    callback()
  }
};

export function delete_university(universityId: string, callback) {
  async.series({

    // 1. delete University, Contacts Links
    links: function (cb) {
      db.universities.findOne(
         {_id: ObjectID(universityId)},
         {_id: 0, "pic": 1, "contactsItems.contactsIds": 1}
      ).then(function(item) {
        async.parallel({
          pic: function (cb) {
            pics.delete_pic_direct(item.pic, function(err) {
              cb()
            })
          },
          contacts: function (cb) {
            if (item.contactsItems.contactsIds) {
              db.contacts.deleteMany(
                 { _id: {$in: item.contactsItems.contactsIds} },
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          }
        },
        function (err) {
          cb(err);
        });
      });
    },

    // 2. delete University Item
    university: function (cb) {
      db.universities.deleteOne(
        { "_id": ObjectID(universityId) },
        { safe: true },
        cb()
      );
    },

    // 3. delete University Query
    universities_query: function (cb) {
      db.universities_query.updateOne(
        { "academigId": ObjectID(universityId) },
        { $unset: { "academigId": "" } },
        { safe: true },
        cb()
      );
    },

    // 4. delete University Algolia
    algolia: function (cb) {
      client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').deleteObject(universityId, (err, content) => {
        cb(err)
      });
    }

  },
  function (err) {
    // 4. convert errors to something we like.
    callback(err);
  });

}

export function post_affiliation(affiliation: Affiliation, universityId: string, callback) {
  async.series({

    // 1. update University item (+Delete Asset)
    university: function (cb) {
      pics.delete_pic("universities", "pic", universityId, affiliation.pic, false, function(err) {
        db.universities.updateOne(
           {_id: ObjectID(universityId)},
           { $set:
             {
               "name": affiliation.title,
               "link": affiliation.abbr,
               "pic": affiliation.pic,
               "description": affiliation.description,
               "source": affiliation.source,
               "externalLink": affiliation.externalLink
             },
           },
           { safe: true },
           cb()
        )
      })
    },

    // 2. update University Query item
    university_query: function (cb) {
      db.universities_query.updateOne(
         { "academigId": ObjectID(universityId) },
         { $set:
           {
             "name": affiliation.title,
             "link": affiliation.abbr,
             "description": affiliation.description,
             "source": affiliation.source,
             "externalLink": affiliation.externalLink
           },
         },
         { safe: true },
         cb()
      )
    },

    // 3. update Department item
    departments: function (cb) {
      db.departments.updateMany(
        { "departmentIndex.university._id": ObjectID(universityId) },
        { $set:
          {
            "departmentIndex.university.name": affiliation.title,
            "departmentIndex.university.link": affiliation.abbr,
            "departmentIndex.university.pic": affiliation.pic
          }
        },
        { safe: true },
        cb()
      )
    },

    // 4. update Group item
    groups: function (cb) {
      db.groups.updateMany(
        {
         "groupIndex.university._id": ObjectID(universityId)
        },
        { $set:
          {
            "groupIndex.university.name": affiliation.title,
            "groupIndex.university.link": affiliation.abbr,
            "groupIndex.university.pic": affiliation.pic,

            "homePageItems.affiliations.0.title": affiliation.title,
            "homePageItems.affiliations.0.pic": affiliation.pic,
            "homePageItems.affiliations.0.description": affiliation.description,
            "homePageItems.affiliations.0.source": affiliation.source,
            "homePageItems.affiliations.0.externalLink": affiliation.externalLink
          }
        },
        { safe: true },
      ).then(function(item) {
        db.groups
          .find({ "groupIndex.university._id": ObjectID(universityId) })
          .project({ _id: 1, groupIndex: 1, resourcesItems: 1 })
        .toArray().then(function(groups) {

          var object = [];

          async.forEachOf(groups, function (group, index, callback) {
            object.push({
              objectID: group._id,
              groupIndex: {
                university: {
                  _id: universityId,
                  name: affiliation.title,
                  link: affiliation.abbr,
                  pic: affiliation.pic
                },
                department: group.groupIndex.department,
                group: group.groupIndex.group
              }
            });

            // groups_data.post_items_algolia(group.groupIndex, (group.resourcesItems || {}).resourcesIds, function (err) {
              callback();
              // callback(err);
            // });

          }, function (err) {
            client.initIndex((process.env.PORT) ? 'labs': 'dev_labs').partialUpdateObjects(object, (err, content) => {
              cb(err);
            });
          })
        })
      })
    }

  },
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });

}

export function post_home_details(extra: any, universityId: string, callback) {
  db.universities.updateOne(
     {_id: ObjectID(universityId)},
     { $set:
       {
         "details": {
           "name_original": extra.name_original,
           "establish": extra.establish,
           "motto": extra.motto,
           "motto_english": extra.motto_english,
           "students_number": extra.students_number,
           "doctoral_numbers": extra.doctoral_numbers,
           "staff_number": extra.staff_number,
           "control_type": extra.control_type,
           "entity_type": extra.entity_type,
           "setting": extra.setting,
           "religious": extra.religious,
           "calendar": extra.calendar,
           "admission_rate": extra.admission_rate,
           "admission_office": extra.admission_office,
           "libraray_facilities": extra.libraray_facilities,
           "housing_facilities": extra.housing_facilities,
           "sports_facilities": extra.sports_facilities,
           // distance_learning
           "undergraduate_tutition": extra.undergraduate_tutition,
           "postgraduate_tutition": extra.postgraduate_tutition
         }
       },
     },
     { safe: true },
     callback()
  )
}

export function university_activate(id: string, academigId: string, name: string, callback) {
  db.universities_query.updateOne(
    { _id: ObjectID(id) },
    { $set: { "academigId": ObjectID(academigId), "name": name } },
    { safe: true },
    callback()
  );
}

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////////////// Get ////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function university_id(university: string, mode: number, callback) {
  var key = (mode==1) ? "link" : "name";

  db.universities
    .find({ [key]: university})
    .project({_id: 1, stage: 1})
    .next().then(function(items) {
      callback(null, (items) ? ((items.stage==1) ? items._id : null) : null)
    });
}

export function universities_list(mode: number, id: string, state: string, city: string, callback) {

  var collection: string;
  var m = {}; var s= {};
  var p, c;

  p = { _id: 1, name: 1, link: 1, pic: 1, country: 1, state: 1, city: 1, establish: 1, rank: 1 };

  switch (mode) {

    case 2: // World Wide
      m = { $or: [
        { "rank.times": { $gt: 0 } },
        { "rank.shanghai": { $gt: 0 } },
        { "rank.top": { $gt: 0 } },
        { "rank.usnews": { $gt: 0 } },
      ] }
      break;

    case 3: { // By Continent
      m = { $or: [
        { "rank.times": { $gt: 0 } },
        { "rank.shanghai": { $gt: 0 } },
        { "rank.top": { $gt: 0 } },
        { "rank.usnews": { $gt: 0 } },
      ] }
      switch (Number(id)) {
        case 0: c = { $in : [28, 660, 533, 44, 52, 84, 60, 92, 124, 136, 188, 192, 212, 214, 222, 304, 308, 312, 320, 332, 340, 388, 474, 484, 500, 558, 591, 630, 659, 670, 780, 796, 840, 850]}; break; // North America
        case 1: c = { $in : [32, 68, 76, 152, 170, 218, 254, 328, 600, 604, 239, 740, 858, 862]}; break; // South America
        case 2: c = { $in : [8, 20, 40, 112, 56, 70, 100, 191, 196, 203, 208, 233, 246, 250, 276, 300, 348, 352, 372, 380, 428, 438, 440, 442, 807, 470, 498, 492, 499, 528, 578, 616, 620, 642, 643, 674, 688, 703, 705, 724, 752, 756, 804, 826]}; break; // Europe
        case 3: c = { $in : [72, 854, 108, 120, 132, 140, 148, 174, 178, 262, 818, 226, 232, 231, 266, 270, 288, 324, 324, 404, 426, 430, 434, 450, 454, 466, 478, 480, 504, 508, 516, 562, 566, 646, 678, 686, 690, 694, 706, 710, 736, 748, 834, 768, 788, 800, 732, 894, 716]}; break; // Africa
        case 4: c = { $in : [4, 51, 31, 48, 50, 96, 116, 156, 626, 268, 356, 360, 364, 368, 376, 392, 400, 398, 414, 417, 422, 458, 462, 496, 104, 524, 410, 512, 586, 608, 275, 634, 682, 702, 410, 144, 760, 762, 764, 792, 795, 158, 784, 860, 704, 887]}; break; // Asia
        case 5: c = { $in : [36, 583, 242, 296, 584, 520, 554, 585, 598, 882, 90, 776, 798, 548]}; break; // Oceania
        // case 0: c = { $in : [840, 124, 660]}; break; // North America
        // case 1: c = { $in : []}; break; // South America
        // case 2: c = { $in : [8, 20]}; break; // Europe
        // case 3: c = { $in : [12, 24]}; break; // Africa
        // case 4: c = { $in : [4]}; break; // Asia
        // case 5: c = { $in : []}; break; // Oceania
      }
      m['country'] = c;
      break;
    }

    case 4: { // By Country
      m['country'] = Number(id);;
      if (state!='') m['state'] = state.replace(/_/g, ' ');
      if (city!='') m['city'] = city.replace(/_/g, ' ');
      break;
    }

    case 5: s['rank.facebook'] = 1; break; // By Facebook
    case 6: s['rank.twitter'] = 1; break; // By Twitter
    case 7: s['rank.linkedin'] = 1; break; // By Linkedin
    case 8: s['rank.instagram'] = 1; break; // By Instagram
    case 9: s['rank.youtube'] = 1; break; // By Youtube
    // Case 11: By Language

  }

  console.log("m",m)
  // console.log("p",p)

  // https://stackoverflow.com/questions/20348093/mongodb-aggregation-how-to-get-total-records-count
  var curFind = db.universities.aggregate(
    [
     { $match: m },
     { $project: p },
     // { $sort: s },
     { $facet: {
                // results: [{ $skip: skipPage }, { $limit: perPage }],
                results: [ { $limit: 1000 } ],
                totalCount: [ { $count: 'count' } ]
               }
     }
    ]
  );

  curFind.limit(1000).toArray().then(function(items) {
    // callback(null, items ? items[0].results : null, (items && items[0].totalCount[0]) ? items[0].totalCount[0].count : 0)
    callback(null, items ? items[0].results : null)
  })
}

export function university_details(universityId: string, type: number, callback) {

  var f;

  if (type==0) {
    f = {_id: 1, name: 1, link: 1, pic: 1, location: 1}
  } else if (type==1) {
    f = {_id: 1, name: 1, link: 1, pic: 1, externalLink: 1, description: 1, source: 1,
         publicInfo: 1, socialInfo: 1, pics: 1, location: 1, country: 1, state: 1, city: 1}
  } else if (type==2) {
    f = {_id: 1, name: 1, link: 1, pic: 1, country: 1, state: 1, city: 1, location: 1}
  }

  db.universities
    .find({ _id: universityId })
    .project(f)
    .next(callback);
}

export function university_details_category(universityId: string, categoryId: string, callback) {
  db.universities
    .find({ _id: universityId, "departmentsItems.categories": { $elemMatch: { id: categoryId } } })
    .project({ _id: 1, name: 1, link: 1, pic: 1, country: 1, state: 1, city: 1, location: 1, "departmentsItems.categories.$": 1 })
    .next(callback);
}

export function university_home_items(universityId: string, callback) {

  async.waterfall([

    function (cb) {
      db.universities
        .find({ _id: ObjectID(universityId) })
        .project({_id: 1, stage: 1, rank: 1, details: 1})
        .next().then(function(items) {
          cb(null, items)
        });
    },

    function (items, cb) {
      university_departments_ids(universityId, 0, null, function (err, departmentsItems) {
        cb(err, Object.assign(items, departmentsItems))
      });
    },

    // citationsTotal
    // citationsCount
    // object.journals = Array.from(new Set(publications.map(r => r.journal)));

 ],
 function (err, items) {
   callback(err, items);
 });

}

export function university_departments_ids(universityId: string, mode: number, query: string, callback) {
  // 1 - Departments By UniversitytId (query)
  // 0 - Units And Departments By UniversitytId

  const m = { "$match" : { $and: [{"_id": ObjectID(universityId)}, {"stage": 1}] } };

  const f = { "$project" : {"_id": 0,
                             "departmentsItems.departments": {
                                $filter: {
                                   input: "$departmentsItems.departments",
                                   as: "department",
                                   cond: { $eq: [ "$$department.stage", 1 ] }
                                },
                             },
                             "departmentsItems.categories": 1,
                           }
            };

  db.universities.aggregate([m,f]).next().then(function(items) {

    if (items) {

      var departmentObj = items["departmentsItems"];

      if (mode==1) {

        var matchedDepartments;
        if (query) {
           const regex = new RegExp(".*" + query + "*.",'i')
           matchedDepartments = departmentObj.departments.filter(r => r.name.match(regex)).slice(0,9);
        } else {
           matchedDepartments = departmentObj.departments;
        }

        matchedDepartments.forEach(function(v) {
           delete v.stage;
           delete v.categoryId}
        );

        callback(null, matchedDepartments)

     } else {

        callback(null, departmentObj)

     };

   } else {

     callback(null, null)

   };

 });

}

export function university_account(id: string, callback) {
  var m = { "$match" : {"_id" : ObjectID(id) } };
  var f = ({ "$project" : { _id: 0, "stage": 1, "description": 1, "source": 1, "externalLink": 1, "country": 1, "state": 1, "city": 1, "rank": 1} });

  db.universities.aggregate( [ m, f ] ).next(callback);
}

export function universities_rank(ids: string[], callback) {
  var m = { "$match" : {"_id" : { "$in" : ids } } };
  var a = { "$addFields" : { "__order" : { "$indexOfArray" : [ ids, "$_id" ] } } };
  var s = { "$sort" : { "__order" : 1 } };
  var f = { "$project" : { _id: 0, rank: 1 } };

  db.universities.aggregate( [ m, a, s, f ] ).toArray(callback);
}

export function university_page_items(page: string, universityId: string, callback) {
  db.universities
    .find(ObjectID(universityId))
    .project({[page]: 1, stage: 1, _id: 0})
    .next().then(function(items) {
      callback(null, (items) ? ((items.stage==1) ? items[page] : null) : null)
    });
}

export function university_items_ids(page: string, universityId: string, callback) {
   db.universities
    .find({$and: [
                  {"_id": ObjectID(universityId)},
                  {"stage": 1}
                 ]})
    .project({[page]: 1, _id: 0})
    .next().then(function(items) {
      callback(null, items[page])
    });
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////// Unit ////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function put_unit(name: string, icon: number, universityId: string, callback) {
  async.waterfall([
    // insert Unit
    function (cb) {
      const unitId = ObjectID();
      db.universities.updateOne(
         {_id: ObjectID(universityId)},
         { $push:
           {
             "departmentsItems.categories":
                {
                  "id": unitId,
                  "name": name,
                  "icon": icon
                }
           }
         },
         { safe: true },
         cb(null, unitId)
      )
    }
  ],
  function (err, unitId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : unitId);
    }
  });
};

export function post_unit(name: string, icon: string, itemId: string, universityId: string, callback) {
  async.waterfall([
    // update Unit
    function (cb) {
      db.universities.updateOne(
        { _id: ObjectID(universityId), "departmentsItems.categories.id": ObjectID(itemId) },
        { $set:
          {
            ["departmentsItems.categories.$.name"]: name,
            ["departmentsItems.categories.$.icon"]: icon
          }
        },
        { safe: true },
        cb()
      );
    }
  ],
  function (err) {
    callback(err);
  });
};

export function delete_unit(universityId: string, itemId: string, callback) {
  async.series({
    // delete Unit
    member: function (cb) {
      db.universities.updateOne(
        { _id: ObjectID(universityId)},
        { $pull: { 'departmentsItems.categories': {id: ObjectID(itemId)} } },
        { multi: false, safe: true },
        cb()
      )
    }
  },
  function (err) {
    callback(err);
  });
}

export function updateDepartmentUnitAdmin(universityId: string, departmentId: string, itemId: string, callback) {
  async.waterfall([
    function (cb) {
      db.universities.updateOne(
        { "_id": ObjectID(universityId), "departmentsItems.departments._id": ObjectID(departmentId) },
        { "$set":
          {
            "departmentsItems.departments.$.categoryId": ObjectID.isValid(itemId) ? ObjectID(itemId) : 0
          }
        },
        function(err, doc) {
          cb(err)
        }
      );
    }
  ],
  function (err) {
    callback(err);
  });
};

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////// universities_query /////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function university_query_add(academigId: string, name: string, url: string, country_id: number, callback) {
  db.universities_query.insertOne(
    {
      "academigId": ObjectID(academigId),
      "name": name,
      "url": url,
      "country_id": Number(country_id)
    },
    { w: 1, safe: true }, function(err, docsInserted) {
      callback()
    }
  );
}

export function university_query_delete(id: string, callback) {
  db.universities_query.deleteOne(
    { _id: ObjectID(id) },
    { safe: true },
    callback()
  );
}

export function university_item(query: string, callback) {
  const reg = query ? (".*" + query + "*.") : null;

  db.universities_query
    .find({"name": { $regex: new RegExp(reg), $options: 'i' } })
    .project({_id: 1, academigId: 1, name: 1, link: 1})
    .limit(10)
    .toArray(callback);
}

export function universities_query(query: string, mode: number, callback) {
  const reg = query ? (".*" + query + "*.") : null;

  if (mode==0) {

    db.universities_query
      .find({"name": { $regex: new RegExp(reg), $options: 'i', $nin: [ "Academig", "Company", "company" ] }  })
      .project({_id: 1, academigId: 1, name: 1, link: 1})
      .limit(10)
      .toArray(callback);

  } else if (mode==1) {

    db.universities_query
      .find({"name": { $regex: new RegExp(reg), $options: 'i' } })
      .project({_id: 1, academigId: 1, name: 1, link: 1})
      .limit(10)
      .toArray(callback);

  }
  //   var array = universitiesQ.map(r => r.academigId)
  //   var flatten = [].concat(...array)
}

// db.test.aggregate([
//       // Duplicate the docs, one per connections array element.
//       {$unwind: '$connections'},
//       // Only include the docs with the specified user id
//       {$match: {'connections.users.id': '50f651a3b58bba7fbec2f222'}},
//       // Bring group out to the only top level field and exclude _id
//       {$project: {_id: 0, group: '$connections.group'}}
// ])
