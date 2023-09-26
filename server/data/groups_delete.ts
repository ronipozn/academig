var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var ObjectID = require('mongodb').ObjectID;

var groups = require("./groups.ts");
var peoples = require("./peoples.ts");

var publications = require("./publications.ts");
var resources = require("./resources.ts");
var projects = require("./projects.ts");
var galleries = require("./galleries.ts");
var collaborations = require("./collaborations.ts");
var fundings = require("./fundings.ts");
var positions = require("./positions.ts");
var media = require("./media.ts");
var news = require("./news.ts");
var pics = require("./pics.ts");
var contacts = require("./contacts.ts");
var privates = require("./private.ts");

if (process.env.PORT) {
  var stripe = require("stripe")("sk_live_cX9wuWcR9lIBXPhAh206GjKb");
} else {
  var stripe = require("stripe")("sk_test_7EVILWvlgJHlUNOh58DBJVe4");
}

// import * as algoliasearch from 'algoliasearch'; // When using TypeScript
const algoliasearch = require('algoliasearch');
const client = algoliasearch('TDKUK8VW4T', '5d17934a8722069c0ac47bd6b4ae4bda');

exports.version = "0.1.0";

export function delete_group(groupId: string, userId: string, callback) {

  var companyFlag: boolean;

  async.series({

    // 1. delete Group Items
    links: function (cb) {

      db.groups
        .find({_id: ObjectID(groupId)})
        .project({
          "_id": 0,
          "buildMode": 1,
          "peoplesItems": 1,
          "publicationsItems": 1,
          "resourcesItems": 1,
          "topicsItems": 1,
          "collaborationsItems": 1,
          "sponsorsItems": 1,
          "fundingsItems": 1,
          "positionsItems": 1,
          "mediaItems": 1,
          "faqPageItems": 1,
          "contactsItems": 1,
          "futureMeetingsItems": 1,
          "reportsItems": 1,
          "eventsItems": 1,
          "newsItems": 1,
          "networkItems": 1,
          "channelId": 1,
          "groupIndex.department._id": 1,
          "groupIndex.group.pic": 1,
          "stripe_id": 1
        })
      .next().then(function(item) {

        companyFlag = item.buildMode==4 || item.buildMode==5 || item.buildMode==7;

        async.series({
        // async.parallel({

          actives: function (cb) {
            console.log('2')
            async.forEachOf(item.peoplesItems.activesIds, function (memberId, key, callback) {
              groups.delete_member(userId, groupId, memberId, 0, 0, false, function (err) {
                callback()
              });
            }, function (err) {
              cb (err)
            })
          },

          // visitors: function (cb) {
          //   if (item.peoplesItems.visitorsIds) {
          //     async.forEachOf(item.peoplesItems.visitorsIds, function (memberId, key, callback) {
          //       groups.delete_member(userId, groupId, memberId, 0, 1, false, function (err) {
          //         callback()
          //       });
          //     }, function (err) {
          //       cb (err)
          //     })
          //   } else {
          //     cb()
          //   }
          // },

          alumnis: function (cb) {
            console.log('3')
            if (item.peoplesItems.alumniIds) {
              async.forEachOf(item.peoplesItems.alumniIds, function (memberId, key, callback) {
                groups.delete_member(userId, groupId, memberId, 0, 2, false, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          publications: function (cb) {
            console.log('4')
            if (item.publicationsItems.publicationsIds) {
              publications.delete_publications(groupId, userId, 0, item.publicationsItems.publicationsIds, function (err) {
                cb()
              })
            } else {
              cb()
            }
          },

          resources: function (cb) {
            console.log('5')
            if (item.resourcesItems.resourcesIds) {
              async.forEachOf(item.resourcesItems.resourcesIds, function (resourceId, key, callback) {
                resources.delete_resource(groupId, userId, resourceId, 0, 2, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          activeProjects: function (cb) {
            console.log('6')
            const currentProjectsIds = item.topicsItems ? [].concat(...item.topicsItems.map(r => r.currentProjectsIds)) : [];
            if (currentProjectsIds) {
              async.forEachOf(currentProjectsIds, function (projectId, key, callback) {
                projects.delete_project(groupId, userId, projectId, null, 0, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          pastProjects: function (cb) {
            console.log('7')
            const pastProjectsIds = item.topicsItems ? [].concat(...item.topicsItems.map(r => r.pastProjectsIds)) : [];
            if (pastProjectsIds) {
              async.forEachOf(pastProjectsIds, function (projectId, key, callback) {
                projects.delete_project(groupId, userId, projectId, null, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          // groupId: string, userId: string, collaborationId: string, type: number, mode: number
          currentCollaborations: function (cb) {
          console.log('8')
            if (item.collaborationsItems.currentIds) {
              async.forEachOf(item.collaborationsItems.currentIds, function (collaborationId, key, callback) {
                collaborations.delete_collaboration(groupId, userId, collaborationId, 0, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          pastCollaborations: function (cb) {
            console.log('9')
            if (item.collaborationsItems.pastIds) {
              async.forEachOf(item.collaborationsItems.pastIds, function (collaborationId, key, callback) {
                collaborations.delete_collaboration(groupId, userId, collaborationId, 1, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          approveCurrentCollaborations: function (cb) {
            console.log('10')
            if (item.collaborationsItems.approveIds) {
              async.forEachOf(item.collaborationsItems.approveIds, function (collaborationId, key, callback) {
                collaborations.delete_collaboration(groupId, userId, collaborationId, 2, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          // approvePastCollaborations: function (cb) {
          //   if (item.collaborationsItems.pastIds) {
          //     async.forEachOf(item.collaborationsItems.pastIds, function (collaborationId, key, callback) {
          //       collaborations.delete_project(groupId, userId, collaborationId, 3, function (err) {
          //         callback()
          //       });
          //     }, function (err) {
          //       cb (err)
          //     })
          //   } else {
          //     cb()
          //   }
          // },

          sponsorsIndustries: function (cb) {
            console.log('11')
            if (item.sponsorsItems.industries) {
              async.forEachOf(item.sponsorsItems.industries, function (industryId, key, callback) {
                collaborations.delete_sponsor(groupId, industryId, 0, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          sponsorsGovernments: function (cb) {
            console.log('12')
            if (item.sponsorsItems.governments) {
              async.forEachOf(item.sponsorsItems.governments, function (governmentId, key, callback) {
                collaborations.delete_sponsor(groupId, governmentId, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          currentFundings: function (cb) {
            console.log('13')
            if (item.fundingsItems.currentFundingsIds) {
              async.forEachOf(item.fundingsItems.currentFundingsIds, function (fundingId, key, callback) {
                fundings.delete_funding(groupId, fundingId, 0, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          pastFundings: function (cb) {
            console.log('14')
            if (item.fundingsItems.pastFundingsIds) {
              async.forEachOf(item.fundingsItems.pastFundingsIds, function (fundingId, key, callback) {
                fundings.delete_funding(groupId, fundingId, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          positions: function (cb) {
            console.log('15')
            if (item.positionsItems.positionsIds) {
              async.forEachOf(item.positionsItems.positionsIds, function (positionId, key, callback) {
                positions.delete_position(groupId, userId, positionId, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          talks: function (cb) {
            console.log('16')
            if (item.mediaItems.talksIds) {
              async.forEachOf(item.mediaItems.talksIds, function (talkId, key, callback) {
                media.delete_media(groupId, talkId, 0, 0, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          posters: function (cb) {
            console.log('17')
            if (item.mediaItems.postersIds) {
              async.forEachOf(item.mediaItems.postersIds, function (posterId, key, callback) {
                media.delete_media(groupId, posterId, 0, 1, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          presses: function (cb) {
            console.log('18')
            if (item.mediaItems.pressesIds) {
              async.forEachOf(item.mediaItems.pressesIds, function (pressId, key, callback) {
                media.delete_media(groupId, pressId, 0, 2, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          faqs: function (cb) {
            console.log('19')
            if (item.faqsIds) {
              db.faq.deleteMany(
                 {_id: {$in: item.faqsIds}},
                 cb()
              )
            } else {
              cb()
            }
          },

          contacts: function (cb) {
            console.log('20')
            if (item.contactsItems.contactsIds) {
              async.forEachOf(item.contactsItems.contactsIds, function (contactId, key, callback) {
                contacts.delete_contact(2, contactId, groupId, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          privateMeetings: function (cb) {
            console.log('21A')
            if (item.futureMeetingsItems.meetings) {
              async.forEachOf(item.futureMeetingsItems.meetings, function (meeting, key, cb) {
                pics.delete_pic_gallery(meeting.files, function(err) {
                  cb(err)
                })
              }, function (err) {
                cb(err)
              })
            } else {
              cb()
            }
          },

          privateReports: function (cb) {
            console.log('21B')
            if (item.reportsItems.currentReport) {
              async.forEachOf(item.reportsItems.currentReport.whoSubmit, function (who, key, cb) {
                pics.delete_pic_direct(who.file, function(err) {
                  cb(err)
                })
              }, function (err) {
                cb(err)
              })
            } else {
              cb()
            }
          },

          privateEvents: function (cb) {
            console.log('21C')
            if (item.eventsItems.eventsIds) {
              async.forEachOf(item.eventsItems.eventsIds, function (eventId, key, callback) {
                galleries.delete_gallery(groupId, eventId, 2, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          privateNews: function (cb) {
            console.log('22')
            if (item.newsItems.newsIds) {
              async.forEachOf(item.newsItems.newsIds, function (newsId, key, callback) {
                privates.delete_news(groupId, newsId, function (err) {
                  callback()
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          groupsFollowing: function(cb) {
            console.log('23')
            if (item.networkItems.followingIds) {
              async.forEachOf(item.networkItems.followingIds, function (followingId, key, callback) {
                groups.toggle_followings_ids(false, 0, null, groupId, followingId, false, function (err, groupId) {
                  cb (err, groupId);
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          groupsFollowers: function(cb) {
            console.log('24')
            if (item.networkItems.followersIds) {
              async.forEachOf(item.networkItems.followersIds, function (followerId, key, callback) {
                groups.toggle_followings_ids(false, 1, null, groupId, followerId, false, function (err, groupId) {
                  cb (err, groupId);
                });
              }, function (err) {
                cb (err)
              })
            } else {
              cb()
            }
          },

          channel: function (cb) {
            console.log('25')
            if (item.channelId) {
              db.channels.deleteOne({ _id: ObjectID(item.channelId) },
                                    { safe: true },
                                    cb());
            } else {
              cb()
            }
          },

          pic: function (cb) {
            pics.delete_pic_direct(item.groupIndex.group.pic, function(err) {
              console.log('27')
              cb()
            })
          },

          department: function (cb) {
            console.log('28')
            db.departments.updateOne(
               { _id: ObjectID(item.groupIndex.department._id) },
               { $pull: { "groupsItems": ObjectID(groupId) } },
               { safe: true },
               cb()
            )
          },

          stripe: function (cb) {
            if (item.stripe_id) {
              stripe.customers.del(item.stripe_id, function(err, confirmation) {
                console.log('29A')
                cb()
              });
            } else {
              console.log('29B')
              cb()
            }
          },

        },

        function (err) {
          cb(err);
        });

      });
    },

    // 4. delete Group Followers Links (+ Notification)
    followers: function (cb) {
      peoples.delete_followings_ids("groups", "groupsIds", groupId, true, function (err) {
        console.log('29')
        cb(err)
      });
    },

    // 5. delete Group Item
    group: function (cb) {
      console.log('30')
      db.groups.deleteOne({ _id: ObjectID(groupId) },
                            { safe: true },
                            cb());
    },

    // 6. delete Group Algolia
    group_algolia: function (cb) {
      console.log('31',companyFlag)

      if (companyFlag) {
        var algoliaIndex = client.initIndex((process.env.PORT) ? 'companies': 'dev_companies');
      } else {
        var algoliaIndex = client.initIndex((process.env.PORT) ? 'labs': 'dev_labs');
      }

      algoliaIndex.deleteObject(groupId.toString(), (err, content) => {
        cb(err)
      });
    },

    // 7. remove all GetStream Group news items
    // notification is sent in the change_stage function
    remove_news: function (cb) {
      console.log('32')
      news.remove_activity(groupId, groupId, 0, function (err) {
        cb(err);
      });
    }

  },
  function (err) {
    console.log('33')
    callback(err);
  });

}

export function from_scratch_group(groupId: string, userId: string, callback) {
  async.series({

      // 1. delete Project Group Links
      links: function (cb) {

        db.groups
          .find({_id: ObjectID(groupId)})
          .project({
            "_id": 0,
            "publicationsItems": 1,
            "resourcesItems": 1,
            "topicsItems": 1,
            "positionsItems": 1,
            "mediaItems": 1,
            "faqPageItems": 1,
            "contactsItems": 1,
            "eventsItems": 1,
          })
        .next().then(function(item) {

          async.parallel({

            publications: function (cb) {
              console.log('S1')
              if (item.publicationsItems.publicationsIds) {
                publications.delete_publications(groupId, userId, 0, item.publicationsItems.publicationsIds, function (err) {
                  cb()
                })
              } else {
                cb()
              }
            },

            resources: function (cb) {
              console.log('S2')
              if (item.resourcesItems.resourcesIds) {
                async.forEachOf(item.publicationsItems.resourcesIds, function (resourceId, key, callback) {
                  resources.delete_resource(groupId, userId, resourceId, 0, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            activeProjects: function (cb) {
              console.log('S3')
              const currentProjectsIds = item.topicsItems ? [].concat(...item.topicsItems.map(r => r.currentProjectsIds)) : [];
              if (currentProjectsIds) {
                async.forEachOf(currentProjectsIds, function (projectId, key, callback) {
                  projects.delete_project(groupId, userId, projectId, null, 0, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            pastProjects: function (cb) {
              console.log('S4')
              const pastProjectsIds = item.topicsItems ? [].concat(...item.topicsItems.map(r => r.pastProjectsIds)) : [];
              if (pastProjectsIds) {
                async.forEachOf(pastProjectsIds, function (projectId, key, callback) {
                  projects.delete_project(groupId, userId, projectId, null, 1, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            positions: function (cb) {
              console.log('S5')
              if (item.positionsItems.positionsIds) {
                async.forEachOf(item.positionsItems.positionsIds, function (positionId, key, callback) {
                  positions.delete_position(userId, userId, positionId, groupId, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            talks: function (cb) {
              console.log('S6')
              if (item.talksIds) {
                async.forEachOf(item.contactsItems.talksIds, function (talkId, key, callback) {
                  media.delete_media(groupId, talkId, 0, 0, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            posters: function (cb) {
              console.log('S7')
              if (item.postersIds) {
                async.forEachOf(item.contactsItems.postersIds, function (posterId, key, callback) {
                  media.delete_media(groupId, posterId, 0, 1, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            presses: function (cb) {
              console.log('S8')
              if (item.pressesIds) {
                async.forEachOf(item.contactsItems.pressesIds, function (pressId, key, callback) {
                  media.delete_media(groupId, pressId, 0, 2, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            faqs: function (cb) {
              console.log('S9')
              if (item.faqsIds) {
                db.faq.deleteMany(
                   {_id: {$in: item.faqsIds}},
                   cb()
                )
              } else {
                cb()
              }
            },

            contacts: function (cb) {
              console.log('S10')
              if (item.contactsItems.contactsIds) {
                async.forEachOf(item.contactsItems.contactsIds, function (contactId, key, callback) {
                  contacts.delete_contact(2, contactId, groupId, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

            events: function (cb) {
              console.log('S11')
              if (item.eventsItems.eventsIds) {
                async.forEachOf(item.eventsItems.eventsIds, function (eventId, key, callback) {
                  galleries.delete_gallery(groupId, eventId, 2, function (err) {
                    callback()
                  });
                }, function (err) {
                  cb (err)
                })
              } else {
                cb()
              }
            },

          },
          function (err) {
            cb(err);
          });

        });
      },

      // 2. reset Group Document
      group: function (cb) {
        console.log('S12')
        resetGroupDocument(groupId, function (err) {
          cb()
        });
      },

  },
  function (err, results) {
    if (err) {
      callback(err);
    } else {
      callback(err, err ? null : results);
    }
  });

}

function resetGroupDocument(groupId: string, callback) {

  db.groups.updateOne(
    {_id: ObjectID(groupId)},
    { $set: {
     "extScore": 0,
     "intScore": 0,
     "stage": 2,
     "progress": [
                 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0,
                 0, 0, 0, 0,
                 0, 0, 0, 0,
                 0, 0, 0, 0
                ],

     "homePageItems.background": null,
     "homePageItems.pic": null,
     "homePageItems.quote": {
                             "text": null,
                             "name": null,
                             "pic": null
                            },
     "homePageItems.thanks": null,
     "homePageItems.intrests": [],

     "publicationsPageItems": { "tags": null },
     "publicationsItems": { "publicationsIds": [] },

     "resourcesPageItems": {
        "background": null,
        "categories": [{
                        title: "No Category",
                        countIds: 0
                      }]
     },
     "resourcesItems": { "resourcesIds": [] },

     "topicsItems": [

     ],

     "projectsPageItems": {
      "background": null,
      "layManText": null,
      "layManPic": null,
      "layManCaption": null,
     },
     "projectsItems": {
      "currentProjectsIds": [],
      "pastProjectsIds": [],
     },

     "collaborationsPageItems": {
      "collaborateWithUs": null
     },
     "collaborationsItems": {
      "currentIds": [],
      "pastIds": [],
      "approveIds": []
     },
     "sponsorsItems": {
      "industries": [],
      "governments": [],
     },

     "fundingsItems": {
      "currentFundingsIds": [],
      "pastFundingsIds": [],
     },

     "positionsPageItems": {
      "whyJoin": null,
      "diversity": null,
     },
     "positionsItems": {
      "positionsIds": []
     },

     "mediaItems": {
      "talksIds": [],
      "postersIds": [],
      "pressesIds": []
     },

     "faqPageItems": {
      "faqs": []
     },

     "contactsPageItems": {
      "findUs": null,
      "findUsPic": null,
      "findUsCaption": null
     },
     "contactsItems": {
      "contactsIds": [],
     },

     "futureMeetingsItems": {
      "settings": null,
      "meetings": [],
     },

     "pastMeetingsItems": {
      "settings": null,
      "meetings": [],
     },

     "reportsItems": {
      "settings": null,
      "currentReport": null,
     },

     "analyticsItems": {
      "groups": [],
      "fields": [],
      "positions": [],
     },

     "eventsItems": {
      // "settings": null,
      "events": [],
     },

     "news": []
    }},
    { safe: true },
    callback()
  );

}
