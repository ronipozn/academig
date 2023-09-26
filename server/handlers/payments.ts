var helpers = require("./helpers.ts");
var async = require("async");
var request = require("request");

var group_data = require("../data/groups.ts");
var people_data = require("../data/peoples.ts");
var deals_data = require("../data/deals.ts");
var payments_data = require("../data/payments.ts");
var privilege_data = require("../data/privileges.ts");

import { groupComplex } from "../models/shared.ts";

var emails = require("../misc/emails.ts");

var ObjectID = require("mongodb").ObjectID;

var stripe = require("stripe")("ENV_STRIPE");

exports.version = "0.1.0";

////////////////////////////////////
////////////////////////////////////
///////// Plans + Payments /////////
////////////////////////////////////
////////////////////////////////////

// Create Payment Source
exports.portal = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);

  async.waterfall(
    [
      // 1. validate Privileges
      function (cb) {
        console.log("PORTAL1", mode, getp.id);
        privilege_data.privilages(
          req.user.sub,
          getp.id,
          mode == 1 ? 0 : 10,
          function (err, userId, flag) {
            if (flag) cb(err, userId);
            else cb(helpers.invalid_privileges());
          }
        );
      },

      // 2. retrieve Stripe ID
      function (userId: string, cb) {
        console.log("PORTAL2", mode);
        if (mode == 0) {
          people_data.user_stripe_id(userId, function (err, stripeId) {
            cb(err, stripeId);
          });
        } else if (mode == 1) {
          group_data.group_stripe_id(getp.id, function (err, stripeId) {
            cb(err, stripeId);
          });
        } else {
          cb("missing portal mode");
        }
      },

      // 3. create Session
      function (stripeId: string, cb) {
        console.log("stripeId", stripeId);
        stripe.billingPortal.sessions.create(
          {
            customer: stripeId,
            return_url:
              mode == 0
                ? "https://www.academig.com/settings/account"
                : "https://www.academig.com",
          },
          function (err, session) {
            console.log("session", session);
            cb(err, session);
          }
        );
      },
    ],
    function (err, session) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, session.url);
      }
    }
  );
};

// Create Payment Source
exports.sourcePost = function (req, res) {
  var getp = req.query;

  var mode = parseInt(getp.mode);
  var id = parseInt(getp.id);

  const host = req.get("host");

  async.waterfall(
    [
      // 1. make sure Mode, ID Are valid
      function (cb) {
        if (mode == null || (!ObjectID.isValid(getp.id) && mode == 1)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privileges
      function (cb) {
        privilege_data.privilages(
          req.user.sub,
          getp.id,
          mode == 1 ? 0 : 10,
          function (err, userId, flag) {
            if (flag) cb(err, userId);
            else cb(helpers.invalid_privileges());
          }
        );
      },

      // 3. retrieve Stripe ID
      function (userId: string, cb) {
        if (mode == 0) {
          people_data.user_stripe_id(userId, function (err, stripeId) {
            cb(err, stripeId, null);
          });
        } else if (mode == 1) {
          group_data.group_stripe_id(
            getp.id,
            function (err, stripeId, groupIndex, groupEmail) {
              cb(err, stripeId, groupIndex);
            }
          );
        }
      },

      // 4. create Payment Source
      function (stripeId: string, groupIndex: groupComplex, cb) {
        payments_data.create_source(
          host,
          mode,
          stripeId,
          groupIndex,
          function (err, payment_info) {
            cb(err, payment_info);
          }
        );
      },
    ],
    function (err, payment_info) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, payment_info);
      }
    }
  );
};

////////////////////////////////////
////////////////////////////////////
///// Create One-Time Payment //////
////////////////////////////////////
////////////////////////////////////

