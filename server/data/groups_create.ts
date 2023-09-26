var db = require("../db.ts"),
  async = require("async"),
  backhelp = require("./backend_helpers.ts");

var ObjectID = require("mongodb").ObjectID;

var departments = require("./departments.ts");
var universities = require("./universities.ts");
var peoples = require("./peoples.ts");
var groups = require("./groups.ts");
var admin = require("./admin.ts");
var news = require("./news.ts");
var messages = require("./messages.ts");
var invites = require("./invites.ts");
var contests = require("./contests.ts");
var positions = require("./positions.ts");

var main = require("../../server.ts");

var publication_misc = require("../misc/publications.ts");
var emails = require("../misc/emails.ts");
var misc = require("../misc/misc.ts");

import { groupComplex, complexName } from "../models/shared.ts";

var stripe = require("stripe")("ENV_STRIPE");

exports.version = "0.1.0";

export function create_group(data, host, userId: string, callback) {
  var university: complexName;
  var universityExternalLink: string = "";
  var universityDescription: string = "";

  var department: complexName;
  var departmentExternalLink: string = "";
  var departmentDescription: string = "";

  var firstId: string;
  var secondId: string;

  var country: Number;
  var state: string;
  var city: string;
  var location: string[];

  // Pay attention to the bad programing: Do Not change university, department var names as it affects Mongos Keys name

  var createMode: number = 0; // 0 - Create Group
  //     Create Department
  //     Create University
  //     Push new Department into new University
  //     Push new Group into new Department
  // 1 - Create Group
  //     Create Department
  //     Push new Department inside existing University
  //     Push new Group into new Department
  // 2 - Create Group
  //     Push new Group into exisintg Department

  var labPI: Number; // 0 - OnBehalf // 1 - PI (Solo)
  var labMode: Number; // 0 - From Position // 1 - From Scratch (New)
  var labMarketing: Number; // 0 - Non Marketing // 1 - Markeintg
  var labJob: Number; // 0 - Non Job Posting // 1 - Job Posting
  var labCompany: Number; // 0 - Lab // 1 - Company
  var labBuild: Number; // 0 - Null // 1 - Build For You

  async.waterfall(
    [
      // 1. validate data.
      function (cb) {
        console.log("1");
        try {
          backhelp.verify(data, [
            "buildMode",
            "university",
            "department",
            "group",
          ]);

          labPI =
            data.buildMode == 0 ||
            data.buildMode == 1 ||
            data.buildMode == 4 ||
            data.buildMode == 5 ||
            data.buildMode == 8
              ? 1
              : 0;
          labMode =
            data.buildMode == 0 ||
            data.buildMode == 2 ||
            data.buildMode == 4 ||
            data.buildMode == 6 ||
            data.buildMode == 7 ||
            data.buildMode == 8 ||
            data.buildMode == 9
              ? 1
              : 0;
          labCompany =
            data.buildMode == 4 || data.buildMode == 5 || data.buildMode == 7
              ? 1
              : 0;
          labMarketing = data.buildMode == 6 || data.buildMode == 7 ? 1 : 0;
          labJob = data.buildMode == 8 || data.buildMode == 9 ? 1 : 0;
          labBuild =
            (data.buildMode < 8 || data.buildPro) &&
            (data.currentWebsite ? 1 : 0);

          // if (labMarketing==0) { backhelp.verify(data, ["firstInstituteEmail", "position", "period"]) };
          // if (labPI==0) { backhelp.verify(data, ["secondInstituteEmail", "secondPosition", "secondName"]) };
        } catch (e) {
          cb(e);
          return;
        }
        // console.log('1. User ID:', userId, 'buildMode:', data.buildMode, 'labPI': labPI, 'labMode:' labMode, 'labMarketing': labMarketing)
        // console.log('data',data)
        cb(null, data);
      },

      // 2. check University Existence.
      function (group_data, cb) {
        console.log("2", misc.NFD(group_data.university));
        universities.university_id(
          group_data.university,
          0,
          function (err, universityId) {
            if (universityId) {
              createMode++;
              universities.university_details(
                universityId,
                1,
                function (err, university_data) {
                  university = university_data;
                  universityExternalLink = university_data.externalLink;
                  universityDescription = university_data.description;
                  cb(err, group_data);
                }
              );
            } else {
              university = {
                _id: null,
                name: group_data.university,
                link: misc.NFD(group_data.university),
                pic: null,
              };
              cb(null, group_data);
            }
          }
        );
      },

      // 3. check Department Existence.
      function (group_data, cb) {
        console.log("3");
        departments.department_id(
          group_data.university,
          group_data.department,
          0,
          function (err, departmentId) {
            if (departmentId) {
              createMode++;
              departments.departments_list(
                [departmentId],
                0,
                function (err, department_data) {
                  department = department_data[0].departmentIndex.department;

                  departmentExternalLink = department_data[0].externalLink;
                  departmentDescription = department_data[0].description;

                  country = labCompany
                    ? group_data.country_id
                    : department_data[0].country;
                  state = department_data[0].state;
                  city = department_data[0].city;
                  location = department_data[0].location;

                  // groups.get_group_exist(university._id, department._id, group_data.group function (err, id) {
                  // console.log('get_group_exist',id)
                  cb(err, group_data);
                  // })
                }
              );
            } else {
              department = {
                _id: null,
                name: group_data.department,
                link: misc.NFD(group_data.department),
                pic: null,
              };
              cb(null, group_data);
            }
          }
        );
      },

      // 4. create First People document (Flag)
      function (group_data, cb) {
        console.log("4A", "userId", userId);
        if (userId) {
          firstId = userId;
          cb(null, group_data);
        } else {
          const people_data = {
            name: group_data.members[0].name,
            pic: group_data.members[0].pic,
            email: group_data.members[0].email,
          };
          peoples.createPeopleDocument(
            1,
            0,
            people_data,
            function (err, createdId) {
              firstId = createdId;
              cb(err, group_data);
            }
          );
        }
      },

      // 4. create Second People document (Flag)
      function (group_data, cb) {
        console.log(
          "4B",
          "firstId",
          firstId,
          "membmers1",
          !group_data.members[1],
          "labPI",
          labPI
        );
        if (labPI == 1 || !group_data.members[1]) {
          console.log("4B_1");
          cb(null, group_data);
        } else {
          console.log("4B_2");
          const people_data = {
            name: group_data.members[1].name,
            pic: group_data.members[1].pic,
            email: group_data.members[1].email,
          };
          peoples.createPeopleDocument(
            1,
            0,
            people_data,
            function (err, createdId) {
              secondId = createdId;
              cb(err, group_data);
            }
          );
        }
      },

      // 5. create Group Chat Ghannel
      function (group_data, cb) {
        console.log("5", "secondId", secondId);
        var membersIds = labPI == 0 ? [secondId, firstId] : [firstId];
        messages.createChannelDocument(
          membersIds,
          null,
          1,
          function (err, channelId) {
            cb(err, group_data, channelId);
          }
        );
      },

      // 7. Delete Dummy position + Dummy Group (Flag)
      function (group_data, channel_id, cb) {
        console.log("7");
        if (labMode == 0) {
          // FROM POSITION
          groups.get_group_id(
            group_data.university,
            group_data.department,
            group_data.group,
            0,
            function (err, groupId, privacy) {
              if (groupId) {
                groups.delete_member(
                  userId,
                  groupId,
                  userId,
                  null,
                  null,
                  false,
                  function (err, groupId) {
                    cb(err, group_data, channel_id);
                  }
                );
              } else {
                cb(err, group_data, channel_id);
              }
            }
          );
        } else {
          cb(null, group_data, channel_id);
        }
      },

      // 8. create Group document
      function (group_data, channel_id, cb) {
        console.log("8");
        const data_clone = JSON.parse(JSON.stringify(group_data)); // clone object
        data_clone["secondId"] = secondId;
        createGroupDocument(
          data_clone,
          universityDescription,
          universityExternalLink,
          university,
          departmentDescription,
          departmentExternalLink,
          department,
          country,
          state,
          city,
          location,
          channel_id,
          firstId,
          function (err, group_id) {
            cb(err, data_clone, group_id, channel_id);
          }
        );
      },

      // 9. create/update Department document
      function (group_data, group_id, channel_id, cb) {
        console.log("9");
        const department_data = {
          groupId: group_id,
          department: group_data.department,
          university: group_data.university,
        };

        departments.createDepartment(
          department_data,
          createMode,
          function (err, department_id) {
            cb(err, group_data, group_id, department_id, channel_id);
          }
        );
      },

      // 10. create/update University document
      function (group_data, group_id, department_id, channel_id, cb) {
        console.log("10");
        const university_data = {
          departmentId: department_id,
          department: group_data.department,
          unit: null,
          universityId: university._id,
          university: group_data.university,
          externalLink: universityExternalLink,
          description: universityDescription,
        };

        universities.createUniversity(
          university_data,
          createMode,
          function (err, university_id) {
            cb(
              err,
              group_data,
              group_id,
              department_id,
              university_id,
              channel_id
            );
          }
        );
      },

      // 11. create academigID in UniversityQuery document (conditional)
      function (
        group_data,
        group_id,
        department_id,
        university_id,
        channel_id,
        cb
      ) {
        console.log("11", group_data.university);
        universities.university_item(
          group_data.university,
          function (err, university_query) {
            console.log("university_query", university_query);
            if (university_query[0]) {
              universities.university_activate(
                university_query[0]._id,
                university_id,
                group_data.university,
                function (err) {
                  cb(
                    err,
                    group_data,
                    group_id,
                    department_id,
                    university_id,
                    channel_id
                  );
                }
              );
            } else {
              cb(
                err,
                group_data,
                group_id,
                department_id,
                university_id,
                channel_id
              );
            }
          }
        );
      },

      // 12. update groupIndex IDs
      function (
        group_data,
        group_id,
        department_id,
        university_id,
        channel_id,
        cb
      ) {
        console.log("12");
        db.groups.updateOne(
          { _id: ObjectID(group_id) },
          {
            $set: {
              "groupIndex.group._id": ObjectID(group_id),
              "groupIndex.department._id": ObjectID(department_id),
              "groupIndex.university._id": ObjectID(university_id),
            },
          },
          function (err, res) {
            cb(
              err,
              group_data,
              group_id,
              department_id,
              university_id,
              channel_id
            );
          }
        );
      },

      // 13. update departmentIndex IDs
      function (
        group_data,
        group_id,
        department_id,
        university_id,
        channel_id,
        cb
      ) {
        console.log("13");
        db.departments.updateOne(
          { _id: ObjectID(department_id) },
          {
            $set: {
              "departmentIndex.department._id": ObjectID(department_id),
              "departmentIndex.university._id": ObjectID(university_id),
            },
          },
          function (err, res) {
            cb(
              err,
              group_data,
              group_id,
              department_id,
              university_id,
              channel_id
            );
          }
        );
      },

      // 14. create (PI / OnBehalf / Marketing) position
      function (
        group_data,
        group_id,
        department_id,
        university_id,
        channel_id,
        cb
      ) {
        const position_data = peoples.generate_people_position(
          userId ? 2 : 0,
          labPI == 0 || labMarketing == 1 ? 7 : 6,
          {
            start: group_data.members[0].startDate,
            end: group_data.members[0].endDate,
            mode: group_data.members[0].active[0] ? 2 : 0,
          },
          group_data.members[0].position,
          group_data.members[0].email,
          labMarketing == 1 || labJob == 1 ? 2 : 0,
          group_id,
          department_id,
          university_id
        );
        console.log("14", userId);
        // peoples.create_position(firstId, channel_id, position_data, false, (group_data.period.mode==0) ? 2 : 0, function (err, people_id) {
        peoples.create_position(
          firstId,
          channel_id,
          position_data,
          false,
          2,
          function (err, people_id) {
            cb(
              err,
              group_data,
              group_id,
              department_id,
              university_id,
              channel_id
            );
          }
        );
      },

      // 15. create PI position (Flag)
      function (
        group_data,
        group_id,
        department_id,
        university_id,
        channel_id,
        cb
      ) {
        console.log("15");
        if (labPI == 1 || !group_data.members[1]) {
          cb(
            null,
            group_data,
            group_id,
            department_id,
            university_id,
            channel_id
          );
        } else {
          const position_data_pi = peoples.generate_people_position(
            0,
            6,
            {
              start: group_data.members[1].startDate,
              end: null,
              mode: 2,
            },
            group_data.members[1].position,
            group_data.members[1].email,
            2,
            group_id,
            department_id,
            university_id
          );
          peoples.create_position(
            secondId,
            channel_id,
            position_data_pi,
            false,
            0,
            function (err, people_id) {
              cb(
                err,
                group_data,
                group_id,
                department_id,
                university_id,
                channel_id
              );
            }
          );
        }
      },

      // 16. create ExistSite position (Flag)
      function (
        group_data,
        group_id,
        department_id,
        university_id,
        channel_id,
        cb
      ) {
        console.log("16", labBuild);
        if (labBuild == 1) {
          const position_data_exist = peoples.generate_people_position(
            2,
            7,
            { start: null, end: null, mode: 2 },
            450,
            "support@academig.com",
            2,
            group_id,
            department_id,
            university_id
          );
          peoples.create_position(
            "academig",
            channel_id,
            position_data_exist,
            false,
            0,
            function (err, people_id) {
              cb(err, group_data, group_id);
            }
          );
        } else {
          cb(null, group_data, group_id);
        }
      },

      // 17. push Group to approve
      function (group_data, group_id, cb) {
        console.log("17");
        admin.push_group_approve(group_id, function (err) {
          cb(err, group_data, group_id);
        });
      },

      // 18. update Auth0 App Metadata
      // function (group_data, group_id, cb) {
      //   console.log('13')
      //   peoples.update_auth_metadata(userId, 1, group_id, function (err) {
      //     cb(err, group_data, group_id);
      //   });
      // },

      // 19. send Verification email / Job: push Invite (First: PI or On Behalf) (Flag)
      function (group_data, group_id, cb) {
        console.log("20");
        if (labMarketing == 1) {
          cb(null, group_data, group_id);
        } else if (labJob == 1) {
          invites.push_non_user_invite(
            firstId,
            group_data.members[0].email,
            group_id,
            0,
            function (err) {
              cb(err, group_data, group_id);
            }
          );
        } else {
          peoples.create_hash(firstId, group_id, function (err, hash) {
            // create (PI or On Behalf) hash
            emails.verificationEmail(
              host,
              hash,
              group_data.members[0].email,
              function (err) {
                cb(err, group_data, group_id);
              }
            );
          });
        }
      },

      // 20. invite/create Members
      function (group_data, group_id, cb) {
        console.log("21", group_data.members);
        var user_data;
        async.forEachOf(
          group_data.members,
          function (member, key, cbFor) {
            if (key == 0 || (labPI == 0 && key == 1)) {
              cbFor();
            } else {
              user_data = {
                _id: member._id,
                name: member.name,
                pic: member.pic,
                email: member.email,
                status: 4,
                mode: 0,
                titles: [member.position],
                period: {
                  start: member.startDate,
                  end: member.endDate,
                  mode: member.active[0] ? 2 : 0,
                },
                groupId: group_id,
                text:
                  member.messageFlag && member.messageFlag[0]
                    ? member.message
                    : null,
                degree: null,
              };

              groups.create_member(
                user_data,
                userId,
                group_id,
                0,
                false,
                function (err) {
                  cbFor(err);
                }
              );
            }
          },
          function (err) {
            cb(err, group_data, group_id);
          }
        );
      },

      // 21. push Invite (Second: PI) (Flag)
      function (group_data, group_id, cb) {
        console.log("21");
        if (labPI == 1 || !group_data.members[1]) {
          cb(null, group_data, group_id);
        } else {
          invites.push_non_user_invite(
            secondId,
            group_data.members[1].email,
            group_id,
            0,
            function (err) {
              cb(err, group_data, group_id);
            }
          );
        }
      },

      // 22. follow Group Feed
      function (group_data, group_id, cb) {
        console.log("22");
        if (labMarketing == 1 || labJob == 1) {
          cb(null, group_data, group_id);
        } else {
          // news.follow_many(group_id, userId, function (err) {
          news.follow_many(group_id, firstId, function (err) {
            cb(err, group_data, group_id);
          });
        }
      },

      // 23. retrieve Publications Suggestions
      function (group_data, group_id, cb) {
        console.log("23");
        cb(null, group_data, group_id);
        // if (labJob==0 && labCompany==0 && labMarketing==0) {
        //   publication_misc.retrieveSuggestions(0, group_id, function (err) {
        //     cb(err, group_data, group_id)
        //   });
        // } else {
        //   cb(null, group_data, group_id)
        // }
      },

      // 24. update Profile plan
      // function (group_data, cb) {
      //   console.log('24')
      //   peoples.post_researcher_plan(userId, 2, function (err) {
      //     cb(err, group_data);
      //   })
      // },

      // 25. plan Subscription
      function (group_data, group_id, cb) {
        stripe.customers
          .create({ email: group_data.members[0].email })
          .then(function (customer) {
            console.log("25", customer.id, group_data.members[0].email);
            db.groups.updateOne(
              { _id: ObjectID(group_id) },
              { $set: { stripe_id: customer.id } },
              function (err, res) {
                cb(err, group_id);
              }
            );
          });
      },

      // 26. push ID Contest (if available)
      function (group_id: string, cb) {
        console.log("26");
        if (labCompany == 0 && labMarketing == 0) {
          contests.contestAdd(group_id, function (err) {
            cb(err, group_id);
          });
        } else {
          cb(null, group_id);
        }
      },

      // 27. retrieve Positions data
      function (group_id: string, cb) {
        console.log("27");
        if (labMarketing == 1) {
          cb(null, group_id);
        } else {
          peoples.people_actives(firstId, true, 9, function (err, people) {
            cb(err, people);
          });
        }
      },
    ],
    function (err, people) {
      console.log("err", err);
      if (err) {
        callback(err);
      } else {
        callback(null, people);
      }
    }
  );
}

