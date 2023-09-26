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

import { Affiliation, Countries } from '../models/shared.ts';

exports.version = "0.1.0";

export function createDepartment(data, createMode: number, callback) {
  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        backhelp.verify(data, ["university", "department", "groupId"]);
      } catch (e) {
        cb(e);
        return;
      }
      cb(null, data);
    },

    // 2. create department document
    function (department_data, cb) {

      const departmentIndex =
        {
          "department": { "_id": null, "name": department_data.department, "link": misc.NFD(department_data.department), "pic": null },
          "university": { "_id": null, "name": department_data.university, "link": misc.NFD(department_data.university), "pic": null }
        }

      if (createMode<2) {
        db.departments.insertOne(
          {
            "stage": 1, // 0
            "type": 0, // Department / 1: Program / 2: Center
            "departmentIndex": departmentIndex,
            "contactsPageItems": {
              "findUs": null,
              "findUsPic": null,
              "findUsCaption": null
            },
            "contactsItems": {
              "contactsIds": [],
            },
            "groupsItems": [department_data.groupId],
            "news": null
          },
          { w: 1, safe: true }, function(err, docsInserted) {
            const departmentId: string = docsInserted.insertedId;
            news.follow_feed(departmentId, departmentId, 200, 0, function (err) {
              cb(err, docsInserted.insertedId);
            })
          }
        );
      } else if (createMode==2) {
        // db.departments.findAndModify(
        db.departments.findOneAndUpdate(
            {
              "departmentIndex.department.name": department_data.department,
              "departmentIndex.university.name": department_data.university
            }, // query
            // [ ["departmentIndex.department.name", 1] ],                     // sort
            { "$push": { "groupsItems": department_data.groupId } },           // doc
            // { "new": true },                                                // options
            function(err, doc){                                                // callback
                if (err){
                  throw err;
                } else if(doc){
                  cb(null, doc.value._id)
                }
            }
        );
      }

    }

  ],
  function (err, departmentId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : departmentId);
    }
  });
};

export function createDepartmentAdmin(data, univeristy, type, callback) {

  const typeName = ['department', 'program', 'center'];
  const countries = Countries;

  async.waterfall([

    // 1. validate data.
    function (cb) {
      try {
        backhelp.verify(data, [ "name", "link" ]);
      } catch (e) {
        cb(e);
        return;
      }
      cb();
    },

    // 2. create department document
    function (cb) {
      const departmentIndex = {
        "department": { "_id": null, "name": data.name, "link": data.link, "pic": data.pic },
        "university": { "_id": univeristy._id, "name": univeristy.name, "link": univeristy.link, "pic": univeristy.pic }
      }

      db.departments.insertOne(
        {
          "stage": 1,
          "type": type, // 0: Department / 1: Program / 2: Center
          "departmentIndex": departmentIndex,
          "contactsPageItems": {
            "findUs": null,
            "findUsPic": null,
            "findUsCaption": null
          },
          "contactsItems": {
            "contactsIds": [],
          },
          "groupsItems": [],
          "news": null,
          "description": data.description,
          "source": data.source,
          "externalLink": data.website,
          "country": univeristy.country,
          "state": univeristy.state,
          "city": univeristy.city,
          "location": univeristy.location
        },
        { w: 1, safe: true }, function(err, docsInserted) {

          const departmentId: string = docsInserted.insertedId;
          client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').getObject(univeristy._id, (err, content) => {
            const object = {
              _id: departmentId,
              type: typeName[type],
              name: departmentIndex.department.name,
              link: departmentIndex.department.link,
              pic: departmentIndex.department.pic,
              description: data.description,
              website: data.website,
              // score:
              // rank:
              // size:
              // establish: item.homePageItems.establish ? new Date(item.homePageItems.establish).getFullYear() : null,
              country: univeristy.country ? countries[countries.findIndex(y => y.id == univeristy.country)].name : null,
              state: univeristy.state ? univeristy.state : null,
              city: univeristy.city ? univeristy.city : null,
              _geoloc: (univeristy.location && univeristy.location[0]) ? { lat: univeristy.location[0], lng: univeristy.location[1] } : { lat: '', lng: '' }
            };
            if (content==undefined) {
              callback(null, departmentId)
            } else {
              if (content && content.departments) content.departments.push(object); else content.departments=[object];
              client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').partialUpdateObject({
                objectID: univeristy._id,
                departments: content.departments
              }, (err, content) => {
                callback(err, departmentId)
              });
            }
          });
        }
      );
    }
  ],
  function (err, departmentId) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : departmentId);
    }
  });
};

