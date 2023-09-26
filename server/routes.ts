import { Request, Response, NextFunction } from 'express';

// import Article from '../models/article';

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');

// const cors = require('cors');
// require('dotenv').config();

const authConfig = require('../auth_config.json');

if (!authConfig.domain || !authConfig.audience) {
  throw 'Please make sure that auth_config.json is in place and populated';
}

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ['RS256']
});

const ignoreJwt = jwt({
  credentialsRequired: false,

  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ['RS256']
});

var admin_hdlr = require('./handlers/admin.ts');
var algolia_hdlr = require('./handlers/algolia.ts');
var payments_hdlr = require('./handlers/payments.ts');
var loggings_hdlr = require('./handlers/loggings.ts');
var support_hdlr = require('./handlers/support.ts');

var user_hdlr = require('./handlers/user.ts');
var searches_hdlr = require('./handlers/searches.ts');

var universities_hdlr = require('./handlers/universities.ts');
var departments_hdlr = require('./handlers/departments.ts');
var groups_hdlr = require('./handlers/groups.ts');

var groups_settings_hdlr = require('./handlers/groups_settings.ts');
var users_settings_hdlr = require('./handlers/users_settings.ts');

var compare_hdlr = require('./handlers/compare.ts');
var private_hdlr = require('./handlers/private.ts');
var analytics_hdlr = require('./handlers/analytics.ts');

var peoples_hdlr = require('./handlers/peoples.ts');
var publications_hdlr = require('./handlers/publications.ts');
var journals_hdlr = require('./handlers/journals.ts');
var resources_hdlr = require('./handlers/resources.ts');
var mentors_hdlr = require('./handlers/mentors.ts');
var projects_hdlr = require('./handlers/projects.ts');
var collaborations_hdlr = require('./handlers/collaborations.ts');
var fundings_hdlr = require('./handlers/fundings.ts');
var positions_hdlr = require('./handlers/positions.ts');
var galleries_hdlr = require('./handlers/galleries.ts');
var teachings_hdlr = require('./handlers/teachings.ts');
var outreachs_hdlr = require('./handlers/outreachs.ts');
var media_hdlr = require('./handlers/media.ts');
var faqs_hdlr = require('./handlers/faqs.ts');
var news_hdlr = require('./handlers/news.ts');
var contacts_hdlr = require('./handlers/contacts.ts');

var trends_hdlr = require('./handlers/trends.ts');
var podcasts_hdlr = require('./handlers/podcasts.ts');
var events_hdlr = require('./handlers/events.ts');
var apps_hdlr = require('./handlers/apps.ts');
var deals_hdlr = require('./handlers/deals.ts');

var contests_hdlr = require('./handlers/contests.ts');
var newsletters_hdlr = require('./handlers/newsletters.ts');

var invites_hdlr = require('./handlers/invites.ts');
var shared_hdlr = require('./handlers/shared.ts');
var pics_hdlr = require('./handlers/pics.ts');
var csv_hdlr = require('./handlers/csv.ts');
var languages_hdlr = require('./handlers/languages.ts');
var messages_hdlr = require('./handlers/messages.ts');
var intelligence_hdlr = require('./handlers/intelligence.ts');
var topics_hdlr = require('./handlers/topics.ts');

export class AcademigRoutes {