export function get_current_stage(groupId: string, callback) {
  db.groups
    .find({ _id: ObjectID(groupId) })
    .project({ _id: 0, stage: 1 })
    .next()
    .then(function (item) {
      callback(null, item.stage);
    });
}

export function change_welcome_stage(stage: number, groupId: string, callback) {
  db.groups.updateOne(
    { _id: ObjectID(groupId) },
    { $set: { welcome: stage } },
    { safe: true },
    callback()
  );
}

function createGroupDocument(
  data,
  universityDescription: string,
  universityExternlLink: string,
  university: complexName,
  departmentDescription: string,
  departmentExternlLink: string,
  department: complexName,
  country: Number,
  state: string,
  city: string,
  location: string[],
  channelId: string,
  userId: string,
  callback
) {
  const labPI: number =
    data.buildMode == 0 ||
    data.buildMode == 1 ||
    data.buildMode == 4 ||
    data.buildMode == 5 ||
    data.buildMode == 8
      ? 1
      : 0;
  const labMarketing: number =
    data.buildMode == 6 || data.buildMode == 7 ? 1 : 0;
  const labBuild: number =
    (data.buildMode < 8 || data.buildPro) && data.currentWebsite;

  var activesIds, alumniIds: string[];
  var titleIndex: number;

  var activesIndexes: number[];
  var alumniIndexes: number[] = [0, 0, 0, 0];

  console.log("labPI", labPI);

  if (labMarketing == 1) {
    activesIndexes = [1, 0, 0, 0, 0];
    activesIds = [data.secondId];
    alumniIds = [];
  } else if (labPI == 0) {
    if (data.members[0].active[0]) {
      titleIndex = Math.floor(data.members[0].position / 100);
      // console.log('members1',data.members[1])
      activesIndexes = [data.members[1] ? 1 : 0, 0, 0, 0, 0];
      activesIndexes[titleIndex] = 1;
      activesIds = data.members[1] ? [data.secondId, userId] : [userId];
      alumniIds = [];
    } else {
      titleIndex = Math.floor(data.members[0].position / 100) - 1;
      activesIndexes = [data.members[1] ? 1 : 0, 0, 0, 0, 0];
      alumniIndexes[titleIndex] = 1;
      activesIds = [data.secondId];
      alumniIds = [userId];
    }
  } else {
    activesIndexes = [1, 0, 0, 0, 0];
    activesIds = [userId];
    alumniIds = [];
  }

  // console.log('activesIds',activesIds)
  // console.log('alumniIds',alumniIds)

  if (labBuild) activesIds.push("academig");

  var groupIndex: groupComplex = {
    group: {
      name: data.group,
      link: misc.NFD(data.group),
      pic: data.logo,
      _id: null,
    },
    department,
    university,
  };

  const sub_pics: string[] = [
    "Arts",
    "History",
    "Literature",
    "Philosophy",
    "Theology",
    "Anthropology",
    "Archaeology",
    "Economics",
    "Human",
    "Law",
    "Political",
    "Psychology",
    "Sociology",
    "Biology",
    "Chemistry",
    "Earth",
    "Space",
    "Physics",
    "Computer",
    "Mathematics",
    "Statistics",
    "Chemical",
    "Civil",
    "Educational",
    "Electrical",
    "Materials",
    "Mechanical",
    "Systems",
    "Medicine",
  ];

  db.groups.insertOne(
    {
      stage: labBuild ? -1 : 1,
      privacy: data.privacy ? 1 : 0,
      plan: 0,
      stripe_id: null,
      sub_id: null,
      currentWebsite: labBuild ? data.currentWebsite : null,
      allowSendEmails: data.allowSendEmails,
      buildPro: data.buildPro,
      onInvite: 0,
      onBehalf: data.buildMode, // 0 - Lab PI (New)
      // 1 - Lab PI (From Position)

      // 2 - Lab OnBehalf (New)
      // 3 - Lab OnBehalf (From Position)

      // 4 - Company (New)
      // 5 - Company (From Position)

      // 6 - Marketing - Lab
      // 7 - Marketing - Company

      // 8 - Job Posting - PI
      // 9 - Job Posting - OnBehalf

      welcome: 1,
      dates: [new Date(), new Date()], // labBuild ? [new Date()] : [new Date(), new Date()],
      extScore: 0,
      intScore: 0,
      progress: [
        1,
        data.background ? 1 : 0,
        0,
        data.interests && data.interests[0] ? 1 : 0,
        0,
        0,
        0,
        0,
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ],

      theme: data.theme,
      themeIndex: data.themeIndex,
      // "template":
      // "style":
      // "feel":
      // "font":
      // "colors":

      membersCount: labPI == 1 || labMarketing == 1 ? 1 : 2,
      groupIndex: groupIndex,
      unit: null, // data.unit,

      homePageItems: {
        background: data.background,
        // "pic": data.cover ? data.cover : 'https://s3.amazonaws.com/academig/coverPics/big/' + sub_pics[data.theme]+'_'+data.themeIndex + '.jpeg',
        pic: data.cover ? data.cover : null,
        statement: data.statement,
        quote: {
          text: data.quote,
          name: null,
          pic: null,
        },
        thanks: null,
        intrests: data.interests,
        topic: data.topic,
        size: data.group_size ? data.group_size : null,
        establish: data.establishDate ? data.establishDate : null,
        affiliations: [
          {
            _id: ObjectID(),
            title: university.name,
            description: universityDescription,
            externalLink: universityExternlLink,
            pic: university.pic,
          },
          {
            _id: ObjectID(),
            title: department.name,
            description: departmentDescription,
            externalLink: departmentExternlLink,
            pic: department.pic,
          },
        ],
      },

      peoplesPageItems: {
        activesIds: activesIndexes,
        visitorsIds: [0],
        alumniIds: alumniIndexes,
        visitUs: null,
      },
      peoplesItems: {
        activesIds: activesIds,
        visitorsIds: [],
        alumniIds: alumniIds,
      },

      publicationsPageItems: {
        tags: null,
        names: data.names,
      },
      publicationsItems: {
        publicationsIds: [],
        suggestionsIds: [],
        rejectedIds: [],
      },

      resourcesPageItems: {
        background: null,
        categories: [
          {
            title: "No Category",
            countIds: 0,
          },
        ],
      },
      resourcesItems: {
        resourcesIds: [],
      },

      topicsItems: [],

      projectsPageItems: {
        background: null,
        layManText: null,
        layManPic: null,
        layManCaption: null,
      },
      projectsItems: {
        currentProjectsIds: [],
        pastProjectsIds: [],
      },

      collaborationsPageItems: {
        collaborateWithUs: null,
      },
      collaborationsItems: {
        currentIds: [],
        pastIds: [],
        approveIds: [],
      },
      sponsorsItems: {
        industries: [],
        governments: [],
      },

      fundingsItems: {
        currentFundingsIds: [],
        pastFundingsIds: [],
      },

      teachingsItems: {
        currentTeachingsIds: [],
        pastTeachingsIds: [],
      },

      outreachsItems: {
        outreachsIds: [],
      },

      positionsPageItems: {
        whyJoin: null,
        diversity: null,
      },
      positionsItems: {
        positionsIds: [],
      },

      mediaItems: {
        talksIds: [],
        postersIds: [],
        pressesIds: [],
      },

      faqPageItems: {
        faqs: [],
      },

      contactsPageItems: {
        findUs: null,
        findUsPic: null,
        findUsCaption: null,
      },
      contactsItems: {
        contactsIds: [],
      },

      networkItems: {
        // Groups Followings
        followingIds: [],
        followersIds: [],
      },
      followedIds: [], // Users Followings

      newsItems: {
        settings: null,
        newsIds: [],
      },

      futureMeetingsItems: {
        // privacy
        settings: null,
        meetings: [],
      },

      pastMeetingsItems: {
        settings: null,
        meetings: [],
      },

      reportsItems: {
        settings: null,
        currentReport: null,
      },

      analyticsItems: {
        groups: [],
        fields: [],
        positions: [],
      },

      eventsItems: {
        eventsIds: [],
      },

      channelId: channelId,

      country: country ? country : "",
      state: state ? state : "",
      city: city ? city : "",
      location: location ? location : [,],

      publicInfo: {
        website: data.currentWebsite ? data.currentWebsite : "",
        email: data.contactEmail ? data.contactEmail : "",
      },

      socialInfo: {
        twitter: data.twitter ? "https://twitter.com/" + data.twitter : "",
      },

      papersKit: {
        // privacy
        status: data.papersKit ? true : false,
      },

      interview:
        data.interview && data.interview.status
          ? {
              status: true,
              email: data.interview.email,
            }
          : {
              status: false,
            },

      club:
        data.club && data.club.status
          ? {
              status: true,
              email: data.club.email,
              phone: data.club.phone,
              address: data.club.address,
              time: data.club.time,
            }
          : {
              status: false,
            },
    },
    { w: 1, safe: true },
    function (err, docsInserted) {
      callback(err, docsInserted.insertedId);
    }
  );
}

