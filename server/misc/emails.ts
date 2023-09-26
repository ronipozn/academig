const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var moment = require('moment');

var department_data = require("../data/departments.ts");
var group_data = require("../data/groups.ts");
var peoples = require("../data/peoples.ts");

import {PublicInfo, SocialInfo, objectMini, complexName} from '../models/shared.ts';
import {SubmitPodcast} from '../models/podcasts.ts';
import {SubmitEvent} from '../models/events.ts';
import {SubmitApp} from '../models/apps.ts';
import {SubmitMentor} from '../models/mentors.ts';

exports.send = function (msg, callback) {
  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(err,result);
    }
  });
}

///////////////////////////////////////
/////////////// Marketing /////////////
///////////////////////////////////////

exports.piMarketingInvite = function (personalText: string,
                                      pics: string[],
                                      piName: string,
                                      piEmail: string,
                                      link: string,
                                      name: string,
                                      topic: string,
                                      sizeId: number,
                                      year: number,
                                      interests: string[],
                                      university: string,
                                      socialInfo: SocialInfo,
                                      publicInfo: PublicInfo,
                                      counter: number,
                                      callback) {

  // console.log("PI Email",piEmail, counter, pics[0])
  const templatesIds: string[] = [
    'd-e714541da8184d5693c57fea9939754c',
    'd-86e4fd6537cc4b0ab8452fe231976a06',
    'd-5015425a88cc456c8c4eb37a00647344',
  ];

  const subjects: string[] = [
    'Join the world largest network for research labs.', // '[Academig] Your new research lab profile',
    'Reminder: Your new research lab profile is ready.',
    'Reminder: About your research lab profile in Academig.',
  ];

  const groupSize = [
    { "id": 0, "name": "1-5", "low": 1, "high": 5 },
    { "id": 1, "name": "6-10" , "low": 6, "high": 10 },
    { "id": 2, "name": "11-20", "low": 11, "high": 20 },
    { "id": 3, "name": "21-30", "low": 21, "high": 30 },
    { "id": 4, "name": "31-40", "low": 31, "high": 40 },
    { "id": 5, "name": "41-50", "low": 41, "high": 50 },
    { "id": 6, "name": "51+", "low": 51, "high": null }
  ];

  const companySize = [
    { "id": 0, "name": "1-10", "low": 1, "high": 10 },
    { "id": 1, "name": "11-50", "low": 11, "high": 50 },
    { "id": 2, "name": "51-100", "low": 51, "high": 100 },
    { "id": 3, "name": "101-250", "low": 101, "high": 250 },
    { "id": 4, "name": "251-500", "low": 251, "high": 500 },
    { "id": 5, "name": "501-1000", "low": 501, "high": 1000 },
    { "id": 6, "name": "1001-5000", "low": 1001, "high": 5000 },
    { "id": 7, "name": "5001-10000", "low": 5001, "high": 10000 },
    { "id": 8, "name": "10001+", "low": 10001, "high": null },
  ];

  const msg = {
    to: piEmail,
    bcc: 'support@academig.com',
    from: 'Academig <support@academig.com>',
    // subject: subjects[counter],
    templateId: templatesIds[counter],
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": subjects[counter],

      "personalText": personalText,
      "universityPic": pics[0],

      "piName": piName,
      "piEmail": piEmail,

      "link": link,
      "name": name,
      "topic": topic,
      "size": groupSize.filter(x => x.id==sizeId)[0].name,
      "year": year,
      "interests": interests.join(", "),

      "email": publicInfo ? publicInfo.email : null,
      "address": publicInfo ? publicInfo.address : null,
      "website": publicInfo ? publicInfo.website : null,

      "linkedin": socialInfo ? socialInfo.linkedin : null,
      "twitter": socialInfo ? socialInfo.twitter : null,
      "scholar": socialInfo ? socialInfo.scholar : null,
      "orcid": socialInfo ? socialInfo.orcid : null,
      "researchgate": socialInfo ? socialInfo.researchgate : null,
      "facebook": socialInfo ? socialInfo.facebook : null,
      "youtube": socialInfo ? socialInfo.youtube : null,
      "pinterest": socialInfo ? socialInfo.pinterest : null,
      "instagram": socialInfo ? socialInfo.instagram : null,

      "universityName": university
    }
    // substitutions: { }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.memberMarketingInvite = function (memberName: string,
                                          memberEmail: string,
                                          existingSite: string,
                                          pics: string[],
                                          groupLink: string,
                                          groupName: string,
                                          university: string,
                                          callback) {
  // console.log("Member Email",memberEmail)
  const msg = {
    to: memberEmail,
    from: 'Academig <support@academig.com>',
    subject: '[Academig] Your new academic lab profile',
    // d-adb02a4a841349e9a7ace16f49cc894f
    templateId: '4a1fd132-4b0a-47f2-aef7-5911a0a335b3',
    substitutions: {
      memberName: memberName,
      memberEmail: memberEmail,
      existingSite: existingSite,
      groupLink: groupLink,
      groupName: groupName,
      universityName: university,
      pic_0: pics ? pics[0] : null,
      pic_1: pics ? pics[1] : null,
      pic_2: pics ? pics[2] : null,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.researcherMarketingInvite = function (name: string,
                                              email: string,
                                              existingSite: string,
                                              pics: string[],
                                              profileLink: string,
                                              callback) {
  // console.log("Profile Email",email)
  const msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: '[Academig] Your new academic researcher profile',
    // d-e714541da8184d5693c57fea9939754c
    templateId: '5a893a8f-dfff-40ba-b4ac-b9f5c444bfc3',
    substitutions: {
      name: name,
      email: email,
      existingSite: existingSite,
      link: profileLink,
      pic_0: pics[0],
      pic_1: pics[1],
      pic_2: pics[2],
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
/////////////// OnBehalf //////////////
///////////////////////////////////////

exports.piOnBehalfInvite = function (userName: string,
                                     userPic: string,
                                     userLink: string,
                                     userEmail: string,
                                     userPosition: string,
                                     userPositionDate: string,
                                     piName: string,
                                     piEmail: string,
                                     groupLink: string,
                                     groupName: string,
                                     university: string,
                                     callback) {

// group screenshoot

  const msg = {
    to: piEmail,
    from: userName + ' via Academig <support@academig.com>',
    subject: userName + ' invites you to Academig',
    templateId: 'a2c96ca1-9618-4721-9e35-2b8c28dad36f',
    substitutions: {
      userName: userName,
      userPic: userPic,
      userLink: userLink,
      userPosition: peoples.titlesTypes(userPosition),
      userDate: moment(userPositionDate).format('MMMM YYYY'),
      piName: piName,
      userEmail: userEmail,
      piEmail: piEmail,
      groupLink: groupLink,
      groupName: groupName,
      university: university,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.piOnBehalfResponse = function (userName: string, groupName: string, mode: number, email: string, callback) {
  var msg;
  var subject: string;
  var response: string;

  if (mode==0) {
    subject = 'Group Invitation Accepted'
    response = 'accepted';
  } else {
    subject = 'Group Invitation Rejected'
    response = 'rejected';
  }

  msg = {
    to: email,
    from: userName + ' via Academig <support@academig.com>',
    subject: subject + ' [' + groupName + ']',
    templateId: 'f79d324f-ab80-4139-8a61-ce4dd99e3fca',
    substitutions: {
      name: userName,
      response: response,
      groupName: groupName,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
///////////// Build For You ///////////
///////////////////////////////////////

exports.builtGroupEmail = function (groupLink: string, groupName: string, departmentLink: string, departmentName: string, universityName: string, message: string, email: string, userName: string, callback) {
  const msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    // templateId: '4d971d20-3340-486d-ac79-9c0d630c4aea',
    templateId: 'd-632186a1fd524c768033e2adaefcd5cd',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] Your lab profile is ready',
      "groupLink": groupLink,
      "groupName": groupName,
      "departmentLink": departmentLink,
      "departmentName": departmentName,
      "universityName": universityName,
      // "positionId": positionId,
      // "positionTitle": positionTitle,
      // "positionName": positionName,
      "userName": userName,
      "message": message
    }
    // substitutions: { }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.intelligence = function (piName: string,
                                 piEmail: string,
                                 groupLink: string,
                                 groupName: string,
                                 university: string,
                                 ai_total: number,
                                 ai_mode: number,
                                 ai_title: string,
                                 callback) {

  const aiType = { 0: 'Project',
                   1: 'Publications',
                   2: 'Funding',
                   3: 'Open Positions',
                   4: 'Services',
                   5: 'Teaching',
                   6: 'Gallery',
                   7: 'Questions and Answers',
                   8: 'Media',
                   9: 'Media',
                   10: 'Media',
                   11: 'Contacts',
                   20: 'Research topic'
                   // 30: 'People',
                   // 31: 'Collaborations',
                 };

  const msg = {
    to: piEmail,
    bcc: 'support@academig.com',
    from: 'Academig <support@academig.com>',
    subject: '[Academig] New AI suggestions for your lab profile',
    templateId: '1a0aabc7-3b0f-4042-9344-d48fac378646',
    substitutions: {
      piName: piName,
      piEmail: piEmail,
      // personalText: personalText,
      groupLink: groupLink,
      groupName: groupName,
      universityName: university,
      ai_total: ai_total,
      ai_category: aiType[ai_mode],
      ai_title: ai_title
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
//////////////// Group ////////////////
///////////////////////////////////////

exports.createGroupEmail = function (newStage: number,
                                     text: string,
                                     email: string,
                                     name: string,
                                     degree: number,
                                     groupName: string,
                                     departmentName: string,
                                     universityName: string,
                                     groupLink: string,
                                     departmentLink: string,
                                     callback) {
  var subject: string;

  if (newStage==2) {
    subject = "Lab request approved";
  } else if (newStage==7) {
    subject = "Fix your lab profile";
  } else if (newStage==8) {
    subject = "Lab request declined";
  }

  const msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: '[Academig] ' + subject,
    // text: 'Hello plain world!',
    // html: '<p>Hello HTML world!</p>',
    templateId: '099a86f3-8fb2-482e-9d69-519c5a783404',
    substitutions: {
      name: name,
      groupName: groupName,
      departmentName: departmentName,
      universityName: universityName,
      groupLink: groupLink,
      departmentLink: departmentLink,
      text: text
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });

}

exports.joinGroupEmail = function (groupName: string,
                                   groupLink: string,
                                   title: string,
                                   name: string,
                                   mode: number,
                                   email: string,
                                   userPic: string,
                                   userLink: string,
                                   type: boolean,
                                   callback) {
  var msg;
  var subject: string;
  var request: string;

  if (mode==4) {
    subject = 'Request to join';
    request = 'requests to join as a';
  } else {
    subject = 'Join';
    request = 'invites you to join as a';
  }

  msg = {
    to: email,
    from: groupName + ' via Academig <support@academig.com>',
    subject: subject + ' ' + groupName,
    templateId: (type) ? 'c0ca0f15-5071-4985-a562-806fc40b54d7' : 'c739e742-184c-4232-bc1f-4e373a8638cc',
    substitutions: {
      name: name,
      userPic: userPic,
      userLink: userLink,
      request: request + ' ' + title,
      groupName: groupName,
      groupLink: groupLink,
      email: email
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.deleteMemberEmail = function (userName: string, groupName: string, email: string, mode: number, callback) {
  // console.log('mode',mode)
  var msg;
  var subject: string;
  var message: string;

  if (mode==0) {
      subject = 'Your invitation to join ' + groupName + ' was declined.';
      message = 'declined the invitation to join';
  } else if (mode==1) {
      subject = userName + ' canceled your invitation to join ' + groupName;
      message = 'canceled your invitation to join';
  } else if (mode==2) {
      subject = userName + ' canceled the request to join ' + groupName;
      message = 'canceled the request to join';
  } else if (mode==3) {
      subject = 'Your request to join ' + groupName + ' was declined.';
      message = 'declined your request to join';
  } else if (mode==4) {
      subject = userName + ' just left ' + groupName + '.';
      message = 'left the group';
  };

  msg = {
    to: email,
    from: ((mode==1 || mode==2 || mode==4) ? userName : groupName) + ' via Academig <support@academig.com>',
    subject: subject,
    templateId: 'c965c4df-438b-451d-b08f-5c3b4ca4ed57',
    substitutions: {
      name: userName,
      message: message,
      groupName: groupName,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.deleteGroupEmail = function (actorName: string, targetName: string, itemName: string, mode: boolean, type: number, email: string, callback) {
  // mode: true - to Admin
  //       false - to Other Users

  var msg;
  var itemType: string;

  if (type==0) {
    itemType="lab profile";
  }

  msg = {
    to: email,
    from: actorName + ' via Academig <support@academig.com>',
    subject: "Delete of " + itemName,
    templateId: 'ffaad48e-8d00-4cbf-9494-7a0454a8bbe8',
    substitutions: {
      actorName: (mode==true) ? "You" : actorName,
      targetName: targetName,
      message: (mode==true) ? "You can build a new lab profile in place of the profile you have just deleted." : "",
      itemName: itemName,
      itemType: itemType,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////////
////////////// Service Posting ////////////
///////////////////////////////////////////

exports.confirmServiceEmail = function (type: number,
                                        host: string,
                                        hash: string,
                                        positionId: string,
                                        groupLink: string,
                                        groupName: string,
                                        email: string,
                                        name: string,
                                        standout: number,
                                        professionalFlag: boolean,
                                        interviewFlag: boolean,
                                        clubFlag: boolean,
                                        callback) {

  const standoutTitles: string[] = ['Standard', 'Good', 'Best'];
  const standoutAmount: number[] = [10.00, 50.00, 100.00];

  const professional = professionalFlag ? "<p><b>Your professional lab profile</b></p><p>As you selected the professional lab profile option, we are starting to build your new lab profile based on your existing lab website</p>" : '';
  const professionalAmount: number = professionalFlag ? 10 : 0;
  // const professionalAmount: number = professionalFlag ? 199 : 0;
  const professionalAmountText: string = professionalFlag ? '<tr class="td-stats tr-stats"><td>Professional Lab Profile</td><td style="text-align: right;">$199.00</td></tr>' : '';
  // <p>As you selected the professional lab profile option, we are starting to build your new lab profile based on your existing lab website and other online resources. We will send you an email once your LAB profile is ready. All you will have to do is accept or reject our suggestions. We include unlimited iterations until you are completely satisfied.</p>-->

  const totalBeforeTax: number = standoutAmount[standout] + professionalAmount;
  const taxAmount: number = 0 ? totalBeforeTax*0.17 : 0;
  const taxAmountText: string = 0 ? '<tr class="td-stats tr-stats"><td>Tax</td><td style="text-align: right;">$'+(Math.round(taxAmount * 100) / 100).toFixed(2)+'</td></tr>' : '';

  const interview = interviewFlag ? "<p><b>Academig Interview</b></p><p>We will coordinate with you the interview soon.</p>" : '';

  const club = clubFlag ? "<p><b>Academig Cake Club</b></p><p>Our special thank you perks are ready to be sent to you. We will coordinate with you the delivery shortly.</p>" : '';

  // <p>You can post and manage your lab’s open positions to attract new talents and streamline and shorten the amount of time required for the entire application process.</p>

  var verifyTitle, verifyLink, verifyText, verifyButton;

  if (type==0) {
    verifyTitle = 'now';
    verifyText = '';
    verifyLink = groupLink + '/services/' + positionId
    verifyButton = "Service Posting";
  } else if (type==1) {
    verifyTitle = 'almost';
    verifyText = "Tap the button below to confirm your email address.";
    verifyLink = "http://"+host+"/verify?token="+hash;
    verifyButton = "Confirm Email";
  } else if (type==2) {
    verifyTitle = 'almost';
    verifyText = "To complete the listing process, tap the button below and signup to Academig with " + email + ". All the links below will be available only after sign up and email confirmation.";
    verifyLink = "signup";
    verifyButton = "Signup";
  }

  const msg = {
    to: email,
    from: groupName + ' via Academig <support@academig.com>',
    templateId: 'd-2a66a9aa7a624b9caa0032c674771008',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      subject: "[Academig] Service Posting",
      verifyTitle: verifyTitle,
      verifyText: verifyText,
      verifyLink: verifyLink,
      verifyButton: verifyButton,
      positionId: positionId,
      groupLink: groupLink,
      groupName: groupName,
      email: email,
      name: name,
      standout: standoutTitles[standout],
      professional: professional,
      // filter: filter,
      interview: interview,
      club: club,
      job_price: standoutAmount[standout]+".00",
      professional_price: professionalAmountText,
      // filter_price: filterAmountText,
      tax_price: taxAmountText,
      total_price: (totalBeforeTax + taxAmount)+".00",
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.pinServiceEmail = function (groupLink: string, groupName: string, adminsEmails: string[], positionId: string, positionTitle: string, positionName: string, callback) {
  // Notify: 30 days job featured is over
  const msg = {
    to: adminsEmails,
    from: groupName + ': ' + positionName + ' via Academig <support@academig.com>',
    templateId: 'd-2f3d2e7f69d44500bcefcc8a228b1000',
    // templateId: '45db0fa6-dade-48a0-9ca2-58c86c71411c',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] Service Featured.',
      "groupLink": groupLink,
      "groupName": groupName,
      "positionId": positionId,
      "positionTitle": positionTitle,
      "positionName": positionName
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.statsServiceEmail = function (stats: number[][], groupLink: string, groupName: string, adminsEmails: string[], positionId: string, positionTitle: string, positionName: number, callback) {
  // console.log("stats",stats[0])
  const msg = {
    to: adminsEmails,
    from: groupName + ': ' + positionName + ' via Academig <support@academig.com>',
    templateId: 'd-646b33d63c5b468a992b387614286ab3',
    // templateId: 'df0d318f-3d4f-4104-b34f-e85986b14379',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] Job Statistics .',
      "organic": stats[0],
      "facebook": stats[1],
      "twitter": stats[2],
      "linkedin": stats[3],
      "slack": stats[4],
      "newsletter": stats[5],
      "groupLink": groupLink,
      "groupName": groupName,
      "positionId": positionId,
      "positionTitle": positionTitle,
      "positionName": positionName
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
////////////// Job Posting ////////////
///////////////////////////////////////

// https://sendgrid.com/docs/ui/sending-email/how-to-send-an-email-with-dynamic-transactional-templates/
// https://github.com/sendgrid/sendgrid-nodejs/issues/680
// https://sendgrid.com/docs/for-developers/sending-email/using-handlebars/#basic-replacement

exports.confirmJobEmail = function (type: number,
                                    host: string,
                                    hash: string,
                                    positionId: string,
                                    groupLink: string,
                                    groupName: string,
                                    email: string,
                                    name: string,
                                    standout: number,
                                    professionalFlag: boolean,
                                    filterFlag: boolean,
                                    interviewFlag: boolean,
                                    clubFlag: boolean,
                                    callback) {

  const standoutTitles: string[] = ['Standard', 'Good', 'Better', 'Best'];
  const standoutAmount: number[] = [10.00, 50.00, 70.00, 100.00];

  const professional = professionalFlag ? "<p><b>Your professional lab profile</b></p><p>As you selected the professional lab profile option, we are starting to build your new lab profile based on your existing lab website</p>" : '';
  const professionalAmount: number = professionalFlag ? 10 : 0;
  // const professionalAmount: number = professionalFlag ? 199 : 0;
  const professionalAmountText: string = professionalFlag ? '<tr class="td-stats tr-stats"><td>Professional Lab Profile</td><td style="text-align: right;">$199.00</td></tr>' : '';
  // <p>As you selected the professional lab profile option, we are starting to build your new lab profile based on your existing lab website and other online resources. We will send you an email once your LAB profile is ready. All you will have to do is accept or reject our suggestions. We include unlimited iterations until you are completely satisfied.</p>-->

  const filter = filterFlag ? "<p><b>Candidates Filter</b></p><p>You will get ordered and filtered lists of candidates in the next 7, 14, 30 and 60 days.</p>" : '';
  // const filterAmount: number = filterFlag ? 199 : 0;
  const filterAmount: number = filterFlag ? 50 : 0;
  const filterAmountText: string = filterFlag ? '<tr class="td-stats tr-stats"><td>Candidates Filter</td><td style="text-align: right;">$199.00</td></tr>' : '';

  const totalBeforeTax: number = standoutAmount[standout] + professionalAmount + filterAmount
  const taxAmount: number = 0 ? totalBeforeTax*0.17 : 0;
  const taxAmountText: string = 0 ? '<tr class="td-stats tr-stats"><td>Tax</td><td style="text-align: right;">$'+(Math.round(taxAmount * 100) / 100).toFixed(2)+'</td></tr>' : '';

  const interview = interviewFlag ? "<p><b>Academig Interview</b></p><p>We will coordinate with you the interview soon.</p>" : '';

  const club = clubFlag ? "<p><b>Academig Cake Club</b></p><p>Our special thank you perks are ready to be sent to you. We will coordinate with you the delivery shortly.</p>" : '';

  // <p>You can post and manage your lab’s open positions to attract new talents and streamline and shorten the amount of time required for the entire application process.</p>

  var verifyTitle, verifyLink, verifyText, verifyButton;

  if (type==0) {
    verifyTitle = 'now';
    verifyText = '';
    verifyLink = groupLink + '/jobs/' + positionId
    verifyButton = "Job Posting";
  } else if (type==1) {
    verifyTitle = 'almost';
    verifyText = "Tap the button below to confirm your email address.";
    verifyLink = "http://"+host+"/verify?token="+hash;
    verifyButton = "Confirm Email";
  } else if (type==2) {
    verifyTitle = 'almost';
    verifyText = "To complete the listing process, tap the button below and signup to Academig with " + email + ". All the links below will be available only after sign up and email confirmation.";
    verifyLink = "signup";
    verifyButton = "Signup";
  }

  // If you didn't create a job posting with Academig, you can safely delete this email.
  // subject: '[Academig] To activate your job posting, verify your email address.'
  // subject: '[Academig] Signup to Academig to complete your job posting.'
  const msg = {
    to: email,
    from: groupName + ' via Academig <support@academig.com>',
    templateId: 'd-7d6d8764536b4183b4cfd5546e66fe52',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      // subject: '[Academig] ' + subject + '.',
      subject: "[Academig] Job Posting",
      verifyTitle: verifyTitle,
      verifyText: verifyText,
      verifyLink: verifyLink,
      verifyButton: verifyButton,
      positionId: positionId,
      groupLink: groupLink,
      groupName: groupName,
      email: email,
      name: name,
      standout: standoutTitles[standout],
      professional: professional,
      filter: filter,
      interview: interview,
      club: club,
      job_price: standoutAmount[standout]+".00",
      professional_price: professionalAmountText,
      filter_price: filterAmountText,
      tax_price: taxAmountText,
      total_price: (totalBeforeTax + taxAmount)+".00",
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.paymentReminderJobEmail = function (groupLink: string, groupName: string, userEmail: string, positionId: string, positionTitle: string, positionName: string, callback) {
  // TBD Link: Payment screen associated with groupId
}

exports.inviteReminderJobEmail = function (groupLink: string, groupName: string, userEmail: string, positionId: string, positionTitle: string, positionName: string, callback) {
  // TBD Link: Verify Link or Signup Link
}

exports.pinJobEmail = function (groupLink: string, groupName: string, adminsEmails: string[], positionId: string, positionTitle: string, positionName: string, callback) {
  // Notify: 30 days job featured is over
  const msg = {
    to: adminsEmails,
    from: groupName + ': ' + positionName + ' via Academig <support@academig.com>',
    templateId: 'd-2f3d2e7f69d44500bcefcc8a228b1000',
    // templateId: '45db0fa6-dade-48a0-9ca2-58c86c71411c',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] Job Featured.',
      "groupLink": groupLink,
      "groupName": groupName,
      "positionId": positionId,
      "positionTitle": positionTitle,
      "positionName": positionName
    }
    // substitutions: { }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.statsJobEmail = function (stats: number[][], groupLink: string, groupName: string, adminsEmails: string[], positionId: string, positionTitle: string, positionName: number, callback) {
  // console.log("stats",stats[0])
  const msg = {
    to: adminsEmails,
    from: groupName + ': ' + positionName + ' via Academig <support@academig.com>',
    templateId: 'd-646b33d63c5b468a992b387614286ab3',
    // templateId: 'df0d318f-3d4f-4104-b34f-e85986b14379',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] Job Statistics .',
      "organic": stats[0],
      "facebook": stats[1],
      "twitter": stats[2],
      "linkedin": stats[3],
      "slack": stats[4],
      "newsletter": stats[5],
      "groupLink": groupLink,
      "groupName": groupName,
      "positionId": positionId,
      "positionTitle": positionTitle,
      "positionName": positionName
    }
    // substitutions: { }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.builtJobEmail = function (groupLink: string, groupName: string, userEmail: string, positionId: string, positionName: string, positionType: number, callback) {
  // Approve suggestions: Your Lab Iteration / Ongoing
}

exports.applicationJobEmail = function (subject: string, groupLink: string, groupName: string, positionId: string, positionTitle: string, positionName: number, message: string, users: objectMini[], toEmails: string[], callback) {
  // console.log('toEmails',toEmails)

  const msg = {
    to: toEmails,
    from: groupName + ': ' + positionName + ' via Academig <support@academig.com>',
    templateId: 'd-bc07a6b6d4ab41cd80f77fee9ad987ef',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] ' + subject + '.',
      "groupLink": groupLink,
      "groupName": groupName,
      "positionId": positionId,
      "positionTitle": positionTitle,
      "positionName": positionName,
      "userId": users[users.length-1]._id,
      "userName": users[users.length-1].name,
      "userPic": users[users.length-1].pic,
      "message": message
    }
    // substitutions: { }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.filteredJobEmail = function (proposals: any[][], interval: number, groupLink: string, groupName: string, adminsEmails: string[], positionId: string, positionTitle: string, positionName: string, callback) {
  // console.log('filteredJobEmail',adminsEmails)
  // console.log('interval',interval)
  // console.log('proposals',proposals)

  const msg = {
    to: adminsEmails,
    from: groupName + ': ' + positionName + ' via Academig <support@academig.com>',
    templateId: 'd-82293f3c4a9a4f048728f3a1ee36356b',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": '[Academig] filtered candidates',
      "rest": proposals[0],
      "good": proposals[1],
      "best": proposals[2],
      "interval": interval,
      "groupLink": groupLink,
      "groupName": groupName,
      "positionId": positionId,
      "positionTitle": positionTitle,
      "positionName": positionName
    }
    // substitutions: { }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
//////////////// Items ////////////////
///////////////////////////////////////

exports.itemInviteEmail = function (userId: string,
                                    userName: string,
                                    userEmail: string,
                                    userPic: string,
                                    itemName: string,
                                    itemLink: string,
                                    mode: number,
                                    invitedId: string,
                                    invitedName: string,
                                    invitedEmail: string,
                                    invitedMessage: string,
                                    inviteCounter: number,
                                    callback) {
  var subject: string;
  var link: string;
  var category: string[];
  // var request: string;

  var peopleId: string;
  var peopleName: string;
  var peopleEmail: string;
  var peoplePic: string;

  if (userId=="academig") {
    // const r = getRandomInt(0,2);
    // if (r==0) {
      peopleId=userId;
      peopleName="Academig Founder";
      peopleEmail=userEmail;
      peoplePic= userPic;
    // } else {
    //   peopleId="roni_pozner"; peopleName="Rony Pozner"; peopleEmail="rony@academig.com"; peoplePic= "https://ucarecdn.com/d9ce0ec6-9de2-4e45-aec4-20256553df70/";
    // }
  } else {
    peopleId=userId;
    peopleName=userName;
    peopleEmail=userEmail;
    peoplePic= userPic;
  }

  if (mode==0) {
    subject += 'a funding at ';
    category = ["funding Invites"];
    // request = 'invites you to join the funding ' + itemName + ' as a ' + title;
  } else if (mode==1) {
    subject += 'a collaboration at ';
    category = ["Publications ReInvites"];
    // subject: subject + ' ' + groupName,
    // request = 'invites you to join as a collaborator.';
  } else if (mode==2) {
    subject = (inviteCounter==2 ? 'Last reminder: ' : '') + peopleName + ' invites you to confirm authorship of your publication.';
    category = ["Publications Invites", "Publications ReInvites", "Publications LastReminders", "Publications Invites"];
    // link = inviteCounter==2 ? 'people/'+invitedId+'/publications/'+itemLink : 'publications/'+itemLink;
    link = 'publications/'+itemLink;
    // request = 'invites you to confirm authorship of your publications.';

  }

  const msg = {
    to: invitedEmail,
    from: ((userId=="academig") ? "Invite" : userName) + ' via Academig <support@academig.com>',
    subject: subject,
    category: category[inviteCounter],
    templateId: 'c8bc7f32-2b73-494a-baed-c2009cab24c2',
    substitutions: {

      userLink: (userId=="academig") ? 'search/' : 'people/' + peopleId,
      userName: peopleName,
      userEmail: peopleEmail,
      userPic: peoplePic,

      itemName: itemName,
      itemLink: link,

      invitedName: invitedName,
      invitedEmail: invitedEmail,
      invitedMessage: invitedMessage || ""

      // request: request,
      // invitedId: invitedId,
      // groupName: groupName,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.itemSuggestEmail = function (userId: string,
                                     userName: string,
                                     userEmail: string,
                                     userPic: string,
                                     itemName: string,
                                     itemLink: string,
                                     suggestedName: string,
                                     suggestedEmail: string,
                                     suggestedMessage: string,
                                     callback) {
  var subject: string;

  subject = userName + ', your co-author ' + suggestedName + ' can help your publication gain more visibility.'

  const msg = {
    to: userEmail,
    bcc: 'support@academig.com',
    from: 'Academig <support@academig.com>',
    subject: subject,
    category: "publications suggestions",
    templateId: '4e57898e-7792-477c-acd5-fa8944081de0',
    substitutions: {
      userId: userId,
      userName: userName,
      userPic: userPic,
      itemName: itemName,
      itemLink: itemLink,
      suggestedName: suggestedName,
      suggestedEmail: suggestedEmail,
      suggestedMessage: suggestedMessage || ""
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
/////////////// Progress //////////////
///////////////////////////////////////

exports.progressEmail = function (user: objectMini, email: string, mode: number, type: number, callback) {
  switch (mode) {
    case 0: { // groups
      callback()
      break;
    }
    case 1: { // peoples
      progressEmailMsg(user, email, type, function (err) {
        callback(err)
      })
      break;
    }
  }
}

function progressEmailMsg(user: objectMini, email: string, type: number, callback) {
  var itemType: string;
  var itemPage: string;
  var itemMessage: string;

  switch (type) {
    case 0: itemType = "Profile Picture"; itemPage=""; break; //
    case 1: itemType = "Research Interests"; itemPage="#interests"; break;
    case 2: itemType = "About Me"; itemPage="#about"; break; //
    case 3: itemType = "Positions and Degrees"; itemPage="#positions"; break; //
    case 4: itemType = "Cover Picture"; itemPage=""; break; //
    case 5: itemType = ""; itemPage=""; break;
    case 6: itemType = "Publications"; itemPage="publications"; break;
    case 7: itemType = "News"; itemPage="news"; break;
    case 8: itemType = "Following"; itemPage="network"; break; //
    case 9: itemType = "Resources"; itemPage="resources"; break; //
    case 10: itemType = "Projects"; itemPage="projects"; break; //
    case 11: itemType = "Funding"; itemPage="funding"; break; //
    case 12: itemType = "Teaching"; itemPage="teaching"; break; //
    case 13: itemType = "Galleries"; itemPage="gallery"; break; //
    case 14: itemType = "Talks"; itemPage="media#talks"; break; //
    case 15: itemType = "Posters"; itemPage="media#posters"; break; //
    case 16: itemType = "Press Releases"; itemPage="media#press"; break; //
  }

  const msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: user.name + ' - Update your ' + itemType,
    category: "progress",
    templateId: 'ab09341d-3ac9-412e-932e-efac874ac838',
    substitutions: {
      userId: user._id,
      userName: user.name,
      userPic: user.pic,
      itemType: itemType,
      itemPage: itemPage,
      itemMessage: itemMessage,
    },
  };

  sgMail.sendMultiple(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
//////////////// Payment //////////////
///////////////////////////////////////

exports.trailDueExpire = function (email: string, mode: number, callback) {
  var msg;

  msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: "Trial is about to end",
    templateId: (mode==1) ? '3cb21556-0bae-4077-ac39-1c098372f853' : 'fc38017e-18a8-449e-a28d-c8ff0e5fcc2a'
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.pastDuePayment = function (email: string, callback) {
  var msg;

  msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: "Payment issues",
    templateId: 'a1e8495b-0757-4a83-88cf-2067fc7e7847'
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
///////////////// User ////////////////
///////////////////////////////////////

exports.publicationsSuggestionEmail = function (suggestions: any, userId: string, userName: string, userEmail: string, callback) {
  // console.log('public  ationsSuggestionEmail',userEmail)
  const msg = {
    to: userEmail,
    from: 'Academig <notifications@academig.com>',
    templateId: 'd-fac14e77ac3a4ce8b644b35d04c1e8ad',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": 'Your Academig Publications Suggestions for ' + moment().format('DD MMM YYYY'),
      "date": moment().format('DD MMM YYYY'),
      "userId": userId,
      "userName": userName,
      "total": suggestions.length,
      "suggestions": suggestions.map(r => ({
        "_id": r._id,
        "title": r.title,
        "authors": r.authors.map(a=>a.name).join(', '),
        "journal": r.journal.name,
        "numbers": r.numbers,
        "date": r.date
      }))
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });

}

exports.updatesEmail = function (news: any, email: string, callback) {
  console.log('email',email)
  console.log('news',news)
  const msg = {
    to: "roni.pozner@gmail.com",
    from: 'Academig <notifications@academig.com>',
    templateId: 'd-c8ca76b3a97449d49056e64e36eb2b50',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "subject": 'Your Academig Updates for ' + moment().format('DD MMM YYYY'),
      "date": moment().format('DD MMM YYYY'),
      "news": news,
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });

}

// https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
exports.contactEmail = function (replyLink: string, fromLink: string, fromPic: string, fromName: string, fromEmail: string, toEmails: string[], subject: string, message: string, callback) {
  const msg = {
    to: toEmails,
    from: fromName + ' via Academig <support@academig.com>',
    // from: fromName + ' via Academig <' + fromEmail + '>',
    templateId: 'f899c4f8-06c3-45f0-87d5-99967716c7c1',
    subject: subject,
    substitutions: {
      replyLink: replyLink,
      userLink: fromLink,
      userPic: fromPic,
      userName: fromName,
      userEmail: fromEmail,
      subject: subject,
      message: message
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });

}

exports.verificationEmail = function (host: string, hash, email: string, callback) {
  var link="http://"+host+"/verify?token="+hash;

  console.log('link',link)

  const msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: '[Academig] Please verify your email address',
    templateId: '11360315-9a72-4f09-a102-75a21ca3e371',
    substitutions: {
      link: link
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      // console.log('msgerr',err.body.errors)
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.colleagueInviteEmail = function (userId: string,
                                         userName: string,
                                         userEmail: string,
                                         userPic: string,
                                         invitedEmail: string,
                                         invitedMessage: string,
                                         callback) {

  const msg = {
    to: invitedEmail,
    bcc: 'support@academig.com',
    from: userName + ' via Academig <support@academig.com>',
    subject: userName + ' invited you to open an Academig account.',
    category: "invites emails",
    templateId: 'f6c177bd-4db8-43e6-ab22-3e41be28e233',
    substitutions: {
      userLink: userId,
      userName: userName,
      userEmail: userEmail,
      userPic: userPic,
      message: invitedMessage || ""
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////////
//////////////// Admin ////////////////
///////////////////////////////////////

exports.groupRequestEmail = function (groupId: string, callback) {
  const msg = {
    to: 'support@academig.com',
    from: 'support@academig.com',
    subject: 'New lab request',
    html: '<h2>Academig</h2>' + 'New lab request ' + groupId + "."
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

///////////////////////////////////////
//////////////// Submit ///////////////
///////////////////////////////////////

exports.submitPodcast = function (submitPodcast: SubmitPodcast, podcastId: string, callback) {
  const dataPodcast = [
    { "field": "Submitted At", "data": moment().format('DD MMM YYYY hh mm'), },

    { "field": "Podcast Name", "data": submitPodcast.podcastName },
    { "field": "Podcast URL", "data": submitPodcast.podcastURL },
    { "field": "Product Markets", "data": submitPodcast.podcastMarkets },
    { "field": "Podcast Type", "data": submitPodcast.podcastType },
    { "field": "Podcast Description", "data": submitPodcast.podcastDescription },
    { "field": "Podcast Benefits", "data": submitPodcast.podcastBenefits },
    { "field": "Podcast Launch Year", "data": submitPodcast.podcastYear },
    { "field": "Podcast Active Listeners", "data": submitPodcast.podcastUsers },

    { "field": "Your Email", "data": submitPodcast.email },
    { "field": "Twitter Account", "data": submitPodcast.twitter },
    { "field": "First Name", "data": submitPodcast.firstName },
    { "field": "Last Name", "data": submitPodcast.lastName },
    { "field": "Your Podcast Role", "data": submitPodcast.role },

    { "field": "Best goals description", "data": submitPodcast.goal },
    // { "field": "What type of deal do you want to run on Academig?", "data": "Paid Lifetime Access To Your Product" },
    // { "field": "Which podcasts are your biggest competition? What makes you better than them?", "data": submitApp },

    { "field": "Referred by", "data": submitPodcast.referred },
    { "field": "Your comments", "data": submitPodcast.comments },
    // { "field": "Have you ever ran a podcast promotion on another site or group?", "data": "No" },

    { "field": "Submission ID", "data": podcastId }
  ]

  const userName = submitPodcast.firstName + ' ' + submitPodcast.lastName;

  // console.log('submitPodcast',submitPodcast, podcastId)
  const msg = {
    to: submitPodcast.email,
    from: 'Academig <support@academig.com>',
    templateId: 'd-9f4919df77cc4d54b6a80d9d0d046c13',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      subject: 'Academig Podcasts Partnership Application',
      userName: userName,
      submitType: "Podcasts",
      submitData: dataPodcast
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      submitConfirm(submitPodcast.email, "Podcasts", userName, submitPodcast.podcastName, function (err) {
        callback(err)
      });
    }
  });
}

exports.submitEvent = function (submitEvent: SubmitEvent, eventId: string, callback) {
  const dataEvent = [
    { "field": "Submitted At", "data": moment().format('DD MMM YYYY hh mm'), },

    { "field": "Event Name", "data": submitEvent.eventName },
    { "field": "Event URL", "data": submitEvent.eventURL },
    { "field": "Event Markets", "data": submitEvent.eventMarkets },
    { "field": "Event Type", "data": submitEvent.eventType },
    { "field": "Event Start Date", "data": submitEvent.eventStartDate },
    { "field": "Event End Date", "data": submitEvent.eventEndDate },
    { "field": "Event Description", "data": submitEvent.eventDescription },
    { "field": "Event Benefits", "data": submitEvent.eventBenefits },

    { "field": "Your Email", "data": submitEvent.email },
    { "field": "Twitter Account", "data": submitEvent.twitter },
    { "field": "First Name", "data": submitEvent.firstName },
    { "field": "Last Name", "data": submitEvent.lastName },
    { "field": "Your Event Role", "data": submitEvent.role },

    { "field": "Best goals description", "data": submitEvent.goal },
    // { "field": "What type of deal do you want to run on Academig?", "data": "Paid Lifetime Access To Your Product" },
    // { "field": "Which events are your biggest competition? What makes you better than them?", "data": submitApp },

    { "field": "Referred by", "data": submitEvent.referred },
    { "field": "Your comments", "data": submitEvent.comments },
    // { "field": "Have you ever ran a event promotion on another site or group?", "data": "No" },

    { "field": "Submission ID", "data": eventId }
  ]

  const userName = submitEvent.firstName + ' ' + submitEvent.lastName;

  // console.log('submitEvent',submitEvent, eventId)
  const msg = {
    to: submitEvent.email,
    from: 'Academig <support@academig.com>',
    templateId: 'd-9f4919df77cc4d54b6a80d9d0d046c13',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      subject: 'Academig Events Partnership Application',
      userName: userName,
      submitType: "Events",
      submitData: dataEvent
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      submitConfirm(submitEvent.email, "Events", userName, submitEvent.eventName, function (err) {
        callback(err)
      });
    }
  });
}

exports.submitApp = function (submitApp: SubmitApp, appId: string, callback) {
  const dataApp = [
    { "field": "Submitted At", "data": moment().format('DD MMM YYYY hh mm') },
    { "field": "Product Name", "data": submitApp.productName },
    { "field": "Product URL", "data": submitApp.productURL },
    { "field": "Product Markets", "data": submitApp.productMarkets },
    { "field": "Product Type", "data": submitApp.productType },
    { "field": "Product Description", "data": submitApp.productDescription },
    { "field": "Product Benefits", "data": submitApp.productBenefits },

    { "field": "Company Name", "data": submitApp.companyName },
    { "field": "Company Launch Year", "data": submitApp.companyYear },
    { "field": "Company Active Users", "data": submitApp.companyUsers },
    { "field": "Company Monthly Revenue", "data": submitApp.companyRevenue },

    { "field": "Your Email", "data": submitApp.email },
    { "field": "Twitter Account", "data": submitApp.twitter },
    { "field": "First Name", "data": submitApp.firstName },
    { "field": "Last Name", "data": submitApp.lastName },
    { "field": "Your Cmpany Role", "data": submitApp.role },

    { "field": "Best goals description", "data": submitApp.goal },
    { "field": "Main goal promotion", "data": submitApp.goalMain },
    { "field": "Goal type", "data": submitApp.goalType },
    { "field": "Offered product version?", "data": submitApp.productVersion },
    { "field": "Current offer full price", "data": submitApp.priceFull },

    // { "field": "Which companies are your biggest competition? What makes you better than them?", "data": "AcademicFailure. Because they are not wow." },
    // { "field": "What price range do you want to run this lifetime deal?", "data": "One-time payment of $49 - 99 USD" },
    // { "field": "What about your product or offering justifies running this deal at the highest price point?", "data": "32423423423" }, "field": "What is your support structure like?", "data": "Flawless" },

    { "field": "Referred by", "data": submitApp.referred },
    { "field": "Your comments", "data": submitApp.comments },
    // { "field": "Have you ever ran a deal on another site, group or community?", "data": "No" },
    { "field": "Submission ID", "data": appId }
  ]

  const userName = submitApp.firstName + ' ' + submitApp.lastName;

  // console.log('submitApp',submitApp, appId)
  const msg = {
    to: submitApp.email,
    from: 'Academig <support@academig.com>',
    templateId: 'd-9f4919df77cc4d54b6a80d9d0d046c13',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      subject: 'Academig Apps Partnership Application',
      userName: userName,
      submitType: "Apps",
      submitData: dataApp
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      submitConfirm(submitApp.email, "Apps", userName, submitApp.productName, function (err) {
        callback(err)
      });
    }
  });
}

exports.submitMentor = function (submitMentor: SubmitMentor, submitId: string, callback) {
  const dataMentor = [
    { "field": "Submitted At", "data": moment().format('DD MMM YYYY hh mm') },
    // { "field": "Product Name", "data": submitMentor.productName },
    // { "field": "Product URL", "data": submitMentor.productURL },
    // { "field": "Product Markets", "data": submitMentor.productMarkets },
    // { "field": "Product Type", "data": submitMentor.productType },
    // { "field": "Product Description", "data": submitMentor.productDescription },
    // { "field": "Product Benefits", "data": submitMentor.productBenefits },
    //
    // { "field": "Company Name", "data": submitMentor.companyName },
    // { "field": "Company Launch Year", "data": submitMentor.companyYear },
    // { "field": "Company Active Users", "data": submitMentor.companyUsers },
    // { "field": "Company Monthly Revenue", "data": submitMentor.companyRevenue },
    //
    // { "field": "Your Email", "data": submitMentor.email },
    // { "field": "Twitter Account", "data": submitMentor.twitter },
    // { "field": "First Name", "data": submitMentor.firstName },
    // { "field": "Last Name", "data": submitMentor.lastName },
    // { "field": "Your Cmpany Role", "data": submitMentor.role },
    //
    // { "field": "Best goals description", "data": submitMentor.goal },
    // { "field": "Main goal promotion", "data": submitMentor.goalMain },
    // { "field": "Goal type", "data": submitMentor.goalType },
    // { "field": "Offered product version?", "data": submitMentor.productVersion },
    // { "field": "Current offer full price", "data": submitMentor.priceFull },

    // { "field": "Which companies are your biggest competition? What makes you better than them?", "data": "AcademicFailure. Because they are not wow." },
    // { "field": "What price range do you want to run this lifetime deal?", "data": "One-time payment of $49 - 99 USD" },
    // { "field": "What about your product or offering justifies running this deal at the highest price point?", "data": "32423423423" }, "field": "What is your support structure like?", "data": "Flawless" },

    // { "field": "Referred by", "data": submitMentor.referred },
    // { "field": "Your comments", "data": submitMentor.comments },
    // { "field": "Have you ever ran a deal on another site, group or community?", "data": "No" },
    { "field": "Submission ID", "data": submitId }
  ]

  // const userName = submitMentor.firstName + ' ' + submitMentor.lastName;
  const userName = submitMentor.first_name + ' ' + submitMentor.last_name;

  // console.log('submitMentor',submitMentor, appId)
  const msg = {
    to: "roni.pozner@gmail.com",
    // to: submitMentor.email,
    from: 'Academig <support@academig.com>',
    templateId: 'd-9f4919df77cc4d54b6a80d9d0d046c13',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      subject: 'Academig Mentors Partnership Application',
      userName: userName,
      submitType: "Mentors",
      submitData: dataMentor
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      // submitConfirm(submitApp.email, "Apps", userName, submitMentor.productName, function (err) {
      submitConfirm("roni.pozner@gmail.com", "Apps", userName, "booboo", function (err) {
        callback(err)
      });
    }
  });
}

function submitConfirm(email: string, submitType: string, userName: string, name: string, callback) {
  const msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    templateId: 'd-7435a18e022a47c0882a2a29ad0da29e',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      subject: 'Academig ' + submitType + ' Submit Confirmation',
      submitType: submitType,
      userName: userName,
      name: name
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

exports.welcomeEmail = function (name: string, email: string, callback) {
  var msg;
  // TBD

  msg = {
    to: email,
    from: 'Academig <support@academig.com>',
    subject: "Welcome to Academig",
    templateId: '0c6d41eb-1631-445c-9de2-c6df85fa060e',
    substitutions: {
      name: name,
    },
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

///////////////////////////////////
///////////// Mentor //////////////
///////////////////////////////////

exports.mentorInviteEmail = function (userId: string, userName: string, userEmail: string, mentorId: string, callback) {
  const msg = {
    to: userEmail,
    from: 'Academig <support@academig.com>',
    templateId: 'd-16430f5602844f9b9f389c8dd3530e02',
    substitutionWrappers: ['{{', '}}'],
    dynamic_template_data: {
      "userId": userId,
      "userName": userName,
      "mentorId": mentorId,
    }
  };

  sgMail.send(msg, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

exports.mentorStatusEmail = function (status: number, userId: string, userName: string, userEmail: string, callback) {
  // TBD
  // 0: mentor_approved
  // 1: mentor_activated
  // 2: mentor_on_hold
  // 3: mentor_deleted
  // 4: mentor_declined
  callback()
}

exports.mentorSessionEmail = function (email: string, callback) {
  // TBD
  callback()
}

// Write a review email / Tell us how you really feel
exports.mentorReviewEmail = function (email: string, callback) {
  // TBD
  callback()
}

///////////////////////////////////
/////////////// Deal //////////////
///////////////////////////////////

exports.dealStatusEmail = function (status: number, email: string, callback) {
  // TBD
  // 1: deal_activated
  // 2: deal_extended
  // 3: deal_ended
  callback()
}

exports.dealBuyEmail = function (email: string, callback) {
  // TBD
  callback()
}

// Write a review email / Tell us how you really feel
exports.dealReviewEmail = function (email: string, callback) {
  // TBD
  callback()
}
