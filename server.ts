import 'zone.js/dist/zone-node';

import * as express from 'express';

const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
var enforce = require('express-sslify');
// var sslRedirect = require('heroku-ssl-redirect');

import { join } from 'path';
import { createWindowMocks } from '@trilon/ng-universal';
import { Server as HttpServer } from 'http';
import { AcademigRoutes } from './server/routes';

var fs = require('fs');
var compression = require('compression');
var CronJob = require('cron').CronJob;

var db = require('./server/db.ts');
var payments = require("./server/data/payments.ts");
var positions = require("./server/data/positions.ts");
var resources = require("./server/data/resources.ts");
var deals = require("./server/data/deals.ts");

// https://github.com/pusher/pusher-http-node/issues/66
const Pusher = require('pusher');
const cors = require('cors');

const endpointSecret = 'whsec_KbdhO8Vq6qMZkMEcRTs3TBn0Gu0tH5F3';

if (process.env.PORT) {
  var stripe = require("stripe")("sk_live_cX9wuWcR9lIBXPhAh206GjKb");
} else {
  var stripe = require("stripe")("sk_test_7EVILWvlgJHlUNOh58DBJVe4");
}

const academigRoutes: AcademigRoutes = new AcademigRoutes();

require('dotenv').config({ path: 'pusher.env' });

const app = express();

// app.use(enforce.HTTPS({ trustProtoHeader: true }))

// app.use(sslRedirect());
app.use(compression());
app.use(morgan('dev'));
app.use(helmet());

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// const pusher = new Pusher({
//   appId: '485988',
//   key: '562fc24342c58e11a061',
//   secret: '16a76a502acf8f630efc',
//   cluster: 'eu',
// });

var pusher = new Pusher({
  appId: '485988',
  key: '562fc24342c58e11a061',
  secret: '16a76a502acf8f630efc',
  cluster: 'eu',
  encrypted: true
});

console.log('DIST_FOLDER',DIST_FOLDER)

// Make sure you grab wherever your index.html is, we want to use that html as a -base- for Domino
const template = fs.readFileSync(join(DIST_FOLDER, 'index.html')).toString();
createWindowMocks(template);

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap} = require('./dist/server/main');

// https://github.com/stripe/stripe-node/issues/341
app.use('/webhook/stripe', bodyParser.raw({type: "*/*"}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
app.all('/*', function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "*");
 next();
});

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Serve static files from /browser
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

app.post('/pusher/auth', (req, res) => {
  // console.log('55555',req.body)
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  var channelData = {user_id: req.body.userId};
  const auth = pusher.authenticate(socketId, channel, channelData);
  res.send(auth);
});