  public academigRoutes(app): void {

    app.get('/api/external', checkJwt, (req, res) => {
      res.send({
        msg: 'Your access token was successfully validated!'
      });
    });

    // ***************************************************
    // ********************* Invites *********************
    // ***************************************************

    app.post('/api/invite.json', checkJwt, invites_hdlr.invitePost);
    app.post('/api/manageInvites.json', checkJwt, invites_hdlr.pullInvites);
    app.post('/api/suggest.json', checkJwt, invites_hdlr.suggestPost);
    app.post('/api/colleague.json', checkJwt, invites_hdlr.colleaguePost);

    // ***************************************************
    // ******************** Root Admin *******************
    // ***************************************************

    app.post('/api/algolia.json', checkJwt, jwtAuthz([ 'write:groups' ]), algolia_hdlr.postAlgolia); // CHECK
    app.post('/api/itemMarketing.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.itemMarketing); // CHECK
    app.get('/api/schedulesAdmin', checkJwt, jwtAuthz([ 'read:publications' ]), admin_hdlr.schedules); // CHECK

    app.get('/api/contactsAdmin', checkJwt, jwtAuthz([ 'read:reports' ]), admin_hdlr.contacts); // CHECK
    app.get('/api/loggingAdmin', checkJwt, jwtAuthz([ 'read:reports' ]), admin_hdlr.loggings);
    app.get('/api/reportsAdmin', checkJwt, jwtAuthz([ 'read:reports' ]), admin_hdlr.reports); // CHECK

    // ***************************************************

    app.get('/api/adminUniversities', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.universities);

    // ***************************************************

    app.get('/api/groupsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.groups);
    app.post('/api/groupStageAdmin.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.changeState);
    app.post('/api/groupInstituteAdmin.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.changeInstitute);

    app.get('/api/emailsStats', checkJwt, jwtAuthz([ 'read:peoples' ]), admin_hdlr.emailsStats); // CHECK

    // ***************************************************

    app.get('/api/peoplesAdmin', checkJwt, jwtAuthz([ 'read:peoples' ]), admin_hdlr.peoples);
    app.get('/api/newsUpdates', checkJwt, jwtAuthz([ 'read:peoples' ]), admin_hdlr.newsUpdates); // CHECK

    app.post('/api/progress.json', checkJwt, jwtAuthz([ 'write:peoples' ]), admin_hdlr.progressNotifiy);
    app.post('/api/progressById.json', checkJwt, jwtAuthz([ 'write:peoples' ]), admin_hdlr.progressNotifiyById);

    app.get('/api/mentorsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.mentors);
    app.post('/api/mentorStatus.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.mentorStatusPost);
    app.post('/api/mentorEmail.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.mentorEmailPost);

    app.get('/api/dataAdmin', checkJwt, jwtAuthz([ 'read:peoples' ]), admin_hdlr.data); // CHECK

    // ***************************************************

    app.get('/api/trendsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.trends);
    app.get('/api/podcastsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.podcasts);
    app.get('/api/eventsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.events);
    app.get('/api/appsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.apps);

    // ***************************************************

    app.get('/api/dealsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.deals);
    app.post('/api/dealStatus.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.dealStatusPost);
    app.post('/api/dealEmail.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.dealEmailPost);

    // ***************************************************

    app.get('/api/publicationsMarketing', checkJwt, jwtAuthz([ 'read:publications' ]), admin_hdlr.publicationsMarketing);
    app.put('/api/publicaitionMarketing.json', checkJwt, jwtAuthz([ 'write:publications' ]), admin_hdlr.publicationPut);
    app.delete('/api/publicaitionMarketing.json', checkJwt, jwtAuthz([ 'write:publications' ]), admin_hdlr.publicationDelete);
    app.post('/api/publicaitionMarketingAll.json', checkJwt, jwtAuthz([ 'write:publications' ]), admin_hdlr.publicationReinviteAll);
    app.get('/api/claimsAdmin', checkJwt, jwtAuthz([ 'read:publications' ]), admin_hdlr.claims); // CHECK

    // ***************************************************

    app.get('/api/contests', checkJwt, jwtAuthz([ 'read:groups' ]), contests_hdlr.contests);
    app.post('/api/contest.json', checkJwt, jwtAuthz([ 'write:groups' ]), contests_hdlr.contestPost);
    app.post('/api/contestAction.json', checkJwt, jwtAuthz([ 'write:groups' ]), contests_hdlr.contestAction);

    // ***************************************************

    app.get('/api/positionsAdmin', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.positions);
    app.get('/api/positionAdmin/:positionId.json', checkJwt, jwtAuthz([ 'read:groups' ]), admin_hdlr.positionDetailsById);

    app.put('/api/positionStats/:positionId.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.positionStatPush);
    app.post('/api/positionStats/:positionId.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.positionStatUpdate);

    app.post('/api/positionFilterStatus/:positionId.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.candidateFilterStatusPost);
    app.post('/api/positionFilterNote/:positionId.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.candidateFilterNotePost);
    app.post('/api/positionFilter/:positionId.json', checkJwt, jwtAuthz([ 'write:groups' ]), admin_hdlr.candidatesFilterPost);

    // ***************************************************
    // ********************* Newsletters *****************
    // ***************************************************

    app.put('/api/daily.json', checkJwt, jwtAuthz([ 'write:groups' ]), newsletters_hdlr.dailyPut);
    app.put('/api/story.json', checkJwt, jwtAuthz([ 'write:groups' ]), newsletters_hdlr.storyPut);

    // ***************************************************
    // *********************** Stripe ********************
    // ***************************************************

    app.get('/api/stripePortal', checkJwt, payments_hdlr.portal);

    app.get('/api/stripePlan', checkJwt, payments_hdlr.plan);
    app.get('/api/stripePayment', checkJwt, payments_hdlr.payment);
    app.post('/api/stripe.json', checkJwt, jwtAuthz([ 'write:groups' ]), payments_hdlr.postStripe);

    app.post('/api/stripeSource.json', checkJwt, payments_hdlr.sourcePost);
    app.post('/api/stripeSubscribe.json', checkJwt, payments_hdlr.subscribePost);
    app.post('/api/stripeDeal.json', checkJwt, payments_hdlr.dealPost);

    // ***************************************************
    // ********************* Messages ********************
    // ***************************************************

    app.get('/api/getChannels', checkJwt, messages_hdlr.channels);
    app.put('/api/channel.json', checkJwt, messages_hdlr.channelPut);
    app.post('/api/channel.json', checkJwt, messages_hdlr.channelPost);
    app.delete('/api/channel.json', checkJwt, messages_hdlr.channelDelete);

    app.get('/api/getMessages', checkJwt, messages_hdlr.messages);
    app.put('/api/message.json', checkJwt, messages_hdlr.messagePut);
    app.delete('/api/message.json', checkJwt, messages_hdlr.messageDelete);

    // ***************************************************
    // ******************* Publications ******************
    // ***************************************************

    app.get('/api/suggestionsPublications', checkJwt, publications_hdlr.suggestionPublications);
    app.post('/api/suggestionPublication', checkJwt, publications_hdlr.suggestionDecision);

    app.put('/api/claim.json', checkJwt, publications_hdlr.claimPut);

    // ***************************************************
    // ********************** Deals **********************
    // ***************************************************

    app.get('/api/getDeals', checkJwt, deals_hdlr.dealsByIds);
    // app.put('/api/background.json', checkJwt, deals_hdlr.tldrPut);
    // app.put('/api/clip.json', checkJwt, deals_hdlr.tldrPut);
    app.put('/api/tldr.json', checkJwt, deals_hdlr.tldrPut);
    app.put('/api/deal.json', checkJwt, deals_hdlr.dealPut);
    app.put('/api/dealPlan.json', checkJwt, deals_hdlr.planPut);

    // ***************************************************
    // ********************* Mentors *********************
    // ***************************************************


    app.post('/api/mentor.json', checkJwt, mentors_hdlr.mentorPost);
    app.delete('/api/mentor.json', checkJwt, mentors_hdlr.mentorDelete);

    app.post('/api/mentor_availability.json', checkJwt, mentors_hdlr.availabilityPost);
    app.post('/api/mentor_ongoing.json', checkJwt, mentors_hdlr.ongoingPost);

    app.put('/api/expertise.json', checkJwt, mentors_hdlr.expertisePut);
    app.post('/api/expertise.json', checkJwt, mentors_hdlr.expertisePost);
    app.delete('/api/expertise.json', checkJwt, mentors_hdlr.expertiseDelete);

    // ***************************************************
    // ****************** User Operations ****************
    // ***************************************************

    // app.get('/api/getNavbar', checkJwt, peoples_hdlr.navbarById);
    app.get('/api/getUser', checkJwt, user_hdlr.getUser);
    app.get('/api/getFollowings', checkJwt, user_hdlr.followingsById);
    app.put('/api/share.json', checkJwt, user_hdlr.sharePut);
    app.put('/api/skip.json', checkJwt, user_hdlr.skipPut);
    app.post('/api/verify', checkJwt, user_hdlr.emailVerify);
    app.post('/api/peopleStage.json', checkJwt, user_hdlr.changeState);

    app.get('/api/getMemberReports', checkJwt, user_hdlr.privateReport);
    app.delete('/api/privateReport.json', checkJwt, user_hdlr.deletePrivateReport);

    app.post('/api/wall.json', checkJwt, user_hdlr.wallPost);

    app.put('/api/follow.json', checkJwt, user_hdlr.followPut);
    app.delete('/api/follow.json', checkJwt, user_hdlr.followDelete);

    app.put('/api/folder.json', checkJwt, user_hdlr.folderPut);
    app.delete('/api/folder.json', checkJwt, user_hdlr.folderDelete);

    app.post('/api/readFolder.json', checkJwt, user_hdlr.readFolderPost);
    app.delete('/api/readFolder.json', checkJwt, user_hdlr.readFolderDelete);

    app.put('/api/challenge.json', checkJwt, user_hdlr.challengePut);
    app.delete('/api/challenge.json', checkJwt, user_hdlr.challengeDelete);

    app.post('/api/libraryPrivacy.json', checkJwt, users_settings_hdlr.libraryPrivacy);

    // notice: Block use followPut/Delete functionality
    app.get('/api/userBlocks', checkJwt, users_settings_hdlr.blocks);
    app.put('/api/block.json', checkJwt, user_hdlr.followPut);
    app.delete('/api/block.json', checkJwt, user_hdlr.followDelete);

    app.get('/api/userAccount', checkJwt, users_settings_hdlr.account);
    app.post('/api/userData.json', checkJwt, users_settings_hdlr.dataPost);
    app.post('/api/email.json', checkJwt, users_settings_hdlr.emailPost);
    app.post('/api/userPassword.json', checkJwt, users_settings_hdlr.resetPassword);

    app.get('/api/userNotifications', checkJwt, users_settings_hdlr.notifications);
    app.post('/api/userNotification.json', checkJwt, users_settings_hdlr.notificationsPost);

    app.get('/api/userReports', checkJwt, users_settings_hdlr.reports);

    app.put('/api/userReport.json', users_settings_hdlr.reportPut);
    app.post('/api/userReport.json', checkJwt, users_settings_hdlr.reportPost);
    app.delete('/api/userReport.json', checkJwt, users_settings_hdlr.reportDelete);

    app.put('/api/people.json', checkJwt, peoples_hdlr.peopleCreate);
    app.delete('/api/people.json', checkJwt, peoples_hdlr.peopleDelete);
    app.put('/api/personal.json', checkJwt, peoples_hdlr.peopleProfileCreate);

    app.put('/api/support.json', support_hdlr.contactPut);

    // ***************************************************
    // **************** Search Operations ****************
    // ***************************************************

    app.get('/api/searches', checkJwt, searches_hdlr.searches);
    app.put('/api/search.json', checkJwt, searches_hdlr.searchPut);
    app.delete('/api/search.json', checkJwt, searches_hdlr.searchDelete);
    app.put('/api/export.json', checkJwt, searches_hdlr.searchExport);

    // ***************************************************
    // ****************** User Profile *******************
    // ***************************************************

    app.put('/api/profile.json', checkJwt, peoples_hdlr.tablePut);
    app.post('/api/profile.json', checkJwt, peoples_hdlr.tablePost);
    app.delete('/api/profile.json', checkJwt, peoples_hdlr.tableDelete);

    // ***************************************************
    // *********** Group Member and Positions ************
    // ***************************************************

    app.put('/api/member.json', checkJwt, groups_hdlr.createMember);
    app.post('/api/member.json', checkJwt, groups_hdlr.updateMember);
    app.delete('/api/member.json', checkJwt, groups_hdlr.moveMember);

    app.put('/api/position.json', checkJwt, peoples_hdlr.positionPut);
    app.post('/api/position.json', checkJwt, peoples_hdlr.positionPost);
    app.delete('/api/position.json', checkJwt, peoples_hdlr.positionDelete);

    // ***************************************************
    // ***************** Group Operations ****************
    // ***************************************************

    app.put('/api/group.json', checkJwt, groups_hdlr.groupCreate);
    app.post('/api/group.json', checkJwt, groups_hdlr.groupMiniUpdate);

    app.post('/api/groupStage.json', checkJwt, groups_hdlr.changeState);
    app.post('/api/groupWelcomeStage.json', checkJwt, groups_hdlr.changeWelcomeState);

    app.post('/api/itemsOrder', checkJwt, groups_hdlr.itemsOrder);

    app.put('/api/groupFollow.json', checkJwt, groups_hdlr.followPut);
    app.delete('/api/groupFollow.json', checkJwt, groups_hdlr.followDelete);

    app.get('/api/groupAccount', checkJwt, groups_settings_hdlr.account);

    app.post('/api/groupPrivacy.json', checkJwt, groups_settings_hdlr.privacyPost);
    app.post('/api/groupData.json', checkJwt, groups_settings_hdlr.dataPost);

    app.get('/api/groupNotifications', checkJwt, groups_settings_hdlr.notifications);
    app.post('/api/groupNotifications.json', checkJwt, groups_settings_hdlr.notificationsPost);


    // ***************************************************
    // ************** Intelligence Operations ************
    // ***************************************************

    app.post('/api/groupIntelligenceNotification.json', checkJwt, jwtAuthz([ 'write:groups' ]), intelligence_hdlr.intelligenceNotification);
    app.post('/api/groupIntelligenceDecision.json', checkJwt, intelligence_hdlr.intelligenceDecision);

    // ***************************************************
    // ****************** News Operations ****************
    // ***************************************************

    app.put('/api/news.json', checkJwt, news_hdlr.newsPut);
    app.post('/api/news.json', checkJwt, news_hdlr.newsPost);
    app.delete('/api/news.json', checkJwt, news_hdlr.newsDelete);

    // ***************************************************
    // ******************* Group Items *******************
    // ***************************************************

    app.put('/api/affiliation.json', checkJwt, groups_hdlr.affiliationPut);
    app.post('/api/affiliation.json', checkJwt, shared_hdlr.affiliationPost); // CHECK
    app.delete('/api/affiliation.json', checkJwt, groups_hdlr.affiliationDelete);

    // ***************************************************

    app.put('/api/publication.json', checkJwt, publications_hdlr.publicationPut);
    app.post('/api/publications.json', checkJwt, publications_hdlr.publicationsDelete);

    app.post('/api/publicationField.json', checkJwt, publications_hdlr.publicationFieldPost);
    app.delete('/api/publicationField.json', checkJwt, publications_hdlr.publicationFieldDelete);

    app.post('/api/journal.json', checkJwt, journals_hdlr.publicationJournalPost);
    app.delete('/api/journal.json', checkJwt, journals_hdlr.publicationJournalDelete);

    // ***************************************************

    // app.put('/api/resourceCategory.json', checkJwt, resources_hdlr.categoryPut);
    // app.post('/api/resourceCategory.json', checkJwt, resources_hdlr.categoryPost);
    // app.delete('/api/resourceCategory.json', checkJwt, resources_hdlr.categoryDelete);

    app.put('/api/resource.json', checkJwt, resources_hdlr.resourcePut);
    app.post('/api/resource.json', checkJwt, resources_hdlr.resourcePost);
    app.delete('/api/resource.json', checkJwt, resources_hdlr.resourceDelete);

    app.post('/api/price.json', checkJwt, resources_hdlr.pricePost);

    app.put('/api/resourceTable.json', checkJwt, resources_hdlr.tablePut);
    app.post('/api/resourceTable.json', checkJwt, resources_hdlr.tablePost);
    app.delete('/api/resourceTable.json', checkJwt, resources_hdlr.tableDelete);

    app.post('/api/terms.json', checkJwt, resources_hdlr.termsPost);
    app.delete('/api/terms.json', checkJwt, resources_hdlr.termsDelete);

    // ***************************************************

    app.put('/api/topic.json', checkJwt, projects_hdlr.topicPut);
    app.post('/api/topic.json', checkJwt, projects_hdlr.topicPost);
    app.delete('/api/topic.json', checkJwt, projects_hdlr.topicDelete);

    app.put('/api/project.json', checkJwt, projects_hdlr.projectPut);
    app.post('/api/project.json', checkJwt, projects_hdlr.projectPost);
    app.delete('/api/project.json', checkJwt, projects_hdlr.projectDelete);
    app.post('/api/projectMove.json', checkJwt, projects_hdlr.projectMove);

    app.put('/api/projectResource.json', checkJwt, projects_hdlr.resourcePut);
    app.delete('/api/projectResource.json', checkJwt, projects_hdlr.resourceDelete);

    // ***************************************************

    app.put('/api/funding.json', checkJwt, fundings_hdlr.fundingPut);
    app.post('/api/funding.json', checkJwt, fundings_hdlr.fundingPost);
    app.delete('/api/funding.json', checkJwt, fundings_hdlr.fundingDelete);

    app.put('/api/fundingRoles.json', checkJwt, fundings_hdlr.fundingRolesPut);
    app.post('/api/fundingRole.json', checkJwt, fundings_hdlr.fundingRolePost);
    app.delete('/api/fundingRole.json', checkJwt, fundings_hdlr.fundingRoleDelete);

    app.put('/api/fundingGroup.json', checkJwt, fundings_hdlr.fundingGroupPut);
    app.delete('/api/fundingGroup.json', checkJwt, fundings_hdlr.fundingGroupDelete);

    // ***************************************************

    app.put('/api/collaboration.json', checkJwt, collaborations_hdlr.collaborationPut);
    app.post('/api/collaboration.json', checkJwt, collaborations_hdlr.collaborationPost);
    app.delete('/api/collaboration.json', checkJwt, collaborations_hdlr.collaborationDelete);

    app.put('/api/sponsor.json', checkJwt, collaborations_hdlr.sponsorPut);
    app.post('/api/sponsor.json', checkJwt, collaborations_hdlr.sponsorPost);
    app.delete('/api/sponsor.json', checkJwt, collaborations_hdlr.sponsorDelete);

    // ***************************************************

    app.put('/api/openPosition.json', checkJwt, positions_hdlr.positionPut);
    app.post('/api/openPosition.json', checkJwt, positions_hdlr.positionPost);
    app.post('/api/openPositionGeneral.json', checkJwt, positions_hdlr.positionGeneralPost);
    app.post('/api/openPositionLetters.json', checkJwt, positions_hdlr.positionLettersPost);
    app.post('/api/openPositionDeadlines.json', checkJwt, positions_hdlr.positionDeadlinesPost);
    app.delete('/api/openPosition.json', checkJwt, positions_hdlr.positionDelete);

    app.put('/api/apply.json', checkJwt, positions_hdlr.applyPut);
    app.post('/api/apply.json', checkJwt, positions_hdlr.applyPost);

    app.post('/api/candidateStage.json', checkJwt, positions_hdlr.candidateStagePost);
    app.post('/api/candidateNote.json', checkJwt, positions_hdlr.candidateNotePost);

    app.get('/api/position/:positionId.json/stats', checkJwt, positions_hdlr.positionStatsById);
    app.get('/api/position/:positionId.json/proposals', checkJwt, positions_hdlr.positionProposalsById);

    // ***************************************************

    app.put('/api/teaching.json', checkJwt, teachings_hdlr.teachingPut);
    app.post('/api/teaching.json', checkJwt,  teachings_hdlr.teachingPost);
    app.delete('/api/teaching.json', checkJwt, teachings_hdlr.teachingDelete);

    // ***************************************************

    app.put('/api/outreach.json', checkJwt, outreachs_hdlr.outreachPut);
    app.post('/api/outreach.json', checkJwt,  outreachs_hdlr.outreachPost);
    app.delete('/api/outreach.json', checkJwt, outreachs_hdlr.outreachDelete);

    // ***************************************************

    app.put('/api/media.json', checkJwt, media_hdlr.mediaPut);
    app.post('/api/media.json', checkJwt,  media_hdlr.mediaPost);
    app.delete('/api/media.json', checkJwt, media_hdlr.mediaDelete);

    // ***************************************************

    app.put('/api/gallery.json', checkJwt, galleries_hdlr.galleryPut);
    app.post('/api/gallery.json', checkJwt, galleries_hdlr.galleryPost);
    app.delete('/api/gallery.json', checkJwt, galleries_hdlr.galleryDelete);

    // ***************************************************

    app.put('/api/faq.json', checkJwt, faqs_hdlr.faqPut);
    app.post('/api/faq.json', checkJwt, faqs_hdlr.faqPost);
    app.delete('/api/faq.json', checkJwt, faqs_hdlr.faqDelete);

    // ***************************************************

    app.put('/api/contactMessage.json', checkJwt, contacts_hdlr.contactMessage);
    app.put('/api/contact.json', checkJwt, contacts_hdlr.contactPut);
    app.post('/api/contact.json', checkJwt, contacts_hdlr.contactPost);
    app.delete('/api/contact.json', checkJwt, contacts_hdlr.contactDelete);

    // ***************************************************
    // **************** Group Private News ***************
    // ***************************************************

    app.get('/api/getPrivateNews', checkJwt, private_hdlr.news);
    app.get('/api/getPrivateComments', checkJwt, private_hdlr.comments);

    app.put('/api/privateNews.json', checkJwt, private_hdlr.newsPut);
    app.post('/api/privateNews.json', checkJwt, private_hdlr.newsPost);
    app.delete('/api/privateNews.json', checkJwt, private_hdlr.newsDelete);

    app.put('/api/privateComment.json', checkJwt, private_hdlr.commentPut);
    app.post('/api/privateComment.json', checkJwt, private_hdlr.commentPost);
    app.delete('/api/privateComment.json', checkJwt, private_hdlr.commentDelete);

    // ***************************************************
    // ************** Group Private Meetings *************
    // ***************************************************

    app.put('/api/privateMeetings.json', checkJwt, private_hdlr.meetingsPut);
    // post
    app.delete('/api/privateMeetings.json', checkJwt, private_hdlr.meetingsDelete);

    app.put('/api/privateSingleMeeting.json', checkJwt, private_hdlr.meetingPut);
    app.post('/api/privateSingleMeeting.json', checkJwt, private_hdlr.meetingPost);
    app.delete('/api/privateSingleMeeting.json', checkJwt, private_hdlr.meetingDelete);

    // ***************************************************
    // ************** Group Private Reports **************
    // ***************************************************

    app.get('/api/getPrivateReports', checkJwt, private_hdlr.reports);
    app.put('/api/privateReports.json', checkJwt, private_hdlr.reportsPut);
    app.post('/api/privateReports.json', checkJwt, private_hdlr.reportsPost);
    app.delete('/api/privateReports.json', checkJwt, private_hdlr.reportsDelete);
    app.post('/api/privateSingleReport.json', checkJwt, private_hdlr.reportPost);

    app.put('/api/privateSingleReport.json', checkJwt, private_hdlr.reportPut);
    app.delete('/api/privateSingleReport.json', checkJwt, private_hdlr.reportDelete);

    app.put('/api/privateReportRemind.json', checkJwt, private_hdlr.reportRemind);

    app.put('/api/privateReportFinazlie.json', checkJwt, private_hdlr.reportFinalize);

    // ***************************************************
    // *************** (Group) Private Info **************
    // ***************************************************

    app.get('/api/getPersonalInfo', checkJwt, private_hdlr.personalInfo);
    app.post('/api/personalInfo.json', checkJwt, private_hdlr.personalInfoPost);

    // ***************************************************
    // **************** Group Analytics ******************
    // ***************************************************

    // app.get('/api/getOverallAnalytics', checkJwt, analytics_hdlr.overallAnalyticsById);
    // app.get('/api/getAnalytics', checkJwt, analytics_hdlr.analyticsById);

    // ***************************************************
    // ********************** Items **********************
    // ***************************************************

    // app.post('/api/item', (req, res) => {
    //   var getp = req.query;
    //   switch (parseInt(getp.mode)) {
    //     case 4: (trends_hdlr.trendPost(req, res)); break;
    //     case 5: (podcasts_hdlr.podcastPost(req, res)); break;
    //     case 6: (events_hdlr.eventPost(req, res)); break;
    //     case 7: (apps_hdlr.appPost(req, res)); break;
    //   }
    // })

    app.delete('/api/item.json', checkJwt, jwtAuthz([ 'write:departments' ]), (req, res) => {
      var getp = req.query;
      switch (parseInt(getp.mode)) {
        case 4: (trends_hdlr.trendDelete(req, res)); break;
        case 5: (podcasts_hdlr.podcastDelete(req, res)); break;
        case 6: (events_hdlr.eventDelete(req, res)); break;
        case 7: (apps_hdlr.appDelete(req, res)); break;
      }
    })

    // ***************************************************
    // ******************** Department *******************
    // ***************************************************

    app.get('/api/departmentAccount', checkJwt, jwtAuthz([ 'read:departments' ]), departments_hdlr.departmentAccountById);
    app.put('/api/department.json', checkJwt, jwtAuthz([ 'write:departments' ]), departments_hdlr.departmentBuild);
    app.post('/api/department.json', checkJwt, jwtAuthz([ 'write:departments' ]), departments_hdlr.departmentPost);
    app.delete('/api/department.json', checkJwt, jwtAuthz([ 'delete:departments' ]), departments_hdlr.departmentDelete);

    // ***************************************************
    // ******************** University *******************
    // ***************************************************

    app.get('/api/universityAccount', checkJwt, jwtAuthz([ 'read:universities' ]), universities_hdlr.universityAccountById);
    app.put('/api/university.json', checkJwt, jwtAuthz([ 'write:universities' ]), universities_hdlr.universityBuild);
    app.delete('/api/university.json', checkJwt, jwtAuthz([ 'delete:universities' ]), universities_hdlr.universityDelete);
    app.delete('/api/universityQuery.json', checkJwt, jwtAuthz([ 'delete:universities' ]), universities_hdlr.universityQueryDelete);

    app.put('/api/univeristyUnit.json', checkJwt, jwtAuthz([ 'read:universities' ]), universities_hdlr.unitPut);
    app.post('/api/univeristyUnit.json', checkJwt, jwtAuthz([ 'read:universities' ]), universities_hdlr.unitPost);
    app.delete('/api/univeristyUnit.json', checkJwt, jwtAuthz([ 'read:universities' ]), universities_hdlr.unitDelete);

    app.post('/api/univeristyRank.json', checkJwt, jwtAuthz([ 'write:universities' ]), universities_hdlr.rankPost);

    // ***************************************************

    app.post('/api/stage.json', checkJwt, jwtAuthz([ 'write:universities' ]), shared_hdlr.stagePost);

    // *************************************
    // ************** Pics ***************
    // *************************************

    app.get('/api/getPicsInfo', checkJwt, pics_hdlr.picsInfo);

    app.post('/api/pics.json', checkJwt, pics_hdlr.picsUpdate);
    app.delete('/api/pics.json', checkJwt, pics_hdlr.picsDelete);

    app.post('/api/textpic.json', checkJwt, pics_hdlr.textpicUpdate);
    app.delete('/api/textpic.json', checkJwt, pics_hdlr.textpicDelete);

    app.put('/api/showcase.json', checkJwt, pics_hdlr.showcasePut);
    app.post('/api/showcase.json', checkJwt, pics_hdlr.showcasePost);
    app.delete('/api/showcase.json', checkJwt, pics_hdlr.showcaseDelete);

    // *************************************
    // **************** CSV ****************
    // *************************************

    app.put('/api/csv.json', checkJwt, jwtAuthz([ 'write:groups' ]), csv_hdlr.csvParse);

    // *************************************
    // ************** Shared ***************
    // *************************************

    app.put('/api/domain.json', checkJwt, shared_hdlr.domainPut);

    app.post('/api/twitter.json', checkJwt, shared_hdlr.twitterPost);
    app.post('/api/location.json', checkJwt, shared_hdlr.locationPost);
    app.post('/api/title.json', checkJwt, shared_hdlr.titlePost);

    app.get('/api/getPublicInfo', peoples_hdlr.publicInfo); // CHECK
    app.post('/api/publicInfo.json', checkJwt, shared_hdlr.publicInfoPost);
    app.post('/api/socialInfo.json', checkJwt, shared_hdlr.socialInfoPost);

    app.post('/api/mini.json', checkJwt, shared_hdlr.miniPost);

    app.post('/api/tags.json', checkJwt, shared_hdlr.tagsUpdate);
    app.delete('/api/tags.json', checkJwt, shared_hdlr.tagsDelete);

    app.put('/api/text.json', checkJwt, shared_hdlr.textUpdate);
    app.delete('/api/text.json', checkJwt, shared_hdlr.textDelete);

    app.put('/api/quote.json', checkJwt, shared_hdlr.quoteUpdate);
    app.delete('/api/quote.json', checkJwt, shared_hdlr.quoteDelete);

    app.put('/api/link.json', checkJwt, shared_hdlr.linkPut);
    app.post('/api/link.json', checkJwt, shared_hdlr.linkPost);
    app.delete('/api/link.json', checkJwt, shared_hdlr.linkDelete);

    app.get('/api/getCoAuthors', shared_hdlr.coAuthors);

    app.get('/api/getLanguages', checkJwt, languages_hdlr.languages);

    app.get('/api/calendar', checkJwt, shared_hdlr.calendar);

    // *************************************
    // ************** Requests *************
    // *************************************

    // requests_hdlr
    app.post('/api/request.json', checkJwt, resources_hdlr.requestPost); // Mentor Sessions, Service Requests
    // app.delete('/api/request.json', checkJwt, resources_hdlr.requestDelete); // CHECK
    // reviews list: put, post, delete (new Shared) // Deals, Sessions, Requests

    // **************************************************************
    // *********** Credentials not required from here on ************
    // **************************************************************

    app.use(ignoreJwt, function (err, req, res, next) {
      if (err.code === 'invalid_token') return next();
      return next();
    });

    // ******************************************************
    // ********* Job-Service-Lab Posting Unlogged ***********
    // ******************************************************

    app.get('/api/openPositionPreview', positions_hdlr.positionPostingPreview);
    app.put('/api/openPosition-create.json', positions_hdlr.positionLabPut);

    app.post('/api/stripePosition.json', payments_hdlr.positionPost);
    app.post('/api/stripeService.json', payments_hdlr.servicePost);

    // *************************************
    // ************ Newsletters ************
    // *************************************

    app.get('/api/story/:storyId.json', newsletters_hdlr.storyDetails);

    // *************************************
    // ************** Logging **************
    // *************************************

    app.put('/api/logging.json', checkJwt, loggings_hdlr.loggingPut);

    // *************************************
    // ************** Submit ***************
    // *************************************

    app.put('/api/submit.json', (req, res) => {
      var getp = req.query;
      switch (parseInt(getp.type)) {
        case 0: (trends_hdlr.submitPut(req, res)); break;
        case 1: (podcasts_hdlr.submitPut(req, res)); break;
        case 2: (events_hdlr.submitPut(req, res)); break;
        case 3: (apps_hdlr.submitPut(req, res)); break;
        case 4: (mentors_hdlr.submitPut(req, res)); break;
      }
    })

    app.put('/api/mentor.json', checkJwt, mentors_hdlr.mentorPut);

    // *************************************
    // *************** Pages ***************
    // *************************************

    app.get('/api/getHomePage', (req, res) => {
      var getp = req.query;
      switch (parseInt(getp.mode)) {
        case 0: (universities_hdlr.universityHomePage(req, res)); break;
        // 1 researchers
        case 1: (departments_hdlr.departmentHomePage(req, res)); break; // 2
        case 2: (groups_hdlr.groupHomePage(req, res)); break; // 3
        case 4: (trends_hdlr.trendHomePage(req, res)); break;
        case 5: (podcasts_hdlr.podcastHomePage(req, res)); break;
        case 6: (events_hdlr.eventHomePage(req, res)); break;
        case 7: (apps_hdlr.appHomePage(req, res)); break;
      }
    })

    app.get('/api/getPeoplesPage', groups_hdlr.groupPeoplesPage);
    app.get('/api/getPublicationsPage', groups_hdlr.groupPublicationsPage);
    app.get('/api/getResourcesPage', groups_hdlr.groupResourcesPage);
    app.get('/api/getProjectsPage', groups_hdlr.groupProjectsPage);
    app.get('/api/getCollaborationsPage', groups_hdlr.groupCollaborationsPage);
    app.get('/api/getPositionsPage', groups_hdlr.groupPositionsPage);
    app.get('/api/getPrivateMeetings', private_hdlr.meetings);

    app.get('/api/getContactsPage', (req, res) => {
      var getp = req.query;
      switch (parseInt(getp.mode)) {
        case 0: (universities_hdlr.universityContactsPage(req, res)); break;
        case 1: (departments_hdlr.departmentContactsPage(req, res)); break;
        case 2: (groups_hdlr.groupContactsPage(req, res)); break;
      }
    })

    // *************************************
    // **************** Query **************
    // *************************************

    app.get('/api/queryFundings', checkJwt, fundings_hdlr.queryFundings);
    app.get('/api/queryJournals', checkJwt, journals_hdlr.queryJournals);
    app.get('/api/queryCoordinates', checkJwt, shared_hdlr.queryCoordinates);

    app.get('/api/queryPeoples', peoples_hdlr.peoplesQueryMini);
    app.get('/api/queryPublications', publications_hdlr.queryPublications);
    app.get('/api/queryUniversities', universities_hdlr.universitiesQuery);
    app.get('/api/queryTopics', topics_hdlr.topics);
    app.get('/api/groupExist', groups_hdlr.groupExist);

    // *************************************
    // **************** Lists **************
    // *************************************

    app.get('/api/kits', searches_hdlr.papers_kits);
    app.get('/api/featured', searches_hdlr.featured);

    app.get('/api/getNews', news_hdlr.newsByIds);

    app.get('/api/getUniversities', universities_hdlr.universitiesByIds);

    app.get('/api/getDepartments', universities_hdlr.departmentsByIds);

    app.get('/api/getGroups', groups_hdlr.groupsByIds); // CHECK
    app.get('/api/getGroupsCompare', compare_hdlr.groupsCompareByIds);

    app.get('/api/getPeoples', peoples_hdlr.peoplesByIds);

    app.get('/api/getPodcasts', podcasts_hdlr.podcastsByIds);
    app.get('/api/getEvents', events_hdlr.eventsByIds);
    app.get('/api/getApps', apps_hdlr.appsByIds);

    app.get('/api/getTopics', groups_hdlr.topicsByIds);
    app.get('/api/getProjects', projects_hdlr.projectsByIds);
    app.get('/api/getPublications', publications_hdlr.publicationsByIds);
    app.get('/api/getResources', resources_hdlr.resourcesByIds);
    app.get('/api/getFundings', fundings_hdlr.fundingsByIds);
    app.get('/api/getProfileFunding', fundings_hdlr.profileFundings);
    app.get('/api/getCollaborations', collaborations_hdlr.collaborationsByIds);
    app.get('/api/getSponsors', collaborations_hdlr.sponsorsByIds);
    app.get('/api/getOpenPositions', positions_hdlr.positionsByIds);
    app.get('/api/getTeachings', teachings_hdlr.teachingsByIds);
    app.get('/api/getOutreach', outreachs_hdlr.outreachsByIds);
    app.get('/api/getGalleries', galleries_hdlr.galleriesByIds);
    app.get('/api/getMedia', media_hdlr.mediaByIds);
    app.get('/api/getQuestions', faqs_hdlr.faqByIds);
    app.get('/api/getContacts', contacts_hdlr.contactsByIds);

    // *************************************
    // ************ Details Pages **********
    // *************************************

    app.get('/api/getProfile/:people', peoples_hdlr.peopleDataByName);
    app.get('/api/getProfileBackground', peoples_hdlr.peopleDetailsById);

    app.get('/api/topic/:topic', projects_hdlr.topicDataByURL);

    app.get('/api/project/:projectId.json', projects_hdlr.projectDetailsById);
    app.get('/api/resource/:resourceId.json', resources_hdlr.resourceDetailsById);
    app.get('/api/mentor/:mentorId.json', mentors_hdlr.mentorDetailsById);
    app.get('/api/publication/:publicationId.json', publications_hdlr.publicationDetailsById);
    app.get('/api/gallery/:galleryId.json', galleries_hdlr.galleryDetailsById);
    app.get('/api/position/:positionId.json', positions_hdlr.positionDetailsById);
    app.get('/api/deal/:itemId.json', deals_hdlr.dealDetailsById);

    // *************************************
    // **************** URLs ***************
    // *************************************

    app.get('/api/trends/:trend', trends_hdlr.trendDataByURL);
    app.get('/api/events/:event', events_hdlr.eventDataByURL);
    app.get('/api/podcasts/:podcast', podcasts_hdlr.podcastDataByURL);
    app.get('/api/apps/:app', apps_hdlr.appDataByURL);

    app.get('/api/:university', universities_hdlr.universityDataByURL);
    app.get('/api/:university/:department', departments_hdlr.departmentDataByURL);
    app.get('/api/:university/:department/:group', groups_hdlr.groupDataByURL);
    app.get('/api/:university/:department/:group/people/:people', peoples_hdlr.peopleDataByURL);

  }
}

// app.route('/api/:id').get((req: Request, res: Response, next: NextFunction) => {
//   console.log("555")
//   universities_hdlr.universityDataByURL
//   Article.findById(req.params.id, (err, article) => {
//     if (err) { return next(err); }
//     res.json(article);
//   });
// });
// app.route('/api/').post((req: Request, res: Response, next: NextFunction) => {
//   console.log(req.body);
//   Article.create(req.body, (err, article) => {
//     if (err) { return next(err); }
//     res.json(article);
//   });
// });
// app.route('/api/:id').put((req: Request, res: Response, next: NextFunction) => {
//   Article.findByIdAndUpdate(req.params.id, req.body, (err, article) => {
//     if (err) { return next(err); }
//     res.json(article);
//   });
// });
// app.route('/api/:id').delete((req: Request, res: Response, next: NextFunction) => {
//   Article.findByIdAndRemove(req.params.id, req.body, (err, article) => {
//     if (err) { return next(err); }
//     res.json(article);
//   });
// });
