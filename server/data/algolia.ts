var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

var people_data = require("../data/peoples.ts");
var group_data = require("../data/groups.ts");

let serviceTypes = {
                    10: 'Analysis Service',
                    20: 'Mathematical Models',
                    30: 'Forecasting and Prediction',
                    40: 'Biostatistics',
                    50: 'Clinical Trials',
                    60: 'Scientific Consulting',
                    70: 'Medical Devices',
                    80: 'Clinical Research Development',
                    90: 'Food Science',
                    100: 'Food Technology',
                    110: 'Scientific Law',
                    120: 'Biotechnology',
                    130: 'Robotics',
                    140: 'Artificial Intelligence',
                    150: 'Synthesis Service',
                    160: 'Measurements Service',
                    170: 'Lab Equipment',
                    180: 'Calibration Service',
                    190: 'Lab Supply',
                    200: 'Software',
                    210: 'Simulation',
                    220: 'Prototyping',
                    230: 'Business Service',
                    240: 'Management Service',
                    250: 'Labeling Service',
                    260: 'Training Service',
                    270: 'Scientific Writing',
                    280: 'Visual Communication',
                    290: 'Scientific Editing',
                    300: 'Facilities'
                  };

import {Countries} from '../models/shared.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

export function add_labs(callback) {
  const countries = Countries;

  async.waterfall([

    function (cb) {
      db.groups
        .find({ stage: 2, "groupIndex.university.name": { $ne: "Academig" } })
        .project({
                  _id: 1, onBehalf: 1, dates: 1, stage: 1, groupIndex: 1,
                  "homePageItems.background": 1, "homePageItems.pic": 1, "homePageItems.intrests": 1,
                  "homePageItems.size": 1, "homePageItems.establish": 1,
                  country: 1, city: 1, state: 1, location: 1,
                  topicsItems: 1, "resourcesItems.resourcesIds": 1, "positionsItems.positionsIds": 1,
                  "peoplesItems.activesIds": 1, "eventsItems.eventsIds": 1
                }).toArray(cb);
    },

    function (labs, cb) {
      // console.log('labs',labs)

      var activesIds: string[];
      async.forEachOf(labs, function (lab, index, callback) {
        activesIds = lab.peoplesItems.activesIds;
        console.log('activesIds',activesIds)
        db.peoples
          .find({ _id: { $in: activesIds } })
          .project({
            _id: 1, name: 1, pic: 1, background: 1,
            // stage: 1, researchInterests: 1, score: 1
            // "positions.status": 1, "positions.mode": 1, "positions.period": 1, "positions.titles": 1, "positions.degree": 1
          })
          .toArray().then(function(items) {
            lab.peoples = items
            callback();
          });
      }, function (err) {
        cb(err,labs);
      })
    },

    function (labs, cb) {
      var projectsIds, currentProjectsIds, pastProjectsIds: string[];
      async.forEachOf(labs, function (lab, index, callback) {
        currentProjectsIds = lab.topicsItems ? [].concat(...lab.topicsItems.map(r => r.currentProjectsIds)) : [];
        pastProjectsIds = lab.topicsItems ? [].concat(...lab.topicsItems.map(r => r.pastProjectsIds)) : [];
        projectsIds = currentProjectsIds.concat(pastProjectsIds);
        // console.log('projectsIds',projectsIds)
        db.projects
          .find({ _id: { $in: projectsIds } }) // views, created_on: new Date(),
          .project({ _id: 1, name: 1, pic: 1, period: 1, description: 1 })
          .toArray().then(function(items) {
            lab.projects = items
            callback();
          });
      }, function (err) {
        cb(err,labs);
      })
    },

    function (labs, cb) {
      var resourcesIds: string[];
      async.forEachOf(labs, function (lab, index, callback) {
        resourcesIds = lab.resourcesItems.resourcesIds;
        // console.log('resourcesIds',resourcesIds)
        db.resources
          .find({ _id: { $in: resourcesIds } }) // views, created_on: new Date(),
          .project({ _id: 1, name: 1, pic: 1, categoryId: 1, categoryName: 1, description: 1, price: 1, rating: 1, tags: 1 })
          .toArray().then(function(items) {
            // console.log('resources',items)
            lab.resources = items
            callback();
          });
      }, function (err) {
        cb(err,labs);
      })
    },

    function (labs, cb) {
      var positionsIds: string[];
      async.forEachOf(labs, function (lab, index, callback) {
        positionsIds = lab.positionsItems.positionsIds;
        // console.log('positionsIds',positionsIds)
        db.positions
          .find({ _id: { $in: positionsIds } }) // views, created_on: new Date(),
          .project({ _id: 1, position: 1, positionName: 1, title: 1, type: 1, description: 1, spotsAvailable: 1, contractLength: 1, contractLengthType: 1, stepsDates: 1, stepsEnables: 1, tags: 1 })
          .toArray().then(function(items) {
            // console.log('positions',items)
            lab.positions = items
            callback();
          });
      }, function (err) {
        cb(err,labs);
      })
    },

    function (labs, cb) {
      var object = [];

      labs.forEach((lab, index) => {
        if (lab.stage>0 && !(lab.onBehalf==4 || lab.onBehalf==5 || lab.onBehalf==7) && lab.groupIndex.group.link!="academig") {
          object.push({
            objectID: lab._id,
            _id: lab._id,
            dates: lab.dates[0], // [lab.dates[0]],
            name: lab.groupIndex.group.name,
            background: lab.homePageItems.background,
            pic: lab.homePageItems.pic,
            interests: lab.homePageItems.intrests,
            groupIndex: lab.groupIndex,
            score: 0,
            peoples: lab.peoples,
            projects: lab.projects,
            resources: lab.resources,
            positions: lab.positions,
            size: lab.homePageItems.size,
            topic: lab.homePageItems.topic,
            establish: new Date(lab.homePageItems.establish).getFullYear(),
            country: lab.country ? countries[countries.findIndex(y => y.id == lab.country)].name : null,
            state: lab.state,
            city: lab.city,
            _geoloc: (lab.location && lab.location[0]) ? { lat: lab.location[0], lng: lab.location[1] } : { lat: '', lng: '' }
          });
        }
      });

      client.initIndex((process.env.PORT) ? 'labs': 'dev_labs').addObjects(object, (err, content) => {
        cb(err);
      });
    }

  ],
  function (err) {
    callback(err, null);
  });

};

