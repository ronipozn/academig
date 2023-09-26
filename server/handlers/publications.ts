const https = require('https');

var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var publication_data = require("../data/publications.ts");
var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var project_data = require("../data/projects.ts");
var resource_data = require("../data/resources.ts");
var private_data = require("../data/private.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var publication_misc = require("../misc/publications.ts");

import { Publication, PublicationDetails, CreatePublication } from '../models/publications.ts';

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.queryPublications = function (req, res) {
  var getp = req.query;

  // console.log('getp.term',getp.term)

  async.waterfall([

    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          cb(err, userId);
        })
      }
    },

    function (userId: string, cb) {
      https.get(`https://api.crossref.org/works?rows=10&query=` + getp.term + `&mailto=roni.pozner@gmail.com`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          try {
            var publications = JSON.parse(data).message.items.map(function(obj) {
              var rObj = obj;
              rObj['name'] = (obj && obj.title) ? obj.title[0] : null;
              return rObj;
            })
            // console.log('publication0',publications[0])
            // console.log('publication1',publications[1])
            cb(null, publications);
          } catch(e) {
            cb(e);
            return;
          }
        });

      }).on("error", (err) => {
        cb(err) // console.log("Error: " + err.message);
      });
    },

    function (publications, cb) {
      var existIndex: number;
      if (publications) {
        var dois: string[] = publications.map(r => r.DOI);
        publication_data.publications_dois(dois, function (err, existPublications) {
          publications.forEach(function(publication) {
            existIndex = existPublications.findIndex(r => r.doi == publication.DOI);
            if (existIndex>-1) {
              publication.doiFlag=existPublications[existIndex]._id ? true : false
              publication.author=existPublications[existIndex].authors
              publication.abstract=existPublications[existIndex].abstract
              publication.abstractPic=existPublications[existIndex].abstractPic
            }
            // publication.doiFlag=(existPublications.find(r => r.doi == publication.DOI) || {})._id;
          })
          cb(err, publications);
        })
      } else {
        cb(null, publications);
      }
    },

  ],
  function (err, publications) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, publications);
    }
  })
}

exports.suggestionPublications = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
          // console.log('suggestionPublications',(req.user.scope.indexOf('write:publications')))
          cb(err, ((req.user.scope.indexOf('write:publications')>-1) || mode==0) ? getp.id : userId);
        })
      }
    },

    function (parentId, cb) {
      publication_misc.retrieveSuggestions(mode, parentId, function (err, publicationsIds) {
        cb(err, publicationsIds)
      })
    }

  ],
  function (err, publicationsIds) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, publicationsIds);
    }
  })

}

exports.suggestionDecision = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var action = parseInt(getp.action);

  async.waterfall([

    function (cb) {
      console.log('SU_1')
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0) ? 0 : 10, function (err, userId, flag) {
          cb(err, (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId);
        })
      }
    },

    function (userId: string, cb) {
      console.log('SU_2')
      publication_data.post_suggestion_decision((mode==0) ? getp.id : userId, getp.itemId, action, mode, function (err) {
        cb(err, userId);
      })
    },

    function (userId: string, cb) {
      console.log('SU_3')
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);

      if (action==1) { // reject
        publication_data.reset_author(userId, getp.itemId, function (err) {
          cb(err)
        })
      } else if (action==0 && !adminFlag) { // accept
        publication_data.post_suggestion_news(userId, (mode==0) ? getp.id : userId, mode, getp.itemId, function (err) {
          cb(err)
        })
      } else {
        cb()
      }
    },

  ],
  function (err) {
    console.log('SU_4')
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, null);
    }
  })

}

