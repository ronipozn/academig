var helpers = require('./helpers.ts');
var async = require("async");

var emails = require("../misc/emails.ts");

var resource_data = require("../data/resources.ts");
var shared_data = require("../data/shared.ts");
var messages_data = require("../data/messages.ts");
var privilege_data = require("../data/privileges.ts");

var university_data = require("../data/universities.ts");
var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var project_data = require("../data/projects.ts");

var ObjectID = require('mongodb').ObjectID;

exports.version = "0.1.0";

exports.resourcesByIds = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var more = parseInt(getp.more);
  var resourcesIds;
  var searchCont: number;

  async.waterfall([

    // 1. validate Privilages
    function (cb) {
      if (!req.user) {
        cb(null, null, null);
      } else {
        privilege_data.privilages(req.user.sub, getp.id, (mode==13 || mode==14) ? 0 : 10, function (err, userId, flag) {
          console.log('mode',mode)
          console.log('flag',flag)
          if (flag || (mode!=13 && mode!=14)) cb(err, flag, userId); else cb(helpers.invalid_privileges());
        })
        // privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        //   cb(err, userId);
        // })
      }
    },

    // 2. validate id
    // function (userId: string, cb) {
    //   if ((!getp.id && mode!=4 && mode!=0) || (!userId && (mode==4 || mode==0))) {
    //     cb(helpers.no_such_item());
    //     return;
    //   }
    //   cb(null, userId);
    // },

    // 3. get resources ids
    function (adminFlag: boolean, userId: string, cb) {
      switch (mode) {
        case 0: // User Following
          if (!userId) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(1, userId, null, function (err, resourcesIds) {
              cb(err, adminFlag, userId, resourcesIds);
            });
          }
          break;
        case 1: // User Associated Groups Resources
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(13, getp.id, null, function (err, resourcesIds) {
              cb(err, adminFlag, userId, resourcesIds);
            });
          }
          break;
        case 2: // Group
        case 13: // Group AI
        case 14: // Group AI - Archive
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            group_data.group_items_ids("resourcesItems", getp.id, function (err, items) {
              cb(err, adminFlag, userId, (items || {}).resourcesIds);
            });
          }
          break;
        case 3: // Project
          if (!ObjectID.isValid(getp.id)) {
            cb(helpers.no_such_item());
          } else {
            project_data.project_items_ids(1, getp.id, null, function (err, items) {
              cb(err, adminFlag, userId, (items || {}).resourcesIds);
            });
          }
          break;
        // case 4: // Search DELETED
        case 5: // Type A Head + (Filter existing Project Resources)
          cb(helpers.no_such_item());
          // if (!ObjectID.isValid(getp.id)) {
          //   cb(helpers.no_such_item());
          // } else {
          //   project_data.project_items_ids(1, getp.id, null, function (err, items) {
          //     resource_data.resource_typeahead_ids(getp.term, (items || {}).resourcesIds, function (err, resourcesIds) {
          //       cb(err, adminFlag, userId, resourcesIds);
          //     });
          //   });
          // }
          break;
        case 6: // Profile
          if (!getp.id) {
            cb(helpers.no_such_item());
          } else {
            shared_data.update_page_views('resources', getp.id, 1, userId, function (err) {
              people_data.get_followings_ids(15, getp.id, null, function (err, resourcesIds) {
                cb(err, adminFlag, userId, resourcesIds);
              });
            })
          }
          break;
        case 7: // Departments
        case 8: // Departments (Search)
          department_data.department_items_ids("groupsItems", getp.id, function (err, groupsIds) {
            group_data.groups_items_ids("resourcesItems", groupsIds, function (err, items) {

              // const ids = (items || {}).resourcesIds;
              const ids: string[] = (items) ? [].concat(...items.map(r => r.resourcesIds)) : null;

              if (more==null) {
                cb(helpers.no_such_item());
              } else if (mode==7) {
                searchCont = ids ? ids.length : 0;
                cb(err, adminFlag, userId, ids ? ids.slice(more*10, (more+1)*10-1) : []);
              } else if (mode==8) {
                shared_data.search_ids_by_ids(getp.text, userId, 3, more, ids, function (err, resourcesIds, count) {
                  searchCont = count;
                  cb(err, adminFlag, userId, resourcesIds);
                });
              }
            })
          });
          break;
        case 9: // Universities
        case 10: // Universities (Search)
          university_data.university_departments_ids(getp.id, 1, null, function (err, departments) {
            const departmentsIds = departments.map(r => r._id)
            if (departmentsIds[0]) {
              department_data.departments_items_ids("groupsItems", departmentsIds, function (err, groupsIds) {
                group_data.groups_items_ids("resourcesItems", groupsIds, function (err, items) {

                  // const ids = (items || {}).resourcesIds;
                  const ids: string[] = (items) ? [].concat(...items.map(r => r.resourcesIds)) : null;

                  if (more==null) {
                    cb(helpers.no_such_item());
                  } else if (mode==9) {
                    searchCont = ids ? ids.length : 0;
                    cb(err, adminFlag, userId, ids ? ids.slice(more*10, (more+1)*10-1) : []);
                  } else if (mode==10) {
                    shared_data.search_ids_by_ids(getp.text, userId, 3, more, ids, function (err, resourcesIds, count) {
                      searchCont = count;
                      cb(err, adminFlag, userId, resourcesIds);
                    });
                  }
                })
              })
            } else {
              cb(err, adminFlag, userId, []);
            }
          });
          break;
        case 11: // User Requests
          if (!userId) {
            cb(helpers.no_such_item());
          } else {
            people_data.get_followings_ids(30, userId, null, function (err, resourcesIds) {
              cb(err, adminFlag, userId, resourcesIds ? resourcesIds : []);
            });
          }
          break;
        case 12: // Admin Requests
          if (!userId) {
            cb(helpers.no_such_item());
          } else {
            cb(null, adminFlag, userId, [ObjectID(getp.id)]);
          }
          break;
        }
      },

      // 4. get followings details
      function (adminFlag: boolean, userId: string, ids: string[], cb) {
        if (!userId) {
          cb(null, null, null, ids, null);
        } else {
          people_data.get_followings_ids(1, userId, null, function (err, followingsIds) {
            cb(err, adminFlag, userId, ids, followingsIds);
          });
        }
      },

      // 5. resources List
      function (adminFlag: boolean, userId: string, ids: string[], followingsIds: string[], cb) {
        resource_data.resources_list(ids, followingsIds, userId, (mode==12) ? 3 : ((mode==11) ? 2 : 1), (mode==13) ? 1 : ((mode==14) ? -1 : 0), adminFlag, function (err, resources) {
          cb(err, userId, resources)
        })
      },

      // 6. dress Channel
      function (userId: string, resources, cb) {
        if ((mode==11 || mode==12) && userId) {
          if (mode==11) {
            const channelsIds = resources.map(r=>r.requests).map(r => r[0].channelId);
            messages_data.channels_func(userId, channelsIds, 2, function (err, channels) {
              resources.forEach((resource, index) => {
                resource.channels=[channels[index]]
                delete resource.requests;
              });
              cb(err, resources);
            });
          } else {
            const channelsIds = resources[0].requests ? resources[0].requests.map(r => r.channelId) : [];
            messages_data.channels_func(userId, channelsIds, 2, function (err, channels) {
              channels.map((channel, i) => {
                channel.type = resources[0].requests[i].type;
              });
              resources[0].channels=channels;
              delete resources[0].requests;
              cb(err, resources);
            });
          }
        } else {
          cb(null, resources);
        }
      },

      // 7. dress Groups
      function (resources, cb) {
        group_data.groups_list(resources.map(r => r.groupId), null, null, null, null, 2, true, function (err, items) {
          resources.forEach(function(resource) {
            resource.group=(items.find(item => item._id.toString() == (resource.groupId || {}).toString()) || {}).groupIndex
            delete resource.groupId;
          })
          cb(err,resources);
        });
      },

      // 8. dress Profiles
      function (resources, cb) {
        people_data.peoples_list(resources.map(r => r.profileId), null, null, 1, null, function (err, items) {
          resources.forEach(function(resource) {
            resource.profile=items.find(item => item._id == resource.profileId)
            delete resource.profileId;
          })
          cb(err,resources);
        });
      }

    ],
    function (err, resources) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        if (mode==4 || mode==7 || mode==8 || mode==9 || mode==10) {
          resources.push(searchCont)
        }
        helpers.send_success(res, resources);
      }
    });

}