export function department_id(university: string, department: string, mode: number, callback) {

  var key = (mode==1) ? "link" : "name";

   db.departments
    .find({ $and: [
                   { ["departmentIndex.department."+key]: department},
                   { ["departmentIndex.university."+key]: university}
                  ]}
         )
    .project({_id: 1, stage: 1})
    .next().then(function(items) {
      callback(null, (items) ? ((items.stage==1) ? items._id : null) : null)
    });
}

export function departments_list(departmentsIds, mode, callback) {

  const f = (mode==1) ?
            {_id: 1, type: 1, stage: 1, departmentIndex: 1, externalLink: 1,
             description: 1, source: 1, twitter: 1, publicInfo: 1, socialInfo: 1,
             groupsItems: 1, pics: 1, country: 1, state: 1, city: 1, location: 1} :
            {"departmentIndex.department": 1, externalLink: 1, source: 1, description: 1,
             country: 1, state: 1, city: 1, location: 1}

  db.departments
    .find({_id: { $in: departmentsIds } })
    .project(f)
    .toArray(callback);
}

export function department_home_items(departmentId: string, callback) {

  async.waterfall([

    function (cb) {
      db.departments.aggregate(
       [
        { "$match" : { _id: ObjectID(departmentId) } },
        { "$project": { _id: 0, stage: 1,  groups: { $size: "$groupsItems" }, details: 1 } }
       ]
     ).next(callback);
      // db.departments
      //   .find({ _id: ObjectID(departmentId) })
      //   .project({_id: 1, stage: 1, groups: { $size: "$groupsItems" }, details: 1})
      //   .next().then(function(items) {
      //     cb(null, items)
      //   });
    },


 ],
 function (err, items) {
   callback(err, items);
 });

}