exports.dealPost = function (req, res) {
  var getp = req.query;
  var quantity = parseInt(getp.quantity);

  const host = req.get("host");

  async.waterfall(
    [
      // 1. make sure Mode, Period, Type, Parent ID Are valid
      function (cb) {
        if (quantity == null || !ObjectID.isValid(getp.id)) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        console.log("DEAL2");
        privilege_data.privilages(
          req.user.sub,
          getp.id,
          10,
          function (err, userId, flag) {
            if (flag) cb(err, userId);
            else cb(helpers.invalid_privileges());
          }
        );
      },

      // 3. Customer Stripe ID
      function (userId: string, cb) {
        console.log("DEAL3");
        people_data.user_stripe_id(userId, quantity, function (err, stripeId) {
          cb(err, stripeId);
        });
      },

      // 4. Price Stripe ID
      function (stripeId: string, cb) {
        console.log("DEAL4", getp.id);
        deals_data.deal_id_price_id(getp.id, function (err, priceId, dealId) {
          cb(err, stripeId, priceId, dealId);
        });
      },

      // 4. Stripe Checkout
      function (stripeId: string, priceId: string, dealId: string, cb) {
        console.log("DEAL5", priceId);
        payments_data.create_deal_payment(
          host,
          dealId,
          stripeId,
          priceId,
          quantity,
          function (err, session, planId) {
            cb(err, session);
          }
        );
      },
    ],
    function (err, session) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, session);
      }
    }
  );
};

////////////////////////////////////
////////////////////////////////////
/////// Create Subscriptions ///////
////////////////////////////////////
////////////////////////////////////

// Create Subscription:
//        PRO
//        LAB PRO
//        LAB SUGGESTIONS PRO
exports.subscribePost = function (req, res) {
  var getp = req.query;

  var mode = parseInt(getp.mode);
  var period = parseInt(getp.period);
  var type = parseInt(getp.type);
  var quantity = 1;

  const host = req.get("host");

  async.waterfall(
    [
      // 1. make sure Mode, Period, Type, Parent ID Are valid
      function (cb) {
        if (
          mode == null ||
          period == null ||
          type == null ||
          (!ObjectID.isValid(getp.id) && mode == 1)
        ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 2. validate Privilages
      function (cb) {
        console.log("SU2");
        privilege_data.privilages(
          req.user.sub,
          getp.id,
          mode == 1 || mode == 2 ? 0 : 10,
          function (err, userId, flag) {
            if (flag) cb(err, userId);
            else cb(helpers.invalid_privileges());
          }
        );
      },

      // 3. Stripe ID
      function (userId: string, cb) {
        console.log("SU3");
        if (mode == 0) {
          people_data.user_stripe_id(userId, function (err, stripeId) {
            cb(err, stripeId, null);
          });
        } else if (mode == 1 || mode == 2) {
          group_data.group_stripe_id(
            getp.id,
            function (err, stripeId, groupIndex, groupEmail) {
              cb(err, stripeId, groupIndex);
            }
          );
        }
      },

      // 4. Stripe Subscribe
      function (stripeId: string, groupIndex: groupComplex, cb) {
        console.log("SU4");
        payments_data.create_subscription(
          host,
          mode,
          period,
          type,
          quantity,
          stripeId,
          groupIndex,
          function (err, session, planId) {
            cb(err, session);
          }
        );
      },
    ],
    function (err, session) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, session);
      }
    }
  );
};