exports.resourcePut = function (req, res) {
  var getp = req.query;
  var insertIndex = parseInt(getp.insertIndex);
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure the Resource Item, Type, Insert Index, Parent ID are valid
    function (cb) {
      if (!req.body || type==null || insertIndex==null ||
          ((type==1 && !req.body.groupId) || (type==0 && !ObjectID.isValid(req.body.groupId)))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, req.body.groupId, (type==1) ? 10 : 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Resource
    function (userId: string, cb) {
      const adminFlag: boolean = (req.user.scope.indexOf('write:groups')>-1);
      // resource_data.put_resource(userId, req.body, insertIndex, type, function (err, resourceId) {
      resource_data.put_resource(userId, req.body, 0, adminFlag, function (err, resourceId) {
        cb(err, resourceId)
      });
    }

  ],
  function (err, resourceId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, resourceId);
    }
  });

};

exports.resourcePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Group ID, Position ID, Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || (mode!=0 && mode!=1 && mode!=2) || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.itemId, 50, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Resource
    function (userId: string, cb) {
      resource_data.post_resource(userId, getp.id, getp.itemId, mode, function (err, resourceId) {
        cb(err, resourceId)
      });
    }

  ],
  function (err, resourceId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, resourceId);
    }
  });

};

exports.resourceDelete = function (req, res) {
  var getp = req.query;
  var type = parseInt(getp.type);

  async.waterfall([

    // 1. make sure Parent ID, Resource ID, Type, Category are valid
    function (cb) {
      if (!ObjectID.isValid(getp.itemId) || type==null || getp.category==null ||
          ((!ObjectID.isValid(getp.id) && type==0) || (!getp.id && type==1))
         ) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, (type==1) ? 10 : 0, function (err, userId, flag) {
        if (flag) cb(err, userId); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Resource
    function (userId: string, cb) {
      resource_data.delete_resource(getp.id, userId, getp.itemId, getp.category, type, cb);
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

exports.resourceDetailsById = function (req, res) {
  var getp = req.query;

  async.waterfall([

    function (cb) {
      if (!req.params || !ObjectID.isValid(req.params.resourceId)) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 1. get Following IDs
    function (cb) {
      if (!req.user) {
        cb(null, null, null, null);
      } else {
        // privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        privilege_data.privilages(req.user.sub, req.params.resourceId, 50, function (err, userId, flag) {
          people_data.get_followings_ids(1, userId, null, function (err, followingsIds) {
            cb(err, flag, followingsIds, userId);
          });
        })
      }
    },

    // 2. get the resource details
    function (adminFlag: boolean, followingsIds: string[], userId: string, cb) {
      resource_data.resource_details(req.params.resourceId, followingsIds, adminFlag, userId, function (err, resource) {
        if (!ObjectID.isValid(getp.parentId) || (resource || {}).groupId==getp.parentId || (resource && resource.people.findIndex(x => x._id==getp.parentId)>-1)) {
          cb(err, resource);
        } else {
          cb(err, null);
        }
      })
    },

    // 3. dress Group
    function (resource, cb) {
      var resourceModified = resource;
      group_data.groups_list(resource ? [resource.groupId] : [], null, null, null, null, 2, true, function (err, item) {
        if (resourceModified) {
          resourceModified.group=(item[0] || {}).groupIndex
          delete resourceModified.groupId;
        }
        cb(err,resourceModified);
      });
    }

  ],
  function (err, resource) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else if (!resource) {
      helpers.send_failure(res, 403, helpers.no_such_item());
    } else {
      helpers.send_success(res, resource);
    }
  });
};


exports.categoryPut = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Group ID, Category Item are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. put Category
    function (cb) {
      resource_data.put_category(req.body, getp.id, cb);
    }

  ],
  function (err, resourceId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, resourceId);
    }
  });

};