// Match the raw body to content type application/json
app.post('/webhook/stripe', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
  // var timestamp = req.body.time_ms;
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('type',event.type)

  if (event.type === 'checkout.session.completed') {

    const session = event.data.object;
    console.log('session',session)
    console.log('setup_intent',session.setup_intent)

    const pathname = session.success_url ? new URL(session.success_url).pathname : null;
    console.log('pathname',pathname)
    console.log('includes',pathname.includes('deal'))

    const plan = (session.display_items && session.display_items[0]) ? session.display_items[0].plan : null;
    console.log('plan',plan)

    if (plan==null && session.setup_intent) {
      console.log("setup_intent")
      payments.setup_intents(session.setup_intent, function (err) {
        response.json({received: true});
      });

    } else if (pathname.includes('post-job/confirm') || pathname.includes('jobs')) {
      const itemId = pathname.substring(pathname.lastIndexOf('/') + 1);
      console.log("Academig Jobs",itemId)
      positions.post_position_notify(session.customer, session.subscription, itemId, function(err) {
        response.json({received: true});
      });

    } else if (pathname.includes('post-service/confirm') || pathname.includes('services')) {
      const itemId = pathname.substring(pathname.lastIndexOf('/') + 1);
      console.log("Academig Services",itemId)
      resources.post_resource_notify(session.customer, session.subscription, itemId, function(err) {
        response.json({received: true});
      });

    } else if (pathname.includes('deal')) {
      const itemId = session.success_url.substring(session.success_url.lastIndexOf('#') + 1);
      console.log("Academig Deals",itemId)
      deals.post_deal_notify(session.customer, itemId, 1, function (err, flag) {
        response.json({received: true});
      });

    // } else if (pathname.includes('mentor')) {

    } else if (plan && (plan.product=="prod_GmyR38umTvJnCt" || plan.product=="prod_IdFYlR9bXpv2pd")) {
      console.log("Academig PRO")
      payments.pro_subscribe(session.customer, session.subscription, 1, function (err) { // session.customer, plan.id
        response.json({received: true});
      })

    } else if (plan && (plan.product=="prod_IUdtQQbVKdakeX" || plan.product=="prod_IdFYRagGTm6wwd")) {
      console.log("Academig PRO & Mentoring")
      payments.pro_subscribe(session.customer, session.subscription, 2, function (err) {
        response.json({received: true});
      })

    } else if (plan && (plan.product=="prod_HxhsVnODfiqGaX" || plan.product=="prod_IdFZsOCsSSes7g")) {
      console.log("Academig Lab Tools PRO")
      payments.lab_pro_subscribe(session.customer, session.subscription,function (err) { // plan.id
        response.json({received: true});
      })

    } else if (plan && (plan.product=="prod_HxhsnVwXmakwxT" || plan.product=="prod_IdFZfzkmnXdgNm")) {
      console.log("Academig Lab AI PRO")
      payments.ai_pro_subscribe(session.customer, session.subscription, function (err) { // plan.id
        response.json({received: true});
      })

    } else {
      response.json({received: true});
    }

    // https://stackoverflow.com/questions/8376525/get-value-of-a-string-after-a-slash-in-javascript

  } else {
    response.json({received: true}); // Return a response to acknowledge receipt of the event
  }

});

export function message_notification(channels, eventData, callback) {
  pusher.trigger(channels, 'one-to-one-chat-request', eventData, null, function(error, request, response) {
    callback(error)
  });
}

export function notifications(channels, eventData, callback) {
  pusher.trigger(channels, 'notifications', eventData, null, function(error, request, response) {
    callback(error)
  });
}

// Rest API endpoints
academigRoutes.academigRoutes(app);

// All regular routes use the Universal engine
// app.get('*', (req, res) => {
//   res.render('index', { req });
// });

app.get('*', (req, res) => {
  res.render('index', {
    req: req,
    res: res,
    providers: [
      {
        provide: 'REQUEST', useValue: (req)
      },
      {
        provide: 'RESPONSE', useValue: (res)
      }
    ]
  });
});

// ************************************************
// *********** Start up the Node server ***********
// ************************************************

db.init( (err, results) => {
  if (err) {
    console.error("** FATAL ERROR ON STARTUP: ");
    console.error(err);
    process.exit(-1);
  }
  console.log("** Database initialized, listening on port: " + PORT);
  const httpServer: HttpServer = app.listen(PORT, () => {
    const {address, port} = httpServer.address();
    console.log('Listening on %s:%s', address, port);
  });
});

// ************************************************
// ************** Start up Scheduler **************
// ************************************************

var private_hdlr = require('./server/handlers/private.ts');
var contests_hdlr = require('./server/handlers/contests.ts');
var publications_hdlr = require('./server/handlers/publications.ts');
var schedule_hdlr = require('./server/data/schedules.ts');

var job = new CronJob({
  cronTime: (process.env.PORT) ? '00 14 * * *' : '*/15 * * * *', // once daily at 14 for Production
                                                                 // every 15 minutes for Developments
  onTick: function() {
    console.log('Scheduler')
    private_hdlr.meetingSchedule()
    private_hdlr.reportSchedule()
    schedule_hdlr.jobSchedule()
    // schedule_hdlr.updatesSchedule()
    // schedule_hdlr.publicationsSuggestionSchedule()
    // contests_hdlr.contestReminder()
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();

var inviteJob = new CronJob({
  cronTime: '*/1 * * * *', // every 1 minute

  onTick: function() {
    // console.log('Invite Scheduler',process.env.PORT)
    // schedule_hdlr.inviteSchedule()

    // schedule_hdlr.jobSchedule()
    // schedule_hdlr.updatesSchedule()
    // schedule_hdlr.publicationsSuggestionSchedule()
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
inviteJob.start();