exports.publicationsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var more = parseInt(getp.more);
  var searchCont: number = 0;

  async.waterfall([

    function (cb) {
      if (!req.user) {
        cb(null, null, null);
      } else {
        // privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, getp.id, (mode>=20 && mode<=22) ? 3 : 10, function (err, userId, flag) {
          cb(err, userId, flag);
        })
      }
    },

    function (userId: string, adminFlag: boolean, cb) {
      if (
          (!ObjectID.isValid(getp.id) && mode!=5 && mode!=7 && mode!=17 && mode!=8 && mode!=1 && mode!=0 && mode!=19) ||
          (!userId && (mode==7 || mode==17)) || // || mode==0 || mode==19
          (!getp.id && (mode==1 || mode==8))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null, userId, adminFlag);
    },

    function (userId: string, adminFlag: boolean, cb) {

      async.parallel({

        publicationsIds: function (callback) {
          switch (mode) {
            case 0: // Latest Reading
            case 19: // Researcher Library
              // people_data.get_followings_ids(0, userId, null, function (err, publicationsIds) {
              if (getp.id==null) {
                callback (null, []);
              } else {
                people_data.get_library_ids(userId, getp.id, function (err, library) {
                  // console.log('library',library);
                  if (library) {
                    let ids: string[];
                    if (mode==19) {
                      ids = [].concat(...Object.values(library));
                    } else if (mode==0) {
                      ids = library['current'];
                    }
                    // console.log('ids',ids);
                    callback (err, ids);
                  } else {
                    callback (err, []);
                  }
                });
              }
              break;
            case 1: // User Profile
              people_data.get_followings_ids(7, getp.id, null, function (err, publicationsIds) {
                shared_data.update_page_views('publications', getp.id, 1, userId, function (err) {
                  callback (err, publicationsIds);
                })
              });
              break;
            case 8: // User Background: Latest Publications
              people_data.get_followings_ids(7, getp.id, null, function (err, publicationsIds) {
                callback (err, publicationsIds);
              });
              break;
            case 2: // Group Publications
              group_data.group_items_ids("publicationsItems", getp.id, function (err, items) {
                shared_data.update_page_views('publications', getp.id, 0, userId, function (err) {
                  callback (err, (items || {}).publicationsIds);
                })
              });
              break;
            case 18: // Group AI
              group_data.group_items_ids("publicationsItems", getp.id, function (err, items) {
                callback (err, (items || {}).publicationsIds);
              });
              break;
            case 9: // Group Home: Latest Publications
              group_data.group_items_ids("publicationsItems", getp.id, function (err, items) {
                callback (err, (items || {}).publicationsIds);
              });
              break;
            case 3: // Project
              project_data.project_items_ids(0, getp.id, null, function (err, items) {
                callback (err, (items || {}).publicationsIds);
              });
              break;
            case 4: // Resource
              resource_data.resource_items_ids(0, getp.id, function (err, items) {
                callback (err, (items || {}).publicationsIds);
              });
              break;
            // case 5: // Search
            case 6: // Group Suggestions
            case 16: // Group Rejected
              group_data.group_items_ids("publicationsItems", getp.id, function (err, items) {
                callback (err, items ? ((mode==6) ? items.suggestionsIds : items.rejectedIds) : [] );
                // callback (err, (items || {}).suggestionsIds);
              });
              break;
            case 7: // Profile Suggestions
            case 17: // Profile Rejected
              const tempId = (req.user.scope.indexOf('write:publications')>-1) ? getp.id : userId
              people_data.get_followings_ids((mode==7) ? 17 : 20, tempId, null, function (err, publicationsIds) {
                callback (err, publicationsIds);
              });
              break;
            case 10: // Departments
            case 11: // Departments: Latest Publications
            case 14: // Departments (Search)
              department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
                group_data.groups_items_ids("publicationsItems", groupsIds, function (err, items) {

                  // const ids = (items || {}).publicationsIds;
                  const ids: string[] = (items) ? [].concat(...items.map(r => r.publicationsIds)) : null;

                  if (more==null) {
                    callback (helpers.no_such_item());
                  } else if (mode==10) {
                    searchCont = ids ? ids.length : 0;
                    callback (err, ids ? ids.slice(more*10, (more+1)*10-1) : []);
                  } else if (mode==11) {
                    callback (err, ids ? ids.slice(0, 3) : []);
                  } else if (mode==14) {
                    shared_data.search_ids_by_ids(getp.text, userId, 2, more, ids, function (err, projectsIds, count) {
                      searchCont = count;
                      callback (err, userId, projectsIds);
                    });
                  }
                })
              });
              break;
            case 12: // Universities
            case 13: // Universities: Latest Publications
            case 15: // Universities (Search)
              university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
                const departmentsIds = departments.map(r => r._id)
                if (departmentsIds[0]) {
                  department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                    group_data.groups_items_ids("publicationsItems", groupsIds, function (err, items) {

                      // const ids = (items || {}).publicationsIds;
                      const ids: string[] = (items) ? [].concat(...items.map(r => r.publicationsIds)) : null;

                      if (more==null) {
                        callback (helpers.no_such_item());
                      } else if (mode==12) {
                        searchCont = ids ? ids.length : 0;
                        callback (err, ids ? ids.slice(more*10, (more+1)*10-1) : []);
                      } else if (mode==13) {
                        callback (err, ids ? ids.slice(0, 3) : []);
                      } else if (mode==15) {
                        shared_data.search_ids_by_ids(getp.text, userId, 2, more, ids, function (err, publicationsIds, count) {
                          searchCont = count;
                          callback (err, userId, publicationsIds);
                        });
                      }
                    });
                  });
                } else {
                  callback (err, userId, []);
                }
              });
              break;
            case 20: // Group Papers Kit: Beginners
            case 21: // Group Papers Kit: Intermediate
            case 22: // Group Papers Kit: Advanced
              // group_data.group_items_ids("papersKit", getp.id, function (err, items) {
                private_data.group_papers_kit(adminFlag, getp.id, function (err, items) {
                const papersType: string[] = ["beginnersIds", "intermediateIds", "advancedIds"];
                callback (err, (items || {})[papersType[mode-20]]);
              });
              break;
            default: console.log("Invalid mode");
          }
        },

        // followingsIds: function (callback) {
        //   if (!userId) {
        //     callback(null, null);
        //   } else {
        //     people_data.get_followings_ids(0, userId, null, function (err, followingsIds) {
        //       callback (err, followingsIds);
        //     });
        //   }
        // }

      }, function (err, results) {
        publication_data.publications_list(results.publicationsIds, getp.id, userId, (mode==0 || mode==8 || mode==9 || mode==11 || mode==13) ? 2 : 0, Number(mode==18), adminFlag, function (err, publications) {
          cb(err, publications)
        })
      })
    }

  ],
  function (err, publications) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      if (mode==5 || mode==10 || mode==12 || mode==14 || mode==15) publications.push(searchCont)
      helpers.send_success(res, publications);
    }
  })

}