function algolia_group_items(groupId: string, userId: string, callback) {
  // sources: group_mini, affiliations x2

  db.groups
    .find({ _id: ObjectID(groupId) })
    .project({
      _id: 0,
      resourcesItems: 1,
      topicsItems: 1,
      positionsItems: 1,
    })
    .next()
    .then(function (item) {
      async.parallel(
        {
          people: function (cb) {
            console.log("A1");
            if (item.resourcesItems.resourcesIds) {
              async.forEachOf(
                item.publicationsItems.resourcesIds,
                function (resourceId, key, callback) {
                  callback();
                },
                function (err) {
                  cb(err);
                }
              );
            } else {
              cb();
            }
          },

          resources: function (cb) {
            console.log("A2");
            if (item.resourcesItems.resourcesIds) {
              async.forEachOf(
                item.publicationsItems.resourcesIds,
                function (resourceId, key, callback) {
                  callback();
                },
                function (err) {
                  cb(err);
                }
              );
            } else {
              cb();
            }
          },

          projects: function (cb) {
            console.log("A3");
            const currentProjectsIds = item.topicsItems
              ? [].concat(...item.topicsItems.map((r) => r.currentProjectsIds))
              : [];
            const pastProjectsIds = item.topicsItems
              ? [].concat(...item.topicsItems.map((r) => r.pastProjectsIds))
              : [];
            if (currentProjectsIds) {
              async.forEachOf(
                currentProjectsIds.concat(pastProjectsIds),
                function (projectId, key, callback) {
                  callback();
                },
                function (err) {
                  cb(err);
                }
              );
            } else {
              cb();
            }
          },

          positions: function (cb) {
            console.log("A4");
            if (item.positionsItems.positionsIds) {
              async.forEachOf(
                item.positionsItems.positionsIds,
                function (positionId, key, callback) {
                  callback();
                },
                function (err) {
                  cb(err);
                }
              );
            } else {
              cb();
            }
          },
        },
        function (err) {
          callback(err);
        }
      );
    });
}