exports.positionPost = function (req, res) {
  var getp = req.query;

  var build = parseInt(getp.build);
  var filter = parseInt(getp.filter);
  var standout = parseInt(getp.standout);
  // var mode = parseInt(getp.mode);

  const host = req.get("host");

  async.waterfall(
    [
      // 1. make sure Standout, Filter, Build, Item ID, Parent ID are valid
      function (cb) {
        console.log(
          "PP1",
          "standout",
          standout,
          "filter",
          filter,
          "build",
          build,
          "getp.itemId",
          getp.itemId,
          "getp.id",
          getp.id
        );
        if (
          standout == null ||
          filter == null ||
          build == null ||
          !ObjectID.isValid(getp.itemId) ||
          !ObjectID.isValid(getp.id)
        ) {
          cb(helpers.no_such_item());
          return;
        }
        cb();
      },

      // 2. validate Privilages
      function (cb) {
        console.log("PP2", req.user);
        if (req.user) {
          privilege_data.privilages(
            req.user.sub,
            getp.id,
            0,
            function (err, userId, flag) {
              if (flag) cb(err, userId);
              else cb(helpers.invalid_privileges());
            }
          );
        } else {
          privilege_data.offline_build_privilages(
            getp.userId,
            getp.id,
            function (err, flag) {
              if (flag) cb(err, null);
              else cb(helpers.invalid_privileges());
            }
          );
        }
      },

      // 3. retrieve Stripe ID
      function (userId: string, cb) {
        console.log("PP3");
        group_data.group_stripe_id(
          getp.id,
          function (err, stripeId, groupIndex, groupEmail) {
            cb(err, userId, stripeId, groupIndex, groupEmail);
          }
        );
      },

      // 4. create Subscription
      function (
        userId: string,
        stripeId: string,
        groupIndex: groupComplex,
        groupEmail: string,
        cb
      ) {
        console.log("PP4");
        payments_data.create_position_subscription(
          userId,
          host,
          build,
          filter,
          standout,
          stripeId,
          groupIndex,
          groupEmail,
          getp.itemId,
          function (err, confirmation) {
            cb(err, confirmation);
          }
        );
      },
    ],
    function (err, confirmation) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, confirmation);
      }
    }
  );
};

exports.servicePost = function (req, res) {
  var getp = req.query;

  var build = parseInt(getp.build);
  var standout = parseInt(getp.standout);

  const host = req.get("host");

  async.waterfall(
    [
      // 1. make sure Standout, Filter, Build, Item ID, Parent ID are valid
      function (cb) {
        console.log(
          "SS1",
          "standout",
          standout,
          "build",
          build,
          "getp.itemId",
          getp.itemId,
          "getp.id",
          getp.id
        );
        if (
          standout == null ||
          build == null ||
          !ObjectID.isValid(getp.itemId) ||
          !ObjectID.isValid(getp.id)
        ) {
          cb(helpers.no_such_item());
          return;
        }
        cb();
      },

      // 2. validate Privilages
      function (cb) {
        console.log("SS2", req.user);
        if (req.user) {
          privilege_data.privilages(
            req.user.sub,
            getp.id,
            0,
            function (err, userId, flag) {
              if (flag) cb(err, userId);
              else cb(helpers.invalid_privileges());
            }
          );
        } else {
          privilege_data.offline_build_privilages(
            getp.userId,
            getp.id,
            function (err, flag) {
              if (flag) cb(err, null);
              else cb(helpers.invalid_privileges());
            }
          );
        }
      },

      // 3. retrieve Stripe ID
      function (userId: string, cb) {
        console.log("SS3");
        group_data.group_stripe_id(
          getp.id,
          function (err, stripeId, groupIndex, groupEmail) {
            cb(err, userId, stripeId, groupIndex, groupEmail);
          }
        );
      },

      // 4. create Subscription
      function (
        userId: string,
        stripeId: string,
        groupIndex: groupComplex,
        groupEmail: string,
        cb
      ) {
        console.log("SS4");
        payments_data.create_service_subscription(
          userId,
          host,
          build,
          standout,
          stripeId,
          groupIndex,
          groupEmail,
          getp.itemId,
          function (err, confirmation) {
            cb(err, confirmation);
          }
        );
      },
    ],
    function (err, confirmation) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, confirmation);
      }
    }
  );
};

////////////////////////////////////
////////////////////////////////////
////////////// Lists ///////////////
////////////////////////////////////
////////////////////////////////////

