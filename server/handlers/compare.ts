var helpers = require('./helpers.ts');
var async = require("async");

var privilege_data = require("../data/privileges.ts");

var compare_data = require("../data/compare.ts");

var people_data = require("../data/peoples.ts");
var project_data = require("../data/projects.ts");
var resource_data = require("../data/resources.ts");
var funding_data = require("../data/fundings.ts");
var position_data = require("../data/positions.ts");
var publication_data = require("../data/publications.ts");
var galleries_data = require("../data/galleries.ts");
var teaching_data = require("../data/teachings.ts");
var universities_data = require("../data/universities.ts");
// var collaboration_data = require("../data/collaborations.ts");

var moment = require('moment');

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.groupsCompareByIds = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb (err, userId);
        })
      }
      // privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
      //   if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      // })
    },

    // 2. get user followings and compare group IDs
    function (userId: string, cb) {
      if (!req.user) {
        cb(null, [ObjectID.isValid(getp.id0) ? ObjectID(getp.id0) : null,
                  ObjectID.isValid(getp.id1) ? ObjectID(getp.id1) : null,
                  ObjectID.isValid(getp.id2) ? ObjectID(getp.id2) : null,
                  ObjectID.isValid(getp.id3) ? ObjectID(getp.id3) : null,
                  ObjectID.isValid(getp.id4) ? ObjectID(getp.id4) : null],
                  []);
      } else {
        people_data.get_compare_ids(userId, function (err, compareIds, followingIds) {
          cb(err, compareIds, followingIds);
        });
      }
    },

    // 3. assemble groups data (construct User data with isGroup)
    function (compareIds, followingIds, cb) {
      // console.log('compareIds',compareIds)
      if (compareIds && compareIds[0]) {
        compare_data.groups_compare(compareIds, followingIds, function (err, groups) {
          cb(err, groups);
        });
      } else {
        cb (null, []);
      }
    },

    // 4. People
    function (groups, cb) {
      // console.log('groups',groups)
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          people_data.peoples_list(group.activesIds.concat(group.alumniIds), group._id, null, 6, null, function (err, peoples) {
            group.peoples = peoples;
            delete group.activesIds;
            delete group.alumniIds;
            callback(err)
          });
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 5. Publications
    function (groups, cb) {
      console.log('Compare_5')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          publication_data.publications_list(group.publicationsIds, null, null, 4, 0, false, function (err, publications) {
            group.publicationsTotal = group.publicationsIds.length;
            group.citationsTotal = publications.map(r => r.citationsCount).reduce((a, b) => a + b, 0);
            group.publicationsCitations = publications.slice(0,3);
            group.publicationsLatest = publications.sort((a, b) => (moment(b.date) - moment(a.date))).slice(0,3);
            group.journals = Array.from(new Set(publications.map(r => r.journal)));

            const yearArrays = publications.map(r => (new Date(r.date)).getFullYear());
            const yearFlatten = [].concat(...yearArrays);
            group.yearUniqs = yearFlatten.reduce((acc, val) => {
              acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
              return acc;
            }, {});

            delete group.publicationsIds;
            callback(err)
          });
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 6. Projects
    function (groups, cb) {
      console.log('Compare_6')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          const currentProjectsIds: string[] = group.topicsItems ? group.topicsItems.map(r => r.currentProjectsIds) : [];
          const pastProjectsIds: string[] = group.topicsItems ? group.topicsItems.map(r => r.pastProjectsIds) : [];
          const ids: string[] = [].concat(...currentProjectsIds).concat([].concat(...pastProjectsIds));

          project_data.projects_list(ids, null, 1, 0, function (err, projects) {
            group.projects = projects;
            delete group.topicsItems;
            callback(err, groups)
          })
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 7. Services
    function (groups, cb) {
      console.log('Compare_7')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          resource_data.resources_list(group.resourcesIds, null, null, 1, 0, false, function (err, resources) {
            group.resources = resources;
            delete group.resourcesIds;
            callback(err, groups)
          })
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 8. Open Positions
    function (groups, cb) {
      console.log('Compare_8')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          position_data.positions_list(group.positionsIds, null, 0, 0, false, function (err, positions) {
            // console.log('positions',key,positions)
            group.positions = positions;
            delete group.positionsIds;
            callback(err)
          });
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 9. Funding
    function (groups, cb) {
      console.log('Compare_9')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          funding_data.fundings_list(group.fundingsIds, 1, 0, function (err, fundings) {
            // console.log('fundings',key,fundings)
            group.fundings = fundings;
            delete group.fundingsIds;
            callback(err)
          });
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 10. Teaching
    function (groups, cb) {
      console.log('Compare_10')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          teaching_data.teachings_list(group.teachingsIds, 0, function (err, teachings) {
            group.teachings = teachings;
            delete group.teachingsIds;
            callback(err)
          });
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 11. Galleries
    function (groups, cb) {
      console.log('Compare_11')
      if (groups && groups[0]) {
        async.forEachOf(groups, function (group, key, callback) {
          galleries_data.galleries_list(group.galleriesIds, 0, function (err, galleries) {
            // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
            group.galleries = galleries.map(r=>r.pics).flat();
            delete group.galleriesIds;
            callback(err)
          });
        }, function (err) {
          cb(err, groups)
        })
      } else {
        cb(null, groups)
      }
    },

    // 12. Ranking
    function (groups, cb) {
      console.log('Compare_12')
      if (groups && groups[0]) {
        universities_data.universities_rank(groups.map(r => r.groupIndex.university._id), function (err, ranks) {
          let i: number;
          if (ranks[0]._id) {
            groups.forEach((group, index) => {
              i = ranks.findIndex(y => y._id.toString() == group.groupIndex.university._id.toString());
              group.rank = (i>-1) ? ranks[i].rank : null
            });
            cb(err, groups)
          } else {
            cb(err, groups)
          }
        })
      } else {
        cb(null, groups)
      }
    }

  ],
  function (err, groups) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res, groups);
  });
}