export function post_affiliation(affiliation: Affiliation, departmentId: string, callback) {
  var object = [];

  async.series({

    // 1. update Department item
    department: function (cb) {
      pics.delete_pic("departments", "departmentIndex.department.pic", departmentId, affiliation.pic, false, function(err) {
        db.departments.updateOne(
           { _id: ObjectID(departmentId)},
           { $set:
             {
              "departmentIndex.department.name": affiliation.title,
              "departmentIndex.department.link": affiliation.abbr,
              "departmentIndex.department.pic": affiliation.pic,
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

    // 2. update University item
    university: function (cb) {
      db.universities.updateOne(
         {
          "departmentsItems.departments._id": ObjectID(departmentId)
         },
         { $set:
           {
            "departmentsItems.departments.$.name": affiliation.title,
            "departmentsItems.departments.$.link": affiliation.abbr,
            "departmentsItems.departments.$.pic": affiliation.pic
           }
         },
         { safe: true },
         cb()
      )
    },

    // 3. update Group item
    groups: function (cb) {
      db.groups.updateMany(
        {
         "groupIndex.department._id": ObjectID(departmentId)
        },
        { $set:
          {
            "groupIndex.department.name": affiliation.title,
            "groupIndex.department.link": affiliation.abbr,
            "groupIndex.department.pic": affiliation.pic,

            "homePageItems.affiliations.1.title": affiliation.title,
            "homePageItems.affiliations.1.pic": affiliation.pic,
            "homePageItems.affiliations.1.description": affiliation.description,
            "homePageItems.affiliations.1.source": affiliation.source,
            "homePageItems.affiliations.1.externalLink": affiliation.externalLink
          }
        },
        { safe: true },
        // cb()
      ).then(function(item) {
        db.groups
          .find({ "groupIndex.department._id": ObjectID(departmentId) })
          .project({ _id: 1, groupIndex: 1, resourcesItems: 1 })
        .toArray().then(function(groups) {

          var object = [];

          async.forEachOf(groups, function (group, index, callback) {
            object.push({
              objectID: group._id,
              groupIndex: {
                university: group.groupIndex.university,
                department: {
                  _id: departmentId,
                  name: affiliation.title,
                  link: affiliation.abbr,
                  pic: affiliation.pic
                },
                group: group.groupIndex.group
              }
            });

            groups_data.post_items_algolia(group.groupIndex, (group.resourcesItems || {}).resourcesIds, function (err) {
              callback(err);
            });

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

export function post_groups_location(lat: number, lng: number, country: number, state: string, city: string, departmentId: string, callback) {
  const countries = Countries;
  const countryName: string = countries[countries.findIndex(y => y.id == country)].name;
  const locObj = {lat: lat, lng: lng};

  var objectGroups = [];

  db.groups.updateMany(
    { "groupIndex.department._id": ObjectID(departmentId) },
    { $set: { "location": [lat, lng], "country": country, "state": state, "city": city } },
    { safe: true },
  ).then(function(items) {
    db.groups.find({ "groupIndex.department._id": ObjectID(departmentId), "stage": 2 })
             .project({ "_id": 1 })
             .toArray().then(function(groups) {
      groups.forEach((group, index) => {
        objectGroups.push({
          objectID: group._id,
          country: countryName,
          state: state,
          city: city,
          _geoloc: locObj
        });
      })
      // ONLY LABS: as services don't have parent Department
      client.initIndex((process.env.PORT) ? 'labs': 'dev_labs').partialUpdateObjects(objectGroups, (err, content) => {
        callback(err);
      });
    })
  })
}

export function post_home_details(extra: any, departmentId: string, callback) {
  db.departments.updateOne(
     {_id: ObjectID(departmentId)},
     { $set:
       {
         "details": {
           "name_original": extra.name_original,
           "establish": extra.establish,
           "motto": extra.motto,
           "motto_english": extra.motto_english,
           "students_number": extra.students_number,
           "doctoral_numbers": extra.doctoral_numbers,
           "staff_number": extra.staff_number
           // distance_learning
         }
       },
     },
     { safe: true },
     callback()
  )
}

export function delete_department(departmentId: string, callback) {
  async.series({

    // 1. pull from University, Contacts Links
    links: function (cb) {
      db.departments.findOne(
         {_id: ObjectID(departmentId)},
         {_id: 0, "departmentIndex.university._id": 1, "departmentIndex.department.pic": 1, "contactsItems.contactsIds": 1}
      ).then(function(item) {
        async.parallel({

          university: function (cb) {
            db.universities.updateOne(
               { _id: ObjectID(item.departmentIndex.university._id) },
               { $pull: { "departmentsItems.departments": {"_id": ObjectID(departmentId)} } },
               { safe: true },
               cb()
            )
          },

          pic: function (cb) {
            pics.delete_pic_direct(item.departmentIndex.department.pic, function(err) {
              cb()
            })
          },

          contacts: function (cb) {
            if (item.contactsItems.contactsIds) {
              db.contacts.deleteMany(
                 {_id: {$in: item.contactsItems.contactsIds}},
                 { multi: true, safe: true },
                 cb()
              )
            } else {
              cb()
            }
          },

          algolia: function (cb) {
            client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').getObject(item.departmentIndex.university._id, (err, content) => {
              if (content==undefined) {
                cb(err)
              } else {
                content.departments = content.departments.filter(r => r._id!=departmentId);
                client.initIndex((process.env.PORT) ? 'institutes': 'dev_institutes').partialUpdateObject({
                  objectID: item.departmentIndex.university._id,
                  departments: content.departments
                }, (err, content) => {
                  cb(err)
                });
              }
            });
          }
        },
        function (err) {
          cb(err);
        });
      });
    },

    // 2. delete Department Item
    department: function (cb) {
      db.departments.deleteOne(
        { _id: ObjectID(departmentId) },
        { safe: true },
        cb()
      );
    }

  },
  function (err) {
    callback(err);
  });

}

export function department_account(id: string, callback) {
  var m = { "$match" : {"_id" : ObjectID(id) } };
  var f = ({ "$project" : {_id: 0, "stage": 1, "description": 1, "source": 1, "externalLink": 1} });

  db.departments.aggregate( [ m, f ] ).next(callback);
}

export function department_page_items(page: string, departmentId: string, callback) {
  db.departments
    .find(ObjectID(departmentId))
    .project({[page]: 1, stage: 1, _id: 0})
    .next().then(function(items) {
      callback(null, (items) ? ((items.stage==1) ? items[page] : null) : null)
    });
}

export function department_items_ids(page: string, departmentId: string, callback) {
   db.departments
    .find(ObjectID(departmentId))
    .project({[page]: 1, stage: 1, _id: 0})
    .next().then(function(items) {
      callback(null, items ? ((items.stage==1) ? items[page] : null) : null)
    });
}

export function departments_items_ids(page: string, departmentsIds: string[], callback) {
   db.departments
   .find({_id: { $in : departmentsIds}})
    .project({[page]: 1, stage: 1, _id: 0})
    .toArray().then(function(items) {
      const ids: string[] = (items) ? [].concat(...items.filter(s=>s.stage==1).map(r => r[page])) : null;
      callback(null, ids)
    });
}