exports.categoryPost = function (req, res) {
  var getp = req.query;
  var index = parseInt(getp.index);

  async.waterfall([

    // make sure Group ID, Category Item, Item Index are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body || !getp.index) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. post Category
    function (cb) {
      resource_data.post_category(req.body, index, getp.id, cb);
    }

  ],
  function (err, resourceId) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, resourceId);
      }
  });
};

exports.categoryDelete = function (req, res) {
  var getp = req.query;
  var index = parseInt(getp.index);

  async.waterfall([
    // make sure Group ID, Resource ID and Category are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || index==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 0, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Category
    function (cb) {
      resource_data.delete_category(getp.id, getp.itemId, index, cb);
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

exports.termsPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Resource ID and Terms Data are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || req.body.mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb(null);
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Terms
    function (cb) {
      resource_data.post_terms(req.body.mode, req.body.more, getp.id, cb);
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

exports.termsDelete = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Resource ID is valid
    function (cb) {
      if (!ObjectID.isValid(getp.id)) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. delete Terms
    function (cb) {
      resource_data.post_terms(0, "", getp.id, cb);
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

exports.pricePost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Resource ID and Price are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. update Price
    function (cb) {
      resource_data.post_price(req.body, getp.id, cb);
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

exports.requestPost = function (req, res) {
  var getp = req.query;

  async.waterfall([

    // 1. make sure Resource ID and Request are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body.message) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, null, 10, function (err, userId, flag) {
        cb(err, userId);
      })
    },

    // 3. push Request
    function (userId: string, cb) {
      resource_data.post_request(req.body.message, userId, getp.id, cb);
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

exports.tablePut = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

    // 1. make sure Resource ID, Table Info, Table Mode are valid
    function (cb) {
      if (!ObjectID.isValid(getp.id) || !req.body || mode==null) {
        cb(helpers.no_such_item());
        return;
      }
      cb();
    },

    // 2. validate Privilages
    function (cb) {
      privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
        if (flag) cb(err); else cb(helpers.invalid_privileges());
      })
    },

    // 3. create Table
    function (cb) {
      resource_data.put_table(req.body, mode, getp.id, function (err, itemId) {
        cb (err, itemId);
      });
    }

  ],
  function (err, itemId) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, itemId);
    }
  });
};

exports.tablePost = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Resource ID, Table Info, Table Mode are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !req.body || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. update Table
      function (cb) {
        resource_data.post_table(req.body, mode, getp.id, cb);
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

exports.tableDelete = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall([

      // 1. make sure Resource ID, Item ID, Table Mode are valid
      function (cb) {
        if (!ObjectID.isValid(getp.id) || !ObjectID.isValid(getp.itemId) || mode==null) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        privilege_data.privilages(req.user.sub, getp.id, 50, function (err, userId, flag) {
          if (flag) cb(err); else cb(helpers.invalid_privileges());
        })
      },

      // 3. delete Table
      function (cb) {
        resource_data.delete_table(mode, getp.itemId, getp.id, cb);
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