// Payments List
exports.payment = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var id = parseInt(getp.id);

  async.waterfall(
    [
      // 0. make sure Mode, ID Are valid
      function (cb) {
        if (
          mode == null ||
          (!ObjectID.isValid(getp.id) && (mode == 1 || mode == 2))
        ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 1. validate Privilages
      function (cb) {
        privilege_data.privilages(
          req.user.sub,
          getp.id,
          mode == 1 || mode == 2 ? 0 : 10,
          function (err, userId, flag) {
            if (flag) cb(err, userId);
            else cb(helpers.invalid_privileges());
          }
        );
      },

      function (userId: string, cb) {
        if (mode == 0) {
          people_data.user_stripe_id(userId, function (err, stripeId) {
            cb(err, stripeId);
          });
        } else if (mode == 1 || mode == 2) {
          group_data.group_stripe_id(
            getp.id,
            function (err, stripeId, groupIndex, groupEmail) {
              cb(err, stripeId);
            }
          );
        }
      },

      function (stripeId: string, cb) {
        payments_data.payment(stripeId, function (err, card) {
          cb(err, stripeId, card);
        });
      },

      function (stripeId: string, card, cb) {
        payments_data.charges(stripeId, function (err, charges) {
          const payment = {
            card: card,
            invoices: charges,
          };
          cb(err, payment);
        });
      },
    ],
    function (err, payment) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, payment);
      }
    }
  );
};

// Plans List
exports.plan = function (req, res) {
  var getp = req.query;
  var mode = parseInt(getp.mode);
  var id = parseInt(getp.id);

  async.waterfall(
    [
      // 0. make sure Mode, ID Are valid
      function (cb) {
        if (
          mode == null ||
          (!ObjectID.isValid(getp.id) && (mode == 1 || mode == 2))
        ) {
          cb(helpers.no_such_item());
          return;
        }
        cb(null);
      },

      // 1. validate Privilages
      function (cb) {
        privilege_data.privilages(
          req.user.sub,
          getp.id,
          mode == 1 || mode == 2 ? 0 : 10,
          function (err, userId, flag) {
            if (flag) cb(err, userId);
            else cb(helpers.invalid_privileges());
          }
        );
      },

      function (userId: string, cb) {
        if (mode == 0) {
          people_data.user_stripe_id(userId, function (err, stripeId) {
            cb(err, stripeId);
          });
        } else if (mode == 1 || mode == 2) {
          group_data.group_stripe_id(
            getp.id,
            function (err, stripeId, groupIndex, groupEmail) {
              cb(err, stripeId);
            }
          );
        }
      },

      function (stripeId: string, cb) {
        if (stripeId) {
          if (mode == 0) {
            payments_data.user_plan(
              stripeId,
              mode,
              function (err, subscriptions) {
                cb(err, stripeId, subscriptions);
              }
            );
          } else if (mode == 1 || mode == 2) {
            payments_data.group_plan(stripeId, function (err, subscriptions) {
              cb(err, stripeId, subscriptions);
            });
          }
        } else {
          cb(null, null, null);
        }
      },

      function (stripeId: string, subscriptions, cb) {
        if (stripeId) {
          payments_data.user_billing_period(
            stripeId,
            function (err, period_end) {
              const plan = {
                subscriptions: subscriptions,
                period_end: period_end,
              };
              cb(err, plan);
            }
          );
        } else {
          cb(null, null);
        }
      },
    ],
    function (err, plan) {
      if (err) {
        helpers.send_failure(res, helpers.http_code_for_error(err), err);
      } else {
        helpers.send_success(res, plan);
      }
    }
  );
};

////////////////////////////////////
////////////////////////////////////
////////////// Admin ///////////////
////////////////////////////////////
////////////////////////////////////

exports.postStripe = function (req, res) {
  var getp = req.query;

  payments_data.post_stripe(getp.id, function (err) {
    if (err) {
      helpers.send_failure(res, 500, err);
      return;
    }
    helpers.send_success(res);
  });
};

// const product = stripe.products.create({
//   name: 'Academig Basic',
//   type: 'service',
// });
//
// const plan_basic = stripe.plans.create({
//   product: 'prod_CiV5pr6h3X6wST',
//   nickname: 'Academig Basic',
//   currency: 'usd',
//   interval: 'month',
//   amount: 15000,
// });
//
// const plan_pro = stripe.plans.create({
//   product: 'prod_CiV5pr6h3X6wST',
//   nickname: 'Academig Pro',
//   currency: 'usd',
//   interval: 'month',
//   amount: 50000,
// });