export function add_services(callback) {
  const countries = Countries;

  async.waterfall([

    function (cb) {
      db.resources
        .find({ })
        .project({_id: 1, created_on: 1, name: 1, pic: 1, categoryId: 1,
                  description: 1, price: 1, rating: 1, tags: 1,
                  groupId: 1, profileId: 1, country: 1, state: 1, city: 1, location: 1
                 })
        .toArray(cb);
    },

    function (services, cb) {
      people_data.peoples_list(services.map(r => r.profileId), null, null, 1, null, function (err, items) {
        services.forEach(function(service) {
          service.profile=items.find(item => item._id == service.profileId)
          delete service.profileId;
        })
        cb(err,services);
      });
    },

    function (services, cb) {
      group_data.groups_list(services.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
        services.forEach(function(service) {
          service.group=(items.find(item => item._id.toString() == (service.groupId || {}).toString()) || {}).groupIndex
          delete service.groupId;
        })
        cb(err,services);
      });
    },

    function (services, cb) {
      var object = [];
      var typeName: string;

      services.forEach((service, index) => {

        if (service.profile) {
          typeName = "Researchers";
        } else if (service.group.university.name=="company") {
          typeName = "Companies";
        } else {
          typeName = "Labs";
        }

        object.push({
          objectID: service._id,
          _id: service._id,
          created_on: service.created_on, //
          name: service.name, //
          pic: service.pic, //
          type: typeName, //
          categoryId: service.categoryId, //
          categoryName: serviceTypes[service.categoryId], //
          description: service.description, //
          price: service.price, //
          rating: service.rating, //
          tags: service.tags, //
          group: service.group, //
          profile: service.profile, //
          country: service.country ? countries[countries.findIndex(y => y.id == service.country)].name : null,
          state: service.state, //
          city: service.city, //
          _geoloc: (service.location && service.location[0]) ? { lat: service.location[0], lng: service.location[1] } : { lat: '', lng: '' } //
        });
      });

      client.initIndex((process.env.PORT) ? 'services': 'dev_services').addObjects(object, (err, content) => {
        cb(err);
      });
    }

  ],
  function (err) {
    callback(err, null);
  });

};

