var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var project_data = require("../data/projects.ts");
var shared_data = require("../data/shared.ts");
var privilege_data = require("../data/privileges.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.projectsByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var mini = parseInt(getp.mini);
  var type = parseInt(getp.type); // also serve as More
  var searchCont: number;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!req.user && mode!=9 && mode!=10) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==9 || mode==10) ? 0 : 10, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      }
    },

    // 2. get projects ids
    function (userId: string, cb) {
      switch (mode) {
        case 0: // Following List
          if (!userId) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(2, userId, null, function (err, projectsIds) {
              cb(err, userId, projectsIds);
            });
          }
          break;
        case 1: // User Associated Groups Projects
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(6, getp.id, null, function (err, projectsIds) {
              cb(err, userId, projectsIds);
            });
          }
          break;
        case 2: // Group
        case 9: // Group AI
        case 10: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            if (type==2) {
              group_data.group_items_ids("topicsItems", getp.id, function (err, items) {
                var currentIds = items.map(r=>r.currentProjectsIds)
                var currentFlatten = [].concat(...currentIds)

                var pastIds = items.map(r=>r.pastProjectsIds)
                var pastFlatten = [].concat(...pastIds)

                cb(err, userId, currentFlatten.concat(pastFlatten));
              });
            } else {
              group_data.group_topics_ids(getp.text, getp.id, function (err, items) {
                var ids: string[] = [];
                if (type==3) {
                  ids = items.currentProjectsIds.concat(items.pastProjectsIds);
                } else if (type==1) {
                  ids = items.pastProjectsIds;
                } else if (type==0) {
                  ids = items.currentProjectsIds;
                }
                // cb(err, userId, (type==1) ? items.pastProjectsIds : items.currentProjectsIds);
                cb(err, userId, ids);
              });
            }
          }
          break;
        // case 3: // Search // DELETED
        case 4: // Profile
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(14, getp.id, null, function (err, projectsIds) {
              shared_data.update_page_views('projects', getp.id, 1, userId, function (err) {
                cb(err, userId, projectsIds);
              })
            });
          }
          break;
        case 5: // Departments
        case 6: // Departments (Search)
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            group_data.groups_items_ids("topicsItems", groupsIds, function (err, items) {

              var ids: string[] = [];

              if (items) {
                const currentProjectsIds: string[] = [].concat(...items.map(r => r.map(p => p.currentProjectsIds)));
                const pastProjectsIds: string[] = [].concat(...items.map(r => r.map(p => p.pastProjectsIds)));
                // var currentProjectsIds = items.map(r => r.currentProjectsIds);
                // var pastProjectsIds = items.map(r => r.pastProjectsIds);
                ids = [].concat(...currentProjectsIds).concat([].concat(...pastProjectsIds));
              } else {
                ids = null;
              }

              if (type==null) {
                cb(helpers.no_such_item());
              } else if (mode==5) {
                searchCont = ids ? ids.length : 0;
                cb (err, userId, ids ? ids.slice(type*10, (type+1)*10-1) : []);
              } else if (mode==6) {
                shared_data.search_ids_by_ids(getp.text, userId, 4, type, ids, function (err, projectsIds, count) {
                  searchCont = count;
                  cb(err, userId, projectsIds);
                });
              }
            })
          });
          break;
        case 7: // Universities
        case 8: // Universities (Search)
          university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
            const departmentsIds = departments.map(r => r._id)
            if (departmentsIds[0]) {
              department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                group_data.groups_items_ids("topicsItems", groupsIds, function (err, items) {

                  var ids: string[];

                  if (items) {
                    const currentProjectsIds: string[] = [].concat(...items.map(r => r.map(p => p.currentProjectsIds)));
                    const pastProjectsIds: string[] = [].concat(...items.map(r => r.map(p => p.pastProjectsIds)));
                    // var currentProjectsIds = items.map(r => r.currentProjectsIds);
                    // var pastProjectsIds = items.map(r => r.pastProjectsIds);
                    ids = [].concat(...currentProjectsIds).concat([].concat(...pastProjectsIds));
                  } else {
                    ids = null;
                  }

                  if (type==null) {
                    cb(helpers.no_such_item());
                  } else if (mode==7) {
                    searchCont = ids ? ids.length : 0;
                    cb (err, userId, ids ? ids.slice(type*10, (type+1)*10-1) : []);
                  } else if (mode==8) {
                    shared_data.search_ids_by_ids(getp.text, userId, 4, type, ids, function (err, projectsIds, count) {
                      searchCont = count;
                      cb(err, userId, projectsIds);
                    });
                  }
                })
              })
            } else {
              cb (err, userId, []);
            }
          });
          break;
      }
    },

    // 3. get followings details
    function (userId: string, ids: string[], cb) {
      if (!userId) {
        cb(null, ids, null);
      } else {
        people_data.get_followings_ids(2, userId, null, function (err, followingsIds) {
          cb(err, ids, followingsIds);
        });
      }
    },

    // 4. projects List
    function (ids, followingsIds, cb) {
      project_data.projects_list(ids, followingsIds, mini, (mode==9) ? 1 : ((mode==10) ? -1 : 0), function (err, projects) {
        cb(err, projects)
      })
    },

    // 5. dress Groups
    function (projects, cb) {
      if (mini==1 || mode==4) {
        cb(null,projects)
      } else {
        group_data.groups_list(projects.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          projects.forEach(function(project) {
            project.group=(items.find(item => item._id.toString() == (project.groupId || {}).toString()) || {}).groupIndex
            delete project.groupId;
          })
          cb(err,projects);
        });
      }
    },

    // 6. dress Profile
    function (projects, cb) {
      people_data.peoples_list(projects.map(r => r.profileId), null, null, 1, null, function (err, items) {
        projects.forEach(function(project) {
          project.profile=items.find(item => item._id == project.profileId)
          delete project.profileId;
        })
        cb(err,projects);
      });
    }

  ],
  function (err, projects) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      if (mode==3 || mode==5 || mode==6 || mode==7 || mode==8) {
        projects.push(searchCont)
      }
      helpers.send_success(res, projects);
    }
  });

}