exports.publicationPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure the Group ID and Publication Item are valid
    function (cb) {
      if (!req.body || mode==null || mode>11 || mode<0) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      // group_Id ==== itemId (for projects and resources)
      privilege_data.privilages(req.user.sub, req.body.parentId, (mode==0 || mode==5 || (mode>=9 && mode<=11)) ? 0 : ((mode==1) ? 40 : ((mode==2) ? 50 : 10)), function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Publication
    function (userId: string, cb) {
      const tempId = (req.user.scope.indexOf('write:publications')>-1 && mode==0) ? req.body.parentId : userId;
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      publication_data.put_publication(tempId, mode, adminFlag, req.body, function (err, publicationId) {
        cb(err, publicationId)
      });
    },

  ],
  function (err, publicationId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, publicationId);
    }
  });

};

exports.publicationsDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([
      // 1. make sure the Parent ID and Publication IDs are valid
      function (cb) {
        if (!req.body || mode==4 || ((!ObjectID.isValid(getp.id) && mode<3) || (!getp.id && mode==3))) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, (mode==0 || (mode>=8 && mode<=10)) ? 0 : ((mode==1) ? 40 : ((mode==2) ? 50 : 10)), function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete publications
      function (userId: string, cb) {
        publication_data.delete_publications(getp.id, userId, mode, req.body, cb);
      }

  ],
  function (err, results) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, results);
      }
  });

};