export function add_researchers(callback) {
  const countries = Countries;

  async.waterfall([

    // 1. people List
    function (cb) {
      console.log("AR_1")
      db.peoples
        .find({stage: 2})
        // .limit(200)
        .project({_id: 1, created_on: 1, name: 1, pic: 1,
                  quote: 1, positions: 1,
                  followedIds: 1, // followedSize: { $size: "$followedIds" },
                  library: 1,
                  publicationsIds: 1, //publicationsSize: { $size: "$publicationsIds" },
                  views: 1, // views: "$views.total",
                  country: 1,
                  interests: 1,
                  background: 1
                  // state: 1, city: 1, location: 1
                 })
        .toArray(cb);
    },

    // 2. dress Stats
    function (researchers, cb) {
      console.log("AR_2")
      researchers.forEach(function(researcher) {
        researcher.followedSize = researcher.followedIds ? researcher.followedIds.length : 0,
        researcher.currentSize = (researcher.library && researcher.library.current) ? researcher.library.current.length : 0,
        researcher.publicationsSize = researcher.publicationsIds ? researcher.publicationsIds.length : 0,
        researcher.views = researcher.views ? researcher.views.total : 0,
        delete researcher.library;
      })
      cb(null,researchers);
    },

    // 3. dress Positions Groups
    function (researchers, cb) {
      console.log("AR_3")
      var arrays = researchers.map(r => r.positions.map(r=> r.groupId))
      var flatten = [].concat(...arrays)
      var group;
      group_data.groups_list(flatten, null, null, null, null, 2, true, function (err, items) {
        researchers.forEach(function(researcher) {
          researcher.positions.forEach(function(position) {
            group = items.find(item => item._id.toString() == position.groupId.toString());
            if (group && group.groupIndex.group.link!="academig") position.group=group.groupIndex;
            delete position.groupId;
          })
        })
        cb(err,researchers);
      });
    },

    // 4. dress Publication Read
    // console.log("AR_4")
    // function (peoples, cb) {
    //   if (mini==0) {
    //     var ids: string[] = peoples.map(r => r.currentId)
    //     var publication;
    //     publication_data.publications_list(ids, null, 5, 0, false, function (err, publications) {
    //       // console.log('publications',publications)
    //       if (publications && publications.length>0) {
    //         peoples.forEach(function(people) {
    //           // console.log('people',people)
    //           if (people.currentId) {
    //             publication = publications.find(publication => publication._id.toString() == people.currentId.toString());
    //             people.currentReading = publication
    //             delete people.currentId;
    //           }
    //         })
    //       }
    //       cb(err, peoples);
    //     })
    //   } else {
    //     cb(null, peoples)
    //   }
    // }

    // 5. populate Algolia
    function (researchers, cb) {
      console.log("AR_5")
      var object = [];
      var i = 0;

      researchers.forEach((researcher, index) => {
        object.push({
          objectID: researcher._id,
          _id: researcher._id,
          created_on: researcher.created_on, //
          name: researcher.name, //
          pic: researcher.pic, //
          positions: researcher.positions, //
          quote: researcher.quote,
          interests: researcher.interests,
          background: researcher.background,

          views: researcher.views, //
          followedSize: researcher.followedSize, //
          publicationsSize: researcher.publicationsSize, //
          currentSize: researcher.currentSize, //

          country: researcher.country ? countries[countries.findIndex(y => y.id == researcher.country)].name : null,
          // state: researcher.state, //
          // city: researcher.city, //
          // _geoloc: (researcher.location && researcher.location[0]) ? { lat: researcher.location[0], lng: researcher.location[1] } : { lat: '', lng: '' } //
        });
        i++;

        if (i==200) {
          client.initIndex((process.env.PORT) ? 'researchers': 'dev_researchers').addObjects(object, (err, content) => { });
          i=0;
          object = [];
        }
      });

      client.initIndex((process.env.PORT) ? 'researchers': 'dev_researchers').addObjects(object, (err, content) => {
        cb(err);
      });
    }

  ],
  function (err) {
    console.log('err',err)
    callback(err, null);
  });

};