exports.projectPut = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Project Item, Type, Parent ID are valid
    function (cb) {
      if (!req.body || type==null ||
          ((type==2 && !req.body.groupId) || ((type==0 || type==1) && !ObjectID.isValid(req.body.groupId) && !ObjectID.isValid(getp.topicId)))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.body.groupId, (type==2) ? 10 : 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Project
    function (userId: string, cb) {
      const tempId: string = (req.user.scope.indexOf('write:publications')>-1) ? req.body.groupId : userId;
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      project_data.put_project(tempId, type, getp.topicId, adminFlag, req.body, function (err, projectId) {
        cb(err, projectId)
      });
    }

  ],
  function (err, projectId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, projectId);
      }
  });

};

exports.projectPost = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Parent ID, Project Data are valid
      function (cb) {
        if (!req.body || type==null ||
            ((!ObjectID.isValid(getp.id) && type<2) || (!getp.id && type==2))
           ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        // privilege_data.privilages(req.user.sub, getp.id, (type==2) ? 10 : 0, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, req.body._id, (type==2) ? 10 : 40, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Project
      function (cb) {
        project_data.post_project(req.body, cb);
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

exports.projectDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Parent ID, Project ID, Project Type are valid
      function (cb) {
        if (!ObjectID.isValid(getp.itemId) || type==null ||
            ((!ObjectID.isValid(getp.id) && type<2) || (!getp.id && type==2))
           ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        // privilege_data.privilages(req.user.sub, getp.id, (type==2) ? 10 : 0, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, getp.itemId, (type==2) ? 10 : 40, function (err, userId, flag) {
          if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Project
      function (userId: string, cb) {
        project_data.delete_project(getp.id, userId, getp.itemId, getp.topicId, type, cb);
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

exports.projectMove = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Group ID, Project ID, Project Mode are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !getp.topicId || type==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        // privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, getp.itemId, 40, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. move Project
      function (cb) {
        project_data.move_project(getp.id, getp.itemId, getp.topicId, type, cb);
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

exports.projectDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.projectId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. get Following IDs
    function (cb) {
      if (!req.user) {
        cb(null, null);
      } else {
        privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
          people_data.get_followings_ids(2, userId, null, function (err, followingsIds) {
            cb (err, followingsIds);
          });
        })
      }
    },

    // 2. get the project details
    function (followingsIds, cb) {
      project_data.project_details(req.params.projectId, followingsIds, function (err, project) {
        if (!ObjectID.isValid(getp.parentId) || (project || {}).groupId==getp.parentId  || (project && project.people.findIndex(x => x._id==getp.parentId)>-1)) {
          cb(err, project);
        } else {
          cb(err, null);
        }
      })
    },

    // 3. dress Group
    function (project, cb) {
      var projectModified = project;
      group_data.groups_list(project ? [project.groupId] : [], null, null, null, null, 2, true, function (err, item) {
        if (projectModified) {
          projectModified.group=(item[0] || {}).groupIndex
          delete projectModified.groupId;
        }
        cb(err,projectModified);
      });
    }

  ],
  function (err, project) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!project) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, project );
    }
  });
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%% Topics %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.topicDataByURL = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. get Topic Details
    function (cb) {
      project_data.topic_details(getp.id, req.params.topic, function (err, topic) {
        if (topic==null) {
          cb("No such research topic", null);
        } else {
          cb(null, topic);
        }
      });
    }

  ],
  function (err, topic) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, topic);
    }
  });

}

exports.topicPut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Document ID, Topic Name
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !req.body.name) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privileges
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. put Topic
      function (cb) {
        const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
        project_data.put_topic(req.body.name, req.body.ai, getp.id, adminFlag, cb);
      }

  ],
  function (err, topicId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, topicId);
      }
  });
}

exports.topicPost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  async.waterfall([

      // 1. make sure Group ID, Topic ID, Topic Data
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || !req.body) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update FAQ
      function (cb) {
        project_data.post_topic(req.body.name, getp.itemId, getp.id, cb);
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

exports.topicDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Group ID, Topic ID are valid
      function (cb) {
          if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId)) {
            cb(helpers.no_such_item());
            return;
          }
          cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Topic
      function (cb) {
        project_data.delete_topic(getp.itemId, getp.id, cb);
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

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%% Related Resources %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.resourcePut = function (req, res) {
  var getp = req.query;

  async.waterfall([

      // 1. make sure Project ID, Resource ID are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(req.body.resourceId)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 40, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. put Related Resource
      function (cb) {
        project_data.update_resource_list(true, getp.id, req.body.resourceId, function (err, projectId) {
          cb(err, projectId)
        });
      },

  ],
  function (err, projectId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, projectId);
      }
  });

};

exports.resourceDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

      // 1. make sure Project ID, Resource ID are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.resourceId)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 40, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Related Resource
      function (cb) {
        project_data.update_resource_list(false, getp.id, getp.resourceId, cb);
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