exports.publicationDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      // console.log('PUB1')
      if (!req.params || !ObjectID.isValid(req.params.publicationId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. get Following IDs
    function (cb) {
      // console.log('PUB2')
      if (!req.user) {
        cb(null, null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          people_data.get_followings_ids(0, userId, null, function (err, followingsIds) {
            cb(err, userId, followingsIds);
          });
        });
      }
    },

    // 2. get the publication details
    function (userId: string, followingsIds: string[], cb) {
      // console.log('PUB3')
      publication_data.publication_details(req.params.publicationId, followingsIds, function (err, publication) {
        if (publication) {
          if (
              !ObjectID.isValid(getp.parentId) ||
              (publication.groupsIds.findIndex(id => id==getp.parentId)>-1) ||
              (publication.projectsIds.findIndex(id => id==getp.parentId)>-1) ||
              (publication.resourcesIds.findIndex(id => id==getp.parentId)>-1) ||
              (publication.authors.findIndex(x => x._id==getp.parentId)>-1)
             )
          {
            if (publication.authors && publication.authors.findIndex(x => x._id==userId)==-1 && (!req.user || (req && req.user.scope.indexOf('write:publications')==0))) {
              publication.authors.forEach(function(author) {
                delete author.email;
              })
            }
            // console.log('userId',userId)
            // console.log('publication',publication.folders)
            cb(err, publication);
          } else {
            cb(err, null);
          }
        } else {
          cb(err, null);
        }
      })
    },

    // 3. dress Parents
    function (publication, cb) {
      // console.log('PUB4')
      if (publication) {
        async.parallel({
          groups: function (callback) {
            // console.log("publication.groupsIds",publication.groupsIds)
            group_data.groups_list(publication.groupsIds, null, null, null, null, 2, false, function (err, groups) {
              // console.log("groups",groups)
              callback(err, groups ? groups.map(r=>r.groupIndex) : null);
            });
          },
          projects: function (callback) {
            // console.log("publication.projectsIds",publication.projectsIds)
            project_data.projects_list(publication.projectsIds, null, 1, 0, function (err, projects) {
              // console.log("projects",projects)
              callback(err, projects);
            });
          },
          resources: function (callback) {
            // console.log("publication.resourcesIds",publication.resourcesIds)
            resource_data.resources_list(publication.resourcesIds, null, null, 1, 0, false, function (err, resources) {
              // console.log("resources",resources)
              callback(err, resources);
            });
          },
          profiles: function (callback) {
            people_data.peoples_list(Object.keys(publication.folders), null, null, 1, null, function (err, profiles) {
              profiles.forEach(function(profile) {
                profile.folders = publication.folders[profile._id];
              })
              // console.log('publication.folders',publication.folders)
              callback(err, profiles);
            });
          },
        },
        function (err, results) {
          // console.log("results",results)
          if (err) {
            cb(err)
          } else {
            var publicationModified = publication;
            publicationModified.groups=results.groups;
            publicationModified.projects=results.projects;
            publicationModified.resources=results.resources;
            publicationModified.profiles=results.profiles;
            delete publicationModified.groupsIds;
            delete publicationModified.projectsIds;
            delete publicationModified.resourcesIds;
            delete publicationModified.folders;
            // console.log('publicationModified',publicationModified)
            cb(err, err ? null : publicationModified)
          }
        });
      } else {
        cb(null)
      }
    }

  ],
  function (err, results) {
    // console.log('PUB5',results)
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!results) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, results);
    }
  });
};

exports.publicationFieldPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Publication Field, Type are valid
    function (cb) {
      if (
          !ObjectID.isValid(getp.itemId) || !req.body || type==null || mode==null ||
          ((!ObjectID.isValid(getp.id) && (mode==0 || mode==3 || mode==4)) || (!getp.id && mode==5))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      var privilegeMode: number;

      if (req.user.scope.indexOf('write:publications')>-1) {
        privilegeMode = 10;
      // } else if (mode>=7 && mode<=10) { // publications authors
      } else { // publications authors
        privilegeMode = 70;
      }

      privilege_data.privilages(req.user.sub, getp.itemId, privilegeMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Field
    function (cb) {
      if (type==8) {
        publication_data.post_doi_field(req.body.link, req.body.name, getp.itemId, cb);
      } else {
        publication_data.post_publication_field(req.body, getp.itemId, type, cb);
      };
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });

}

exports.publicationFieldDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Parent ID, Item ID, Type are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || type==null || mode==null ||
         ((!ObjectID.isValid(getp.id) && (mode==0 || mode==3 || mode==4)) || (!getp.id && mode==5))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Position Status
    function (cb) {
      var privilegeMode: number;

      if (req.user.scope.indexOf('write:publications')>-1) {
        privilegeMode = 10;
      // } else if (mode>=7 && mode<=10) { // publications authors
      } else { // publications authors
        privilegeMode = 70;
      }

      privilege_data.privilages(req.user.sub, getp.itemId, privilegeMode, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Field
    function (cb) {
      publication_data.post_publication_field({"text": ""}, getp.itemId, type, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });

}

exports.claimPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Item ID, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. Item Claim
    function (userId: string, cb) {
      publication_data.put_claim(getp.id, userId, mode, req.body.name, req.body.message, cb);
    }

  ],
  function (err, results) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, results);
    }
  });
};
